create table if not exists hist_prices (
  symbol text not null,
  exchange text not null default 'NSE',
  day date not null,
  open double precision,
  high double precision,
  low double precision,
  close double precision,
  adj_close double precision not null,
  volume double precision,
  raw_close double precision,
  currency text not null default 'INR',
  source text not null,
  source_priority integer not null,
  source_type text not null,
  source_url text,
  source_title text,
  evidence text,
  retrieved_at timestamptz not null default now(),
  quality text not null default 'accepted',
  primary key (symbol, exchange, day)
);

create index if not exists hist_prices_symbol_day on hist_prices (symbol, day);

create table if not exists hist_conflicts (
  id bigserial primary key,
  symbol text not null,
  exchange text not null,
  day date not null,
  kept_value double precision,
  other_value double precision,
  kept_source text,
  other_source text,
  note text,
  at timestamptz not null default now()
);