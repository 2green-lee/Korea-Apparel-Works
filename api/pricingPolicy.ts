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
 * SwatchOn 조회가 실패했을 때 쓰는 기본값이다.
 */
const FABRIC_USD_PER_YARD_TIERS = [
  { minYards: 100, usdPerYard: 7.14 },
  { minYards: 50, usdPerYard: 8.93 },
  { minYards: 0, usdPerYard: 11.90 },
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
 * 대화 지침이 아니라 '가격을 계산할 때 근거로 삼을 자료'다.
 */
export function pricingPolicyPrompt(fabricCatalog?: string): string {
  const t30 = quoteFor(30);
  const t50 = quoteFor(50);
  const t100 = quoteFor(100);

  // 실시간 원단 표가 있으면 그것만 쓴다. 계산도 예시 가격도 주지 않는다 —
  // 모델에게 산수를 시키면 틀리고, 원가를 보여주면 고객에게 흘린다.
  if (fabricCatalog) {
    return (
      "[가격 정책 — 내부 자료]\n" +
      "아래 표는 원단별·수량별 '장당 판매가(USD)'입니다. 이미 계산이 끝난 값이니 그대로 읽어서 답하세요.\n\n" +
      "■ 규칙\n" +
      "- 가격을 말하기 전에 search_fabrics 도구로 고객이 원하는 원단을 찾으세요. 도구가 돌려주는\n" +
      "  pricePerPiece 값이 이미 계산이 끝난 장당 판매가입니다. 그 숫자를 그대로 쓰세요.\n" +
      "- 원단 보유 여부를 짐작해서 말하지 마세요. 고객이 울·리넨·실크 등 어떤 소재를 말하든\n" +
      "  먼저 search_fabrics로 확인하세요. 결과가 나오면 취급 가능한 원단입니다.\n" +
      "  확인도 없이 '저희는 그 소재를 취급하지 않습니다'라고 답하면 안 됩니다.\n" +
      "- 도구가 결과를 못 주면 아래 표에서 가장 가까운 원단을 쓰세요. 둘 다 없으면 지어내지 말고\n" +
      "  디렉터가 확인해 이메일로 보내드린다고 안내하세요.\n" +
      "- 직접 계산하지 마세요. 도구나 표에 있는 숫자만 말하세요.\n" +
      "- 수량이 구간 사이면(예: 45장) 해당 구간 값을 쓰세요. 45장은 '50장미만' 칸입니다.\n" +
      "- 고객에게는 원단 이름과 조성만 말하세요. 야드 단가, 원가, 마진, 공급처는 어떤 경우에도 말하지 마세요.\n" +
      "- 표에 맞는 원단이 없으면 지어내지 말고, 디렉터가 확인해 이메일로 보내드린다고 안내하세요.\n\n" +
      "■ 원단별 장당 판매가 (장당 " + DEFAULT_YARDS_PER_PIECE + "야드 기준)\n" +
      fabricCatalog + "\n\n" +
      "■ 샘플\n" +
      "샘플 1장 $" + SAMPLE.listPriceUsd + ". 패턴 배치 때문에 원단을 최소 " + SAMPLE.yards + "야드 끊어야 해서 벌크보다 비쌉니다.\n" +
      "샘플비는 벌크 주문 시 환급됩니다 — 50장 이상 50%, 100장 이상 100%.\n\n" +
      "■ 답변 방식\n" +
      "가격을 숨기지 말고 표의 값을 알려주세요. 다만 확정가로 말하면 안 됩니다. 가격을 말할 때마다:\n" +
      "  (1) 개략적인 견적이다 (a broad estimate)\n" +
      "  (2) 원단·사양·디테일을 저희와 상의하는 과정에서 조정될 수 있다\n" +
      "이 두 가지를 반드시 함께 전달하고, 정식 견적서는 생산 총괄 디렉터가 이메일로 보내드린다고 안내하며 이메일을 받으세요."
    );
  }

  const fabricSection =
    "■ 원단 야드 단가 (기본값 — 실시간 조회 실패 시)\n" +
    "  100야드 이상 $7.14/yd · 50~99야드 $8.93/yd · 50야드 미만 $11.90/yd\n\n";

  return (
    "[가격 정책 — 내부 자료]\n" +
    "가격에 관한 대화를 할 때는 아래 자료를 근거로 계산해서 답하세요. 추측하거나 지어내지 마세요.\n\n" +
    "■ 절대 노출 금지\n" +
    "원가, 마크업률, 공임 단가(원화), 원단 야드 단가는 회사 내부 정보입니다. 고객에게 어떤 경우에도 말하지 마세요.\n" +
    "고객에게 말할 수 있는 것은 '장당 판매가'와 '샘플 비용'뿐입니다.\n\n" +
    "■ 티어 기준이 두 개입니다 (가장 흔한 계산 실수)\n" +
    "- 원단 단가 티어 = 총 야드수 기준 (수량 × 장당 소요 야드)\n" +
    "- 공임/부자재 티어 = 총 장수 기준\n" +
    "장당 소요는 기본 " + DEFAULT_YARDS_PER_PIECE + "야드이므로 50야드는 약 42장에 해당합니다.\n" +
    "두 티어를 하나로 묶어 장수만으로 판단하면 견적이 실제보다 비싸집니다.\n\n" +
    "■ 계산식 (수량이 구간 경계에 걸치면 표를 쓰지 말고 이걸로 계산하세요)\n" +
    "총야드 = 수량 × 장당소요야드\n" +
    "장당원가 = (원단단가 × 장당소요야드) + 공임 + 부자재\n" +
    "장당판매가 = 장당원가 × " + (1 + MARKUP).toFixed(2) + "\n\n" +
    fabricSection +
    "공임 — 장수 기준:\n" +
    "  100장 이상 $6.43/장 · 50~99장 $10.71/장 · 50장 미만 $16.43/장\n" +
    "부자재 — 장수 기준:\n" +
    "  100장 이상 $0.93/장 · 50~99장 $1.29/장 · 50장 미만 $1.43/장\n\n" +
    "■ 대표 구간 판매가 (장당 " + DEFAULT_YARDS_PER_PIECE + "야드 기준, USD)\n" +
    "- 100장 이상: $" + t100.priceUsdPerPiece.toFixed(2) + "\n" +
    "- 50~99장: $" + t50.priceUsdPerPiece.toFixed(2) + "\n" +
    "- 30장: $" + t30.priceUsdPerPiece.toFixed(2) + "\n" +
    "경계 예시 — 45장: 총 54야드라 원단은 $8.93/yd를 받지만 공임은 50장 미만 $16.43입니다. " +
    "따라서 원가 $" + quoteFor(45).costUsdPerPiece.toFixed(2) + ", 판매가 $" + quoteFor(45).priceUsdPerPiece.toFixed(2) + "입니다. " +
    "여기서 '50장 미만이니 $" + t30.priceUsdPerPiece.toFixed(2) + "'라고 답하면 안 됩니다.\n" +
    "원단을 많이 쓰는 품목이면 장당 소요 야드를 늘려 다시 계산하세요.\n\n" +
    "■ 샘플\n" +
    "샘플 1장 $" + SAMPLE.listPriceUsd + ". 샘플은 패턴 배치 때문에 원단을 최소 " + SAMPLE.yards + "야드 끊어야 해서 벌크보다 장당 원단비가 비쌉니다.\n" +
    "샘플비는 벌크 주문 시 환급됩니다 — 50장 이상 50%, 100장 이상 100%.\n\n" +
    "■ 환율\n" +
    "1 USD = " + FX_KRW_PER_USD + "원 기준으로 산출된 가격입니다.\n\n" +
    "■ 답변 방식\n" +
    "고객이 수량을 말하면 위 기준으로 장당 가격을 계산해서 알려주세요. 가격을 숨기지 마세요.\n" +
    "다만 어떤 경우에도 확정가로 말하면 안 됩니다. 가격을 말할 때마다 다음 두 가지를 반드시 함께 전달하세요:\n" +
    "  (1) 이건 개략적인 견적이다 (a broad estimate / ballpark figure)\n" +
    "  (2) 원단 종류, 사양, 디테일을 저희와 상의하는 과정에서 조정될 수 있다\n" +
    "그 뒤 정식 견적서는 생산 총괄 디렉터가 이메일로 보내드린다고 안내하고 이메일을 받으세요.\n" +
    "예: 'For 100 pcs, you're looking at roughly $" + t100.priceUsdPerPiece.toFixed(2) + " per piece. " +
    "That's a broad estimate — the final number shifts once we go over the fabric and details together. " +
    "Could I get your email so our production director can send the formal quote?'"
  );
}
