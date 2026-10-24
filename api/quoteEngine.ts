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
  ESTIMATE_SPREAD,
  FABRICS,
  FABRIC_YARD_MULTIPLIERS,
  FX_KRW_PER_USD,
  GARMENTS,
  GarmentKey,
  LABOR_KRW_TIERS,
  MARKUP,
  MIN_CUT_YARDS_PER_COLOR,
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
  decorations?: { method: DecorationMethod; placements?: number }[];
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

function laborUsdPerPiece(garment: GarmentKey, stylePieces: number): number {
  const tier = LABOR_KRW_TIERS.find((t) => stylePieces >= t.minPieces) ?? LABOR_KRW_TIERS[LABOR_KRW_TIERS.length - 1];
  return krwToUsd(tier.krwPerPiece * GARMENTS[garment].laborFactor);
}

function fabricMultiplier(yards: number): number {
  const tier = FABRIC_YARD_MULTIPLIERS.find((t) => yards >= t.minYards) ?? FABRIC_YARD_MULTIPLIERS[FABRIC_YARD_MULTIPLIERS.length - 1];
  return tier.multiplier;
}

function basicTrimUsd(stylePieces: number): number {
  const tier = BASIC_TRIM_USD_TIERS.find((t) => stylePieces >= t.minPieces) ?? BASIC_TRIM_USD_TIERS[BASIC_TRIM_USD_TIERS.length - 1];
  return tier.usd;
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

export function calculateQuote(input: QuoteInput): QuoteResult {
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
      const usdPerYard = bulk * fabricMultiplier(yards);
      return { color_qty: cq, yards_bought: round2(yards), usd_per_yard: round2(usdPerYard), total: yards * usdPerYard };
    });
    const fabricPerPiece = fabricDetail.reduce((s, d) => s + d.total, 0) / qty;

    const labor = laborUsdPerPiece(it.garment, qty);
    const basicTrim = basicTrimUsd(qty);

    // 장식
    let decorationPerPiece = 0;
    let decorationSetup = 0;
    const includes: string[] = [`${fabricLabel}`, "cut & sew", "basic trims (thread, care label, plain polybag)"];
    const notIncluded: string[] = [];
    for (const d of it.decorations || []) {
      const spec = DECORATIONS[d.method] ?? DECORATIONS.other;
      const placements = Math.max(1, Math.round(d.placements ?? 1));
      if (spec.usdPerPlacement == null) {
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

    const cost = fabricPerPiece + labor + basicTrim + decorationPerPiece + brandedForItem;

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
    "Call this every time the buyer asks about price or cost, and again whenever quantity, colors, fabric, decoration or trims change. " +
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
                },
                required: ["method"],
              },
            },
            custom_dye: { type: "boolean", description: "True if the buyer needs fabric dyed to a specific Pantone color." },
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
    "- 샘플은 장당 $" + SAMPLE.listPriceUsd + "입니다(가격 확정된 장식만 추가). " + SAMPLE_CREDIT_POLICY + "\n\n" +
    "[정확한 견적을 위해 대화 중 확인할 것 — 한 번에 하나씩, 자연스럽게]\n" +
    "1) 품목(스타일별) 2) 원단 촉감/소재 3) 수량 4) 컬러 수와 컬러별 수량\n" +
    "5) 로고·프린트 방식과 위치 수(자수/실리콘/프린트 등) 6) 브랜드 라벨·행택·전용 폴리백을 원하는지\n" +
    "7) 테크팩 또는 레퍼런스 옷/사이즈표 유무 8) 특정 Pantone 색 염색이 필요한지 9) 배송 국가\n" +
    "고객이 가격을 먼저 물으면 1~3만으로도 도구를 호출해 범위를 알려주고, 나머지는 '더 정확한 견적을 위해' 이어서 물어보세요.\n" +
    "모르는 항목은 합리적으로 가정해서 호출하고, 무엇을 가정했는지 한 줄로 말하세요(예: 1컬러, 왼쪽 가슴 로고 1곳).\n"
  );
}
