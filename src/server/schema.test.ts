import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { MIGRATIONS } from "./schema";

/**
 * The database as Supabase sets it up: the Data API's roles exist, and every table created in
 * public is granted to them by default. The migrations must leave nothing readable through it.
 */
let pg: PGlite;

beforeAll(async () => {
  pg = new PGlite("memory://");
  await pg.exec(`
    create role anon nologin;
    create role authenticated nologin;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on sequences to anon, authenticated;
    create table schema_migrations (version int primary key, applied_at timestamptz not null default now());
  `);
  for (const m of MIGRATIONS) await pg.exec(m.sql);
});

const tables = async () =>
  (
    await pg.query<{ name: string; rls: boolean }>(
      `select c.relname as name, c.relrowsecurity as rls from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind in ('r', 'p') order by 1`,
    )
  ).rows;

describe("database security", () => {
  it("switches on row level security for every table", async () => {
    const all = await tables();
    expect(all.length).toBeGreaterThan(5);
    expect(all.filter((t) => !t.rls).map((t) => t.name)).toEqual([]);
  });

  it("leaves the Data API's roles no access to any table", async () => {
    const { rows } = await pg.query<{ name: string }>(
      `select c.relname as name from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind in ('r', 'p')
         and (has_table_privilege('anon', c.oid, 'select, insert, update, delete')
           or has_table_privilege('authenticated', c.oid, 'select, insert, update, delete'))`,
    );
    expect(rows).toEqual([]);
  });

  it("doesn't grant the Data API tables created later", async () => {
    await pg.exec(`create table later_table (id int)`);
    const { rows } = await pg.query<{ ok: boolean }>(`select has_table_privilege('anon', 'later_table', 'select') as ok`);
    expect(rows[0].ok).toBe(false);
  });
});
