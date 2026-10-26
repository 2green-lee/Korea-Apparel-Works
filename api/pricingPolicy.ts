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
  /**
   * 공임 곡선을 직접 받은 품목. 있으면 laborFactor·LABOR_KRW_TIERS 대신 이 곡선을 쓴다.
   *   polo      → POLO_LABOR_KRW_POINTS 그대로
   *   round_tee → 폴로 곡선 − ROUND_TEE_LABOR_DISCOUNT_KRW
   */
  laborCurve?: "polo" | "round_tee";
  laborConfirmed: boolean;
  /** scope가 in_house가 아닐 때 고객에게 할 말의 요지(영문). */
  scopeNote?: string;
}

/**
 * 요척은 아직 전부 추정치다(실제 재단 후 실측으로 바꿀 것).
 * 공임 배수: 티 15,000원(50장) 기준. 폴로·여성 탑 17,000원은 Unstrung 원가 시트 확정가.
 */
export const GARMENTS: Record<GarmentKey, GarmentSpec> = {
  tee: { label: "T-shirt", scope: "in_house", yardsPerPiece: 1.1, yardsConfirmed: false, laborFactor: 1, laborConfirmed: true, laborCurve: "round_tee" },
  long_sleeve_tee: { label: "Long-sleeve T-shirt", scope: "in_house", yardsPerPiece: 1.4, yardsConfirmed: false, laborFactor: 1, laborConfirmed: true, laborCurve: "polo" },
  polo: { label: "Polo", scope: "in_house", yardsPerPiece: 1.3, yardsConfirmed: false, laborFactor: 1, laborConfirmed: true, laborCurve: "polo" },
  womens_sleeveless_top: { label: "Women's sleeveless top", scope: "in_house", yardsPerPiece: 0.7, yardsConfirmed: false, laborFactor: 1, laborConfirmed: true, laborCurve: "polo" },
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
/**
 * 폴로 공임 (원/장, 2026.10 확정). 점 사이는 직선으로 이어서 계산한다 — 구간 경계에서 값이 튀지 않게.
 *   50장 이하는 무조건 17,000원, 300장 이상은 무조건 8,000원.
 *   예: 51장 16,940원 / 75장 15,500원 / 150장 12,500원
 * 라운드 티는 여기서 2,000원 뺀 값. 긴팔티·여성 민소매 탑 등 나머지 티류는 폴로와 같다.
 */
export const POLO_LABOR_KRW_POINTS = [
  { pieces: 50, krw: 17000 },
  { pieces: 100, krw: 14000 },
  { pieces: 200, krw: 11000 },
  { pieces: 300, krw: 8000 },
];

export const ROUND_TEE_LABOR_DISCOUNT_KRW = 2000;

/** 장수에 맞는 폴로 공임(원). 첫 점 이하·마지막 점 이상은 끝값으로 고정, 그 사이는 직선 보간. */
export function poloLaborKrw(pieces: number): number {
  const pts = POLO_LABOR_KRW_POINTS;
  if (pieces <= pts[0].pieces) return pts[0].krw;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (pieces <= b.pieces) return Math.round(a.krw + ((b.krw - a.krw) * (pieces - a.pieces)) / (b.pieces - a.pieces));
  }
  return pts[pts.length - 1].krw;
}

/** 공임 곡선이 없는 품목(맨투맨·후디 등)이 쓰는 기존 사다리 × laborFactor. */
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
  /**
   * 원화 야드 단가를 직접 받은 원단. 있으면 bulkUsdPerYard × 할증률 대신 이 구간을 쓴다.
   * 구간 기준은 컬러별 야드수.
   */
  krwPerYardTiers?: { minYards: number; krw: number }[];
}

/** 폴리 원단 공장 매입가 3,000~4,000원/야드 (2026.10 확인). 100야드 이상 하단, 50야드 미만 상단. */
export const POLY_KRW_PER_YARD_TIERS = [
  { minYards: 100, krw: 3000 },
  { minYards: 50, krw: 3500 },
  { minYards: 0, krw: 4000 },
];

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
  { key: "poly_performance", name: "Polyester Performance Knit", spec: "Poly 100% · 110-170gsm", bulkUsdPerYard: 3000 / FX_KRW_PER_USD, krwPerYardTiers: POLY_KRW_PER_YARD_TIERS },
  { key: "poly_pique", name: "Polyester Pique (polo)", spec: "Poly 100% · 160-200gsm", bulkUsdPerYard: 3000 / FX_KRW_PER_USD, krwPerYardTiers: POLY_KRW_PER_YARD_TIERS },
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

