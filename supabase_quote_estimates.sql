-- 마크 견적 로그 테이블.
-- Supabase SQL Editor에서 한 번 실행하면 된다. 없어도 사이트는 정상 동작한다(로그만 안 남음).
-- 오더가 끝나면 actual_cost_usd_per_piece / actual_note 를 채워서, 견적 원가와 실제 원가를 비교한다.

create table if not exists public.quote_estimates (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),
  session_id        text,
  order_type        text,
  input             jsonb not null,
  customer_quote    jsonb not null,
  internal_breakdown jsonb not null,
  total_low_usd     numeric,
  total_high_usd    numeric,
  needs_director    boolean default false,
  actual_cost_usd_per_piece numeric,
  actual_note       text
);

create index if not exists quote_estimates_session_idx on public.quote_estimates (session_id);
create index if not exists quote_estimates_created_idx on public.quote_estimates (created_at desc);

-- 원가가 들어 있으니 브라우저(anon)에서는 못 읽게 막는다. 서버는 service_role 키로 접근한다.
alter table public.quote_estimates enable row level security;
