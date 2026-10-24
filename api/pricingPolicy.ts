// 가격 정책 단일 소스 — "숫자"만 모아 둔 파일.
//
// 계산 로직은 api/quoteEngine.ts, BBally의 대화 지침은 api/index.ts에 있다.
// 단가·환율·마진이 바뀌면 이 파일의 표만 고치면 된다.
//
// 표의 confirmed/estimated 표시를 꼭 지킬 것:
//   confirmed: true  → 실제로 공장·공급처에서 확인한 값. BBally가 그대로 안내.
//   confirmed: false → 아직 미뤄 잡은 값. 견적은 내되 "디렉터 확인 필요" 플래그가 붙고
//                      텔레그램으로 알림이 간다. 확인되면 true로 바꿀 것.
//
// 외주(타 공장) 단가는 넣지 않는다. 여기 있는 건 전부 자체 생산(1호 공장) 기준이다.
//
// 주의 — 원단과 공임은 티어 기준이 서로 다르다:
//   원단 티어 = f(컬러별 야드수)  ← 같은 원단이라도 컬러가 다르면 따로 끊는다
//   공임 티어 = g(스타일 총 장수)

export const FX_KRW_PER_USD = 1400;

/** 원가 대비 마크업. 원가 × (1 + MARKUP) = 견적 하한. */
export const MARKUP = 0.10;

/**
 * 견적 범위 폭. 견적 상한 = 하한 × (1 + ESTIMATE_SPREAD).
 * 원단 로스·사양 변경 여지를 고객에게 미리 보여 주는 용도.
 */
export const ESTIMATE_SPREAD = 0.10;

/** 컬러 하나당 최소로 끊어야 하는 원단 길이(야드). 패턴 배치 때문에 이보다 적게는 못 산다. */
export const MIN_CUT_YARDS_PER_COLOR = 2;

// ─── 품목 ──────────────────────────────────────────────────────────

export type GarmentKey =
  | "tee"
  | "long_sleeve_tee"
  | "polo"
  | "womens_sleeveless_top"
  | "sweatshirt"
  | "hoodie"
  | "quarter_zip"
  | "joggers"
  | "shorts"
  | "skirt_skort"
  | "cap_hat"
  | "outerwear_woven"
  | "dress"
  | "denim"
  | "other";

export type Scope =
  /** 1호 공장에서 바로 견적·생산 */
  | "in_house"
  /** 생산은 가능하나 디렉터 확인 후 확정 (카테고리 경계) */
  | "confirm"
  /** 1호 공장에서 하지 않음 — 숫자를 내지 않는다 */
  | "not_in_house";

export interface GarmentSpec {
  label: string;
  scope: Scope;
  /** 장당 원단 소요(야드). 58~60인치 폭 기준. */
  yardsPerPiece: number;
  yardsConfirmed: boolean;
  /** 기본(티셔츠) 공임 사다리 대비 배수. */
  laborFactor: number;
  laborConfirmed: boolean;
  /** scope가 in_house가 아닐 때 고객에게 할 말의 요지(영문). */
  scopeNote?: string;
}

/**
 * 요척은 아직 전부 추정치다(실제 재단 후 실측으로 바꿀 것).
 * 공임 배수: 티 15,000원(50장) 기준. 폴로·여성 탑 17,000원은 Unstrung 원가 시트 확정가.
 */
