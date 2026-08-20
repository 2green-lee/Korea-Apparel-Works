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

          {/* Upper: brand block (left) + info columns (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

            {/* Brand & Manifesto */}
            <div className="lg:col-span-7">
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
              <p className={`text-[14px] font-light leading-[1.8] max-w-xl font-dm-sans ${textDescClass}`}>
                Forging the physical frontier of custom low-MOQ technical garments and structural
                style designs. Conceived elegantly for global labels — hand-assembled,
                pattern-drafted, and calibrated alongside veteran ateliers in Busan, South Korea.
              </p>
            </div>

            {/* Info columns */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-8 lg:pt-4">
              <div>
                <div className={`text-[11px] font-medium uppercase tracking-[0.22em] mb-4 select-none ${microLabelClass}`}>
                  Office
                </div>
                <p className={`text-[14px] font-light leading-[1.8] font-dm-sans ${textDescClass}`}>
                  2F, 30-1, Suyeong-ro 603beon-gil,<br />
                  Suyeong-gu, Busan,<br />
                  Republic of Korea
                </p>
              </div>
              <div>
                <div className={`text-[11px] font-medium uppercase tracking-[0.22em] mb-4 select-none ${microLabelClass}`}>
                  Contact
                </div>
                <a
                  href="mailto:contact@koreaapparel.works"
                  className={`text-[14px] font-light leading-[1.8] font-dm-sans underline-offset-4 hover:underline transition-colors break-all ${textDescClass} ${linkHoverClass}`}
                >
                  contact@koreaapparel.works
                </a>
              </div>
            </div>

          </div>

          {/* Lower: legal row */}
          <div className={`border-t mt-14 pt-7 flex flex-col sm:flex-row justify-between items-center text-[11px] ${textDescClass} font-mono gap-3 select-none ${borderClass}`}>
            <div className="tracking-wide">
              © {new Date().getFullYear()} KOREA APPAREL WORKS. ALL RIGHTS RESERVED.
            </div>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-cookie-policy'));
              }}
              className={`tracking-wide transition-colors cursor-pointer select-none ${linkHoverClass}`}
            >
              COOKIE POLICY
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
});

export default Footer;
