// 견적 계산 엔진.
//
// BBally(LLM)는 숫자를 계산하지 않는다. 고객에게서 받은 사양을 calculate_quote 도구로 넘기면
// 이 파일이 api/pricingPolicy.ts의 표만 보고 계산해서 돌려준다.
// - BBally에게는 고객용 결과(판매가 범위, 포함/제외 항목, 플래그 문구)만 간다.
// - 원가 내역(internal)은 텔레그램·DB 로그로만 간다. 고객에게 절대 노출하지 않는다.

import {
  BASIC_TRIM_USD_TIERS,
  BRANDED_TRIMS,
  BrandedTrimKey,
  DECORATIONS,
  DecorationMethod,
  PRINT_SIZE_LABELS,
  PrintSize,
  ESTIMATE_SPREAD,
  FABRICS,
  FABRIC_YARD_MULTIPLIERS,
  FX_KRW_PER_USD,
  GARMENTS,
  GARMENT_PARTS,
  GARMENT_PART_USAGE,
  GarmentKey,
  LABOR_KRW_TIERS,
  MARKUP,
  MIN_CUT_YARDS_PER_COLOR,
  poloLaborKrw,
  ROUND_TEE_LABOR_DISCOUNT_KRW,
  PRODUCTION_LEAD_TIME,
  SAMPLE,
  SAMPLE_CREDIT_POLICY,
  TRIM_HEAVY_USD_PER_PIECE,
  UNLISTED_FABRIC_BULK_USD_PER_YARD,
} from "./pricingPolicy.js";

const round2 = (n: number) => Math.round(n * 100) / 100;
const krwToUsd = (krw: number) => krw / FX_KRW_PER_USD;

// ─── 입력 ──────────────────────────────────────────────────────────

export interface QuoteItemInput {
  garment: GarmentKey;
  /** FABRICS의 key. 고객 설명에 맞는 게 없으면 "unlisted". */
  fabric: string;
  /** 고객이 말한 원단 설명 원문 (표에 없는 소재일 때 디렉터 참고용) */
  fabric_note?: string;
  /** 컬러별 수량. 컬러 1개 50장이면 [50], 2컬러 50장씩이면 [50, 50]. */
  quantity_per_color: number[];
  decorations?: {
    method: DecorationMethod;
    placements?: number;
    /** 나염: 도수(색 수) */
    colors?: number;
    /** 나염: 인쇄 크기 */
    size?: PrintSize;
  }[];
  /** 라운드넥이어도 요꼬카라(플랫니트 칼라)가 들어가면 true — 폴로 공임과 요꼬카라 부속이 붙는다 */
  flat_knit_collar?: boolean;
  /** 원단을 PMS 지정색으로 새로 염색해야 하는지 */
  custom_dye?: boolean;
  /** 색이 있는 원단 위에 승화 전사를 원하는지 */
  sublimation_on_colored_fabric?: boolean;
}

export interface QuoteInput {
  order_type: "sample" | "production";
  items: QuoteItemInput[];
  branded_trims?: BrandedTrimKey[];
  /** 테크팩(작업지시서)이 있는지 */
  has_tech_pack?: boolean;
  /** 핏을 맞출 실물 레퍼런스 옷이나 사이즈표가 있는지 */
  has_size_reference?: boolean;
  ship_to_country?: string;
}

// ─── 출력 ──────────────────────────────────────────────────────────

export type FlagSeverity =
  /** 해당 항목은 숫자를 내지 않음 */
  | "blocker"
  /** 숫자는 냈지만 디렉터 확인 후 확정 */
  | "confirm"
  /** 고객에게 알려 줄 참고 사항 */
  | "info";

export interface QuoteFlag {
  code: string;
  severity: FlagSeverity;
  /** 고객에게 전달할 요지 (영문 — BBally가 고객 언어로 옮긴다) */
  customer_message: string;
  /** 디렉터용 메모 (한국어) */
  internal_note: string;
}

export interface CustomerItemQuote {
  item: string;
  fabric: string;
  quantity: number;
  colors: number;
  /** null 이면 숫자를 내지 않은 항목 (blocker) */
  price_per_piece_usd: { low: number; high: number } | null;
  line_total_usd: { low: number; high: number } | null;
  includes: string[];
  not_included: string[];
}

export interface CustomerQuote {
  estimate_type: "broad_estimate";
  order_type: "sample" | "production";
  items: CustomerItemQuote[];
  order_total_usd: { low: number; high: number } | null;
  /** 브랜드 부자재(MOQ 있는 것) 장당 배분액 — 이미 위 단가에 포함됨 */
  branded_trims_included: string[];
  flags: { severity: FlagSeverity; message: string }[];
  terms: string[];
  /** BBally가 고객에게 꼭 함께 말할 것 */
  must_say: string[];
}