// ─── 품목별 부속 (요꼬·단추·지퍼·끈 등) ─────────────────────────────

export type GarmentPartKey =
  | "flat_knit_collar"
  | "flat_knit_cuff"
  | "button"
  | "quarter_zipper"
  | "drawcord"
  | "eyelet"
  | "waist_elastic"
  | "rib_trim";

export interface GarmentPartSpec {
  label: string;
  /** 스타일 총 장수 기준 단가 (원/개). 위에서부터 먼저 맞는 구간을 쓴다. */
  krwTiers: { minPieces: number; krwPerUnit: number }[];
  confirmed: boolean;
}

/**
 * 출처 (2026.10.26, 원/개, 세금 별도):
 *   확정     — 요꼬카라 (공장 확인가)
 *   ApparelX — kr.apparel-x.com 회원가 그대로. 소량 소매가라 국내 대량 단가보다 비쌀 수 있다.
 *   추정     — ApparelX에도 없거나 사양이 안 맞아 미뤄 잡은 값. confirmed: false → 디렉터 확인 플래그.
 * 실제 발주 단가를 받으면 숫자를 바꾸고 confirmed: true로 할 것.
 */
export const GARMENT_PARTS: Record<GarmentPartKey, GarmentPartSpec> = {
  /** 확정 */
  flat_knit_collar: {
    label: "Flat-knit collar",
    /** 299장까지 2,000원, 300장부터 1,500원 (2026.10 확정) */
    krwTiers: [{ minPieces: 300, krwPerUnit: 1500 }, { minPieces: 0, krwPerUnit: 2000 }],
    confirmed: true,
  },
  /** 추정 — ApparelX에 없음. 소매 요꼬 한 쌍, 카라 단가의 60% */
  flat_knit_cuff: {
    label: "Flat-knit sleeve cuffs (pair)",
    krwTiers: [{ minPieces: 300, krwPerUnit: 900 }, { minPieces: 0, krwPerUnit: 1200 }],
    confirmed: false,
  },
  /** ApparelX SE-2708 4구멍 폴리 단추 ₩190 (30개 이하 ₩380). 폴로 3개 기준 → 10장 이하면 30개 이하 */
  button: { label: "Buttons", krwTiers: [{ minPieces: 11, krwPerUnit: 190 }, { minPieces: 0, krwPerUnit: 380 }], confirmed: true },
  /** ApparelX YKK 3CFC 코일 지퍼 클로즈드 20cm ₩680 (10개 이상 ₩570) */
  quarter_zipper: { label: "Zipper", krwTiers: [{ minPieces: 10, krwPerUnit: 570 }, { minPieces: 0, krwPerUnit: 680 }], confirmed: true },
  /**
   * ApparelX 3091 폴리 코드 5mm ₩1,100/m × 1.3m = ₩1,430.
   * 100장 이상은 롤 구매(미터 재단의 절반 단가)로 보고 ₩720.
   */
  drawcord: { label: "Drawcord", krwTiers: [{ minPieces: 100, krwPerUnit: 720 }, { minPieces: 0, krwPerUnit: 1430 }], confirmed: true },
  /** ApparelX SE300 아일렛 9mm ₩300/세트 (200세트 이상 ₩80). 장당 2개 → 100장이면 200세트 */
  eyelet: { label: "Eyelets", krwTiers: [{ minPieces: 100, krwPerUnit: 80 }, { minPieces: 0, krwPerUnit: 300 }], confirmed: true },
  /**
   * 추정 — ApparelX 1100-WH 평직 고무밴드 ₩1,950–4,480/m 중 허리용 폭(25~30mm)을 ₩3,000/m로 보고 × 0.8m.
   * 100장 이상은 롤 단가(절반).
   */
  waist_elastic: { label: "Waist elastic", krwTiers: [{ minPieces: 100, krwPerUnit: 1200 }, { minPieces: 0, krwPerUnit: 2400 }], confirmed: false },
  /** 추정 — ApparelX에 없음. 소매·밑단 시보리(립) 원단, 요척에 안 들어간 몫 */
  rib_trim: { label: "Rib cuffs & hem", krwTiers: [{ minPieces: 0, krwPerUnit: 500 }], confirmed: false },
};

