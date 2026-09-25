import { mkdirSync } from "node:fs";
import path from "node:path";
import { env } from "./env";
import { MIGRATIONS } from "./schema";

/**
 * One tiny interface over two drivers:
 * - Postgres (Supabase, Neon, RDS…) when DATABASE_URL is set.
 * - PGlite, an embedded Postgres, for local development and tests.
 * The SQL is the same in both, so what works locally works in production.
 */
export interface Db {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  exec(text: string): Promise<void>;
}

const g = globalThis as unknown as { __suppliDb?: Promise<Db> };

export function db(): Promise<Db> {
  if (!g.__suppliDb) {
    g.__suppliDb = connect().catch((e) => {
      g.__suppliDb = undefined;
      throw e;
    });
  }
  return g.__suppliDb;
}

async function connect(): Promise<Db> {
  let d: Db;
  if (env.databaseUrl) {
    const postgres = (await import("postgres")).default;
    // prepare:false keeps us compatible with transaction poolers (e.g. Supabase port 6543).
    // Serverless instances pause between requests, so idle connections are closed rather than left to go stale.
    const sql = postgres(env.databaseUrl, { max: 5, prepare: false, idle_timeout: 20, connect_timeout: 10, onnotice: () => {} });
    d = {
      query: async <T,>(text: string, params: unknown[] = []) =>
        (await sql.unsafe(text, params as never[])) as unknown as T[],
      exec: async (text: string) => {
        await sql.unsafe(text);
      },
    };
  } else {
    if (process.env.VERCEL && !process.env.PGLITE_DIR) {
      // Vercel's disk is read-only and every instance starts empty: the embedded database can't keep anything there.
      throw new Error("DATABASE_URL is not set. On Vercel the app needs a hosted Postgres database (Supabase, Neon…); see .env.example.");
    }
    const { PGlite } = await import("@electric-sql/pglite");
    // "memory://" keeps everything in memory (tests); anything else is a folder on disk.
    const inMemory = env.pgliteDir.startsWith("memory://");
    const dir = inMemory ? env.pgliteDir : path.resolve(/* turbopackIgnore: true */ process.cwd(), env.pgliteDir);
    if (!inMemory) mkdirSync(dir, { recursive: true });
    const pg = new PGlite(dir);
    await pg.waitReady;
    d = {
      query: async <T,>(text: string, params: unknown[] = []) => (await pg.query<T>(text, params)).rows,
      exec: async (text: string) => {
        await pg.exec(text);
      },
    };
  }
  await migrate(d);
  return d;
}

async function migrate(d: Db) {
  await d.exec(`create table if not exists schema_migrations (version int primary key, applied_at timestamptz not null default now())`);
  const done = new Set((await d.query<{ version: number }>(`select version from schema_migrations`)).map((r) => r.version));
  for (const m of MIGRATIONS) {
    if (done.has(m.version)) continue;
    await d.exec(m.sql);
    await d.query(`insert into schema_migrations (version) values ($1) on conflict do nothing`, [m.version]);
  }
}

/** JSON parameters must be passed as text and cast with ::jsonb in the SQL. */
export const json = (v: unknown) => JSON.stringify(v ?? null);
