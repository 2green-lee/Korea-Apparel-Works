import React, { useEffect, useState } from "react";

// 관리자 '협력 업체' 탭: 업체 등록·수정, 문의 현황, 발송 통로 설정 상태

const CATEGORIES: [string, string][] = [
  ["embroidery", "자수"],
  ["screen_print", "나염"],
  ["heat_transfer", "열전사"],
  ["dtp", "DTP·디지털 프린트"],
  ["patch", "패치·와펜"],
  ["fabric", "원단"],
  ["dyeing", "염색"],
  ["trims", "부자재"],
  ["sewing", "봉제"],
  ["other", "기타"],
];
const catKo = (c: string) => CATEGORIES.find(([k]) => k === c)?.[1] || c;

const STATUS_KO: Record<string, string> = {
  pending_approval: "텔레그램 승인 대기",
  no_supplier: "담당 업체 없음",
  sent: "업체 답변 대기",
  answered: "답변 받음",
  delivered: "고객 전달 완료",
  cancelled: "취소",
};

interface Supplier {
  id?: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  categories: string[];
  note: string;
  active: boolean;
}

const EMPTY: Supplier = { name: "", contact_name: "", phone: "", email: "", categories: [], note: "", active: true };

const field = "w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-white/30";

export default function SupplierManager({ token }: { token?: string }) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [form, setForm] = useState<Supplier>(EMPTY);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState("");

  const api = async (path: string, init?: RequestInit) => {
    const r = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}`, ...(init?.headers || {}) },
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `요청 실패 (${r.status})`);
    return data;
  };

  const load = async () => {
    try {
      const [s, i, st] = await Promise.all([api("/api/admin/suppliers"), api("/api/admin/supplier-inquiries"), api("/api/admin/relay-status")]);
      setSuppliers(s);
      setInquiries(i.inquiries);
      setRecipients(i.recipients);
      setStatus(st);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      await api("/api/admin/suppliers", { method: "POST", body: JSON.stringify(form) });
      setForm(EMPTY);
      setNotice("저장했습니다.");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number, name: string) => {
    if (!confirm(`${name} 업체를 삭제할까요? 지난 문의 기록에서도 이 업체 답변이 지워집니다.`)) return;
    try {
      await api("/api/admin/suppliers/delete", { method: "POST", body: JSON.stringify({ id }) });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const resend = async (id: number) => {
    try {
      await api("/api/admin/supplier-inquiries/send", { method: "POST", body: JSON.stringify({ id }) });
      setNotice(`문의 #${id}를 업체에 보냈습니다.`);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const connectTelegram = async () => {
    try {
      await api("/api/admin/telegram/setup-webhook", { method: "POST" });
      setNotice("텔레그램 승인 버튼을 연결했습니다.");
    } catch (e: any) {
      setError(e.message);
    }
  };

  // 기본 품목 + 다른 업체에 이미 쓴 직접 추가 품목 + 지금 폼에서 추가한 품목
  const allCategories: [string, string][] = [
    ...CATEGORIES,
    ...[...new Set([...suppliers.flatMap((s) => s.categories || []), ...form.categories])]
      .filter((c) => !CATEGORIES.some(([k]) => k === c))
      .map((c): [string, string] => [c, c]),
  ];

  const addCustomCat = () => {
    const c = newCat.trim();
    if (!c) return;
    const builtIn = CATEGORIES.find(([, label]) => label === c)?.[0];
    const key = builtIn || c;
    setForm((f) => (f.categories.includes(key) ? f : { ...f, categories: [...f.categories, key] }));
    setNewCat("");
  };

  const toggleCat = (c: string) =>
    setForm((f) => ({ ...f, categories: f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c] }));

  if (!token) {
    return (
      <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 text-sm text-neutral-300">
        협력 업체 화면은 새 로그인 방식이 필요합니다. 왼쪽 아래 <strong className="text-white">관리자 로그아웃</strong> 후 다시 로그인해 주세요.
      </div>
    );
  }

  const Dot = ({ ok }: { ok: boolean }) => <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${ok ? "bg-emerald-500" : "bg-neutral-600"}`} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-white tracking-tight">협력 업체</h2>
        <p className="text-sm text-neutral-400 mt-1">
          BBally가 모르는 견적을 만나면 텔레그램으로 승인 요청이 옵니다. 보내기를 누르면 그 품목 담당 업체에 문자·메일이 가고, 업체 답변은 마진을 붙여 고객 언어로 채팅창과 메일에 전달됩니다.
        </p>
      </div>

      {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">{error}</div>}
      {notice && <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm px-4 py-3">{notice}</div>}

      {status && (
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-300">
          <span><Dot ok={status.telegram} />텔레그램</span>
          <span><Dot ok={status.telegramWebhookSecret} />승인 버튼 키</span>
          <span><Dot ok={status.sms} />문자(솔라피)</span>
          <span><Dot ok={status.email} />메일</span>
          <button onClick={connectTelegram} className="ml-auto px-3.5 py-2 rounded-xl bg-white text-black text-xs font-semibold">
            텔레그램 승인 버튼 연결
          </button>
        </div>
      )}

      <form onSubmit={save} className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-medium">{form.id ? "업체 수정" : "업체 추가"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className={field} placeholder="업체명 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={field} placeholder="담당자" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          <input className={field} placeholder="휴대폰 (문자 받을 번호)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className={field} placeholder="이메일" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-2">담당 품목 *</p>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(([k, label]) => (
              <button
                type="button"
                key={k}
                onClick={() => toggleCat(k)}
                className={`px-3 py-1.5 rounded-full text-xs border ${form.categories.includes(k) ? "bg-white text-black border-white" : "border-white/15 text-neutral-400"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              className={`${field} max-w-[220px]`}
              placeholder="품목 직접 추가 (예: 모자, 라이더자켓)"
              value={newCat}
              maxLength={20}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomCat();
                }
              }}
            />
            <button type="button" onClick={addCustomCat} className="px-3.5 rounded-xl border border-white/15 text-neutral-300 text-xs">
              추가
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            여기 있는 품목은 우리 공장에서 안 만드는 것(모자·아우터 등)이라도 BBally가 거절하지 않고 이 업체에 견적을 물어봅니다.
          </p>
        </div>
        <input className={field} placeholder="메모 (내부용)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            문의 받기
          </label>
          <div className="ml-auto flex gap-2">
            {form.id && (
              <button type="button" onClick={() => setForm(EMPTY)} className="px-4 py-2 rounded-xl border border-white/10 text-neutral-300 text-sm">
                취소
              </button>
            )}
            <button disabled={saving} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-50">
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 text-white font-medium">등록된 업체 {suppliers.length}곳</div>
        {suppliers.length === 0 ? (
          <p className="px-6 py-6 text-sm text-neutral-500">아직 없습니다. 위에서 추가해 주세요.</p>
        ) : (
          suppliers.map((s) => (
            <div key={s.id} className="px-6 py-4 border-b border-white/5 last:border-0 flex flex-col md:flex-row md:items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm">
                  {s.name} {s.contact_name && <span className="text-neutral-500">· {s.contact_name}</span>} {!s.active && <span className="text-amber-400 text-xs ml-1">쉬는 중</span>}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {(s.categories || []).map(catKo).join(", ")} · {s.phone || "번호 없음"} · {s.email || "메일 없음"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm({ id: s.id, name: s.name, contact_name: s.contact_name || "", phone: s.phone || "", email: s.email || "", categories: s.categories || [], note: s.note || "", active: s.active })}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-neutral-300 text-xs"
                >
                  수정
                </button>
                <button onClick={() => remove(s.id, s.name)} className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-300 text-xs">
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 text-white font-medium">최근 문의</div>
        {inquiries.length === 0 ? (
          <p className="px-6 py-6 text-sm text-neutral-500">아직 없습니다.</p>
        ) : (
          inquiries.map((q) => {
            const recs = recipients.filter((r) => r.inquiry_id === q.id);
            return (
              <div key={q.id} className="px-6 py-4 border-b border-white/5 last:border-0 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white">#{q.id} {catKo(q.category)} · {q.quantity}장</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-neutral-300">{STATUS_KO[q.status] || q.status}</span>
                  <span className="text-xs text-neutral-500">{new Date(q.created_at).toLocaleString("ko-KR")}</span>
                  {["no_supplier", "pending_approval"].includes(q.status) && (
                    <button onClick={() => resend(q.id)} className="ml-auto px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold">
                      업체에 보내기
                    </button>
                  )}
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-neutral-400">{q.request_ko}</pre>
                {recs.length > 0 && (
                  <div className="mt-2 space-y-1 text-xs text-neutral-400">
                    {recs.map((r) => {
                      const s = suppliers.find((x) => x.id === r.supplier_id);
                      return (
                        <div key={r.id}>
                          · {s?.name || "업체"} — {r.reply ? `답변: ${Number(r.reply.price_krw).toLocaleString()}원 (${r.reply.unit === "per_yard" ? "야드당" : r.reply.unit === "per_order" ? "건당" : "장당"})${r.reply.setup_krw ? ` + 셋업 ${Number(r.reply.setup_krw).toLocaleString()}원` : ""}${r.reply.lead_time ? ` · ${r.reply.lead_time}` : ""}` : `대기 (문자 ${r.sms_status} / 메일 ${r.email_status})`}
                        </div>
                      );
                    })}
                  </div>
                )}
                {q.customer_price && (
                  <div className="mt-2 text-xs text-emerald-300">
                    고객 안내가 ${q.customer_price.low}–${q.customer_price.high}/장
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