/** 품목별로 들어가는 부속과 장당 개수. 없는 품목은 부속 없음. 개수는 추정치. */
export const GARMENT_PART_USAGE: Partial<Record<GarmentKey, { part: GarmentPartKey; units: number }[]>> = {
  polo: [{ part: "flat_knit_collar", units: 1 }, { part: "flat_knit_cuff", units: 1 }, { part: "button", units: 3 }],
  sweatshirt: [{ part: "rib_trim", units: 1 }],
  hoodie: [{ part: "rib_trim", units: 1 }, { part: "drawcord", units: 1 }, { part: "eyelet", units: 2 }],
  quarter_zip: [{ part: "rib_trim", units: 1 }, { part: "quarter_zipper", units: 1 }],
  joggers: [{ part: "rib_trim", units: 1 }, { part: "waist_elastic", units: 1 }, { part: "drawcord", units: 1 }, { part: "eyelet", units: 2 }],
  shorts: [{ part: "waist_elastic", units: 1 }, { part: "drawcord", units: 1 }, { part: "eyelet", units: 2 }],
  skirt_skort: [{ part: "waist_elastic", units: 1 }],
};

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
  /**
   * 원단 야드 단위로 매기는 장식(승화전사). 있으면 위치 수 대신, 그 옷을 만들려고 끊은 원단 야드 전체에
   * 이 단가를 곱한다. 디자인 크기·비율과 상관없이 야드 단위로 한 번 찍는 값.
   */
  krwPerFabricYard?: number;
  /** 나염(실크스크린)처럼 도수·크기로 매기는 장식. 판비는 도당·위치당 주문 전체에 한 번, 인쇄비는 도당·위치당·장당. */
  screenPrint?: Record<PrintSize, { setupKrwPerColor: number; krwPerColorPerPiece: number }>;
}

/** 나염 인쇄 크기 구분 */
export type PrintSize = "small" | "a4" | "a3";
export const PRINT_SIZE_LABELS: Record<PrintSize, string> = {
  small: "up to 10×10cm",
  a4: "up to A4",
  a3: "up to A3",
};

/**
 * 확정 단가가 들어간 건 실리콘 로고뿐이다(Unstrung 견적 기준).
 * 나머지는 일광산업 등에서 단가를 받으면 채울 것 — 그전까지는 "별도 견적"으로 안내된다.
 */
export const DECORATIONS: Record<DecorationMethod, DecorationSpec> = {
  embroidery: { label: "Embroidery", usdPerPlacement: null, setupUsd: 0 },
  heat_seal_embroidery: { label: "Heat-seal embroidered patch", usdPerPlacement: null, setupUsd: 0 },
  /**
   * 나염 — 티모자 공개 단가 기준(도당 판비 + 도당 장당 인쇄비). 2도면 둘 다 두 배.
   * 거래 나염 공장 단가를 받으면 바꿀 것.
   */
  screen_print: {
    label: "Screen print", usdPerPlacement: null, setupUsd: 0,
    screenPrint: {
      small: { setupKrwPerColor: 20000, krwPerColorPerPiece: 200 },
      a4: { setupKrwPerColor: 30000, krwPerColorPerPiece: 300 },
      a3: { setupKrwPerColor: 60000, krwPerColorPerPiece: 600 },
    },
  },
  silicone_patch: { label: "Silicone logo", usdPerPlacement: 0.40, setupUsd: 0 },
  heat_transfer: { label: "Heat transfer", usdPerPlacement: null, setupUsd: 0 },
  digital_print: { label: "Digital print (DTP)", usdPerPlacement: null, setupUsd: 0 },
  /** 승화전사 야드당 3,500원 (2026.10 확정). 수량·디자인 크기와 상관없이, 끊은 원단 야드 전체에 찍는다. */
  sublimation_allover: { label: "Sublimation print", usdPerPlacement: null, setupUsd: 0, krwPerFabricYard: 3500 },
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
  /** 샘플비 입금일 기준 7~14영업일(약 2~3주) (2026.10 확정) */
  leadTime: "about 7–14 business days (roughly 2–3 weeks) from the day we receive the sample payment",
};

/** 샘플비 환급 정책 (고객 안내용) */
export const SAMPLE_CREDIT_POLICY = "Sample fees are credited back on a bulk order: 50% at 50+ pcs, 100% at 100+ pcs.";

/** 생산 리드타임 안내 (Unstrung 계약 기준으로 늘려 잡은 값) */
export const PRODUCTION_LEAD_TIME = "about 3 weeks of production after sample approval, plus 3–5 weeks by sea (air is faster, quoted separately)";
