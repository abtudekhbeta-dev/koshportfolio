-- Unowned company filings cache. World-readable/writable company data only —
-- never portfolios, trades, or personal notes. No user_id. No delete-all.
create table if not exists company_funds (
  symbol text primary key,
  fund text not null,
  sources text not null default '[]',
  at timestamptz not null default now()
);
create index if not exists company_funds_at_idx on company_funds (at);
