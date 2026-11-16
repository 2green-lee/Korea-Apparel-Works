import { useEffect, type RefObject } from "react";
import Lenis from "lenis";

// 인더엑스 퍼블리싱의 common.js·ui.js 동작을 React용으로 옮긴 것.
// 모든 동작은 welcome 페이지(root) 안에서만 걸리고, 페이지를 벗어나면 정리된다.
export function useWelcomeInteractions(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];
    const on = <K extends keyof WindowEventMap>(
      target: Window | Element,
      type: K | string,
      handler: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions
    ) => {
      target.addEventListener(type, handler, options);
      cleanups.push(() => target.removeEventListener(type, handler, options));
    };

    const header = root.querySelector<HTMLElement>("#header");

    // 1. 스크롤 시 헤더 그림자
    if (header) {
      const updateFixed = () => header.classList.toggle("is-fixed", window.scrollY > 10);
      updateFixed();
      on(window, "scroll", updateFixed, { passive: true });
    }

    // 2. 아래로 스크롤하면 헤더 숨김, 위로 올리면 다시 표시
    if (header && header.hasAttribute("data-auto-hide")) {
      let lastY = window.scrollY;
      const updateHide = () => {
        const y = window.scrollY;
        if (header.classList.contains("is-open") || y <= header.offsetHeight) {
          header.classList.remove("is-hidden");
        } else if (y > lastY + 5) {
          header.classList.add("is-hidden");
        } else if (y < lastY - 5) {
          header.classList.remove("is-hidden");
        } else {
          return;
        }
        lastY = y;
      };
      on(window, "scroll", updateHide, { passive: true });
      on(header, "focusin", () => header.classList.remove("is-hidden"));
    }

    // 3. 모바일 메뉴 열기/닫기
    const menuBtn = header?.querySelector<HTMLButtonElement>(".btn-menu");
    if (header && menuBtn) {
      const label = menuBtn.querySelector(".blind");
      const setOpen = (open: boolean) => {
        header.classList.toggle("is-open", open);
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
        if (label) label.textContent = open ? "Close menu" : "Open menu";
        document.body.style.overflow = open ? "hidden" : "";
      };
      on(menuBtn, "click", () => setOpen(!header.classList.contains("is-open")));
      header.querySelectorAll(".gnb a").forEach((a) => on(a, "click", () => setOpen(false)));
      on(window, "resize", () => {
        if (window.innerWidth > 1024 && header.classList.contains("is-open")) setOpen(false);
      });
      cleanups.push(() => {
        document.body.style.overflow = "";
      });
    }

    // 4. Lenis 관성 스크롤 + 같은 페이지 앵커 이동
    let lenis: Lenis | null = null;
    if (!reduceMotion) {
      lenis = new Lenis({ lerp: 0.1 });
      let rafId = 0;
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      cleanups.push(() => {
        cancelAnimationFrame(rafId);
        lenis?.destroy();
        lenis = null;
      });
    }
    root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
      on(link, "click", (e) => {
        const hash = link.getAttribute("href");
        if (!hash || hash === "#") return;
        const target = root.querySelector<HTMLElement>(hash);
        if (!target) return;
        e.preventDefault();
        const offset = header ? -(header.offsetHeight + 24) : 0;
        if (lenis) {
          lenis.scrollTo(target, { offset });
        } else {
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
        }
        history.replaceState(null, "", hash);
      });
    });

    // 5. 스크롤 진입 시 등장 효과
    const reveals = root.querySelectorAll<HTMLElement>(".reveal");
    if (reveals.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px" }
      );
      reveals.forEach((el) => {
        el.classList.add("is-ready");
        io.observe(el);
      });
      cleanups.push(() => io.disconnect());
    }

    // 6. 숫자 카운트업 (data-count)
    const nums = root.querySelectorAll<HTMLElement>(".js-count");
    if (nums.length && !reduceMotion && "IntersectionObserver" in window) {
      const frames: number[] = [];
      const run = (el: HTMLElement) => {
        const target = parseInt(el.getAttribute("data-count") || "0", 10) || 0;
        const duration = 1400;
        let start: number | null = null;
        const step = (time: number) => {
          if (start === null) start = time;
          const progress = Math.min((time - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased).toLocaleString("en-US");
          if (progress < 1) frames.push(requestAnimationFrame(step));
        };
        frames.push(requestAnimationFrame(step));
      };
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            run(entry.target as HTMLElement);
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      nums.forEach((n) => io.observe(n));
      cleanups.push(() => {
        io.disconnect();
        frames.forEach(cancelAnimationFrame);
        nums.forEach((n) => (n.textContent = n.getAttribute("data-count") || n.textContent));
      });
    }

    // 7. 배경 영상 재생/일시정지
    const video = root.querySelector<HTMLVideoElement>(".visual-video");
    const videoBtn = root.querySelector<HTMLButtonElement>(".btn-video-toggle");
    if (video && videoBtn) {
      const label = videoBtn.querySelector(".blind");
      const setPaused = (paused: boolean) => {
        videoBtn.classList.toggle("is-paused", paused);
        videoBtn.setAttribute("aria-pressed", paused ? "true" : "false");
        if (label) label.textContent = paused ? "Play background video" : "Pause background video";
      };
      const source = video.querySelector("source");
      if (source) on(source, "error", () => (videoBtn.hidden = true));
      if (reduceMotion) {
        video.pause();
        setPaused(true);
      }
      on(videoBtn, "click", () => {
        if (video.paused) {
          void video.play();
          setPaused(false);
        } else {
          video.pause();
          setPaused(true);
        }
      });
    }

    // 8. 공정 단계 호버 시 이미지 전환, 목록을 벗어나면 기본 단계(Sample)로 복귀
    const processList = root.querySelector<HTMLElement>(".process-list");
    if (processList) {
      const items: HTMLElement[] = [];
      processList.querySelectorAll<HTMLElement>(".process-item").forEach((it) => items.push(it));
      const defaultItem = processList.querySelector<HTMLElement>(".is-key") || items[0];
      const activate = (target: HTMLElement) => items.forEach((it) => it.classList.toggle("is-active", it === target));
      items.forEach((it) => on(it, "mouseenter", () => activate(it)));
      on(processList, "mouseleave", () => defaultItem && activate(defaultItem));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [rootRef]);
}