export interface InternalItemBreakdown {
  item: string;
  quantity: number;
  fabric_usd_per_piece: number;
  fabric_detail: { color_qty: number; yards_bought: number; usd_per_yard: number }[];
  labor_usd_per_piece: number;
  basic_trim_usd_per_piece: number;
  garment_parts_usd_per_piece: number;
  decoration_usd_per_piece: number;
  branded_trim_usd_per_piece: number;
  cost_usd_per_piece: number;
  price_low_usd_per_piece: number;
}

export interface QuoteResult {
  customer: CustomerQuote;
  internal: {
    fx_krw_per_usd: number;
    markup: number;
    items: InternalItemBreakdown[];
    branded_trim_total_usd: number;
    flags: QuoteFlag[];
    needs_director: boolean;
  };
}

// ─── 사다리 조회 ───────────────────────────────────────────────────

/**
 * 사 오는 것(원단·부자재·부속·승화)은 업체 구간 단가대로 계단식. 흥정할 수 없으니 원가도 실제로 계단으로 움직인다.
 * 경계 바로 아래 수량은 calculateQuote의 price_break 안내로 "몇 장 더 하면 싸진다"를 알려 준다.
 */
function stepTier(tiers: { min: number; value: number }[], x: number): number {
  const desc = [...tiers].sort((a, b) => b.min - a.min);
  return (desc.find((t) => x >= t.min) ?? desc[desc.length - 1]).value;
}

/**
 * 공임(우리 공장 비용)만 구간 사이를 직선으로 잇는다. 99장과 100장 사이처럼 경계에서 값이 툭 떨어지지 않게.
 * - 각 구간 값은 그 구간이 시작하는 지점(min)에서 표의 값과 정확히 같다.
 * - 맨 아래 구간(min 0)은 다음 경계의 절반 지점에 놓고, 그보다 적으면 평평하게 그 값.
 * - 맨 위 구간이 시작한 뒤로도 평평하게 그 값.
 */
function smoothTier(tiers: { min: number; value: number }[], x: number): number {
  const asc = [...tiers].sort((a, b) => a.min - b.min);
  const pts = asc.map((t, i) => ({ x: t.min === 0 && asc[i + 1] ? asc[i + 1].min / 2 : t.min, y: t.value }));
  if (x <= pts[0].x) return pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (x <= b.x) return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
  }
  return pts[pts.length - 1].y;
}

function laborUsdPerPiece(garment: GarmentKey, stylePieces: number, flatKnitCollar = false): number {
  const g = GARMENTS[garment];
  // 요꼬카라가 들어가면 넥 모양과 상관없이 폴로 공정이다
  if (g.laborCurve === "polo" || (flatKnitCollar && g.laborCurve === "round_tee")) return krwToUsd(poloLaborKrw(stylePieces));
  if (g.laborCurve === "round_tee") return krwToUsd(poloLaborKrw(stylePieces) - ROUND_TEE_LABOR_DISCOUNT_KRW);
  const krw = smoothTier(LABOR_KRW_TIERS.map((t) => ({ min: t.minPieces, value: t.krwPerPiece })), stylePieces);
  return krwToUsd(krw * g.laborFactor);
}

function krwYardTier(tiers: { minYards: number; krw: number }[], yards: number): number {
  return stepTier(tiers.map((t) => ({ min: t.minYards, value: t.krw })), yards);
}

function fabricMultiplier(yards: number): number {
  return stepTier(FABRIC_YARD_MULTIPLIERS.map((t) => ({ min: t.minYards, value: t.multiplier })), yards);
}

/** 요꼬·단추·지퍼 등 품목별 부속. 단가는 스타일 총 장수 구간으로 정한다. */
function garmentPartsUsd(garment: GarmentKey, stylePieces: number, flatKnitCollar = false) {
  let usd = 0;
  const labels: string[] = [];
  const estimated: string[] = [];
  const usage = [...(GARMENT_PART_USAGE[garment] || [])];
  if (flatKnitCollar && !usage.some((u) => u.part === "flat_knit_collar")) usage.push({ part: "flat_knit_collar", units: 1 });
  for (const { part, units } of usage) {
    const spec = GARMENT_PARTS[part];
    const krw = stepTier(spec.krwTiers.map((t) => ({ min: t.minPieces, value: t.krwPerUnit })), stylePieces);
    usd += krwToUsd(krw * units);
    labels.push(units > 1 && part === "button" ? `${spec.label} ×${units}` : spec.label);
    if (!spec.confirmed) estimated.push(spec.label);
  }
  return { usd, labels, estimated };
}

