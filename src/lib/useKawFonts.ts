import { useEffect } from "react";

// 인더엑스 리디자인 화면(welcome, 빨리 채팅)에서 쓰는 글꼴: Inter + Pretendard
const FONT_LINKS = [
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300..800&display=swap",
];

export function useKawFonts() {
  useEffect(() => {
    FONT_LINKS.forEach((href) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
    // 다른 화면으로 옮겨 가도 글꼴은 남겨 둔다(다시 돌아올 때 깜빡임 방지)
  }, []);
}
