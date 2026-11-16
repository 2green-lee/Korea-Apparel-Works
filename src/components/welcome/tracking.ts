// Google Tag Manager로 전환 클릭을 보낸다 (기존 welcome 페이지와 같은 이벤트 이름·형식)
export function pushConversion(ctaId: string) {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: "conversion_click", cta_id: ctaId, page: "welcome" });
}