function basicTrimUsd(stylePieces: number): number {
  return stepTier(BASIC_TRIM_USD_TIERS.map((t) => ({ min: t.minPieces, value: t.usd })), stylePieces);
}

/** MOQ가 있는 부자재: 주문 수량이 MOQ 이하면 MOQ 총액을 그대로 사야 한다. */
function brandedTrimTotalUsd(key: BrandedTrimKey, garments: number): number {
  const t = BRANDED_TRIMS[key];
  const unitsNeeded = garments * t.unitsPerGarment;
  const unitKrw = t.moqTotalKrw / t.moq;
  const totalKrw = unitsNeeded <= t.moq ? t.moqTotalKrw : unitKrw * unitsNeeded;
  return krwToUsd(totalKrw);
}

// ─── 메인 ──────────────────────────────────────────────────────────

/** 다음 단가 구간을 찾아볼 범위: 지금 수량의 +20% 또는 +10장 중 큰 쪽까지. */
const PRICE_BREAK_LOOKAHEAD = { ratio: 0.2, minPieces: 10 };
/** 1장 늘렸을 때 장당 단가가 이만큼(비율) 이상 툭 떨어지면 구간 경계로 본다. 공임 곡선의 완만한 하락은 걸리지 않는다. */
const PRICE_BREAK_STEP = 0.01;
/** 지금 단가 대비 이만큼(비율) 이상 내려가야 안내한다. */
const PRICE_BREAK_MIN_DROP = 0.02;

/**
 * 계단식 원가 때문에 경계 바로 아래 수량이 손해일 때, 조금 더 주문하면 장당 단가가 얼마로 내려가는지 찾는다.
 * 컬러가 여러 개면 컬러별 비율을 유지한 채 늘린다.
 */
function findPriceBreak(input: QuoteInput, index: number, base: CustomerItemQuote) {
  if (!base.price_per_piece_usd) return null;
  const item = input.items[index];
  const qty = base.quantity;
  const maxQty = qty + Math.max(PRICE_BREAK_LOOKAHEAD.minPieces, Math.ceil(qty * PRICE_BREAK_LOOKAHEAD.ratio));
  const colors = item.quantity_per_color.length ? item.quantity_per_color : [qty];
  let prevLow = base.price_per_piece_usd.low;
  for (let q = qty + 1; q <= maxQty; q++) {
    // 컬러별 비율 유지: 늘어난 장수를 앞 컬러부터 나눠 붙인다
    const scaled = colors.map((c) => Math.floor((c * q) / qty));
    for (let i = 0, rest = q - scaled.reduce((a, b) => a + b, 0); rest > 0; i = (i + 1) % scaled.length, rest--) scaled[i]++;
    const trial = calculateQuote({ ...input, items: [{ ...item, quantity_per_color: scaled }] }, { priceBreaks: false });
    const price = trial.customer.items[0].price_per_piece_usd;
    if (!price) return null;
    const isStep = price.low <= prevLow * (1 - PRICE_BREAK_STEP);
    if (isStep && price.low <= base.price_per_piece_usd.low * (1 - PRICE_BREAK_MIN_DROP)) {
      return { quantity: q, price, total: trial.customer.items[0].line_total_usd! };
    }
    prevLow = price.low;
  }
  return null;
}

