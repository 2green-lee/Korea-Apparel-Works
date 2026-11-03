// 협력 업체 견적 릴레이
// BBally가 표에 없는 견적(자수·패치·특수 원단 등)을 만나면:
//   1) request_supplier_quote 도구로 문의를 만든다 → 사장님 텔레그램에 [업체에 보내기] 버튼
//   2) 사장님이 누르면 그 품목 담당 업체들에 문자 + 메일 (업체마다 답변 링크)
//   3) 업체가 링크에서 단가를 적으면 → 마진을 붙여 고객 언어로 바꿔 채팅창 + 메일로 전달
// 문자: 솔라피(SOLAPI_*), 메일: Gmail(GMAIL_USER + GMAIL_APP_PASSWORD) 또는 Resend(RESEND_API_KEY).
// 키가 없으면 그 통로만 조용히 건너뛴다.

import crypto from "crypto";
import nodemailer from "nodemailer";
import type { Express, Request, Response, NextFunction } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GoogleGenAI } from "@google/genai";
import { ESTIMATE_SPREAD, FX_KRW_PER_USD, GARMENTS, MARKUP, GarmentKey } from "./pricingPolicy.js";

// ─── 품목 ──────────────────────────────────────────────────────────

export const SUPPLIER_CATEGORIES: Record<string, { ko: string; en: string }> = {
  embroidery: { ko: "자수", en: "embroidery" },
  screen_print: { ko: "나염", en: "screen printing" },
  heat_transfer: { ko: "열전사", en: "heat transfer" },
  dtp: { ko: "DTP·디지털 프린트", en: "digital print" },
  patch: { ko: "패치·와펜", en: "patch" },
  fabric: { ko: "원단", en: "fabric" },
  dyeing: { ko: "염색", en: "custom dyeing" },
  trims: { ko: "부자재", en: "trims" },
  sewing: { ko: "봉제", en: "sewing" },
  other: { ko: "기타", en: "this item" },
};

/**
 * 업체가 한 번에 정확한 단가를 낼 수 있게 품목별로 꼭 확인해서 요청문에 넣을 항목.
 * 업체가 되묻지 않아도 되도록 — 모르는 항목은 빼지 말고 '고객 미정'으로 적는다.
 */
export const REQUEST_CHECKLIST: Record<string, string[]> = {
  embroidery: ["자수 종류(평자수/입체자수/아플리케)", "크기(가로×세로 cm)", "위치(왼가슴·등 등)와 위치 수", "실 색 수", "바탕 원단 소재·두께", "로고 파일 유무(AI/PNG)"],
  patch: ["패치 종류(자수 와펜/실리콘/PVC/가죽/우븐)", "크기(가로×세로 cm)·모양", "부착 방식(봉제/열압착/벨크로)", "색 수", "부착 위치"],
  heat_transfer: ["전사 종류(일반/반사/글리터 등)", "크기(가로×세로 cm)", "위치와 위치 수", "색 수 또는 풀컬러", "원단 소재(면/폴리)"],
  dtp: ["크기(가로×세로 cm)", "위치와 위치 수", "풀컬러 여부", "원단 소재(면/폴리)·바탕색"],
  screen_print: ["특수 잉크(발포/고무/형광/메탈릭 등)", "크기(가로×세로 cm)", "도수(색 수)", "위치와 위치 수", "원단 소재·바탕색"],
  fabric: ["소재·혼용률", "중량(gsm)", "조직(싱글/피케/테리/쭈리/우븐 등)", "기능(냉감/흡한속건/스판/발수 등)·촉감", "색상과 컬러 수", "필요 수량(완성품 장수, 가능하면 필요 야드)"],
  dyeing: ["팬톤 번호", "원단 소재·중량", "필요 수량(장수 또는 야드)", "견뢰도 등 요구사항"],
  trims: ["부자재 종류", "규격(크기·길이·굵기)", "색상", "로고 각인·인쇄 여부", "개당 사용 수량"],
  sewing: ["작업 내용(특수 봉제 공정)", "품목과 원단", "사이즈 구성", "작업지시서 유무"],
  모자: ["종류(볼캡/스냅백/버킷햇/비니 등)", "패널 수·챙 모양(커브/플랫)", "원단(코튼 트윌/나일론/울 등)", "조절 방식(스트랩/스냅/벨크로/고정)", "장식(자수·패치 위치·크기·색 수)", "안쪽 라벨·테이프", "컬러별 수량"],
  아우터: ["종류(라이더자켓/바람막이/패딩 등)", "겉감 소재(가죽/인조가죽/나일론 등)", "안감·충전재", "여밈(지퍼/단추/스냅)·포켓 수", "장식·로고 방식", "사이즈 구성", "컬러별 수량"],
};
const COMMON_CHECKLIST = ["총 수량과 컬러별 수량", "사이즈 구성", "샘플 필요 여부", "희망 납기", "배송 국가"];

/** 관리자가 직접 추가한 품목은 이름에 맞춰 가장 비슷한 체크리스트를 쓴다 */
function checklistFor(category: string): string[] {
  if (REQUEST_CHECKLIST[category]) return REQUEST_CHECKLIST[category];
  if (/모자|캡|햇|비니/.test(category)) return REQUEST_CHECKLIST["모자"];
  if (/아우터|자켓|재킷|점퍼|코트|패딩|바람막이/.test(category)) return REQUEST_CHECKLIST["아우터"];
  return ["품목·스타일", "소재", "크기·사양", "디테일·장식", "컬러별 수량"];
}

export function checklistPrompt(categories: string[]): string {
  const cats = [...new Set([...Object.keys(REQUEST_CHECKLIST), ...categories])].filter((c) => c !== "other");
  return cats.map((c) => `  · ${categoryKo(c)}: ${checklistFor(c).join(", ")}`).join("\n");
}

