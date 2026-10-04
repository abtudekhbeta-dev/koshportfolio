create table if not exists enrich_jobs (
  id text primary key,
  payload text not null,
  updated_at timestamptz not null default now()
);
