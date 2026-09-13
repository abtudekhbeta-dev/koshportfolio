create table if not exists portfolios (
  id         text primary key,
  user_id    text not null,
  name       text not null,
  bench      text not null default 'nifty',
  holdings   text not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists portfolios_user_id_idx on portfolios (user_id);