export const SUPPLIER_TOOL_NAME = "request_supplier_quote";

/** 기본 품목은 키(embroidery…), 관리자가 직접 추가한 품목은 이름 그대로(예: "모자") 저장한다. */
export const categoryKo = (c: string) => SUPPLIER_CATEGORIES[c]?.ko || c;
const categoryEn = (c: string) => SUPPLIER_CATEGORIES[c]?.en || c;

/** 업체 견적이 고객가에서 어떤 자리인지 — 고객 메시지 문구와 업체 답변 화면 안내가 달라진다 */
export type PriceScope = "add_on" | "whole_item" | "fabric";

/** request_supplier_quote 도구. 관리자가 추가한 품목까지 enum에 넣으려고 요청마다 만든다. */
export function supplierToolDeclaration(customCategories: string[]) {
  return {
    name: SUPPLIER_TOOL_NAME,
    description:
      "Asks Korea Apparel Works' partner suppliers for a price that calculate_quote cannot give: an unpriced decoration (embroidery, patch, heat transfer, digital print), an unlisted fabric, custom dyeing, a special trim or process, " +
      "or a whole product our own line doesn't make (e.g. caps, outerwear) when a partner category for it exists. " +
      "Before calling, collect the details a supplier needs to quote (for embroidery/patch: size in cm, placement, number of thread colors; for fabric: composition, weight, feel; for a whole product: style, material, key details, colors; plus quantity). " +
      "Call it once per item; the server ignores duplicates. Never invent the price yourself.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: [...Object.keys(SUPPLIER_CATEGORIES), ...customCategories],
          description: "Supplier category. Korean names are categories our admin added (e.g. 모자 = caps).",
        },
        price_scope: {
          type: "string",
          enum: ["add_on", "whole_item", "fabric"],
          description: "add_on = extra cost on top of a garment we make (decoration, trim, dyeing); whole_item = the partner makes the whole product (caps, outerwear…); fabric = fabric that replaces our standard fabric.",
        },
        garment: { type: "string", enum: Object.keys(GARMENTS), description: "The garment this is for." },
        quantity: { type: "integer", description: "Total pieces for this item." },
        request_ko: {
          type: "string",
          description:
            "The full spec the supplier needs to quote without asking back, in KOREAN, one '항목: 값' per line. " +
            "Start with 품목 and 수량, then every checklist item for this category from your instructions, then 공통 항목 (컬러별 수량, 사이즈 구성, 샘플 여부, 희망 납기, 배송 국가). " +
            "Write '고객 미정' for anything the buyer didn't specify instead of leaving it out. If the buyer sent a photo, add a '사진 설명' line describing what is visible (colors, size, placement). No customer name, email or company.",
        },
        customer_question: { type: "string", description: "What the buyer asked, in their own words (short)." },
        customer_language: { type: "string", description: "The language the buyer writes in, e.g. English, Korean, Thai." },
      },
      required: ["category", "price_scope", "quantity", "request_ko", "customer_language"],
    },
  };
}

export function supplierPolicyPrompt(activeCategories: string[]): string {
  const list = activeCategories.length ? activeCategories.map(categoryKo).join(", ") : "없음";
  return (
    "\n[모르는 견적 — 협력 업체 문의]\n" +
    `- 지금 협력 업체가 등록된 품목: ${list}\n` +
    "- calculate_quote 결과에 supplier_quote_needed가 있으면 그 항목은 디렉터에게 미루지 말고 협력 업체에 물어봅니다. 필요한 정보가 이미 있으면 같은 턴에 바로 request_supplier_quote를 호출하세요.\n" +
    "- calculate_quote 결과에 '견적 제외(not_included / unpriced)'인 항목이 있거나, 표에 없는 원단·염색·특수 가공을 물으면, 필요한 정보(크기·위치·색 수·소재 등)를 먼저 짧게 확인한 뒤 request_supplier_quote를 호출하세요.\n" +
    "- 업체 요청문은 업체가 되묻지 않고 바로 단가를 낼 수 있을 만큼 자세해야 합니다. 호출 전에 아래 품목별 확인 항목 중 가격에 큰 영향을 주는 것(크기·종류·소재·색 수·수량)이 빠졌다면 고객에게 한 번에 하나씩 짧게 물어보세요(최대 2~3번). 고객이 모른다·상관없다고 하면 더 묻지 말고 '고객 미정'으로 적고 호출하세요. 사진이 있으면 사진에서 읽을 수 있는 것은 묻지 말고 직접 적으세요.\n" +
    "  품목별 확인 항목:\n" + checklistPrompt(activeCategories) + "\n" +
    `  · 공통: ${COMMON_CHECKLIST.join(", ")}\n` +
    "- 우리 라인에서 안 만드는 품목(모자, 아우터 등)이라도 위 목록에 맞는 품목이 있으면 거절하지 말고, 스타일·소재·디테일·컬러·수량을 확인한 뒤 그 품목으로 request_supplier_quote(price_scope=whole_item)를 호출하세요. 목록에 없으면 지금처럼 '상의·스포츠웨어 전문'으로 안내합니다.\n" +
    "- 호출한 턴에는 '협력 공장에 확인을 요청했고, 답이 오면 이 채팅과 이메일로 바로 알려 드린다'고 한 줄로 안내하세요. 보통 영업일 기준 몇 시간~하루 걸린다고 말하세요. 가격을 추측해서 말하지 마세요.\n" +
    "- 아직 이메일을 못 받았다면 이 순간이 이메일을 묻기 좋은 때입니다: '답이 오면 메일로도 보내 드릴게요 — 어느 주소로 보내 드릴까요?'\n" +
    "- 업체가 있다는 사실 외에 업체 이름·연락처·원가는 절대 말하지 마세요.\n"
  );
}