export const GARMENTS: Record<GarmentKey, GarmentSpec> = {
  tee: { label: "T-shirt", scope: "in_house", yardsPerPiece: 1.1, yardsConfirmed: false, laborFactor: 1, laborConfirmed: true },
  long_sleeve_tee: { label: "Long-sleeve T-shirt", scope: "in_house", yardsPerPiece: 1.4, yardsConfirmed: false, laborFactor: 1.1, laborConfirmed: false },
  polo: { label: "Polo", scope: "in_house", yardsPerPiece: 1.3, yardsConfirmed: false, laborFactor: 17000 / 15000, laborConfirmed: true },
  womens_sleeveless_top: { label: "Women's sleeveless top", scope: "in_house", yardsPerPiece: 0.7, yardsConfirmed: false, laborFactor: 17000 / 15000, laborConfirmed: true },
  sweatshirt: { label: "Crewneck sweatshirt", scope: "in_house", yardsPerPiece: 1.6, yardsConfirmed: false, laborFactor: 1.2, laborConfirmed: false },
  hoodie: { label: "Hoodie", scope: "in_house", yardsPerPiece: 2.0, yardsConfirmed: false, laborFactor: 1.4, laborConfirmed: false },
  quarter_zip: { label: "Quarter-zip pullover", scope: "in_house", yardsPerPiece: 1.7, yardsConfirmed: false, laborFactor: 1.5, laborConfirmed: false },
  joggers: { label: "Joggers", scope: "in_house", yardsPerPiece: 1.6, yardsConfirmed: false, laborFactor: 1.2, laborConfirmed: false },
  shorts: { label: "Knit shorts", scope: "in_house", yardsPerPiece: 0.9, yardsConfirmed: false, laborFactor: 0.9, laborConfirmed: false },
  skirt_skort: {
    label: "Skirt / skort", scope: "confirm", yardsPerPiece: 1.2, yardsConfirmed: false, laborFactor: 17000 / 15000, laborConfirmed: false,
    scopeNote: "Skirts and skorts sit outside our core knit tops line; our production director confirms construction (liners, built-in shorts) before quoting.",
  },
  cap_hat: {
    label: "Cap / hat", scope: "not_in_house", yardsPerPiece: 0, yardsConfirmed: false, laborFactor: 0, laborConfirmed: false,
    scopeNote: "Caps are made in a separate specialist factory, not our cut-and-sew line, so we can't price them here. Our director can advise by email.",
  },
  outerwear_woven: {
    label: "Outerwear / woven", scope: "not_in_house", yardsPerPiece: 0, yardsConfirmed: false, laborFactor: 0, laborConfirmed: false,
    scopeNote: "We specialise in knit tops and sportswear; woven outerwear is outside our production line.",
  },
  dress: {
    label: "Dress", scope: "not_in_house", yardsPerPiece: 0, yardsConfirmed: false, laborFactor: 0, laborConfirmed: false,
    scopeNote: "We specialise in knit tops and sportswear; dresses are outside our production line.",
  },
  denim: {
    label: "Denim", scope: "not_in_house", yardsPerPiece: 0, yardsConfirmed: false, laborFactor: 0, laborConfirmed: false,
    scopeNote: "Denim needs a dedicated woven/wash facility, which we don't run.",
  },
  other: {
    label: "Other", scope: "confirm", yardsPerPiece: 1.2, yardsConfirmed: false, laborFactor: 1.2, laborConfirmed: false,
    scopeNote: "This item isn't in our standard list; our director will confirm feasibility and price.",
  },
};

// ─── 공임 ──────────────────────────────────────────────────────────

/** 기본 공임 사다리 — 티셔츠 기준, 스타일 총 장수 기준 (원/장). */
export const LABOR_KRW_TIERS = [
  { minPieces: 100, krwPerPiece: 9000 },
  { minPieces: 50, krwPerPiece: 15000 },
  { minPieces: 0, krwPerPiece: 23000 },
];

// ─── 원단 ──────────────────────────────────────────────────────────

export interface FabricOption {
  key: string;
  name: string;
  spec: string;
  bulkUsdPerYard: number;
  estimated?: boolean;
}

/**
 * 대표 원단과 대량 기준 야드 단가(USD). 공급처에서 실제로 확인한 가격이며 상담용 개략치다.
 * estimated: true 는 비슷한 원단에서 미뤄 잡은 값.
 */
