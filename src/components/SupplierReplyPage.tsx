import React, { useEffect, useState } from "react";

// 협력 업체가 문자·메일 링크로 들어와 단가를 적는 페이지. 가입 없이 링크만으로 답한다.
// 한국어/영어 전환 — 영어로 바꾸면 요청문도 영어로 번역해서 보여 주고, 단가를 달러로도 받는다.

interface Inquiry {
  supplier: string;
  category: string;
  quantity: number;
  request: string;
  createdAt: string;
  expired: boolean;
  priceScope: "add_on" | "whole_item" | "fabric" | null;
  images?: string[];
  reply: null | { unit: string; price_krw: number; setup_krw: number; moq: number | null; lead_time: string; note: string };
}

type Lang = "ko" | "en";

const T = {
  ko: {
    title: "견적 답변 | 코리아어패럴웍스",
    brand: "코리아어패럴웍스",
    loading: "불러오는 중…",
    notFound: "링크를 찾을 수 없습니다.",
    greeting: (name: string) => `${name}님께 드리는 견적 요청`,
    pcs: "장",
    unitLabel: "단가 기준",
    units: { per_piece: "장당", per_yard: "야드당", per_order: "건당 (전체 금액)" },
    priceLabel: "단가 (원, 부가세 별도)",
    pricePh: "예: 1500",
    hint: {
      whole_item: "완제품 1장 가격으로 적어 주세요 (원단·봉제·부자재 포함).",
      fabric: "원단은 보통 '야드당'으로 적어 주세요.",
      add_on: "해당 작업만의 가격입니다 (옷 값 제외).",
    },
    setupLabel: "판비·셋업비 (원, 한 번만 드는 비용)",
    setupPh: "없으면 비워 두세요",
    moqLabel: "최소 수량",
    moqPh: "예: 50",
    leadLabel: "작업 기간",
    leadPh: "예: 5일",
    noteLabel: "메모",
    notePh: "조건, 주의사항 등 (선택)",
    needPrice: "단가를 적어 주세요.",
    send: "답변 보내기",
    sending: "보내는 중…",
    sendFail: "전송에 실패했습니다.",
    thanks: "답변 감사합니다",
    thanksBody: "보내 주신 단가로 고객 견적을 안내하겠습니다. 진행되면 다시 연락드리겠습니다.",
    already: "이미 답변해 주신 문의입니다. 수정이 필요하면 연락 주세요.",
    closed: "마감되었거나 취소된 문의입니다. 감사합니다.",
    errors: { 400: "단가를 숫자로 적어 주세요.", 409: "이미 답변하셨습니다.", 410: "기한이 지난 문의입니다." } as Record<number, string>,
  },
  en: {
    title: "Quote reply | Korea Apparel Works",
    brand: "Korea Apparel Works",
    loading: "Translating the request…",
    notFound: "This link could not be found.",
    greeting: (name: string) => `Quote request for ${name}`,
    pcs: "pcs",
    unitLabel: "Price basis",
    units: { per_piece: "Per piece", per_yard: "Per yard", per_order: "Per order (total)" },
    priceLabel: "Price (excl. VAT)",
    pricePh: "e.g. 1.20",
    hint: {
      whole_item: "Price for one finished piece (fabric, sewing and trims included).",
      fabric: "For fabric, please quote per yard.",
      add_on: "Price for this process only (not the garment).",
    },
    setupLabel: "Setup / screen fee (one-time)",
    setupPh: "Leave blank if none",
    moqLabel: "Minimum quantity",
    moqPh: "e.g. 50",
    leadLabel: "Lead time",
    leadPh: "e.g. 5 days",
    noteLabel: "Notes",
    notePh: "Conditions, remarks (optional)",
    needPrice: "Please enter a price.",
    send: "Send reply",
    sending: "Sending…",
    sendFail: "Could not send. Please try again.",
    thanks: "Thank you for your reply",
    thanksBody: "We'll use your price for the customer's quote and get back to you if the order goes ahead.",
    already: "You've already answered this request. Please contact us if you need to change it.",
    closed: "This request is closed or was cancelled. Thank you.",
    errors: { 400: "Please enter the price as a number.", 409: "You've already answered this request.", 410: "This request has expired." } as Record<number, string>,
  },
};