// ─── 관리자 토큰 ───────────────────────────────────────────────────
// 기존 관리자 로그인은 브라우저에만 상태가 있어서, 업체 연락처를 다루는 API만이라도 서명 토큰으로 막는다.

const ADMIN_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function adminTokenKey(): string {
  return process.env.ADMIN_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function signAdminToken(email: string): string | null {
  const key = adminTokenKey();
  if (!key) return null;
  const payload = `${Buffer.from(email).toString("base64url")}.${Date.now() + ADMIN_TOKEN_TTL_MS}`;
  const sig = crypto.createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string | undefined): string | null {
  const key = adminTokenKey();
  if (!key || !token) return null;
  const [emailB64, exp, sig] = token.split(".");
  if (!emailB64 || !exp || !sig) return null;
  const expected = crypto.createHmac("sha256", key).update(`${emailB64}.${exp}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now()) return null;
  return Buffer.from(emailB64, "base64url").toString();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!verifyAdminToken(token)) return res.status(401).json({ error: "관리자 로그인이 필요합니다. 로그아웃 후 다시 로그인해 주세요." });
  next();
}

// ─── 발송 통로 ─────────────────────────────────────────────────────

const siteUrl = () => (process.env.PUBLIC_SITE_URL || "https://k-apparel.works").replace(/\/$/, "");

async function sendSms(to: string, text: string): Promise<string> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const secret = process.env.SOLAPI_API_SECRET;
  const from = process.env.SOLAPI_SENDER;
  if (!apiKey || !secret || !from) return "skipped";
  const phone = to.replace(/[^0-9]/g, "");
  if (!phone) return "no_phone";
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto.createHmac("sha256", secret).update(date + salt).digest("hex");
  try {
    const r = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
      },
      // 90바이트가 넘으면 솔라피가 알아서 장문(LMS)으로 보낸다
      body: JSON.stringify({ message: { to: phone, from: from.replace(/[^0-9]/g, ""), text } }),
    });
    if (!r.ok) {
      console.error("SMS failed:", r.status, await r.text());
      return `error_${r.status}`;
    }
    return "sent";
  } catch (err) {
    console.error("SMS failed:", err);
    return "error";
  }
}

// Gmail(Workspace) SMTP — 회사 메일 주소로 나가고, 답장은 평소 받은편지함으로, 보낸편지함에도 남는다
let gmail: nodemailer.Transporter | null = null;
function gmailTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!gmail) gmail = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass: pass.replace(/\s/g, "") } });
  return gmail;
}

const mailConfigured = () => !!(gmailTransport() || (process.env.RESEND_API_KEY && process.env.MAIL_FROM));

async function sendEmail(to: string, subject: string, text: string, html: string): Promise<string> {
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return "no_email";
  const smtp = gmailTransport();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || "Korea Apparel Works"}" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
        ...(process.env.MAIL_REPLY_TO ? { replyTo: process.env.MAIL_REPLY_TO } : {}),
      });
      return "sent";
    } catch (err) {
      console.error("Gmail send failed:", err);
      return "error_smtp";
    }
  }
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) return "skipped";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from, to: [to], subject, text, html, reply_to: process.env.MAIL_REPLY_TO || from }),
    });
    if (!r.ok) {
      console.error("Email failed:", r.status, await r.text());
      return `error_${r.status}`;
    }
    return "sent";
  } catch (err) {
    console.error("Email failed:", err);
    return "error";
  }
}

function esc(str: unknown): string {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function telegram(method: string, body: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch (err) {
    console.error(`Telegram ${method} failed:`, err);
    return null;
  }
}

// ─── 가격 ──────────────────────────────────────────────────────────

export type ReplyUnit = "per_piece" | "per_yard" | "per_order";

export interface SupplierReply {
  unit: ReplyUnit;
  price_krw: number;
  setup_krw: number;
  moq: number | null;
  lead_time: string;
  note: string;
  /** 업체가 달러로 적었으면 원래 값 (계산은 price_krw로) */
  original?: { currency: "USD"; price: number; setup: number };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** 업체 원가 → 고객 장당 가격(견적 엔진과 같은 마진·범위). MOQ보다 적게 주문하면 MOQ만큼 산다고 본다. */
export function customerPriceFromReply(reply: SupplierReply, quantity: number, garment?: string | null) {
  const q = Math.max(1, quantity || 1);
  const billed = reply.moq && reply.moq > q ? reply.moq : q;
  let totalKrw: number;
  if (reply.unit === "per_order") {
    totalKrw = reply.price_krw + reply.setup_krw;
  } else if (reply.unit === "per_yard") {
    const yards = GARMENTS[(garment || "other") as GarmentKey]?.yardsPerPiece ?? 1.3;
    totalKrw = reply.price_krw * yards * billed + reply.setup_krw;
  } else {
    totalKrw = reply.price_krw * billed + reply.setup_krw;
  }
  const costUsdPerPiece = totalKrw / q / FX_KRW_PER_USD;
  const low = round2(costUsdPerPiece * (1 + MARKUP));
  const high = round2(low * (1 + ESTIMATE_SPREAD));
  return { low, high, moq_applied: billed > q ? billed : null, cost_krw_per_piece: Math.round(totalKrw / q) };
}

// ─── 본체 ──────────────────────────────────────────────────────────

interface Deps {
  supabase: SupabaseClient;
  getGemini: () => GoogleGenAI;
  model: string;
}

export function createSupplierRelay({ supabase, getGemini, model }: Deps) {
  const ownerChat = () => process.env.TELEGRAM_CHAT_ID;

  // 업체가 등록된 품목 (1분 캐시) — BBally 도구 목록과 프롬프트에 들어간다
  let categoryCache: { at: number; list: string[] } | null = null;
  async function activeCategories(): Promise<string[]> {
    if (categoryCache && Date.now() - categoryCache.at < 60_000) return categoryCache.list;
    const { data, error } = await supabase.from("suppliers").select("categories").eq("active", true);
    const list = error ? [] : [...new Set((data || []).flatMap((r: any) => r.categories || []))] as string[];
    categoryCache = { at: Date.now(), list };
    return list;
  }

  /** /api/chat이 매 요청 쓰는 도구 선언 + 프롬프트 */
  async function chatTools() {
    const active = await activeCategories();
    const custom = active.filter((c) => !SUPPLIER_CATEGORIES[c]);
    return { declaration: supplierToolDeclaration(custom), prompt: supplierPolicyPrompt(active) };
  }

  async function suppliersFor(category: string) {
    const { data } = await supabase.from("suppliers").select("*").eq("active", true).contains("categories", [category]);
    return data || [];
  }

  /** 고객이 이 대화에서 올린 디자인·샘플 사진 (업체 메일과 답변 화면에 같이 보여 준다) */
  async function sessionImages(sessionId: string): Promise<string[]> {
    const { data } = await supabase
      .from("messages")
      .select("content")
      .eq("session_id", sessionId)
      .eq("sender_role", "user")
      .like("content", "%[Image Attached:%")
      .order("created_at", { ascending: true })
      .limit(20);
    const urls = (data || []).flatMap((m: any) => [...String(m.content).matchAll(/\[Image Attached:\s*(https?:\/\/[^\]\s]+)\]/g)].map((x) => x[1]));
    return [...new Set(urls)].slice(0, 6);
  }

  function approvalText(inq: any, suppliers: any[], statusLine: string, imageCount = 0) {
    const cat = categoryKo(inq.category);
    const names = suppliers.length ? suppliers.map((s) => esc(s.name)).join(", ") : "등록된 업체 없음 — 관리자 화면 '협력 업체'에서 추가";
    return (
      `🏭 <b>업체 견적 문의 #${inq.id}</b> · ${esc(cat)}\n\n` +
      `${esc(inq.request_ko)}\n\n` +
      (inq.customer_question ? `고객 질문: ${esc(inq.customer_question)}\n` : "") +
      (imageCount ? `고객 사진 ${imageCount}장 함께 보냄\n` : "") +
      `받을 업체: ${names}\n` +
      (inq.customer_email ? `고객: ${esc(inq.customer_email)}\n` : "") +
      `세션: ${esc(String(inq.session_id).slice(0, 8))}\n\n` +
      statusLine
    );
  }

  /** BBally 도구 호출 → 문의 생성 + 사장님 승인 요청. 같은 세션·같은 품목의 진행 중인 문의가 있으면 그걸 돌려준다. */
  async function createInquiry(sessionId: string, userEmail: string | undefined, args: any) {
    const active = await activeCategories();
    const category = SUPPLIER_CATEGORIES[args.category] || active.includes(args.category) ? String(args.category) : "other";
    const priceScope: PriceScope = ["add_on", "whole_item", "fabric"].includes(args.price_scope) ? args.price_scope : "add_on";
    const { data: existing } = await supabase
      .from("supplier_inquiries")
      .select("id,status")
      .eq("session_id", sessionId)
      .eq("category", category)
      .in("status", ["pending_approval", "sent", "answered", "no_supplier"])
      .order("created_at", { ascending: false })
      .limit(1);
    if (existing?.[0]) return { inquiryId: existing[0].id as number, duplicate: true };

    const row = {
        session_id: sessionId,
        customer_email: userEmail || null,
        customer_language: String(args.customer_language || "English").slice(0, 40),
        category,
        garment: args.garment || null,
        quantity: Math.max(1, Math.round(Number(args.quantity) || 1)),
        request_ko: String(args.request_ko || "").slice(0, 2000),
        customer_question: args.customer_question ? String(args.customer_question).slice(0, 1000) : null,
    };
    let { data: inq, error } = await supabase.from("supplier_inquiries").insert([{ ...row, price_scope: priceScope }]).select().single();
    // price_scope 컬럼을 아직 안 만들었으면 없이 저장 (supabase_supplier_inquiries.sql 맨 아래 참고)
    if (error && /price_scope/.test(error.message)) ({ data: inq, error } = await supabase.from("supplier_inquiries").insert([row]).select().single());
    if (error || !inq) throw new Error(error?.message || "inquiry insert failed");

    const suppliers = await suppliersFor(category);
    const images = await sessionImages(sessionId);
    const buttons = suppliers.length
      ? [[{ text: `✅ 업체 ${suppliers.length}곳에 보내기`, callback_data: `inq:ok:${inq.id}` }, { text: "❌ 취소", callback_data: `inq:no:${inq.id}` }]]
      : [[{ text: "❌ 닫기", callback_data: `inq:no:${inq.id}` }]];
    const sent = await telegram("sendMessage", {
      chat_id: ownerChat(),
      text: approvalText(inq, suppliers, suppliers.length ? "보내기를 누르면 업체에 문자·메일이 나갑니다." : "업체를 등록한 뒤 관리자 화면에서 다시 보낼 수 있습니다.", images.length),
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: buttons },
    });
    const messageId = sent?.result?.message_id;
    await supabase
      .from("supplier_inquiries")
      .update({ telegram_message_id: messageId ?? null, status: suppliers.length ? "pending_approval" : "no_supplier" })
      .eq("id", inq.id);
    return { inquiryId: inq.id as number, duplicate: false };
  }

  /** 승인 → 업체마다 답변 링크를 만들고 문자·메일 발송 */
  async function sendToSuppliers(inquiryId: number) {
    const { data: inq } = await supabase.from("supplier_inquiries").select("*").eq("id", inquiryId).single();
    if (!inq) throw new Error("문의를 찾을 수 없습니다");
    if (!["pending_approval", "no_supplier"].includes(inq.status)) return { inq, results: [] as any[], already: true };
    const suppliers = await suppliersFor(inq.category);
    if (!suppliers.length) return { inq, results: [], already: false };

    const cat = categoryKo(inq.category);
    const images = await sessionImages(inq.session_id);
    const imagesText = images.length ? `\n\n고객 참고 사진:\n${images.join("\n")}` : "";
    const imagesHtml = images.length
      ? `<p style="margin-top:16px"><strong>고객 참고 사진</strong></p><p>${images
          .map((u) => `<a href="${esc(u)}"><img src="${esc(u)}" alt="" style="width:160px;height:160px;object-fit:cover;border-radius:8px;margin:0 8px 8px 0;border:1px solid #eee"></a>`)
          .join("")}</p>`
      : "";
    const results: any[] = [];
    for (const s of suppliers) {
      const token = crypto.randomBytes(18).toString("base64url");
      const link = `${siteUrl()}/reply/${token}`;
      const smsText = `[코리아어패럴웍스 견적요청] ${cat}\n${inq.request_ko}${images.length ? `\n(참고 사진 ${images.length}장은 링크에서 확인)` : ""}\n\n단가 답변: ${link}`;
      const mailText = `${s.contact_name || s.name}님, 안녕하세요. 코리아어패럴웍스입니다.\n\n아래 작업 견적 부탁드립니다.\n\n${inq.request_ko}${imagesText}\n\n아래 링크에서 단가·납기를 적어 주시면 됩니다.\n${link}\n\n감사합니다.\n\n— English: open the link above and tap "English" at the top to read and answer in English.`;
      const mailHtml =
        `<p>${esc(s.contact_name || s.name)}님, 안녕하세요. 코리아어패럴웍스입니다.</p>` +
        `<p>아래 작업 견적 부탁드립니다.</p>` +
        `<pre style="font-family:inherit;white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px">${esc(inq.request_ko)}</pre>` +
        imagesHtml +
        `<p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">단가·납기 답변하기</a></p>` +
        `<p style="color:#888;font-size:12px">링크가 안 열리면: ${esc(link)}</p>` +
        `<p style="color:#888;font-size:12px">English: open the link and tap "English" at the top to read and answer in English.</p>`;
      const [smsStatus, emailStatus] = await Promise.all([
        s.phone ? sendSms(s.phone, smsText) : Promise.resolve("no_phone"),
        s.email ? sendEmail(s.email, `[견적요청] ${cat} · ${inq.quantity}장`, mailText, mailHtml) : Promise.resolve("no_email"),
      ]);
      await supabase.from("supplier_inquiry_recipients").insert([{ inquiry_id: inq.id, supplier_id: s.id, token, sms_status: smsStatus, email_status: emailStatus }]);
      results.push({ name: s.name, sms: smsStatus, email: emailStatus });
    }
    await supabase.from("supplier_inquiries").update({ status: "sent", approved_at: new Date().toISOString() }).eq("id", inq.id);
    return { inq, results, already: false };
  }

  const statusKo = (s: string) => (s === "sent" ? "문자✓" : s === "skipped" ? "문자 미설정" : s === "no_phone" ? "번호 없음" : `실패(${s})`);
  const mailKo = (s: string) => (s === "sent" ? "메일✓" : s === "skipped" ? "메일 미설정" : s === "no_email" ? "메일 없음" : `실패(${s})`);

  /** 텔레그램 버튼 처리 */
  async function handleTelegramUpdate(update: any) {
    const cq = update?.callback_query;
    if (!cq?.data || String(cq.message?.chat?.id) !== String(ownerChat())) return;
    const m = /^inq:(ok|no):(\d+)$/.exec(cq.data);
    if (!m) return;
    const id = Number(m[2]);
    const edit = async (inq: any, suppliers: any[], line: string) =>
      telegram("editMessageText", { chat_id: ownerChat(), message_id: cq.message.message_id, text: approvalText(inq, suppliers, line), parse_mode: "HTML" });

    if (m[1] === "no") {
      const { data: inq } = await supabase.from("supplier_inquiries").update({ status: "cancelled" }).eq("id", id).select().single();
      await telegram("answerCallbackQuery", { callback_query_id: cq.id, text: "취소했습니다" });
      if (inq) await edit(inq, [], "❌ 취소됨");
      return;
    }
    const { inq, results, already } = await sendToSuppliers(id);
    await telegram("answerCallbackQuery", { callback_query_id: cq.id, text: already ? "이미 처리된 문의입니다" : results.length ? "업체에 보냈습니다" : "등록된 업체가 없습니다" });
    if (!already) {
      const lines = results.map((r) => `· ${esc(r.name)} — ${statusKo(r.sms)} / ${mailKo(r.email)}`).join("\n");
      await edit(inq, await suppliersFor(inq.category), results.length ? `✅ 발송됨\n${lines}` : "⚠️ 등록된 업체가 없어 보내지 못했습니다");
    }
  }

  /** 고객 이메일: 로그인 이메일 → 없으면 대화 중 고객이 적은 마지막 이메일 */
  async function customerEmailFor(inq: any): Promise<string | null> {
    if (inq.customer_email) return inq.customer_email;
    const { data } = await supabase
      .from("messages")
      .select("content")
      .eq("session_id", inq.session_id)
      .eq("sender_role", "user")
      .order("created_at", { ascending: false })
      .limit(50);
    for (const row of data || []) {
      const found = String(row.content || "").match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
      if (found) return found[0];
    }
    return null;
  }

  /** 업체 답 → 고객 언어 메시지 (원가·업체 정보는 넘기지 않는다) */
  async function writeCustomerMessage(inq: any, price: { low: number; high: number; moq_applied: number | null }, reply: SupplierReply) {
    const cat = categoryEn(inq.category);
    const facts = {
      topic: cat,
      buyer_question: inq.customer_question || "",
      quantity: inq.quantity,
      price_per_piece_usd: price.low === price.high ? `$${price.low.toFixed(2)}` : `$${price.low.toFixed(2)}–$${price.high.toFixed(2)}`,
      price_meaning:
        inq.price_scope === "whole_item"
          ? "This is the full price per finished piece for this product (any setup cost is already spread into it). It is separate from any other items quoted earlier."
          : inq.price_scope === "fabric" || reply.unit === "per_yard"
          ? "This is the fabric cost per finished garment, replacing the placeholder fabric cost in the earlier estimate."
          : "This is added on top of the earlier per-piece estimate; any setup cost is already spread into it.",
      minimum_quantity: price.moq_applied ? `Priced as ${price.moq_applied} pcs because that is the minimum run for this process.` : null,
      lead_time: reply.lead_time || null,
      supplier_note_ko: reply.note || null,
    };
    const prompt =
      `You are BBally, the assistant of Korea Apparel Works (a Korean apparel factory). Earlier in the chat the buyer asked about ${cat}; our partner workshop has now answered. Write the topic name naturally in the buyer's language.\n` +
      `Write the follow-up message in ${inq.customer_language || "English"}.\n\n` +
      `Facts (JSON):\n${JSON.stringify(facts, null, 2)}\n\n` +
      "Format exactly:\n" +
      `1st line: a short lead-in like 'Update on your ${cat} question:' (in the buyer's language), then the price in bold on the same line, e.g. **$1.20–$1.32 per piece** (${inq.quantity} pcs).\n` +
      "Blank line, then 2–3 short '- ' bullets: what the price means, lead time (if given), minimum quantity (if given), and anything from supplier_note_ko that matters to the buyer (translated).\n" +
      "Blank line, then one sentence: it's a broad estimate that can be adjusted as we finalize details, and our director will include it in the formal quote by email.\n" +
      "Rules: no greeting, no 'Hi'. Never mention suppliers, workshops by name, KRW, cost, margin, or any number not in the facts. Do not repeat supplier_note_ko if it is about internal cost or payment terms between factories.";
    try {
      const r = await getGemini().models.generateContent({ model, contents: [{ role: "user", parts: [{ text: prompt }] }] });
      const text = (r.text || "").trim();
      if (text) return text;
    } catch (err) {
      console.error("Customer message generation failed:", err);
    }
    return (
      `Update on your ${cat} question: **${facts.price_per_piece_usd} per piece** (${inq.quantity} pcs)\n\n` +
      `- ${facts.price_meaning}\n` +
      (reply.lead_time ? `- Lead time: ${reply.lead_time}\n` : "") +
      `\nThis is a broad estimate and may be adjusted as we finalize details; our director will include it in your formal quote by email.`
    );
  }

  function markdownToHtml(text: string) {
    return text
      .split(/\n{2,}/)
      .map((block) => {
        const lines = block.split("\n");
        const inline = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        if (lines.every((l) => /^\s*[-•]\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-•]\s+/, ""))}</li>`).join("")}</ul>`;
        return `<p>${lines.map(inline).join("<br>")}</p>`;
      })
      .join("");
  }

  /** 첫 답변이면 고객에게 전달, 이미 전달했으면 사장님에게만 알림 */
  async function handleReply(recipient: any, reply: SupplierReply) {
    const { data: inq } = await supabase.from("supplier_inquiries").select("*").eq("id", recipient.inquiry_id).single();
    const { data: supplier } = await supabase.from("suppliers").select("name").eq("id", recipient.supplier_id).single();
    if (!inq) return;
    const price = customerPriceFromReply(reply, inq.quantity, inq.garment);
    const unitKo = reply.unit === "per_yard" ? "야드당" : reply.unit === "per_order" ? "건당(총액)" : "장당";
    const costLine =
      `${esc(supplier?.name || "업체")}: ${unitKo} ${reply.price_krw.toLocaleString()}원` +
      (reply.original ? ` ($${reply.original.price}${reply.original.setup ? ` + 셋업 $${reply.original.setup}` : ""} 로 받음)` : "") +
      (reply.setup_krw ? ` + 셋업 ${reply.setup_krw.toLocaleString()}원` : "") +
      (reply.moq ? ` · MOQ ${reply.moq}` : "") +
      (reply.lead_time ? ` · 납기 ${esc(reply.lead_time)}` : "") +
      (reply.note ? `\n메모: ${esc(reply.note)}` : "");

    if (inq.status === "delivered") {
      await telegram("sendMessage", {
        chat_id: ownerChat(),
        parse_mode: "HTML",
        text: `📨 <b>문의 #${inq.id} 추가 답변</b> (고객에게는 첫 답변만 전달됨)\n\n${costLine}\n→ 고객가 환산 $${price.low}–$${price.high}/장`,
      });
      return;
    }

    const message = await writeCustomerMessage(inq, price, reply);
    const email = await customerEmailFor(inq);
    let emailStatus = "no_email";
    if (email) {
      emailStatus = await sendEmail(
        email,
        `Update on your ${categoryEn(inq.category)} question — Korea Apparel Works`,
        message.replace(/\*\*/g, ""),
        `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222">${markdownToHtml(message)}<p style="color:#888;font-size:12px;margin-top:24px">Korea Apparel Works · Busan, Korea</p></div>`
      );
    }
    await supabase.from("messages").insert([{ session_id: inq.session_id, sender_role: "model", content: message }]);
    await supabase
      .from("supplier_inquiries")
      .update({
        status: "delivered",
        answered_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
        customer_message: message,
        customer_price: { low: price.low, high: price.high, unit: "usd_per_piece", moq_applied: price.moq_applied },
      })
      .eq("id", inq.id);
    await telegram("sendMessage", {
      chat_id: ownerChat(),
      parse_mode: "HTML",
      text:
        `📨 <b>문의 #${inq.id} 업체 답변 → 고객 전달</b>\n\n${costLine}\n` +
        `→ 고객가 $${price.low}–$${price.high}/장 (원가 ${price.cost_krw_per_piece.toLocaleString()}원/장)\n` +
        `전달: 채팅창 · 메일 ${email ? `${esc(email)} (${mailKo(emailStatus)})` : "없음"}\n\n${esc(message)}`,
    });
  }

  // ─── 라우트 ──────────────────────────────────────────────────────

  function registerRoutes(app: Express) {
    // 텔레그램 버튼 → 서버 (setWebhook 때 넣은 secret_token으로 확인)
    app.post("/api/telegram/webhook", async (req, res) => {
      const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
      if (!secret || req.headers["x-telegram-bot-api-secret-token"] !== secret) return res.status(401).end();
      try {
        await handleTelegramUpdate(req.body);
      } catch (err) {
        console.error("Telegram webhook failed:", err);
      }
      res.json({ ok: true });
    });

    // 업체 답변 페이지용
    const findRecipient = async (token: string) => {
      if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) return null;
      const { data } = await supabase.from("supplier_inquiry_recipients").select("*").eq("token", token).maybeSingle();
      if (!data) return null;
      if (Date.now() - new Date(data.created_at).getTime() > 21 * 24 * 60 * 60 * 1000) return { ...data, expired: true };
      return data;
    };

    // 영어 화면용 요청문 번역 (문의별로 한 번만, 서버 메모리에 보관)
    const englishCache = new Map<number, { category: string; request: string }>();
    const toEnglish = async (inq: any) => {
      const hit = englishCache.get(inq.id);
      if (hit) return hit;
      let out = { category: categoryEn(inq.category), request: inq.request_ko };
      try {
        const r = await getGemini().models.generateContent({
          model,
          contents: [{
            role: "user",
            parts: [{
              text:
                "Translate this Korean apparel production request for an overseas factory into clear English. Keep the same line structure and all numbers/sizes. " +
                'Reply as JSON only: {"category": "...", "request": "..."}\n\n' +
                JSON.stringify({ category: categoryKo(inq.category), request: inq.request_ko }),
            }],
          }],
          config: { responseMimeType: "application/json" },
        });
        const parsed = JSON.parse(r.text || "{}");
        if (parsed.request) out = { category: String(parsed.category || out.category), request: String(parsed.request) };
        englishCache.set(inq.id, out);
      } catch (err) {
        console.error("Request translation failed:", err);
      }
      return out;
    };

    app.get("/api/supplier-reply/:token", async (req, res) => {
      const rec = await findRecipient(req.params.token);
      if (!rec) return res.status(404).json({ error: "링크를 찾을 수 없습니다." });
      const { data: inq } = await supabase.from("supplier_inquiries").select("*").eq("id", rec.inquiry_id).single();
      const { data: s } = await supabase.from("suppliers").select("name,contact_name").eq("id", rec.supplier_id).single();
      const en = req.query.lang === "en" && inq ? await toEnglish(inq) : null;
      res.json({
        supplier: s?.contact_name || s?.name || "",
        category: en ? en.category : categoryKo(inq?.category),
        priceScope: inq?.price_scope || null,
        quantity: inq?.quantity,
        request: en ? en.request : inq?.request_ko,
        images: inq ? await sessionImages(inq.session_id) : [],
        createdAt: inq?.created_at,
        expired: !!rec.expired || inq?.status === "cancelled",
        reply: rec.reply,
      });
    });

    app.post("/api/supplier-reply/:token", async (req, res) => {
      const rec = await findRecipient(req.params.token);
      if (!rec) return res.status(404).json({ error: "링크를 찾을 수 없습니다." });
      if (rec.expired) return res.status(410).json({ error: "기한이 지난 문의입니다." });
      if (rec.reply) return res.status(409).json({ error: "이미 답변하셨습니다. 수정이 필요하면 전화 주세요." });
      const b = req.body || {};
      const num = (v: unknown) => {
        const n = Number(String(v ?? "").replace(/[^0-9.]/g, ""));
        return Number.isFinite(n) ? n : 0;
      };
      // 해외 업체는 달러로 적을 수 있다 → 견적 엔진과 같은 환율로 원화로 바꿔 계산
      const usd = b.currency === "USD";
      const rawPrice = num(b.price ?? b.price_krw);
      const rawSetup = num(b.setup ?? b.setup_krw);
      const reply: SupplierReply = {
        unit: (["per_piece", "per_yard", "per_order"].includes(b.unit) ? b.unit : "per_piece") as ReplyUnit,
        price_krw: usd ? Math.round(rawPrice * FX_KRW_PER_USD) : rawPrice,
        setup_krw: usd ? Math.round(rawSetup * FX_KRW_PER_USD) : rawSetup,
        ...(usd ? { original: { currency: "USD" as const, price: rawPrice, setup: rawSetup } } : {}),
        moq: b.moq ? Math.round(num(b.moq)) || null : null,
        lead_time: String(b.lead_time || "").slice(0, 100),
        note: String(b.note || "").slice(0, 1000),
      };
      if (reply.price_krw <= 0 || reply.price_krw > 10_000_000) return res.status(400).json({ error: "단가를 원 단위 숫자로 적어 주세요." });
      // 동시에 두 번 눌러도 한 번만 저장되도록 reply가 비어 있을 때만 갱신
      const { data: updated } = await supabase
        .from("supplier_inquiry_recipients")
        .update({ reply, replied_at: new Date().toISOString() })
        .eq("id", rec.id)
        .is("reply", null)
        .select()
        .maybeSingle();
      if (!updated) return res.status(409).json({ error: "이미 답변하셨습니다." });
      try {
        await handleReply(updated, reply);
      } catch (err) {
        console.error("Reply delivery failed:", err);
      }
      res.json({ ok: true });
    });

    // 고객 채팅창: 내 세션 문의 중 전달된 답이 있는지
    app.get("/api/chat/updates", async (req, res) => {
      const sessionId = String(req.query.sessionId || "");
      const ids = String(req.query.ids || "")
        .split(",")
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0)
        .slice(0, 20);
      if (!sessionId || !ids.length) return res.json({ updates: [] });
      const { data } = await supabase
        .from("supplier_inquiries")
        .select("id,status,customer_message")
        .eq("session_id", sessionId)
        .in("id", ids);
      res.json({
        updates: (data || []).filter((d) => d.status === "delivered" && d.customer_message).map((d) => ({ id: d.id, text: d.customer_message })),
        closed: (data || []).filter((d) => d.status === "cancelled").map((d) => d.id),
      });
    });

    // ── 관리자 ──
    app.get("/api/admin/suppliers", requireAdmin, async (_req, res) => {
      const { data, error } = await supabase.from("suppliers").select("*").order("created_at", { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      res.json(data || []);
    });

    app.post("/api/admin/suppliers", requireAdmin, async (req, res) => {
      const b = req.body || {};
      const row = {
        name: String(b.name || "").trim().slice(0, 100),
        contact_name: String(b.contact_name || "").trim().slice(0, 100) || null,
        phone: String(b.phone || "").trim().slice(0, 30) || null,
        email: String(b.email || "").trim().slice(0, 200) || null,
        // 기본 품목 키 또는 관리자가 직접 적은 품목명(20자 이내)
        categories: [...new Set((Array.isArray(b.categories) ? b.categories : []).map((c: unknown) => String(c).trim()).filter((c: string) => c && c.length <= 20))].slice(0, 20),
        note: String(b.note || "").slice(0, 1000) || null,
        active: b.active !== false,
      };
      if (!row.name) return res.status(400).json({ error: "업체명을 입력해 주세요." });
      if (!row.phone && !row.email) return res.status(400).json({ error: "휴대폰이나 이메일 중 하나는 있어야 합니다." });
      if (!row.categories.length) return res.status(400).json({ error: "담당 품목을 하나 이상 골라 주세요." });
      const q = b.id ? supabase.from("suppliers").update(row).eq("id", b.id) : supabase.from("suppliers").insert([row]);
      const { error } = await q;
      if (error) return res.status(500).json({ error: error.message });
      categoryCache = null;
      res.json({ ok: true });
    });

    app.post("/api/admin/suppliers/delete", requireAdmin, async (req, res) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", req.body?.id);
      if (error) return res.status(500).json({ error: error.message });
      categoryCache = null;
      res.json({ ok: true });
    });

    app.get("/api/admin/supplier-inquiries", requireAdmin, async (_req, res) => {
      const { data: inquiries, error } = await supabase.from("supplier_inquiries").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) return res.status(500).json({ error: error.message });
      const ids = (inquiries || []).map((i) => i.id);
      const { data: recipients } = ids.length
        ? await supabase.from("supplier_inquiry_recipients").select("id,inquiry_id,supplier_id,sms_status,email_status,replied_at,reply").in("inquiry_id", ids)
        : { data: [] as any[] };
      res.json({ inquiries: inquiries || [], recipients: recipients || [] });
    });

    // 관리자 화면에서 다시 보내기 (업체를 나중에 등록한 경우)
    app.post("/api/admin/supplier-inquiries/send", requireAdmin, async (req, res) => {
      try {
        const { results, already } = await sendToSuppliers(Number(req.body?.id));
        if (already) return res.status(409).json({ error: "이미 보낸 문의입니다." });
        if (!results.length) return res.status(400).json({ error: "이 품목 담당 업체가 없습니다." });
        res.json({ ok: true, results });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // 어떤 통로가 설정됐는지 + 텔레그램 버튼 연결
    app.get("/api/admin/relay-status", requireAdmin, async (_req, res) => {
      res.json({
        telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
        telegramWebhookSecret: !!process.env.TELEGRAM_WEBHOOK_SECRET,
        sms: !!(process.env.SOLAPI_API_KEY && process.env.SOLAPI_API_SECRET && process.env.SOLAPI_SENDER),
        email: mailConfigured(),
        siteUrl: siteUrl(),
      });
    });

    app.post("/api/admin/telegram/setup-webhook", requireAdmin, async (_req, res) => {
      const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
      if (!secret) return res.status(400).json({ error: "TELEGRAM_WEBHOOK_SECRET 환경변수를 먼저 넣어 주세요." });
      const r = await telegram("setWebhook", { url: `${siteUrl()}/api/telegram/webhook`, secret_token: secret, allowed_updates: ["callback_query"] });
      if (!r?.ok) return res.status(500).json({ error: r?.description || "텔레그램 연결 실패" });
      res.json({ ok: true });
    });
  }

  return { createInquiry, chatTools, registerRoutes };
}
