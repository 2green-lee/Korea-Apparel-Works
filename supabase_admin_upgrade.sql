-- ============================================================
-- 어드민 대시보드 업그레이드용 SQL
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하세요.
-- (여러 번 실행해도 안전합니다)
-- ============================================================

-- 1) 사이트 조회수 트래킹 테이블
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text,
  visitor_id text,
  created_at timestamptz not null default now()
);

-- 서버(service_role)만 접근하므로 RLS 활성화 후 정책 없이 잠금
alter table public.page_views enable row level security;

-- 2) 휴지통(소프트 삭제)용 deleted_at 컬럼 추가
alter table public.sessions        add column if not exists deleted_at timestamptz;
alter table public.submissions     add column if not exists deleted_at timestamptz;
alter table public.apparel_orders  add column if not exists deleted_at timestamptz;

-- 3) 조회 성능용 인덱스
create index if not exists idx_page_views_created_at on public.page_views (created_at);
create index if not exists idx_sessions_deleted_at on public.sessions (deleted_at) where deleted_at is not null;
