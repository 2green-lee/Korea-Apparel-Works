import React from "react";

interface FooterProps {
  onAdminClick?: () => void;
  setCurrentSlide?: (slide: number) => void;
  currentSlide?: number;
}

const Footer = React.memo(function Footer({ onAdminClick, setCurrentSlide, currentSlide }: FooterProps) {
  const isHome = currentSlide === 0;

  const bgClass = isHome ? "bg-transparent" : "bg-[#0a0a0a]";
  const textTitleClass = isHome ? "text-neutral-900" : "text-white";
  const textDescClass = isHome ? "text-neutral-600" : "text-neutral-400";
  const microLabelClass = isHome ? "text-neutral-400" : "text-neutral-500";
  const logoClass = isHome ? "object-contain brightness-0 opacity-80" : "object-contain brightness-0 invert opacity-90";
  const borderClass = isHome ? "border-neutral-200" : "border-neutral-800";
  const linkHoverClass = isHome ? "hover:text-neutral-900" : "hover:text-white";

  return (
    <div className={`w-full ${bgClass} ${isHome ? "mt-16 lg:mt-24" : ""}`}>
      <footer
        id="footer"
        className={`pt-20 pb-10 overflow-hidden relative font-sans bg-transparent ${textDescClass}`}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10 relative z-10 select-text">

          {/* Upper: brand block */}
          <div className="max-w-xl">
            <div className="flex items-center mb-5">
              <img
                src="/logo1234.png"
                alt="Korea Apparel Works Logo"
                className={logoClass}
                style={{ width: 70, height: 70 }}
              />
              <span className={`font-sans font-semibold tracking-widest text-[16px] ${textTitleClass}`} style={{ marginLeft: -14 }}>
                Korea Apparel Works
              </span>
            </div>
            <p className={`text-[14px] font-light leading-[1.8] font-dm-sans ${textDescClass}`}>
              Forging the physical frontier of custom low-MOQ technical garments and structural
              style designs. Conceived elegantly for global labels — hand-assembled,
              pattern-drafted, and calibrated alongside veteran ateliers in Busan, South Korea.
            </p>
          </div>

          {/* Lower: company / office / contact + legal row, all in the light DM Sans */}
          <div className={`border-t mt-14 pt-8 font-dm-sans font-light text-[13px] leading-[1.8] ${textDescClass} ${borderClass}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* 사업자 정보 — 해외 바이어가 실제 한국 법인인지 확인할 수 있게 */}
              <div>
                <div className={`text-[11px] font-medium uppercase tracking-[0.22em] mb-3 select-none ${microLabelClass}`}>Company</div>
                <p>
                  KAW Inc. · CEO 이근일<br />
                  Business Reg. No. 179-86-04548
                </p>
              </div>
              <div>
                <div className={`text-[11px] font-medium uppercase tracking-[0.22em] mb-3 select-none ${microLabelClass}`}>Office</div>
                <p>
                  2F, 30-1, Suyeong-ro 603beon-gil,<br />
                  Suyeong-gu, Busan, Republic of Korea
                </p>
              </div>
              <div>
                <div className={`text-[11px] font-medium uppercase tracking-[0.22em] mb-3 select-none ${microLabelClass}`}>Contact</div>
                <a
                  href="mailto:contact@koreaapparel.works"
                  className={`underline-offset-4 hover:underline transition-colors break-all ${linkHoverClass}`}
                >
                  contact@koreaapparel.works
                </a>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 select-none">
              <div>© {new Date().getFullYear()} Korea Apparel Works. All rights reserved.</div>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-cookie-policy'));
                }}
                className={`transition-colors cursor-pointer select-none ${linkHoverClass}`}
              >
                Cookie Policy
              </button>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
});

export default Footer;
