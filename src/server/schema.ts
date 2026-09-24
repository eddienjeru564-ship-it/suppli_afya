/**
 * Database schema, as ordered migrations. Never edit a migration that has
 * shipped; add a new one.
 *
 * Money is stored as whole Kenyan shillings (integers).
 */
export const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table sessions (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index sessions_user_idx on sessions(user_id);

-- One workspace per distributor. Onboarding answers live here because the
-- portal and the public health check both read them.
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references users(id) on delete cascade,
  plan text not null,
  slug text unique,
  owner_name text,
  business_name text,
  location text,
  business_type text,
  whatsapp text,
  channels jsonb not null default '[]',
  goals jsonb not null default '[]',
  onboarding_step int not null default 0,
  onboarded_at timestamptz,
  community_dismissed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Current subscription state for a workspace (one row, updated on renewals and plan changes).
create table subscriptions (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  plan text not null,
  status text not null default 'pending',
  current_period_start timestamptz,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- Every attempt to pay, successful or not. Failed attempts stay so they can be retried and audited.
create table payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  plan text not null,
  amount int not null,
  currency text not null default 'KES',
  method text not null,
  provider text not null,
  status text not null default 'pending',
  phone text,
  provider_ref text,
  receipt text,
  failure_reason text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_workspace_idx on payments(workspace_id, created_at desc);
create index payments_provider_ref_idx on payments(provider_ref);

-- People who completed the health check through the distributor's link and chose to send it.
create table prospects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  ref text not null,
  name text not null,
  phone text,
  age int,
  sex text,
  goals jsonb not null default '[]',
  products jsonb not null default '[]',
  flags jsonb not null default '[]',
  preference text,
  status text not null default 'new',
  result jsonb,
  answers jsonb,
  customer_id uuid,
  contacted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, ref)
);
create index prospects_workspace_idx on prospects(workspace_id, created_at desc);

create table customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  phone text,
  notes text,
  source text not null default 'manual',
  prospect_id uuid,
  created_at timestamptz not null default now()
);
create index customers_workspace_idx on customers(workspace_id, created_at desc);

create table orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  items jsonb not null,
  total int not null,
  status text not null default 'unpaid',
  payment_method text,
  payment_ref text,
  paid_at timestamptz,
  delivered_at timestamptz,
  reorder_due_at timestamptz,
  created_at timestamptz not null default now()
);
create index orders_workspace_idx on orders(workspace_id, created_at desc);
create index orders_customer_idx on orders(customer_id);

-- A customer's story: notes, messages sent, orders, payments. task_key marks a Today item as done.
create table interactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  customer_id uuid,
  prospect_id uuid,
  kind text not null,
  body text,
  task_key text,
  created_at timestamptz not null default now()
);
create index interactions_workspace_idx on interactions(workspace_id, created_at desc);
create index interactions_task_idx on interactions(workspace_id, task_key);
`,
  },
  {
    version: 2,
    sql: `
-- Phones and computers that asked for the morning reminder. One row per device.
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_sent_at timestamptz
);
create index push_subscriptions_workspace_idx on push_subscriptions(workspace_id);
`,
  },
];
