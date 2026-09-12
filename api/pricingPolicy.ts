// 가격 정책 단일 소스.
//
// 마크 에이전트의 대화 지침(api/index.ts의 systemInstruction)과는 분리되어 있다.
// 단가·환율·마진이 바뀌면 이 파일의 상수만 고치면 되고, 프롬프트 본문은 건드릴 필요가 없다.
//
// 주의 — 원단과 공임은 티어 기준이 서로 다르다:
//   원단 티어 = f(총 야드수)   ← 수량 × 장당 소요 야드
//   공임 티어 = g(총 장수)
// 예: 45장을 주문하면 장수로는 "50장 미만"이라 공임은 23,000원이지만,
//     원단은 45 × 1.2 = 54야드라서 50야드 티어에 걸려 $8.93/yd가 적용된다.
//     이 둘을 한 덩어리로 묶어 계산하면 견적이 $3 이상 비싸게 나온다.

export const FX_KRW_PER_USD = 1400;

/** 기본 원단 소요량(야드/장). 품목이 다르면 호출 시 덮어쓴다. */
export const DEFAULT_YARDS_PER_PIECE = 1.2;

/** 원가 대비 마크업. 원가 × (1 + MARKUP) = 권장 판매가. */
export const MARKUP = 0.25;

/** 공임 사다리 — 장수 기준 (원/장). */
const LABOR_KRW_TIERS = [
  { minPieces: 100, krwPerPiece: 9000 },
  { minPieces: 50, krwPerPiece: 15000 },
  { minPieces: 0, krwPerPiece: 23000 },
];

/**
 * 원단 사다리 — 야드 기준 (USD/야드). 장수가 아니다.
 * 아래 FABRICS에 없는 소재를 물어왔을 때 쓰는 기본값이다.
 */
const FABRIC_USD_PER_YARD_TIERS = [
  { minYards: 100, usdPerYard: 7.14 },
  { minYards: 50, usdPerYard: 8.93 },
  { minYards: 0, usdPerYard: 11.90 },
];

/**
 * 대표 원단과 대량 기준 야드 단가(USD).
 *
 * 공급처 사이트를 실시간으로 조회하던 것을 접고 이 표로 대체했다. 조회는 약관이
 * 금지하는 자동 수집이었고, 실제로 서버 요청이 403으로 막혔다.
 * 여기 값은 그전에 공급처에서 실제로 확인한 가격이며, 정확한 호가가 아니라
 * 상담용 개략치다. 단가가 바뀌면 이 표만 고치면 된다.
 *
 * estimated: true 는 실측하지 못해 비슷한 원단에서 미뤄 잡은 값이다.
 */
export interface FabricOption {
  name: string;
  spec: string;
  bulkUsdPerYard: number;
  estimated?: boolean;
}

export const FABRICS: FabricOption[] = [
  { name: "Cotton Single Jersey (lightweight)", spec: "Cotton 100% · 130-150gsm", bulkUsdPerYard: 4.98 },
  { name: "Cotton Single Jersey (midweight)", spec: "Cotton 100% · 180-220gsm", bulkUsdPerYard: 6.80 },
  { name: "Cotton-blend Single Jersey", spec: "Cotton 60% Poly 40% · 218gsm", bulkUsdPerYard: 4.08 },
  { name: "Cotton Rib", spec: "Cotton 100% · 200-240gsm", bulkUsdPerYard: 4.53 },
  { name: "Cotton Pique (polo)", spec: "Cotton 100% · 200-240gsm", bulkUsdPerYard: 6.50, estimated: true },
  { name: "Cotton French Terry (midweight)", spec: "Cotton 100% · 250-370gsm", bulkUsdPerYard: 6.34 },
  { name: "Cotton French Terry (heavyweight)", spec: "Cotton 100% · 420-480gsm", bulkUsdPerYard: 8.34 },
  { name: "Polyester Performance Knit", spec: "Poly 100% · 110-170gsm", bulkUsdPerYard: 3.26 },
  { name: "Poly/Spandex Wicking Mesh", spec: "Poly 95% Spandex 5% · 92-140gsm", bulkUsdPerYard: 4.08 },
  { name: "Linen-blend Jersey", spec: "Linen/Cotton · 160gsm", bulkUsdPerYard: 4.53 },
  { name: "Wool / Wool-blend", spec: "Wool · 170-320gsm", bulkUsdPerYard: 21.0 },
];