export function calculateQuote(input: QuoteInput, opts: { priceBreaks?: boolean } = {}): QuoteResult {
  const flags: QuoteFlag[] = [];
  const addFlag = (f: QuoteFlag) => {
    if (!flags.some((x) => x.code === f.code && x.customer_message === f.customer_message)) flags.push(f);
  };

  const isSample = input.order_type === "sample";

  // 수량 정리: 음수·소수 방지, 컬러 수량이 비면 1장으로 본다. 모르는 품목 키는 "other"로.
  const items: QuoteItemInput[] = (input.items || []).filter(Boolean).map((it) => {
    const q = (it.quantity_per_color || []).map((n) => Math.max(0, Math.round(Number(n) || 0))).filter((n) => n > 0);
    return {
      ...it,
      garment: GARMENTS[it.garment] ? it.garment : "other",
      quantity_per_color: q.length ? q : [1],
    };
  });

  // 브랜드 부자재는 주문 전체(견적 가능한 품목)에 한 번 사서 나눠 쓴다
  const pricedGarmentCount = items
    .filter((it) => GARMENTS[it.garment].scope !== "not_in_house")
    .reduce((s, it) => s + it.quantity_per_color.reduce((a, b) => a + b, 0), 0);

  const brandedKeys = Array.from(new Set((input.branded_trims || []).filter((k) => BRANDED_TRIMS[k])));
  let brandedTrimTotal = 0;
  if (!isSample && pricedGarmentCount > 0) {
    for (const key of brandedKeys) {
      const total = brandedTrimTotalUsd(key, pricedGarmentCount);
      brandedTrimTotal += total;
      const perPiece = total / pricedGarmentCount;
      if (perPiece > TRIM_HEAVY_USD_PER_PIECE) {
        const t = BRANDED_TRIMS[key];
        addFlag({
          code: "trim_moq_heavy",
          severity: "info",
          customer_message: `${t.label} has a supplier minimum of ${t.moq.toLocaleString()} units, so at this quantity it adds about $${round2(perPiece * (1 + MARKUP))} per piece. A cheaper option is ${t.cheaperAlternative}.`,
          internal_note: `${t.label} MOQ ${t.moq} → 장당 원가 $${round2(perPiece)} (총 $${round2(total)})`,
        });
      }
    }
  }
  const brandedPerPiece = pricedGarmentCount > 0 ? brandedTrimTotal / pricedGarmentCount : 0;

  const customerItems: CustomerItemQuote[] = [];
  const internalItems: InternalItemBreakdown[] = [];

  for (const it of items) {
    const g = GARMENTS[it.garment];
    const qty = it.quantity_per_color.reduce((a, b) => a + b, 0);
    const colors = it.quantity_per_color.length;
    const fabricOpt = FABRICS.find((f) => f.key === it.fabric);
    const fabricLabel = fabricOpt ? `${fabricOpt.name} (${fabricOpt.spec})` : (it.fabric_note || "Fabric to be confirmed");

    // 1호 공장에서 하지 않는 품목 — 숫자를 내지 않는다
    if (g.scope === "not_in_house") {
      addFlag({
        code: "not_in_house",
        severity: "blocker",
        customer_message: g.scopeNote || `${g.label} is outside our production line.`,
        internal_note: `${g.label} ${qty}장 — 자체 생산 불가 품목, 견적 제외`,
      });
      customerItems.push({ item: g.label, fabric: fabricLabel, quantity: qty, colors, price_per_piece_usd: null, line_total_usd: null, includes: [], not_included: ["Not quoted — outside our production line"] });
      continue;
    }

    if (g.scope === "confirm") {
      addFlag({
        code: "category_confirm",
        severity: "confirm",
        customer_message: g.scopeNote || `Our director will confirm ${g.label} before quoting.`,
        internal_note: `${g.label} — 카테고리 경계, 구조 확인 후 확정`,
      });
    }

    if (!g.laborConfirmed) {
      addFlag({
        code: "labor_estimated",
        severity: "confirm",
        customer_message: `Sewing cost for ${g.label.toLowerCase()} is based on similar styles; the final figure comes after our factory reviews the design.`,
        internal_note: `${g.label} 공임 배수 ${round2(g.laborFactor)} 추정치 — pricingPolicy.ts GARMENTS에서 확정 필요`,
      });
    }

    if (!fabricOpt) {
      addFlag({
        code: "fabric_unlisted",
        severity: "confirm",
        customer_message: `The fabric you described isn't in our standard list, so the price uses a typical fabric cost; our director will source a match and confirm.`,
        internal_note: `표에 없는 원단: "${it.fabric_note || it.fabric}" — 기본 대량가 $${UNLISTED_FABRIC_BULK_USD_PER_YARD}/yd 적용`,
      });
    } else if (fabricOpt.estimated) {
      addFlag({
        code: "fabric_estimated",
        severity: "info",
        customer_message: `${fabricOpt.name} pricing is approximate until we confirm the exact mill.`,
        internal_note: `${fabricOpt.name} 야드 단가 추정치`,
      });
    }

    if (it.custom_dye) {
      addFlag({
        code: "custom_dye",
        severity: "confirm",
        customer_message: "Custom-dyeing fabric to a Pantone color has a dye-lot minimum, so for small runs we either match the color with sublimation / digital printing or use the closest stock color. Full custom dyeing is possible — our director will quote it separately.",
        internal_note: `${g.label} PMS 커스텀 염색 요청 — 염색 로트 최소량 확인, 견적엔 미포함`,
      });
    }

    if (it.sublimation_on_colored_fabric) {
      addFlag({
        code: "sublimation_on_color",
        severity: "confirm",
        customer_message: "Sublimation ink is transparent, so printing on a colored base shifts the print color. We'd run a strike-off test first, or print on white fabric instead.",
        internal_note: `${g.label} 컬러 원단 위 승화 — 색 겹침·열변색 위험, 시험 전사 필요`,
      });
    }

    // 원단: 컬러별로 따로 끊는다 (최소 컷 적용)
    const bulk = fabricOpt?.bulkUsdPerYard ?? UNLISTED_FABRIC_BULK_USD_PER_YARD;
    const fabricDetail = it.quantity_per_color.map((cq) => {
      const yards = Math.max(cq * g.yardsPerPiece, MIN_CUT_YARDS_PER_COLOR);
      const usdPerYard = fabricOpt?.krwPerYardTiers
        ? krwToUsd(krwYardTier(fabricOpt.krwPerYardTiers, yards))
        : bulk * fabricMultiplier(yards);
      return { color_qty: cq, yards_bought: round2(yards), usd_per_yard: round2(usdPerYard), total: yards * usdPerYard };
    });
    const fabricPerPiece = fabricDetail.reduce((s, d) => s + d.total, 0) / qty;

    const labor = laborUsdPerPiece(it.garment, qty, it.flat_knit_collar);
    const basicTrim = basicTrimUsd(qty);
    const parts = garmentPartsUsd(it.garment, qty, it.flat_knit_collar);
    if (parts.estimated.length) {
      addFlag({
        code: "parts_estimated",
        severity: "confirm",
        customer_message: `Trim parts for the ${g.label.toLowerCase()} (${parts.estimated.join(", ").toLowerCase()}) use typical costs; the exact figure comes with the formal quote.`,
        internal_note: `${g.label} 부속 추정치: ${parts.estimated.join(", ")} — pricingPolicy.ts GARMENT_PARTS 확정 필요`,
      });
    }

    // 장식
    let decorationPerPiece = 0;
    let decorationSetup = 0;
    const includes: string[] = [`${fabricLabel}`, "cut & sew", "basic trims (thread, care label, plain polybag)"];
    if (parts.labels.length) includes.push(parts.labels.join(", ").toLowerCase());
    const notIncluded: string[] = [];
    for (const d of it.decorations || []) {
      const spec = DECORATIONS[d.method] ?? DECORATIONS.other;
      const placements = Math.max(1, Math.round(d.placements ?? 1));
      if (spec.krwPerFabricYard != null) {
        // 승화전사처럼 원단 야드로 매기는 장식 — 컬러별로 산 원단 야드 전체에 찍는다
        const yards = fabricDetail.reduce((s, f) => s + f.yards_bought, 0);
        decorationPerPiece += krwToUsd(yards * spec.krwPerFabricYard) / qty;
        includes.push(spec.label);
      } else if (spec.screenPrint) {
        // 나염 — 도수·크기별 판비(주문 전체 한 번) + 인쇄비(장당)
        const size: PrintSize = d.size && spec.screenPrint[d.size] ? d.size : "a4";
        const colors = Math.max(1, Math.round(d.colors ?? 1));
        const rate = spec.screenPrint[size];
        decorationPerPiece += krwToUsd(rate.krwPerColorPerPiece * colors * placements);
        decorationSetup += krwToUsd(rate.setupKrwPerColor * colors * placements);
        includes.push(`${spec.label} ${colors}-color, ${PRINT_SIZE_LABELS[size]} ×${placements}`);
        if (d.colors == null || !d.size) {
          addFlag({
            code: "screen_print_assumed",
            severity: "info",
            customer_message: `Screen print is priced as ${colors}-color, ${PRINT_SIZE_LABELS[size]} per placement; the number of colors and print size change the setup and print cost.`,
            internal_note: `${g.label} 나염 도수/크기 미확인 — ${colors}도·${size} 가정`,
          });
        }
      } else if (spec.usdPerPlacement == null) {
        notIncluded.push(`${spec.label} (${placements} placement${placements > 1 ? "s" : ""}) — quoted separately`);
        addFlag({
          code: "decoration_unpriced",
          severity: "confirm",
          customer_message: `${spec.label} isn't included in this estimate yet; our director adds it once the artwork size and colors are known.`,
          internal_note: `${g.label} ${spec.label} ×${placements} — 장식 단가 미확정(pricingPolicy.ts DECORATIONS), 견적 제외`,
        });
      } else {
        decorationPerPiece += spec.usdPerPlacement * placements;
        decorationSetup += spec.setupUsd;
        includes.push(`${spec.label} ×${placements}`);
      }
    }
    decorationPerPiece += decorationSetup / qty;

    const brandedForItem = isSample ? 0 : brandedPerPiece;
    if (brandedForItem > 0) includes.push("your branded trims (see list)");

    const cost = fabricPerPiece + labor + basicTrim + parts.usd + decorationPerPiece + brandedForItem;

    let low: number;
    let high: number;
    if (isSample) {
      // 샘플은 정가제. 단, 가격이 확정된 장식은 얹는다.
      low = SAMPLE.listPriceUsd + round2(decorationPerPiece * (1 + MARKUP));
      high = low;
    } else {
      low = round2(cost * (1 + MARKUP));
      high = round2(low * (1 + ESTIMATE_SPREAD));
    }

    customerItems.push({
      item: g.label,
      fabric: fabricLabel,
      quantity: qty,
      colors,
      price_per_piece_usd: { low, high },
      line_total_usd: { low: round2(low * qty), high: round2(high * qty) },
      includes,
      not_included: notIncluded,
    });

    internalItems.push({
      item: g.label,
      quantity: qty,
      fabric_usd_per_piece: round2(fabricPerPiece),
      fabric_detail: fabricDetail.map(({ total, ...rest }) => rest),
      labor_usd_per_piece: round2(labor),
      basic_trim_usd_per_piece: round2(basicTrim),
      garment_parts_usd_per_piece: round2(parts.usd),
      decoration_usd_per_piece: round2(decorationPerPiece),
      branded_trim_usd_per_piece: round2(brandedForItem),
      cost_usd_per_piece: round2(cost),
      price_low_usd_per_piece: low,
    });
  }

  // 핏 자료가 없으면 패턴 개발이 필요하다는 안내
  if (items.length && input.has_tech_pack === false && input.has_size_reference !== true) {
    addFlag({
      code: "fit_development",
      severity: "info",
      customer_message: "Without a tech pack or a reference garment, we build the pattern and size grading from your photos and fit notes — the first sample is where we lock the fit.",
      internal_note: "테크팩·레퍼런스 없음 — 패턴·그레이딩 신규 작업",
    });
  }

  const priced = customerItems.filter((c) => c.line_total_usd);
  const orderTotal = priced.length
    ? {
        low: round2(priced.reduce((s, c) => s + c.line_total_usd!.low, 0)),
        high: round2(priced.reduce((s, c) => s + c.line_total_usd!.high, 0)),
      }
    : null;

  const terms: string[] = [
    "Prices are in USD, ex-factory Busan. Shipping, duties and import taxes are quoted separately.",
  ];
  if (isSample) {
    terms.push(`Sample lead time: ${SAMPLE.leadTime}.`, SAMPLE_CREDIT_POLICY);
  } else {
    terms.push(
      `Every new style starts with a paid sample ($${SAMPLE.listPriceUsd} per piece) to lock fit and fabric before production. ${SAMPLE_CREDIT_POLICY}`,
      `Lead time: ${PRODUCTION_LEAD_TIME}.`,
      "There is no minimum order — quantity only changes the unit price.",
    );
  }
  if (input.ship_to_country) terms.push(`Shipping to ${input.ship_to_country} will be added in the formal quote.`);

  // 경계 바로 아래 수량이면 "몇 장 더 하면 단가가 내려간다" 안내 (샘플은 제외)
  if (!isSample && opts.priceBreaks !== false) {
    customerItems.forEach((c, i) => {
      const br = findPriceBreak({ ...input, items }, i, c);
      if (!br || !c.line_total_usd) return;
      const sameOrLess = br.total.low <= c.line_total_usd.low;
      addFlag({
        code: "price_break",
        severity: "info",
        customer_message:
          `${c.item}: ordering ${br.quantity} pcs instead of ${c.quantity} brings the price to about $${br.price.low}–$${br.price.high} per piece ` +
          `($${br.total.low}–$${br.total.high} total)` + (sameOrLess ? " — about the same total or less, for more pieces." : "."),
        internal_note: `${c.item} ${c.quantity}장 → ${br.quantity}장이면 장당 $${c.price_per_piece_usd!.low} → $${br.price.low} (구간 단가)`,
      });
    });
  }

  const needsDirector = flags.some((f) => f.severity !== "info");

  return {
    customer: {
      estimate_type: "broad_estimate",
      order_type: input.order_type,
      items: customerItems,
      order_total_usd: orderTotal,
      branded_trims_included: isSample ? [] : brandedKeys.map((k) => BRANDED_TRIMS[k].label),
      flags: flags.map((f) => ({ severity: f.severity, message: f.customer_message })),
      terms,
      must_say: [
        "This is a broad estimate, not a final price.",
        "It can change as we confirm fabric, specs and details together.",
        "The formal quote comes from our production director by email.",
      ],
    },
    internal: {
      fx_krw_per_usd: FX_KRW_PER_USD,
      markup: MARKUP,
      items: internalItems,
      branded_trim_total_usd: round2(brandedTrimTotal),
      flags,
      needs_director: needsDirector,
    },
  };
}

