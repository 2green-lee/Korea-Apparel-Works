// SwatchOn(원단 공급처)에서 실제 야드 단가를 가져온다.
//
// 왜 서버가 직접 가져오는가 —
// Gemini의 googleSearch/urlContext 툴로 모델에게 직접 찾게 해봤더니, SKU와 이름은 맞히면서
// 가격만 지어냈다. (QL-042640을 "$12.84~$23.44"로 답했으나 실제는 $17.22~$33.98,
// urlContextMetadata를 보면 페이지를 읽지도 않았다.) 견적에서 가격이 조용히 틀리면
// 손실로 직결되므로, 숫자는 반드시 이 모듈이 실제 페이지에서 파싱한 값만 쓴다.
//
// 목록 페이지(/fabric-for/<카테고리>)는 SSR이라 한 번의 요청으로 24개 원단의
// SKU·이름·대량단가·조성·중량을 모두 준다. 목록에 찍힌 가격은 상세 페이지의
// lowPrice(대량가)와 일치하는 것을 확인했다.

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

/** 우리가 만드는 품목 → SwatchOn 카테고리. 상의·스포츠웨어가 주력이다. */
export const CATEGORY_SLUGS = {
  tshirt: "t-shirts",
  activewear: "activewear",
  shirt: "shirts",
  outerwear: "outerwear",
} as const;

export type CategoryKey = keyof typeof CATEGORY_SLUGS;

export interface Fabric {
  sku: string;
  name: string;
  /** SwatchOn 표시가 = 대량 구간 야드 단가(USD). */
  bulkUsdPerYard: number;
  composition?: string;
  gsm?: number;
  url: string;
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6시간
const cache = new Map<string, { at: number; fabrics: Fabric[] }>();

function parseListing(html: string): Fabric[] {
  const out: Fabric[] = [];
  const seen = new Set<string>();
  const linkRe = /\/fabric\/([A-Z]{2}-\d+)/g;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html))) {
    const sku = m[1];
    if (seen.has(sku)) continue;

    // 링크 뒤쪽 한 덩어리에 이름·가격·조성·중량이 같이 들어 있다.
    // 여는 <a> 태그가 끝나는 '>' 다음부터 봐야 태그 속성이 이름에 섞이지 않는다.
    const tagEnd = html.indexOf(">", m.index);
    if (tagEnd === -1) continue;

    const segment = html.slice(tagEnd + 1, tagEnd + 1200);
    const text = segment.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    const priceMatch = text.match(/\$([0-9]+\.[0-9]{2})/);
    if (!priceMatch) continue;

    seen.add(sku);

    // 본문은 "QL-039500 면-혼방 싱글 저지 $4.08 CO 60 P 40 218 gsm" 꼴이다.
    const afterSku = text.replace(sku, "").trimStart();
    const name = afterSku.slice(0, afterSku.indexOf("$")).trim() || sku;
    const gsmMatch = text.match(/([0-9]{2,4})\s*gsm/i);
    const compMatch = afterSku.match(/\$[0-9.]+\s+([A-Z]{1,3}(?:\s+\d{1,3})?(?:\s+[A-Z]{1,3}\s+\d{1,3})*)/);

    out.push({
      sku,
      name,
      bulkUsdPerYard: parseFloat(priceMatch[1]),
      composition: compMatch ? compMatch[1].trim() : undefined,
      gsm: gsmMatch ? parseInt(gsmMatch[1], 10) : undefined,
      url: `https://www.swatchon.com/fabric/${sku}`,
    });
  }

  return out;
}

/** 카테고리 목록을 가져온다. 실패하면 빈 배열 — 호출부가 기본 단가로 넘어간다. */
export async function fetchCategoryFabrics(category: CategoryKey): Promise<Fabric[]> {
  const slug = CATEGORY_SLUGS[category];
  const hit = cache.get(slug);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.fabrics;

  try {
    const res = await fetch(`https://www.swatchon.com/fabric-for/${slug}`, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const fabrics = parseListing(await res.text());
    if (fabrics.length) cache.set(slug, { at: Date.now(), fabrics });
    return fabrics;
  } catch (err) {
    console.error(`SwatchOn fetch failed (${slug}):`, err);
    return hit?.fabrics ?? [];
  }
}

/** 상세 페이지의 JSON-LD에서 정확한 저가/고가 범위를 읽는다. 특정 원단이 확정됐을 때만 쓴다. */
export async function fetchFabricDetail(
  sku: string
): Promise<{ sku: string; name: string; material?: string; lowPrice: number; highPrice: number } | null> {
  try {
    const res = await fetch(`https://www.swatchon.com/fabric/${sku}`, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;

    const html = await res.text();
    for (const block of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
      try {
        const data = JSON.parse(block[1]);
        if (data?.["@type"] === "Product" && data?.offers?.lowPrice != null) {
          return {
            sku: data.sku ?? sku,
            name: data.name ?? sku,
            material: data.material,
            lowPrice: Number(data.offers.lowPrice),
            highPrice: Number(data.offers.highPrice ?? data.offers.lowPrice),
          };
        }
      } catch {
        // 이 블록은 Product가 아니다 — 다음 블록으로.
      }
    }
    return null;
  } catch (err) {
    console.error(`SwatchOn detail fetch failed (${sku}):`, err);
    return null;
  }
}

/**
 * 프롬프트에 넣을 원단별 '최종 판매가' 표.
 *
 * 야드 단가가 아니라 완제품 장당 가격을 미리 계산해서 넣는다. 이유가 둘이다 —
 * 모델에게 원가를 주고 계산시켰더니 (1) 산수를 틀렸고 (2) "$4.98/yd 원단으로" 하며
 * 내부 단가를 고객에게 흘렸다. 표만 주면 고를 뿐 계산할 것도, 흘릴 것도 없다.
 */
export function formatFabricPriceTable(
  groups: { category: CategoryKey; fabrics: Fabric[] }[],
  priceAt: (bulkUsdPerYard: number, pieces: number) => number,
  // 목록 요청 한 번이 24개를 주므로 전부 싣는다. 앞서 6개만 쓰던 때는 싼 원단에만
  // 몰려 100장가가 $11~17에 그쳤고, 조금이라도 고급한 원단을 찾는 고객은 견적을 못 받았다.
  perCategory = 24
): string {
  const lines: string[] = [];

  for (const { category, fabrics } of groups) {
    if (!fabrics.length) continue;
    const picked = [...fabrics].sort((a, b) => a.bulkUsdPerYard - b.bulkUsdPerYard).slice(0, perCategory);
    lines.push(`[${CATEGORY_SLUGS[category]}]`);
    for (const f of picked) {
      const spec = [f.composition, f.gsm ? `${f.gsm}gsm` : null].filter(Boolean).join(" · ");
      const p100 = priceAt(f.bulkUsdPerYard, 100).toFixed(2);
      const p50 = priceAt(f.bulkUsdPerYard, 50).toFixed(2);
      const p30 = priceAt(f.bulkUsdPerYard, 30).toFixed(2);
      lines.push(`  ${f.name}${spec ? ` (${spec})` : ""} — 100장+ $${p100} / 50~99장 $${p50} / 50장미만 $${p30}`);
    }
  }

  return lines.join("\n");
}