const UNIT_KEYS = ["per_piece", "per_yard", "per_order"] as const;

const inputClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[16px] text-neutral-900 outline-none focus:border-neutral-900 placeholder:text-neutral-400";

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "en" || q === "ko") return q;
  } catch {
    // 기본값으로
  }
  return navigator.language?.toLowerCase().startsWith("ko") ? "ko" : "en";
}

export default function SupplierReplyPage({ token }: { token: string }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = T[lang];
  const [inq, setInq] = useState<Inquiry | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [currency, setCurrency] = useState<"KRW" | "USD">(lang === "en" ? "USD" : "KRW");
  const [unit, setUnit] = useState<string>("per_piece");
  const [price, setPrice] = useState("");
  const [setup, setSetup] = useState("");
  const [moq, setMoq] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = t.title;
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
  }, []);

  // 언어를 바꾸면 요청문도 그 언어로 다시 받아 온다
  useEffect(() => {
    setInq(null);
    fetch(`/api/supplier-reply/${encodeURIComponent(token)}${lang === "en" ? "?lang=en" : ""}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        setInq(await r.json());
      })
      .catch(() => setLoadError(true));
  }, [token, lang]);

  const switchLang = (l: Lang) => {
    setLang(l);
    setCurrency(l === "en" ? "USD" : "KRW");
    setPrice("");
    setSetup("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!price.trim()) return setError(t.needPrice);
    setSending(true);
    try {
      const r = await fetch(`/api/supplier-reply/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit, currency, price, setup, moq, lead_time: leadTime, note }),
      });
      if (!r.ok) throw new Error(t.errors[r.status] || t.sendFail);
      setDone(true);
    } catch (err: any) {
      setError(err.message || t.sendFail);
    } finally {
      setSending(false);
    }
  };

  // 원화는 정수에 쉼표, 달러는 소수점 둘째 자리까지
  const cleanMoney = (v: string) =>
    currency === "KRW" ? v.replace(/[^0-9]/g, "") : v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1").replace(/(\.\d{2})\d+/, "$1");
  const showMoney = (v: string) => (currency === "KRW" && v ? Number(v).toLocaleString("ko-KR") : v);
  const digits = (v: string) => v.replace(/[^0-9]/g, "");
  const curLabel = currency === "KRW" ? (lang === "ko" ? "원" : "KRW") : "USD";

  return (
    <div className="min-h-[100dvh] bg-neutral-50 font-sans text-neutral-900">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <img src="/logo1.png" alt="" className="h-7 w-7 object-contain" />
          <span className="text-[15px] font-semibold tracking-wide">{t.brand}</span>
          <div className="ml-auto flex rounded-full border border-neutral-300 bg-white p-0.5 text-[13px]">
            {(["ko", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLang(l)}
                className={`rounded-full px-3 py-1 ${lang === l ? "bg-neutral-900 text-white" : "text-neutral-600"}`}
              >
                {l === "ko" ? "한국어" : "English"}
              </button>
            ))}
          </div>
        </div>

        {loadError ? (
          <p className="rounded-2xl bg-white p-6 text-[15px] text-neutral-600 shadow-sm">{t.notFound}</p>
        ) : !inq ? (
          <p className="text-[15px] text-neutral-500">{t.loading}</p>
        ) : done || inq.reply ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-[20px] font-semibold">{t.thanks}</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{done ? t.thanksBody : t.already}</p>
          </div>
        ) : inq.expired ? (
          <p className="rounded-2xl bg-white p-6 text-[15px] text-neutral-600 shadow-sm">{t.closed}</p>
        ) : (
          <>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-[13px] text-neutral-500">{t.greeting(inq.supplier)}</p>
              <h1 className="mt-1 text-[20px] font-semibold">
                {inq.category} · {inq.quantity?.toLocaleString()} {t.pcs}
              </h1>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-neutral-100 p-4 font-sans text-[15px] leading-relaxed text-neutral-800">{inq.request}</pre>
              {!!inq.images?.length && (
                <div className="mt-3">
                  <p className="mb-2 text-[13px] text-neutral-500">{lang === "ko" ? "고객 참고 사진 (누르면 크게 보기)" : "Customer reference photos (tap to enlarge)"}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {inq.images.map((u) => (
                      <a key={u} href={u} target="_blank" rel="noreferrer">
                        <img src={u} alt="" className="aspect-square w-full rounded-lg border border-neutral-200 object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={submit} className="mt-4 space-y-5 rounded-2xl bg-white p-5 shadow-sm">
              <div>
                <label className="mb-2 block text-[14px] font-medium">{t.unitLabel}</label>
                <div className="grid grid-cols-3 gap-2">
                  {UNIT_KEYS.map((u) => (
                    <button
                      type="button"
                      key={u}
                      onClick={() => setUnit(u)}
                      className={`rounded-xl border px-2 py-3 text-[14px] ${unit === u ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-700"}`}
                    >
                      {t.units[u]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-[14px] font-medium">
                    {t.priceLabel} <span className="text-red-500">*</span>
                  </label>
                  {/* 해외 업체는 달러로도 받는다 (서버에서 원화로 바꿔 계산) */}
                  <div className="flex rounded-lg border border-neutral-300 text-[12px]">
                    {(["KRW", "USD"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCurrency(c);
                          setPrice("");
                          setSetup("");
                        }}
                        className={`px-2.5 py-1 ${currency === c ? "bg-neutral-900 text-white" : "text-neutral-600"} ${c === "KRW" ? "rounded-l-lg" : "rounded-r-lg"}`}
                      >
                        {c === "KRW" ? (lang === "ko" ? "원" : "KRW") : "USD"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <input
                    inputMode="decimal"
                    className={`${inputClass} pr-14`}
                    placeholder={currency === "KRW" ? "1,500" : "1.20"}
                    value={showMoney(price)}
                    onChange={(e) => setPrice(cleanMoney(e.target.value))}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-neutral-400">{curLabel}</span>
                </div>
                <p className="mt-1.5 text-[13px] text-neutral-500">{t.hint[inq.priceScope || "add_on"]}</p>
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-medium">{t.setupLabel}</label>
                <div className="relative">
                  <input inputMode="decimal" className={`${inputClass} pr-14`} placeholder={t.setupPh} value={showMoney(setup)} onChange={(e) => setSetup(cleanMoney(e.target.value))} />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-neutral-400">{curLabel}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[14px] font-medium">{t.moqLabel}</label>
                  <input inputMode="numeric" className={inputClass} placeholder={t.moqPh} value={moq} onChange={(e) => setMoq(digits(e.target.value))} />
                </div>
                <div>
                  <label className="mb-2 block text-[14px] font-medium">{t.leadLabel}</label>
                  <input className={inputClass} placeholder={t.leadPh} value={leadTime} onChange={(e) => setLeadTime(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-medium">{t.noteLabel}</label>
                <textarea className={`${inputClass} min-h-[90px] resize-y`} placeholder={t.notePh} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              {error && <p className="text-[14px] text-red-600">{error}</p>}

              <button type="submit" disabled={sending} className="w-full rounded-xl bg-neutral-900 py-4 text-[16px] font-semibold text-white disabled:opacity-50">
                {sending ? t.sending : t.send}
              </button>
            </form>
            <p className="mt-4 text-center text-[12px] text-neutral-400">KAW Inc. · contact@k-apparel.works</p>
          </>
        )}
      </div>
    </div>
  );
}