// ─── BBally용 도구 선언 ─────────────────────────────────────────────

export const QUOTE_TOOL_NAME = "calculate_quote";

export const quoteToolDeclaration = {
  name: QUOTE_TOOL_NAME,
  description:
    "Calculates a broad price estimate for an apparel order from Korea Apparel Works' internal price tables. " +
    "Do not call it early just to volunteer a price. Call it only when (a) you have gathered the order details listed in the quoting rules (or the buyer has said they don't know / want to skip the rest), or (b) the buyer directly asks about price, cost or a rough estimate. " +
    "Once a quote has been given, call it again whenever quantity, colors, fabric, decoration or trims change. " +
    "Never state a price that did not come from this tool. Fill unknown fields with the most reasonable assumption and tell the buyer what you assumed.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      order_type: {
        type: "string",
        enum: ["sample", "production"],
        description: "'sample' for one-off samples before bulk, 'production' for a run.",
      },
      items: {
        type: "array",
        description: "One entry per style.",
        items: {
          type: "object",
          properties: {
            garment: { type: "string", enum: Object.keys(GARMENTS) },
            fabric: {
              type: "string",
              enum: [...FABRICS.map((f) => f.key), "unlisted"],
              description: "Closest fabric key. " + FABRICS.map((f) => `${f.key} = ${f.name}, ${f.spec}`).join("; ") + ". Use 'unlisted' if nothing fits.",
            },
            fabric_note: { type: "string", description: "The buyer's own words about the fabric." },
            quantity_per_color: {
              type: "array",
              items: { type: "integer" },
              description: "Pieces per colorway, e.g. [50, 50] for two colors of 50. Use [N] if colors are unknown.",
            },
            decorations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  method: { type: "string", enum: Object.keys(DECORATIONS) },
                  placements: { type: "integer", description: "Number of logo/print positions with this method." },
                  colors: { type: "integer", description: "Screen print only: number of ink colors in the artwork (도수). Count them from the buyer's image if there is one." },
                  size: {
                    type: "string",
                    enum: Object.keys(PRINT_SIZE_LABELS),
                    description: "Screen print only: print size per placement. small = up to 10×10cm (chest logo), a4 = up to A4, a3 = up to A3 (large front/back print).",
                  },
                },
                required: ["method"],
              },
            },
            custom_dye: { type: "boolean", description: "True if the buyer needs fabric dyed to a specific Pantone color." },
            flat_knit_collar: { type: "boolean", description: "True if the garment has a flat-knit (yoko) collar even though it is not a polo, e.g. a pique crew-neck with a knit collar band. Polos already include it." },
            sublimation_on_colored_fabric: { type: "boolean", description: "True if the buyer wants sublimation printed on a non-white fabric." },
          },
          required: ["garment", "fabric", "quantity_per_color"],
        },
      },
      branded_trims: {
        type: "array",
        items: { type: "string", enum: Object.keys(BRANDED_TRIMS) },
        description: "Custom branded trims the buyer wants (only if they asked for them).",
      },
      has_tech_pack: { type: "boolean" },
      has_size_reference: { type: "boolean", description: "True if they have a reference garment or size chart for fit." },
      ship_to_country: { type: "string" },
    },
    required: ["order_type", "items"],
  },
};

