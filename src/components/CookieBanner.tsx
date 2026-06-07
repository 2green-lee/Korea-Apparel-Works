import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("apparel-cookie-consent");
    if (!consent) {
      // Gentle appearance on interface loader
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("apparel-cookie-consent", "granted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("apparel-cookie-consent", "denied");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="cookie-consent-banner"
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 left-5 right-5 md:left-auto md:right-8 md:w-[460px] z-50 bg-[#121212] border border-white/10 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.65)] p-6 font-sans select-none overflow-hidden"
        >
          {/* Subtle Deep Red Ambient glow inside banner */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#b8321e]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4">
            {/* Header Area */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#b8321e]/15 text-[#e14833] rounded-md">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-base font-semibold text-white tracking-tight">
                  We value your privacy
                </h4>
              </div>
              <button
                onClick={handleDecline}
                className="text-neutral-500 hover:text-white transition-colors p-1 rounded-md"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanatory Body Copy */}
            <div className="space-y-2 text-[12px] leading-relaxed text-neutral-300 font-light">
              <p>
                We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.{" "}
                <span className="text-[#e14833] underline hover:text-[#f26552] cursor-pointer font-normal">Privacy Policy</span>.
              </p>
              <p className="text-neutral-500 border-t border-white/5 pt-2 select-text font-normal">
                우리는 귀하의 브라우징 경험을 개선하고, 맞춤형 광고나 콘텐츠를 제공하며, 트래픽을 분석하기 위해 쿠키를 사용합니다. &quot;Accept All&quot;을 클릭하면 귀하는 당사의 쿠키 사용에 동의하게 됩니다.{" "}
                <span className="text-[#e14833] underline cursor-pointer hover:text-[#f26552]">개인정보처리방침</span>.
              </p>
            </div>

            {/* Responsive Actions mimicking the reference layout (Customise / Accept All) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleDecline}
                className="w-full py-2.5 px-4 bg-transparent border border-[#b8321e] hover:bg-[#b8321e]/10 text-[#e14833] hover:text-[#f26552] text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer text-center"
              >
                Customise
              </button>
              <button
                onClick={handleAccept}
                className="w-full py-2.5 px-4 bg-[#b8321e] hover:bg-[#a12817] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer text-center shadow-lg shadow-[#b8321e]/10"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
