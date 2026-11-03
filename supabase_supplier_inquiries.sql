-- 협력 업체 견적 문의 (BBally가 모르는 견적 → 사장님 텔레그램 승인 → 업체 문자·메일 → 업체 답변 → 고객 전달)
-- Supabase SQL Editor에서 한 번 실행하면 된다.

-- 협력 업체 목록 (관리자 화면 '협력 업체'에서 등록)
create table if not exists public.suppliers (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  name          text not null,
  contact_name  text,
  phone         text,
  email         text,
  -- embroidery, screen_print, heat_transfer, dtp, patch, fabric, dyeing, trims, sewing, other
  categories    text[] not null default '{}',
  note          text,
  active        boolean not null default true
);

-- 문의 한 건 (고객 질문 하나)
create table if not exists public.supplier_inquiries (
  id               bigint generated always as identity primary key,
  created_at       timestamptz not null default now(),
  session_id       text not null,
  customer_email   text,
  customer_language text,
  category         text not null,
  garment          text,
  quantity         integer,
  request_ko       text not null,      -- 업체에 보내는 요청 내용(한국어)
  customer_question text,              -- 고객이 실제로 물은 것(요지)
  -- pending_approval → sent → answered → delivered  (또는 cancelled / no_supplier)
  status           text not null default 'pending_approval',
  telegram_message_id bigint,
  approved_at      timestamptz,
  answered_at      timestamptz,
  delivered_at     timestamptz,
  customer_message text,               -- 고객에게 보낸 최종 메시지(고객 언어)
  customer_price   jsonb               -- 마진 붙인 고객 가격 {low, high, unit}
);

-- 업체별 발송·답변 (업체마다 답변 링크가 다르다)
create table if not exists public.supplier_inquiry_recipients (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  inquiry_id    bigint not null references public.supplier_inquiries(id) on delete cascade,
  supplier_id   bigint not null references public.suppliers(id) on delete cascade,
  token         text not null unique,
  sms_status    text,
  email_status  text,
  replied_at    timestamptz,
  reply         jsonb                  -- {unit, price_krw, setup_krw, moq, lead_time, note}
);

create index if not exists supplier_inquiries_session_idx on public.supplier_inquiries (session_id);
create index if not exists supplier_inquiry_recipients_inquiry_idx on public.supplier_inquiry_recipients (inquiry_id);

-- 업체 연락처와 원가가 들어 있으니 브라우저(anon)에서는 못 읽게 막는다. 서버는 service_role 키로 접근한다.
alter table public.suppliers enable row level security;
alter table public.supplier_inquiries enable row level security;
alter table public.supplier_inquiry_recipients enable row level security;

-- (추가) 업체 견적이 고객가에서 어떤 자리인지: add_on(장식·부자재 추가금) / whole_item(모자·아우터 등 완제품) / fabric(원단)
alter table public.supplier_inquiries add column if not exists price_scope text;