// ─── 프롬프트 블록 ─────────────────────────────────────────────────

export function quotingPolicyPrompt(): string {
  return (
    "[견적 규칙 — 내부 자료]\n" +
    "- 가격은 반드시 calculate_quote 도구를 호출해서 얻으세요. 직접 계산하거나 기억으로 숫자를 말하면 안 됩니다.\n" +
    "- 수량·컬러·원단·장식·부자재가 바뀌면 도구를 다시 호출하세요.\n" +
    "- 도구 결과의 price_per_piece_usd를 '$low–$high per piece' 범위로 말하세요. 범위가 같으면 한 숫자로.\n" +
    "- must_say 세 가지(개략 견적이다 / 상의하며 조정될 수 있다 / 정식 견적서는 디렉터가 이메일로)를 반드시 함께 전하세요.\n" +
    "- flags의 message는 빠짐없이, 짧게 고객 언어로 전하세요. severity가 blocker인 품목은 가격을 말하지 마세요.\n" +
    "- not_included 항목(예: 자수 별도)은 '이 금액에 포함되지 않았다'고 분명히 말하세요.\n" +
    "- 배송비·관세는 포함되지 않았다고 말하세요.\n" +
    "- 원가, 야드 단가, 공임, 마진 같은 내부 수치는 어떤 경우에도 말하지 마세요. 도구가 주지도 않습니다.\n" +
    "- 최소 주문은 1장입니다. 50장·100장은 단가가 내려가는 구간일 뿐이니 수량이 적다고 거절하지 마세요.\n" +
    "- 샘플은 장당 $" + SAMPLE.listPriceUsd + "입니다(가격 확정된 장식만 추가). " + SAMPLE_CREDIT_POLICY + "\n" +
    "- 샘플 제작 기간은 '" + SAMPLE.leadTime + "'입니다. 견적과 상관없이 샘플 기간을 물으면 항상 이 기간으로 답하고, 다른 숫자를 지어내지 마세요.\n\n" +
    "[견적 답변 형식 — 가독성]\n" +
    "견적을 안내하는 턴만은 2~3문장 제한 대신 아래 형식으로, 줄을 나눠 쓰세요. 고객 언어로 쓰되 구조는 그대로.\n" +
    "1줄: 장당 가격 범위를 굵게, 괄호에 수량과 총액. 예) **$19.65–$21.62 per piece** (100 pcs · $1,965–$2,162 total)\n" +
    "빈 줄 후 '- '로 시작하는 짧은 목록 2~4개: 포함 항목 한 줄(원단·로고 등 핵심만), 미포함 항목 한 줄(배송·관세 등), 가정한 것 한 줄(있을 때), flags 안내(있을 때 한 줄씩).\n" +
    "빈 줄 후 한 문장: 개략 견적이며 상의하며 조정될 수 있고, 정식 견적서는 디렉터가 이메일로 보낸다.\n" +
    "빈 줄 후 다음 질문 하나만.\n" +
    "- 굵게(**)는 가격 범위에만 쓰세요. 목록 항목은 한 줄 이내로 짧게. 인사말은 첫 턴이 아니면 생략.\n\n" +
    "[정확한 견적을 위해 대화 중 확인할 것 — 한 번에 하나씩, 자연스럽게]\n" +
    "1) 품목(스타일별) 2) 원단 촉감/소재 3) 수량 4) 컬러 수와 컬러별 수량\n" +
    "5) 로고·프린트 방식과 위치 수(자수/실리콘/프린트 등) 6) 브랜드 라벨·행택·전용 폴리백을 원하는지\n" +
    "   - 나염(screen_print)이면 위치마다 도수(색 수)와 크기(10×10cm 이내 / A4 이내 / A3 이내)를 꼭 확인하세요. 사진이 있으면 사진에서 색 수와 크기를 먼저 추정해 말하고 맞는지 물어보세요.\n" +
    "   - 승화전사(sublimation_allover)는 원단 야드 단위라 크기·도수를 물을 필요 없습니다.\n" +
    "   - 피케 원단에 요꼬카라(니트 칼라)가 들어가는 라운드넥은 flat_knit_collar를 true로 하세요.\n" +
    "7) 테크팩 또는 레퍼런스 옷/사이즈표 유무 8) 특정 Pantone 색 염색이 필요한지 9) 배송 국가\n" +
    "[견적 시점]\n" +
    "- 기본은 정보 수집입니다. 고객이 묻지 않았는데 먼저 가격을 말하지 마세요. 위 1~9를 한 번에 하나씩 최대한 확인하세요.\n" +
    "- 1~6이 모두 확인됐거나(모른다·생략하겠다는 답도 확인으로 봄) 고객이 더 이상 답하기 어려워하면, 그때 도구를 호출해 견적을 안내하세요.\n" +
    "- 고객이 가격이나 대략적인 견적을 직접 물으면(예: 'how much?', 'ballpark?', '대략 얼마예요?') 그 시점까지의 정보로 바로 도구를 호출해 범위를 알려주고, 이어서 '더 정확한 견적을 위해' 남은 항목을 물어보세요.\n" +
    "모르는 항목은 합리적으로 가정해서 호출하고, 무엇을 가정했는지 한 줄로 말하세요(예: 1컬러, 왼쪽 가슴 로고 1곳).\n"
  );
}