export const FABRICS: FabricOption[] = [
  { key: "cotton_jersey_light", name: "Cotton Single Jersey (lightweight)", spec: "Cotton 100% · 130-150gsm", bulkUsdPerYard: 4.98 },
  { key: "cotton_jersey_mid", name: "Cotton Single Jersey (midweight)", spec: "Cotton 100% · 180-220gsm", bulkUsdPerYard: 6.80 },
  { key: "cotton_blend_jersey", name: "Cotton-blend Single Jersey", spec: "Cotton 60% Poly 40% · 218gsm", bulkUsdPerYard: 4.08 },
  { key: "cotton_rib", name: "Cotton Rib", spec: "Cotton 100% · 200-240gsm", bulkUsdPerYard: 4.53 },
  { key: "cotton_pique", name: "Cotton Pique (polo)", spec: "Cotton 100% · 200-240gsm", bulkUsdPerYard: 6.50, estimated: true },
  { key: "french_terry_mid", name: "Cotton French Terry (midweight)", spec: "Cotton 100% · 250-370gsm", bulkUsdPerYard: 6.34 },
  { key: "french_terry_heavy", name: "Cotton French Terry (heavyweight)", spec: "Cotton 100% · 420-480gsm", bulkUsdPerYard: 8.34 },
  { key: "poly_performance", name: "Polyester Performance Knit", spec: "Poly 100% · 110-170gsm", bulkUsdPerYard: 3.26 },
  { key: "poly_spandex_mesh", name: "Poly/Spandex Wicking Mesh", spec: "Poly 95% Spandex 5% · 92-140gsm", bulkUsdPerYard: 4.08 },
  { key: "linen_blend_jersey", name: "Linen-blend Jersey", spec: "Linen/Cotton · 160gsm", bulkUsdPerYard: 4.53 },
  { key: "wool_blend", name: "Wool / Wool-blend", spec: "Wool · 170-320gsm", bulkUsdPerYard: 21.0 },
];

/** 표에 없는 소재일 때 쓰는 대량가. (기존 기본 사다리의 100야드+ 값) */
export const UNLISTED_FABRIC_BULK_USD_PER_YARD = 7.14;

/**
 * 대량가 대비 소량 구간 할증률 — 컬러별 야드수 기준.
 * SwatchOn 상세 페이지의 lowPrice→highPrice 배수와 일치.
 */
export const FABRIC_YARD_MULTIPLIERS = [
  { minYards: 100, multiplier: 1 },
  { minYards: 50, multiplier: 1.25 },
  { minYards: 0, multiplier: 1.667 },
];

// ─── 기본 부자재 (케어라벨·재봉사·무지 폴리백 등) ─────────────────────

/** 스타일 총 장수 기준 (USD/장). */
export const BASIC_TRIM_USD_TIERS = [
  { minPieces: 100, usd: 0.93 },
  { minPieces: 50, usd: 1.29 },
  { minPieces: 0, usd: 1.43 },
];

// ─── 장식 (로고·프린트) ────────────────────────────────────────────

export type DecorationMethod =
  | "embroidery"
  | "heat_seal_embroidery"
  | "screen_print"
  | "silicone_patch"
  | "heat_transfer"
  | "digital_print"
  | "sublimation_allover"
  | "other";

export interface DecorationSpec {
  label: string;
  /** 위치 1곳당 원가(USD/장). null 이면 단가 미확정 → 견적에서 빼고 디렉터 확인. */
  usdPerPlacement: number | null;
  /** 장식 셋업비(판비·자수 펀칭 등, USD). 주문 전체에 한 번. */
  setupUsd: number;
}

/**
 * 확정 단가가 들어간 건 실리콘 로고뿐이다(Unstrung 견적 기준).
 * 나머지는 일광산업 등에서 단가를 받으면 채울 것 — 그전까지는 "별도 견적"으로 안내된다.
 */
