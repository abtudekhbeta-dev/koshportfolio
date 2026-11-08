create table if not exists liquidity_locks (
  cache_key text primary key,
  owner text not null,
  expires_at bigint not null
);
