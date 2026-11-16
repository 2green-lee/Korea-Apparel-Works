import React, { useEffect, useRef } from "react";
import BballyCompose from "./BballyCompose";
import { pushConversion } from "./tracking";
import { useWelcomeInteractions } from "./useWelcomeInteractions";
import "./welcome.css";
import "./welcome-react.css";

// 인더엑스(INTHE X) 퍼블리싱 welcome 페이지를 React로 옮긴 것 (원본: k_apparel/html/welcome.html, 2026-11-16 전달본)
// 스타일은 welcome.css(원본을 .kaw-welcome 안으로 한정), 동작은 useWelcomeInteractions.

const FONT_LINKS = [
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300..800&display=swap",
];

function useWelcomeFonts() {
  useEffect(() => {
    const added: HTMLLinkElement[] = [];
    FONT_LINKS.forEach((href) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      added.push(link);
    });
    return () => added.forEach((l) => l.remove());
  }, []);
}

function useConversionTracking() {
  // 광고 전환 추적: 기존 welcome 페이지와 같은 방식(dataLayer 'conversion_click')으로 보낸다
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(".gtm-conversion-btn");
      if (el) pushConversion(el.id || "unknown");
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);
}

export default function WelcomePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  useWelcomeFonts();
  useConversionTracking();
  useWelcomeInteractions(rootRef);

  return (
    <div className="kaw-welcome" id="wrap" ref={rootRef}>
      <header id="header" data-auto-hide>
            <div className="inner">
              <h1 className="logo">
                <a href="/welcome"><img src="/welcome/images/common/logo_header.png" alt="Korea Apparel Works" /></a>
              </h1>
              <div className="header-util">
                <nav className="gnb" id="gnb" aria-label="Main">
                  <a href="#bbally">How it works</a>
                  <a href="#zero-risk">Zero risk</a>
                  <a href="#factory">Our factory</a>
                </nav>
                <a href="/" id="gtm-welcome-header-start-btn" className="btn-primary btn-s gtm-conversion-btn">Start with BBally</a>
                <button type="button" className="btn-menu" aria-controls="gnb" aria-expanded="false">
                  <span></span><span></span><span></span>
                  <em className="blind">Open menu</em>
                </button>
              </div>
            </div>
          </header>
          {/* e: header */}

          <main id="container">

            {/* 1. Hero */}
            <section className="sec-visual">
              <div className="inner">
                <div className="visual-box">
                  <div className="visual-media">
                    <video className="visual-video" autoPlay muted loop playsInline preload="metadata" poster="/welcome/images/sub/bg_welcome_visual.jpg" aria-hidden="true">
                      <source src="/welcome/images/sub/bg_welcome_visual.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <div className="visual-cont">
                    <p className="visual-eyebrow reveal">Korea-made knitwear for sports &amp; performance brands</p>
                    <h2 className="visual-title reveal">No brand is too small.<br /><span>Every order starts with one.</span></h2>
                    <p className="visual-desc reveal">Polos, tees, hoodies and sets — made in our Busan factory, from a single piece to full production runs.</p>
                    <div className="visual-btns reveal">
                      <a href="#bbally" id="gtm-welcome-hero-quote-btn" className="btn-white gtm-conversion-btn">Start with BBally <span className="ico-arrow" aria-hidden="true">→</span></a>
                      <a href="#why" className="btn-line">See how it works</a>
                    </div>
                  </div>
                  <p className="visual-note">Our AI production agent. No login, no forms — just tell BBally what you want to make.</p>
                  <button type="button" className="btn-video-toggle" aria-pressed="false">
                    <span className="blind">Pause background video</span>
                  </button>
                </div>{/* //.visual-box */}
              </div>
            </section>
            {/* //.sec-visual */}

            {/* 2. Start with BBally (대화창 자리) */}
            <section className="sec-bbally" id="bbally">
              <div className="inner">
                <div className="bbally-head reveal">
                  <span className="sec-eyebrow">Meet BBally</span>
                  <h2 className="sec-title">Start your brand <span className="tit-dim">with us.</span></h2>
                  <p className="sec-desc">Upload a photo or just describe it — get pricing, MOQ and lead time. Made in Korea.</p>
                </div>

                <div className="bbally-chat reveal">
                  {/* BBally 대화 시작 화면 */}
                  <div className="chat-window">
                    <div className="chat-screen">
                      {/* BBally 첫 메시지 */}
                      <div className="chat-row">
                        <span className="chat-avatar" aria-hidden="true">B</span>
                        <div className="chat-body">
                          <strong className="chat-name">BBally</strong>
                          <div className="chat-bubble">
                            <p>Hi, I'm BBally from Korea Apparel Works.</p>
                            <p>Tell me what you'd like to make, or upload a design photo — I'll get you pricing, MOQ and lead time.</p>
                          </div>
                        </div>
                      </div>{/* //.chat-row */}

                      {/* 입력창 — 보내면 빨리 채팅 화면(/)으로 넘어가 바로 전송 */}
                      <BballyCompose />
                    </div>{/* //.chat-screen */}
                  </div>{/* //.chat-window */}
                </div>{/* //.bbally-chat */}

                <ol className="bbally-steps reveal">
                  <li>
                    <strong className="steps-tit">Tell BBally what you need.</strong>
                    <p className="steps-txt">Style, fabric, quantity, where it ships. A sketch or a reference photo is enough.</p>
                  </li>
                  <li>
                    <strong className="steps-tit">BBally checks with Korean makers.</strong>
                    <p className="steps-txt">Pricing and lead times from our factory and partner workshops.</p>
                  </li>
                  <li>
                    {/* TODO: 견적 확인 시간 확정 (자료상 [24 hours]) */}
                    <strong className="steps-tit">A real person confirms your quote.</strong>
                    <p className="steps-txt">Every quote is reviewed by our founder before it reaches you, within 24 hours.</p>
                  </li>
                </ol>
                <p className="bbally-note reveal">BBally gets you moving fast. Our team makes sure every promise is one we can keep.</p>
              </div>
            </section>
            {/* //.sec-bbally */}

            {/* 3. Why one piece works */}
            <section className="sec-why" id="why">
              <div className="inner">
                <div className="why-wrap">
                  <div className="why-text reveal">
                    <span className="sec-eyebrow">Why one piece works</span>
                    <h2 className="sec-title">Why can we take one piece <span className="tit-dim">when others won't?</span></h2>
                    <p className="why-txt">Small orders don't fail because of the garment. They fail because every order needs quoting, back-and-forth and coordination — and that costs more than the piece itself.</p>
                    <p className="why-txt">We handed that work to BBally, our AI agent, so a single piece makes sense. That's also why we built our sample factory first.</p>
                  </div>{/* //.why-text */}
                  <div className="why-compare reveal">
                    <div className="compare-box">
                      <div>
                        <p className="compare-label">Most factories</p>
                        <p className="compare-desc">Cost per order &gt; cost of one garment. MOQ goes up.</p>
                      </div>
                      <ol className="flow-list">
                        <li><span className="flow-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg></span>Inquiry</li>
                        <li><span className="flow-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg></span>Emails</li>
                        <li><span className="flow-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></span>Calls</li>
                        <li><span className="flow-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></span>Quote</li>
                      </ol>
                    </div>{/* //.compare-box */}
                    <div className="compare-box is-kaw">
                      <div>
                        <p className="compare-label">KAW</p>
                        <p className="compare-desc">Coordination handled by BBally. One piece makes sense.</p>
                      </div>
                      <ol className="flow-list">
                        <li className="is-active"><span className="flow-ico" aria-hidden="true">B</span>BBally</li>
                        <li><span className="flow-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M22 22H2V10l7-3v2l5-2v3h3l1-8h3l1 8v12zM12 9.95l-5 2V10l-3 1.32V20h16v-8h-8V9.95zM11 18h2v-4h-2v4zm-4 0h2v-4H7v4zm10-4h-2v4h2v-4z"/></svg></span>Sample factory</li>
                        <li><span className="flow-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21.6 18.2L13 11.75v-.91c1.65-.49 2.8-2.17 2.43-4.05-.26-1.31-1.3-2.4-2.61-2.7C10.54 3.57 8.5 5.3 8.5 7.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .84-.69 1.52-1.53 1.5-.54-.01-.97.45-.97.99v1.76L2.4 18.2c-.77.58-.36 1.8.6 1.8h18c.96 0 1.37-1.22.6-1.8zM6 18l6-4.5 6 4.5H6z"/></svg></span>Your piece</li>
                      </ol>
                    </div>{/* //.compare-box */}
                  </div>{/* //.why-compare */}
                </div>{/* //.why-wrap */}
              </div>
            </section>
            {/* //.sec-why */}

            {/* 4. A family knitwear factory in Busan */}
            <section className="sec-trust" aria-labelledby="trust-title">
              <div className="inner">
                <div className="trust-head reveal">
                  <span className="sec-eyebrow">About</span>
                  <h2 className="trust-title" id="trust-title">
                    A family knitwear factory in Busan{" "}<br />
                    built for <em className="trust-stitch">small brands</em>{" "}<br />
                    <span className="trust-title-sub">and starting from <em className="trust-tag">one piece</em></span>
                  </h2>
                </div>
                <ul className="trust-grid">
                  {/* 카드 1 : 공장 사진 */}
                  {/* TODO: 클라이언트 전달 공장 사진으로 교체 */}
                  <li className="trust-card is-photo reveal">
                    <img className="card-bg" src="/welcome/images/sub/img_welcome_factory_01.jpg" alt="Sewing knitwear at our family factory in Busan" />
                    <div className="card-top">
                      <span className="card-logo">KAW</span>
                    </div>
                    <div className="card-panel">
                      <strong className="card-num"><span className="js-count" data-count="30">30</span>+ years</strong>
                      <p className="card-desc">Sewing knitwear in Busan as a family factory.</p>
                    </div>
                  </li>
                  {/* 카드 2 : 최소 주문 + 품목 */}
                  <li className="trust-card is-gray reveal">
                    <p className="card-label">Minimum order</p>
                    <strong className="card-num">1 pc</strong>
                    <div className="card-bottom">
                      <ul className="card-items" aria-label="Polos, tees, hoodies and sets">
                        <li title="Polo"><img src="/welcome/images/icon/ico_polo.svg" alt="" /></li>
                        <li title="Tee"><img src="/welcome/images/icon/ico_tee.svg" alt="" /></li>
                        <li title="Hoodie"><img src="/welcome/images/icon/ico_hoodie.svg" alt="" /></li>
                        <li title="Set"><img src="/welcome/images/icon/ico_sets.svg" alt="" /></li>
                      </ul>
                      <p className="card-quote">Polos, tees, hoodies and sets — every style can start from a single piece.</p>
                    </div>
                  </li>
                  {/* 카드 3 : 샘플 기간 */}
                  <li className="trust-card is-point reveal">
                    <p className="card-label">Sample lead time</p>
                    <strong className="card-num">3–14 days</strong>
                    <p className="card-desc">Made in our own sample factory, built for single pieces.</p>
                  </li>
                  {/* 카드 4 : 파트너 브랜드 */}
                  <li className="trust-card is-dark reveal">
                    <p className="card-label">Partner brands</p>
                    <strong className="card-num"><span className="js-count" data-count="100">100</span><em className="num-plus">+</em></strong>
                  </li>
                </ul>
              </div>
            </section>
            {/* //.sec-trust */}

            {/* 5. Try us with zero risk */}
            <section className="sec-risk" id="zero-risk">
              <div className="inner">
                <div className="sec-head reveal">
                  <span className="sec-eyebrow">Try us with zero risk</span>
                  <h2 className="sec-title">See our quality in your hands <span className="tit-dim">before committing to anything.</span></h2>
                </div>
                <div className="risk-chart reveal">
                  <ul className="risk-phase">
                    <li className="phase-sample">Sample</li>
                    <li className="phase-check">Check</li>
                    <li className="phase-scale">Scale</li>
                  </ul>
                  <ol className="risk-bars">
                    <li className="risk-bar bar-markup">
                      <strong>No sample markup</strong>
                      <span>We make your first sample at actual production cost — the same rate you'd pay in bulk.</span>
                    </li>
                    <li className="risk-bar bar-approve">
                      <strong>Approve before we ship</strong>
                      <span>Photos and measurements sent for your sign-off</span>
                    </li>
                    <li className="risk-bar bar-test">
                      <strong>Hold it. Test it.</strong>
                      <span>Check the fit, the fabric, the make</span>
                    </li>
                    <li className="risk-bar bar-remake is-safety">
                      <em className="bar-tag">If needed</em>
                      <strong>Off-spec? We remake it free</strong>
                      <span>If it doesn't match the agreed spec, we remake and reship on us</span>
                    </li>
                    <li className="risk-bar bar-refund is-safety">
                      <em className="bar-tag">If needed</em>
                      <strong>Still off? Full refund</strong>
                      <span>If the remake misses too, every dollar back including shipping</span>
                    </li>
                    <li className="risk-bar bar-scale">
                      <strong>Scale when ready</strong>
                      <span>Your sample fee credited to bulk</span>
                      <div className="bar-credit">
                        <p className="credit-title">Your sample fee comes back on your bulk order</p>
                        <ul className="credit-list">
                          <li><b>50%</b> credited at 50 pcs+</li>
                          <li><b>100%</b> credited at 100 pcs+</li>
                        </ul>
                      </div>
                    </li>
                  </ol>
                </div>{/* //.risk-chart */}
                <div className="risk-foot reveal">
                  <a href="#bbally" className="btn-primary">Get pricing &amp; lead time</a>
                  <p className="risk-notice">Additional charges may apply depending on the production process and the amount of materials used.</p>
                </div>
              </div>
            </section>
            {/* //.sec-risk */}

            {/* 6. From idea to bulk */}
            <section className="sec-process">
              <div className="inner">
                <div className="process-wrap">
                  <div className="process-head reveal">
                    <span className="sec-eyebrow">From idea to bulk</span>
                    <h2 className="sec-title">First collection?<br /><span className="tit-dim">We'll take it from&nbsp;A&nbsp;to&nbsp;Z.</span></h2>
                    <p className="process-note">One partner from your first sample to your hundredth order.</p>
                  </div>
                  {/* 단계 호버 시 우측에 해당 이미지 노출 (기본 : 4. Sample) */}
                  {/* TODO: 단계별 실제 이미지로 교체 (현재 공장 사진 임시 배정) */}
                  <ol className="process-list reveal">
                    <li className="process-item">
                      <span className="process-num">1</span>
                      <h3 className="process-title">Design &amp; tech pack</h3>
                      <img className="process-thumb" src="/welcome/images/sub/img_welcome_factory_04.jpg" alt="" aria-hidden="true" />
                    </li>
                    <li className="process-item">
                      <span className="process-num">2</span>
                      <h3 className="process-title">Pattern</h3>
                      <img className="process-thumb" src="/welcome/images/sub/img_welcome_factory_03.jpg" alt="" aria-hidden="true" />
                    </li>
                    <li className="process-item">
                      <span className="process-num">3</span>
                      <h3 className="process-title">Fabric &amp; trims</h3>
                      <img className="process-thumb" src="/welcome/images/sub/img_welcome_factory_02.jpg" alt="" aria-hidden="true" />
                    </li>
                    <li className="process-item is-key is-active">
                      <span className="process-num">4</span>
                      <h3 className="process-title">Sample</h3>
                      <img className="process-thumb" src="/welcome/images/sub/img_welcome_factory_01.jpg" alt="" aria-hidden="true" />
                    </li>
                    <li className="process-item">
                      <span className="process-num">5</span>
                      <h3 className="process-title">Small batch</h3>
                      <img className="process-thumb" src="/welcome/images/sub/img_welcome_founder.jpg" alt="" aria-hidden="true" />
                    </li>
                    <li className="process-item">
                      <span className="process-num">6</span>
                      <h3 className="process-title">Bulk</h3>
                      <img className="process-thumb" src="/welcome/images/sub/bg_welcome_visual.jpg" alt="" aria-hidden="true" />
                    </li>
                  </ol>
                </div>{/* //.process-wrap */}
              </div>
            </section>
            {/* //.sec-process */}

            {/* 7. The people & the factory */}
            {/* TODO: 실제 사진으로 교체 */}
            <section className="sec-people" id="factory">
              <div className="inner">
                <div className="people-head reveal">
                  <div>
                    <span className="sec-eyebrow">The people &amp; the factory</span>
                    <h2 className="sec-title">Real people.<br /><span className="tit-dim">A real factory.</span></h2>
                  </div>
                  <p className="people-desc">KAW is run by a family that has been sewing knitwear in Busan for over 30 years. You talk to us directly — no middlemen, no anonymous suppliers.</p>
                </div>
                <div className="people-gallery">
                  <figure className="people-founder reveal">
                    <img src="/welcome/images/sub/img_welcome_founder.jpg" alt="Lee Geun Il, founder, in the factory with fabric and a sewing machine" />
                    <figcaption><strong>Lee Geun Il</strong> — Founder &amp; Head of Sales</figcaption>
                  </figure>
                  <figure className="people-factory reveal">
                    <ul className="factory-list">
                      <li><img src="/welcome/images/sub/img_welcome_factory_01.jpg" alt="Stacks of cut fabric next to a steam iron on the work table" /></li>
                      <li><img src="/welcome/images/sub/img_welcome_factory_02.jpg" alt="Stacked fabric panels ready htmlFor sewing" /></li>
                      <li><img src="/welcome/images/sub/img_welcome_factory_03.jpg" alt="Pattern pieces laid out on the cutting table" /></li>
                      <li><img src="/welcome/images/sub/img_welcome_factory_04.jpg" alt="Paper patterns hanging in the workroom" /></li>
                    </ul>
                    <figcaption>Our Busan factory, still running after 30+ years</figcaption>
                  </figure>
                </div>{/* //.people-gallery */}
              </div>
            </section>
            {/* //.sec-people */}

            {/* 8. Why Korea */}
            <section className="sec-korea" id="korea">
              <div className="inner">
                <div className="korea-head reveal">
                  <span className="sec-eyebrow">Why Korea?</span>
                  <h2 className="sec-title">One supply chain. <span className="tit-dim">One country.</span></h2>
                  <p className="sec-desc">Global brands have sourced here for decades.</p>
                </div>

                <figure className="korea-stage reveal">
                  <div className="globe-crop">
                    <div className="globe">
                      <img className="globe-dots" src="/welcome/images/sub/img_welcome_globe.svg" alt="" />
                      <svg className="globe-arc" viewBox="0 0 600 600" aria-hidden="true">
                        <path d="M196.0 401.3L191.0 393.8L186.0 385.8L181.1 377.3L176.3 368.3L171.6 358.8L167.0 348.9L162.6 338.5L158.4 327.8L154.4 316.7L150.7 305.2L147.2 293.5L144.1 281.5L141.2 269.3L138.7 257.1L136.6 244.7L134.8 232.3L133.4 220.0L132.4 207.7L131.9 195.6L131.7 183.8L131.9 172.2L132.6 161.0L133.6 150.2L135.0 139.8L136.9 129.9L139.1 120.5L141.6 111.7L144.5 103.5L147.7 95.9L151.2 89.0L155.0 82.7L159.0 77.1L163.3 72.2L167.7 68.0L172.3 64.4L177.1 61.5L181.9 59.1L186.8 57.4L191.8 56.3L196.8 55.7"/>
                        <path d="M196.0 401.3L190.3 404.0L184.5 406.6L178.6 409.3L172.6 411.9L166.6 414.5L160.5 416.9L154.5 419.4L148.5 421.7L142.5 423.9L136.5 426.0L130.7 428.0L125.0 429.8L119.4 431.5L114.0 433.1L108.7 434.4L103.7 435.6L98.9 436.6L94.4 437.4L90.1 438.0L86.2 438.5L82.5 438.7L79.2 438.7L76.1 438.6L73.5 438.2L71.1 437.6L69.2 436.9L67.5 435.9L66.3 434.8L65.4 433.6L64.8 432.1L64.6 430.5L64.7 428.8L65.1 427.0L65.8 425.0L66.8 422.9L68.1 420.8L69.6 418.6L71.3 416.3L73.2 413.9L75.3 411.6"/>
                        <path d="M196.0 401.3L200.5 397.0L205.3 392.2L210.6 387.1L216.3 381.6L222.3 375.8L228.8 369.5L235.6 362.9L242.7 355.9L250.3 348.6L258.1 341.0L266.2 333.1L274.6 325.0L283.2 316.6L292.0 308.0L301.0 299.3L310.0 290.5L319.1 281.7L328.3 272.8L337.4 263.9L346.4 255.1L355.4 246.4L364.1 237.9L372.7 229.6L381.0 221.5L389.1 213.6L396.8 206.1L404.2 198.9L411.2 192.1L417.8 185.7L424.0 179.7L429.7 174.1L435.0 169.0L439.8 164.3L444.1 160.1L448.0 156.3L451.4 153.0L454.4 150.1L456.9 147.6L459.0 145.6L460.7 143.9"/>
                        <path d="M196.0 401.3L202.7 396.9L209.8 392.0L217.5 386.7L225.7 381.0L234.4 374.8L243.6 368.3L253.3 361.3L263.4 353.9L273.8 346.1L284.6 338.1L295.8 329.7L307.1 321.0L318.7 312.1L330.4 303.0L342.2 293.8L354.0 284.5L365.8 275.2L377.4 265.8L388.9 256.5L400.2 247.3L411.1 238.3L421.7 229.4L431.9 220.9L441.6 212.6L450.8 204.6L459.5 197.1L467.5 189.9L474.9 183.2L481.7 177.0L487.8 171.2L493.2 166.0L498.0 161.2L502.0 157.1L505.3 153.4L508.0 150.2L509.9 147.6L511.3 145.5L512.0 143.9L512.2 142.7L511.8 142.0"/>
                      </svg>
                      <span className="globe-pin pt-europe"><i className="pin-ico"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 14.5s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0c0 3.3 4.5 7.5 4.5 7.5z"/><circle cx="8" cy="7" r="1.6"/></svg></i><em className="pin-label">Europe</em></span>
                      <span className="globe-pin pt-seasia"><i className="pin-ico"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 14.5s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0c0 3.3 4.5 7.5 4.5 7.5z"/><circle cx="8" cy="7" r="1.6"/></svg></i><em className="pin-label">SE Asia</em></span>
                      <span className="globe-pin pt-canada"><i className="pin-ico"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 14.5s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0c0 3.3 4.5 7.5 4.5 7.5z"/><circle cx="8" cy="7" r="1.6"/></svg></i><em className="pin-label">Canada</em></span>
                      <span className="globe-pin pt-usa"><i className="pin-ico"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 14.5s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0c0 3.3 4.5 7.5 4.5 7.5z"/><circle cx="8" cy="7" r="1.6"/></svg></i><em className="pin-label">USA</em></span>
                      <span className="globe-pin pt-korea"><i className="pin-ico"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M1.5 14.5V7l4 2.5V7l4 2.5V3h5v11.5h-13z"/></svg></i><em className="pin-label">Korea</em></span>
                    </div>{/* //.globe */}
                  </div>{/* //.globe-crop */}
                  <figcaption className="korea-callout">Sewn in Busan, shipped to brands across these regions.</figcaption>
                </figure>{/* //.korea-stage */}

                <ul className="korea-features reveal">
                  <li>
                    <svg className="feature-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
                    <h3 className="feature-tit">Others</h3>
                    <div className="chain-flow">
                      <span className="chain-chip">Yarn</span>
                      <span className="chain-gap">borders</span>
                      <span className="chain-chip">Fabric</span>
                      <span className="chain-gap">30+ days</span>
                      <span className="chain-chip">Sewing</span>
                    </div>
                  </li>
                  <li className="is-korea">
                    <svg className="feature-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s7-6.5 7-11.5a7 7 0 0 0-14 0C5 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
                    <h3 className="feature-tit">Korea</h3>
                    <div className="chain-flow">
                      <span className="chain-chip">Yarn</span>
                      <span className="chain-arrow" aria-hidden="true">→</span>
                      <span className="chain-chip">Fabric</span>
                      <span className="chain-arrow" aria-hidden="true">→</span>
                      <span className="chain-chip">Sewing</span>
                    </div>
                  </li>
                </ul>{/* //.korea-features */}
              </div>
            </section>
            {/* //.sec-korea */}

            {/* 9. Our promise to small brands */}
            <section className="sec-promise">
              <div className="inner">
                <div className="promise-wrap">
                  <div className="promise-head reveal">
                    <p className="promise-eyebrow">Our promise to small brands</p>
                    <h2 className="sec-title">Your growth is <span className="tit-dim">our growth.</span></h2>
                    <p className="promise-lead">We know what it's like to start small.</p>
                    <div className="promise-action">
                      <a href="#bbally" className="btn-primary">Start with BBally <span className="ico-arrow" aria-hidden="true">→</span></a>
                      <p className="promise-note">
                        <svg className="promise-note-arrow" viewBox="0 0 40 34" aria-hidden="true"><path d="M36 32C36 16 26 6 6 8M6 8l7-6M6 8l6 6"/></svg>
                        Start with one piece.
                      </p>
                    </div>
                  </div>{/* //.promise-head */}

                  <ul className="promise-list reveal">
                    <li className="promise-card">
                      <div className="promise-card-head">
                        <h3 className="promise-card-tit">Same care for every order</h3>
                        <span className="promise-card-ico"><img src="/welcome/images/icon/ico_favorite.svg" alt="" /></span>
                      </div>
                      <p className="promise-card-txt">A 1-piece order gets the same care as a 1,000-piece one.</p>
                      <ul className="promise-tags">
                        <li>1 pc</li>
                        <li>100 pcs</li>
                        <li>1,000 pcs</li>
                      </ul>
                    </li>
                    <li className="promise-card">
                      <div className="promise-card-head">
                        <h3 className="promise-card-tit">Why you won't see our clients' logos here</h3>
                        <span className="promise-card-ico"><img src="/welcome/images/icon/ico_verified_user.svg" alt="" /></span>
                      </div>
                      <p className="promise-card-txt">We never show client designs or names. The same rule protects your brand.</p>
                      <ul className="promise-tags">
                        <li>No logos</li>
                        <li>No designs</li>
                        <li>No names</li>
                      </ul>
                    </li>
                  </ul>{/* //.promise-list */}
                </div>{/* //.promise-wrap */}
              </div>
            </section>
            {/* //.sec-promise */}

            {/* 10. Final CTA */}
            <section className="sec-cta" id="contact">
              <div className="cta-glow" aria-hidden="true"><span></span><span></span><span></span></div>
              <div className="inner">
                <h2 className="cta-title reveal">No brand is too small.</h2>
                <p className="cta-desc reveal">Start with one piece. Start with BBally.</p>
                <div className="cta-btns reveal">
                              <a href="#bbally" id="gtm-welcome-footer-request-btn" className="btn-dark gtm-conversion-btn">Start with BBally <span className="ico-arrow" aria-hidden="true">→</span></a>
                  <a href="mailto:contact@k-apparel.works" className="btn-soft">or email contact@k-apparel.works</a>
                </div>
              </div>
            </section>
            {/* //.sec-cta */}

          </main>

          {/* s: footer */}
          <footer id="footer">
            <div className="inner footer-inner">
              <div className="footer-brand">
                <a href="/welcome" className="footer-logo">
                  <span className="footer-logo-mark" aria-hidden="true">KAW</span>
                  Korea Apparel Works
                </a>
                <p className="footer-company">KAW Inc. (주식회사 케이에이더블유)</p>
              </div>{/* //.footer-brand */}
              <nav className="footer-cols" aria-label="Footer">
                <div className="footer-col">
                  <p className="footer-col-tit">Menu</p>
                  <ul>
                    <li><a href="#bbally">How it works</a></li>
                    <li><a href="#zero-risk">Zero risk</a></li>
                    <li><a href="#factory">Our factory</a></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <p className="footer-col-tit">Contact</p>
                  <ul>
                    <li><a href="mailto:contact@k-apparel.works">contact@k-apparel.works</a></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <p className="footer-col-tit">Legal</p>
                  <ul>
                    {/* TODO: 개인정보처리방침 링크 */}
                    <li><a href="#">Privacy Policy</a></li>
                  </ul>
                </div>
              </nav>{/* //.footer-cols */}
            </div>{/* //.footer-inner */}
            <div className="inner footer-bottom">
              <p>Business Registration No. 179-86-04548</p>
              <p>2F, 30-1, Suyeong-ro 603beon-gil, Suyeong-gu, Busan, Korea</p>
            </div>{/* //.footer-bottom */}
          </footer>
    </div>
  );
}