export const DECORATIONS: Record<DecorationMethod, DecorationSpec> = {
  embroidery: { label: "Embroidery", usdPerPlacement: null, setupUsd: 0 },
  heat_seal_embroidery: { label: "Heat-seal embroidered patch", usdPerPlacement: null, setupUsd: 0 },
  screen_print: { label: "Screen print", usdPerPlacement: null, setupUsd: 0 },
  silicone_patch: { label: "Silicone logo", usdPerPlacement: 0.40, setupUsd: 0 },
  heat_transfer: { label: "Heat transfer", usdPerPlacement: null, setupUsd: 0 },
  digital_print: { label: "Digital print (DTP)", usdPerPlacement: null, setupUsd: 0 },
  sublimation_allover: { label: "All-over sublimation", usdPerPlacement: null, setupUsd: 0 },
  other: { label: "Other decoration", usdPerPlacement: null, setupUsd: 0 },
};

// ─── 브랜드 부자재 (최소 발주량이 있는 것) ───────────────────────────

export type BrandedTrimKey = "woven_label" | "hang_tag" | "printed_neck_tape" | "custom_polybag";

export interface BrandedTrimSpec {
  label: string;
  /** 최소 발주 수량(장/매/야드) */
  moq: number;
  /** 최소 발주 수량을 샀을 때 총액(원) */
  moqTotalKrw: number;
  /** 의류 1장당 몇 단위가 드는지 (넥테이프는 야드) */
  unitsPerGarment: number;
  /** 고객에게 안내할 대안(영문) */
  cheaperAlternative: string;
}

/**
 * 2026.09 부자재 업체 안내 단가 기준(VAT 별도, 1종·1도).
 * 최소 발주량이 있어서 소량 주문에서는 장당 단가가 크게 튄다 — 엔진이 MOQ 총액을 수량으로 나눠 배분한다.
 */
export const BRANDED_TRIMS: Record<BrandedTrimKey, BrandedTrimSpec> = {
  woven_label: {
    label: "Custom woven neck label", moq: 1000, moqTotalKrw: 270000, unitsPerGarment: 1,
    cheaperAlternative: "a printed care/brand label, or reusing one label batch across future orders",
  },
  hang_tag: {
    label: "Custom hang tag", moq: 200, moqTotalKrw: 150000, unitsPerGarment: 1,
    cheaperAlternative: "skipping hang tags for the first run",
  },
  printed_neck_tape: {
    label: "Printed neck tape", moq: 1000, moqTotalKrw: 210000, unitsPerGarment: 0.5,
    cheaperAlternative: "a plain neck tape",
  },
  custom_polybag: {
    label: "Custom printed polybag", moq: 10000, moqTotalKrw: 850000, unitsPerGarment: 1,
    cheaperAlternative: "plain polybags with a branded sticker",
  },
};

/** 브랜드 부자재 장당 원가가 이 값(USD)을 넘으면 고객에게 대안을 함께 안내한다. */
export const TRIM_HEAVY_USD_PER_PIECE = 1.5;

// ─── 샘플 ──────────────────────────────────────────────────────────

/** 샘플 1장. 패턴 배치 때문에 원단을 최소 2야드 끊는다. 계산 원가 $101.66을 반올림해 제시. */
export const SAMPLE = {
  listPriceUsd: 100,
  /** 샘플 단계 리드타임 안내 */
  leadTime: "about 2–3 weeks per sample round (each revision adds about 2 weeks)",
};

/** 샘플비 환급 정책 (고객 안내용) */
export const SAMPLE_CREDIT_POLICY = "Sample fees are credited back on a bulk order: 50% at 50+ pcs, 100% at 100+ pcs.";

/** 생산 리드타임 안내 (Unstrung 계약 기준으로 늘려 잡은 값) */
export const PRODUCTION_LEAD_TIME = "about 3 weeks of production after sample approval, plus 3–5 weeks by sea (air is faster, quoted separately)";