/**
 * 대량가(SwatchOn 표시가) 대비 소량 구간 할증률.
 * 기본 사다리 7.14 / 8.93 / 11.90의 비율(1 / 1.25 / 1.667)을 그대로 가져온 것이고,
 * SwatchOn 실제 상세 페이지의 lowPrice→highPrice 배수와도 일치한다.
 */
const FABRIC_YARD_MULTIPLIERS = [
  { minYards: 100, multiplier: 1 },
  { minYards: 50, multiplier: 1.25 },
  { minYards: 0, multiplier: 1.667 },
];

export function fabricYardMultiplier(totalYards: number): number {
  const tier =
    FABRIC_YARD_MULTIPLIERS.find((t) => totalYards >= t.minYards) ??
    FABRIC_YARD_MULTIPLIERS[FABRIC_YARD_MULTIPLIERS.length - 1];
  return tier.multiplier;
}

/** 부자재 — 장수 기준 (USD/장). */
const TRIM_USD_TIERS = [
  { minPieces: 100, usd: 0.93 },
  { minPieces: 50, usd: 1.29 },
  { minPieces: 0, usd: 1.43 },
];

/** 샘플 1장. 패턴을 배치하려면 원단을 1.2야드로 끊을 수 없어 최소 2야드를 산다. */
export const SAMPLE = {
  yards: 2,
  fabricUsdPerYard: 11.90,
  laborKrw: 23000,
  trimUsd: 1.43,
  surchargeUsd: 60,
  /** 계산 원가 $101.66을 반올림해 제시하는 값. */
  listPriceUsd: 100,
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function laborUsdPerPiece(pieces: number): number {
  const tier = LABOR_KRW_TIERS.find((t) => pieces >= t.minPieces) ?? LABOR_KRW_TIERS[LABOR_KRW_TIERS.length - 1];
  return round2(tier.krwPerPiece / FX_KRW_PER_USD);
}

export function fabricUsdPerYard(totalYards: number): number {
  const tier =
    FABRIC_USD_PER_YARD_TIERS.find((t) => totalYards >= t.minYards) ??
    FABRIC_USD_PER_YARD_TIERS[FABRIC_USD_PER_YARD_TIERS.length - 1];
  return tier.usdPerYard;
}

export function trimUsdPerPiece(pieces: number): number {
  const tier = TRIM_USD_TIERS.find((t) => pieces >= t.minPieces) ?? TRIM_USD_TIERS[TRIM_USD_TIERS.length - 1];
  return tier.usd;
}

export interface Quote {
  pieces: number;
  yardsPerPiece: number;
  totalYards: number;
  fabricUsdPerYard: number;
  fabricUsdPerPiece: number;
  laborUsdPerPiece: number;
  trimUsdPerPiece: number;
  /** 내부 원가. 고객에게 노출 금지. */
  costUsdPerPiece: number;
  /** 원가에 마크업을 얹은 권장 판매가. */
  priceUsdPerPiece: number;
}

/**
 * @param bulkUsdPerYard SwatchOn에서 조회한 해당 원단의 대량 야드 단가.
 *                       생략하면 기본 사다리를 쓴다.
 */
export function quoteFor(
  pieces: number,
  yardsPerPiece: number = DEFAULT_YARDS_PER_PIECE,
  bulkUsdPerYard?: number
): Quote {
  const totalYards = pieces * yardsPerPiece;
  const fabricYard =
    bulkUsdPerYard != null
      ? round2(bulkUsdPerYard * fabricYardMultiplier(totalYards))
      : fabricUsdPerYard(totalYards);
  const fabric = round2(fabricYard * yardsPerPiece);
  const labor = laborUsdPerPiece(pieces);
  const trim = trimUsdPerPiece(pieces);
  const cost = round2(fabric + labor + trim);

  return {
    pieces,
    yardsPerPiece,
    totalYards: round2(totalYards),
    fabricUsdPerYard: fabricYard,
    fabricUsdPerPiece: fabric,
    laborUsdPerPiece: labor,
    trimUsdPerPiece: trim,
    costUsdPerPiece: cost,
    priceUsdPerPiece: round2(cost * (1 + MARKUP)),
  };
}

/**
 * 마크 에이전트의 시스템 프롬프트 뒤에 덧붙이는 가격 참조 블록.
 *
 * 원단별 장당 판매가를 서버가 미리 계산해서 표로 싣는다. 모델에게 원가를 주고
 * 계산시켰더니 산수를 틀렸고 야드 단가를 고객에게 흘렸다. 표만 주면 고를 뿐
 * 계산할 것도, 흘릴 것도 없다. 표가 작아서(원단 11종) 프롬프트 부담도 적다.
 */
export function pricingPolicyPrompt(): string {
  const rows = FABRICS.map((f) => {
    const at = (pieces: number) => quoteFor(pieces, undefined, f.bulkUsdPerYard).priceUsdPerPiece.toFixed(2);
    return `  ${f.name} (${f.spec}) — 100장+ $${at(100)} / 50~99장 $${at(50)} / 50장미만 $${at(30)}`;
  }).join("\n");

  return (
    "[가격 정책 — 내부 자료]\n" +
    "아래 표는 원단별·수량별 '장당 판매가(USD)'입니다. 계산이 끝난 값이니 그대로 읽어서 답하세요.\n\n" +
    "■ 규칙\n" +
    "- 고객이 말한 촉감·소재에 가장 가까운 원단을 표에서 하나 고르고, 수량에 맞는 칸의 값을 쓰세요.\n" +
    "- 직접 계산하지 마세요. 표에 있는 숫자만 말하세요. 없는 가격을 지어내면 안 됩니다.\n" +
    "- 구간은 단가가 낮아지는 지점일 뿐 최소 주문 수량이 아닙니다. 최소 주문은 1장이고,\n" +
    "  5장이든 20장이든 제작 가능합니다. 수량이 적다고 거절하거나 50장을 채우라고 하지 마세요.\n" +
    "  50장 미만은 전부 '50장미만' 칸을 쓰면 됩니다.\n" +
    "- 표에 없는 특수 소재(실크, 캐시미어 등)를 원하면 지어내지 말고, 취급은 가능하니\n" +
    "  디렉터가 원단을 확인해 정확한 견적을 이메일로 보내드린다고 안내하세요.\n" +
    "- 고객에게는 원단 이름과 조성만 말하세요. 야드 단가, 원가, 마진은 어떤 경우에도 말하지 마세요.\n\n" +
    "■ 원단별 장당 판매가 (장당 " + DEFAULT_YARDS_PER_PIECE + "야드 기준, USD)\n" +
    rows + "\n\n" +
    "■ 샘플\n" +
    "샘플 1장 $" + SAMPLE.listPriceUsd + ". 패턴 배치 때문에 원단을 최소 " + SAMPLE.yards + "야드 끊어야 해서 벌크보다 비쌉니다.\n" +
    "샘플비는 벌크 주문 시 환급됩니다 — 50장 이상 50%, 100장 이상 100%.\n\n" +
    "■ 답변 방식\n" +
    "가격을 숨기지 말고 알려주세요. 다만 확정가로 말하면 안 됩니다. 가격을 말할 때마다:\n" +
    "  (1) 개략적인 견적이다 (a broad estimate)\n" +
    "  (2) 원단·사양·디테일을 저희와 상의하는 과정에서 조정될 수 있다\n" +
    "이 두 가지를 반드시 함께 전달하고, 정식 견적서는 생산 총괄 디렉터가 이메일로 보내드린다고\n" +
    "안내하며 이메일을 받으세요."
  );
}
