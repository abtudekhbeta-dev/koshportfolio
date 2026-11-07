create table if not exists liquidity_runs (
  cache_key text primary key,
  cursor_at integer not null default 0,
  universe_size integer not null default 0,
  done integer not null default 0,
  hits text not null default '[]',
  stats text not null default '[]',
  skipped text not null default '[]',
  skipped_n integer not null default 0,
  scanned_n integer not null default 0,
  universe_note text not null default '',
  timeframe_note text not null default '',
  adjusted integer not null default 0,
  newest_bar bigint,
  as_of bigint not null,
  valid_until bigint not null
);
