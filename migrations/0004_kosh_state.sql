create table if not exists kosh_state (
  user_id    text primary key,
  rev        bigint not null default 0,
  payload    text not null default '{}',
  updated_at timestamptz not null default now()
);
