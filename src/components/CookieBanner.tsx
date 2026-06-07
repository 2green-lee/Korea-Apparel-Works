import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, X, HelpCircle, FileText } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isCustomiseOpen, setIsCustomiseOpen] = useState(false);
  const [perfConsent, setPerfConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(true);

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
    const consentConfig = {
      necessary: true,
      performance: true,
      marketing: true,
      timestamp: Date.now()
    };
    localStorage.setItem("apparel-cookie-consent", JSON.stringify(consentConfig));
    setIsVisible(false);
  };

  const handleDecline = () => {
    const consentConfig = {
      necessary: true,
      performance: false,
      marketing: false,
      timestamp: Date.now()
    };
    localStorage.setItem("apparel-cookie-consent", JSON.stringify(consentConfig));
    setIsVisible(false);
  };

  return (
    <>
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
                <h4 className="text-base font-semibold text-white tracking-tight">
                  We value your privacy
                </h4>
                <button
                  onClick={handleDecline}
                  className="text-neutral-500 hover:text-white transition-colors p-1 rounded-md cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Explanatory Body Copy */}
              <div className="space-y-2 text-[12px] leading-relaxed text-neutral-300 font-light">
                <p>
                  We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.{" "}
                  <button
                    onClick={() => setIsPolicyOpen(true)}
                    className="text-[#e14833] underline hover:text-[#f26552] cursor-pointer font-normal bg-transparent border-none p-0 inline-block align-baseline"
                  >
                    Privacy Policy
                  </button>.
                </p>
                <p className="text-neutral-500 border-t border-white/5 pt-2 select-text font-normal">
                  우리는 귀하의 브라우징 경험을 개선하고, 맞춤형 광고나 콘텐츠를 제공하며, 트래픽을 분석하기 위해 쿠키를 사용합니다. &quot;Accept All&quot;을 클릭하면 귀하는 당사의 쿠키 사용에 동의하게 됩니다.{" "}
                  <button
                    onClick={() => setIsPolicyOpen(true)}
                    className="text-[#e14833] underline cursor-pointer hover:text-[#f26552] bg-transparent border-none p-0 inline-block align-baseline"
                  >
                    개인정보처리방침
                  </button>.
                </p>
              </div>

              {/* Responsive Actions mimicking the reference layout (Customise / Accept All) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => setIsCustomiseOpen(true)}
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

      {/* Customise Cookie Preferences Modal */}
      <AnimatePresence>
        {isCustomiseOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomiseOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
              className="w-full max-w-2xl bg-[#161616] border border-white/10 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden relative z-10 flex flex-col max-h-[85vh] font-sans"
            >
              {/* Top ambient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#b8321e]/50 to-transparent" />
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#121212]/50">
                <div>
                  <h3 className="text-base font-semibold text-white">Customise Cookie Preferences</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">쿠키 및 개인정보 설정 맞춤 조정</p>
                </div>
                <button
                  onClick={() => setIsCustomiseOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content with custom slick scrollbar */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-300 font-light leading-relaxed select-text [scrollbar-width:thin] [scrollbar-color:#333_transparent]">
                
                {/* Intro block */}
                <div className="space-y-3 pb-4 border-b border-white/5">
                  <p className="text-[13px] text-neutral-200">
                    We use cookies to help you navigate efficiently and perform certain functions.
                  </p>
                  <p className="text-neutral-400">
                    The cookies that are categorised as &quot;Necessary&quot; are stored on your browser as they are essential for enabling the basic functionalities of the site.
                  </p>
                  <p className="text-neutral-400/90 font-light">
                    We also use third-party cookies that help us analyse how you use this website, store your preferences, and provide the content and advertisements that are relevant to you. These cookies will only be stored in your browser with your prior consent.
                  </p>
                  <p className="text-neutral-400/90 font-light">
                    You can choose to enable or disable some or all of these cookies but disabling some of them may affect your browsing experience.
                  </p>
                  <p className="text-neutral-500 text-[11px] font-normal border-t border-white/5 pt-2.5">
                    우리는 귀하가 웹사이트를 보다 효율적으로 탐색하고 특정 기능을 수행할 수 있도록 쿠키를 사용합니다. &quot;필수&quot;로 분류된 쿠키는 사이트의 핵심 기본 기능을 활성화하는 데 필수적이므로 브라우저에 저장됩니다. 또한 우리는 귀하가 웹사이트를 사용하는 방식을 분석하고 선호 사항을 저장하며 적절한 정보/광고를 제공하기 위해 제3자 쿠키를 사용하며, 전적으로 귀하의 전적인 동의하에 저장됩니다. 특정 쿠키의 비활성화는 브라우징 환경에 다소 영향을 미칠 수 있습니다.
                  </p>
                </div>

                {/* Cookie Preference Rows */}
                <div className="space-y-4">
                  
                  {/* Category 1: Necessary Cookies */}
                  <div className="flex items-start justify-between gap-6 p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-[13px] font-semibold text-white">Necessary Cookies</h5>
                        <span className="text-[10px] bg-white/10 text-neutral-300 font-mono px-1.5 py-0.5 rounded uppercase font-medium">Required</span>
                      </div>
                      <p className="text-neutral-400 text-[11px] font-normal">
                        Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.
                      </p>
                      <p className="text-neutral-500 text-[10px] font-normal">
                        필수 쿠키는 안전한 로그인 제공 및 기본 인터페이스 활성화 등 본 사이트의 기본 기능을 유지하는 데 필요하며, 식별 가능한 개인 데이터를 저장하지 않습니다.
                      </p>
                    </div>
                    {/* Locked Active Toggle */}
                    <div className="shrink-0 pt-1">
                      <div className="w-10 h-6 flex items-center rounded-full p-[2px] bg-white/20 opacity-50 cursor-not-allowed">
                        <div className="bg-white w-4 h-4 rounded-full translate-x-4 shadow" />
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Performance & Analytics */}
                  <div className="flex items-start justify-between gap-6 p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                    <div className="space-y-1.5 flex-1">
                      <h5 className="text-[13px] font-semibold text-white">Performance & Analytics</h5>
                      <p className="text-neutral-400 text-[11px] font-normal">
                        Analytical and performance cookies help us understand how visitors interact with the website and measure key performance metrics, such as visitor numbers, bounce rate, traffic sources, and other indicators. This information allows us to improve the user experience. Your data remains anonymous.
                      </p>
                      <p className="text-neutral-500 text-[10px] font-normal">
                        분석 및 성능 쿠키는 방문자가 웹사이트와 상호작용하는 방식을 이해하고 방문자 수, 이탈률, 트래픽 유입 경로 등을 측정하는 데 도움을 줍니다. 수집 정보는 완전 익명 처리되어 서비스 개선에만 사용됩니다.
                      </p>
                    </div>
                    {/* Toggle Switch */}
                    <div className="shrink-0 pt-1">
                      <button
                        onClick={() => setPerfConsent(!perfConsent)}
                        className={`w-10 h-6 flex items-center rounded-full p-[2px] transition-colors duration-200 cursor-pointer ${
                          perfConsent ? "bg-[#b8321e]" : "bg-neutral-700"
                        }`}
                        aria-label="Toggle performance cookies"
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow duration-200 transform ${
                            perfConsent ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Category 3: Marketing & Tracking */}
                  <div className="flex items-start justify-between gap-6 p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                    <div className="space-y-1.5 flex-1 select-text">
                      <h5 className="text-[13px] font-semibold text-white">Marketing & Tracking</h5>
                      <p className="text-neutral-400 text-[11px] font-normal">
                        Advertisement cookies are used to provide visitors with customised advertisements based on the pages you visited previously and to analyse the effectiveness of the ad campaigns.
                      </p>
                      <p className="text-neutral-500 text-[10px] font-normal">
                        마케팅 및 트래킹 쿠키는 이전 방문 기록을 분석하여 더욱 관련도 높은 맞춤형 설계 피드백과 가상 코디네이션 정보를 제공하고 커뮤니티 캠페인 효과를 모니터링하기 위해 사용됩니다.
                      </p>
                    </div>
                    {/* Toggle Switch */}
                    <div className="shrink-0 pt-1">
                      <button
                        onClick={() => setMarketingConsent(!marketingConsent)}
                        className={`w-10 h-6 flex items-center rounded-full p-[2px] transition-colors duration-200 cursor-pointer ${
                          marketingConsent ? "bg-[#b8321e]" : "bg-neutral-700"
                        }`}
                        aria-label="Toggle marketing cookies"
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow duration-200 transform ${
                            marketingConsent ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Preferences Footer with Save Preferences / Accept All */}
              <div className="p-4 border-t border-white/5 bg-[#121212]/50 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => {
                    const consentConfig = {
                      necessary: true,
                      performance: perfConsent,
                      marketing: marketingConsent,
                      timestamp: Date.now()
                    };
                    localStorage.setItem("apparel-cookie-consent", JSON.stringify(consentConfig));
                    setIsCustomiseOpen(false);
                    setIsVisible(false);
                  }}
                  className="px-5 py-2.5 bg-transparent border border-neutral-600 hover:border-white hover:bg-white/5 text-neutral-300 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAccept}
                  className="px-5 py-2.5 bg-[#b8321e] hover:bg-[#a12817] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer shadow-lg shadow-[#b8321e]/10"
                >
                  Accept All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Cookie Policy Overlay Modal */}
      <AnimatePresence>
        {isPolicyOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPolicyOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
              className="w-full max-w-2xl bg-[#161616] border border-white/10 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden relative z-10 flex flex-col max-h-[85vh]"
            >
              {/* Top ambient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#b8321e]/50 to-transparent" />
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#121212]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#b8321e]/10 border border-[#b8321e]/20 rounded-lg text-[#e14833]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Cookie Policy & Privacy • 쿠키 및 개인정보 정책</h3>
                    <p className="text-[11px] text-neutral-400 font-mono">Last updated: June 7, 2026</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPolicyOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content with custom slick scrollbar */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-300 font-light leading-relaxed select-text [scrollbar-width:thin] [scrollbar-color:#333_transparent]">
                
                {/* Introduction English & Korean */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                  <p className="text-[13px] text-white font-normal">
                    This document explains how Korea Apparel Works protects visitor privacy and manages the deployment of browser cookies.
                  </p>
                  <p className="text-neutral-400 border-t border-white/5 pt-2.5">
                    본 문서는 Korea Apparel Works가 방문자의 개인정보를 보호하고 브라우저 쿠키 파일을 활용하는 방식을 안내합니다.
                  </p>
                </div>

                {/* Section 1 */}
                <div className="space-y-2">
                  <h4 className="text-[13px] font-semibold text-white flex items-center gap-2">
                    <span className="text-[#e14833] font-mono">1.</span> What are Cookies?
                  </h4>
                  <p className="pl-5 text-neutral-400">
                    Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
                  </p>
                </div>

                {/* Section 2 */}
                <div className="space-y-3">
                  <h4 className="text-[13px] font-semibold text-white flex items-center gap-2">
                    <span className="text-[#e14833] font-mono">2.</span> How We Use Cookies
                  </h4>
                  <p className="pl-5 text-neutral-400">
                    At Korea Apparel Works, we use cookies strictly to improve your browsing experience and facilitate our manufacturing consultation services. We use the following types of cookies:
                  </p>
                  
                  <div className="pl-5 space-y-3">
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                      <strong className="text-white block mb-0.5">Strictly Necessary Cookies:</strong>
                      <span className="text-neutral-400">
                        These are essential for our website to function properly. They allow you to navigate the site, use our AI chatbot, and securely maintain your consultation session without losing your chat history during a visit.
                      </span>
                    </div>

                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                      <strong className="text-white block mb-0.5">Analytical/Performance Cookies:</strong>
                      <span className="text-neutral-400">
                        These allow us to recognize and count the number of visitors and see how visitors move around our website. This helps us improve the way our website works, such as ensuring users find what they are looking for easily.
                      </span>
                    </div>

                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                      <strong className="text-white block mb-0.5">Location/Preference Cookies:</strong>
                      <span className="text-neutral-400">
                        These help us remember your country or region to provide accurate shipping feasibility and estimated delivery timelines for your apparel production.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-2">
                  <h4 className="text-[13px] font-semibold text-white flex items-center gap-2">
                    <span className="text-[#e14833] font-mono">3.</span> What We Do NOT Do
                  </h4>
                  <p className="pl-5 text-neutral-400">
                    We do not use cookies to track your activity across other websites, nor do we sell your cookie data to third-party advertising networks.
                  </p>
                </div>

                {/* Section 4 */}
                <div className="space-y-2">
                  <h4 className="text-[13px] font-semibold text-white flex items-center gap-2">
                    <span className="text-[#e14833] font-mono">4.</span> How to Manage Your Cookies
                  </h4>
                  <p className="pl-5 text-neutral-400">
                    You can set your browser not to accept cookies. However, please note that disabling cookies may affect the functionality of our AI chatbot and other features on our website. You can typically manage cookies through your browser&apos;s &apos;Settings&apos; or &apos;Preferences&apos; menu.
                  </p>
                </div>

                {/* Section 5 */}
                <div className="space-y-3">
                  <h4 className="text-[13px] font-semibold text-white flex items-center gap-2">
                    <span className="text-[#e14833] font-mono">5.</span> Contact Us
                  </h4>
                  <p className="pl-5 text-neutral-400">
                    If you have any questions about our use of cookies, please contact us at:
                  </p>
                  <div className="pl-5">
                    <span className="inline-block bg-white/5 px-3 py-1.5 rounded-md font-mono text-white text-[11px] border border-white/5 selection:bg-neutral-800">
                      Email: lgi12@naver.com
                    </span>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 bg-[#121212]/50 flex justify-end shrink-0">
                <button
                  onClick={() => setIsPolicyOpen(false)}
                  className="px-5 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Acknowledge & Close (확인 및 닫기)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

