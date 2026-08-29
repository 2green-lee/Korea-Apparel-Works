import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import StartLanding from "./components/StartLanding";
import WelcomeLanding from "./components/WelcomeLanding";
import MobileChatView from "./components/mobile/MobileChatView";
const PreOrderModal = lazy(() => import("./components/PreOrderModal"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const CookieBanner = lazy(() => import("./components/CookieBanner"));
const QuoteModal = lazy(() => import("./components/QuoteModal"));
const UserAccountModal = lazy(() => import("./components/UserAccountModal"));
import { StreamColorFinish } from "./types";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
const bgImage = "https://tznhtceeqozjndfllknm.supabase.co/storage/v1/object/public/public-assets/white-fabric-texture-bg-optimized2.jpg";

export default function App() {
  const [currentView, setCurrentView] = useState<"client" | "admin" | "start" | "welcome">(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      if (path === "/admin") return "admin";
      if (path === "/start") return "start";
      if (path === "/welcome") return "welcome";
    }
    return "client";
  });

  // Page view tracking for the admin dashboard stats (once per browser session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.toLowerCase() === "/admin") return;
    if (sessionStorage.getItem("kaw_view_tracked")) return;
    sessionStorage.setItem("kaw_view_tracked", "1");

    // 순 방문자 집계용 익명 ID (개인정보 아님)
    let visitorId = localStorage.getItem("kaw_visitor_id");
    if (!visitorId) {
      visitorId = `v-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem("kaw_visitor_id", visitorId);
    }

    // 개발 환경(로컬) 접속은 통계에서 제외
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;

    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname, visitorId })
    }).catch(() => {});
  }, []);

  // Force lowercase URL in browser address bar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const lowerPath = currentPath.toLowerCase();
      if (currentPath !== lowerPath) {
        window.history.replaceState(null, "", lowerPath + window.location.search + window.location.hash);
      }
    }
  }, []);

  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);
  const [customFinish, setCustomFinish] = useState<StreamColorFinish>("titanium-silver");
  const [customSize, setCustomSize] = useState<number>(9);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string; imageUrl?: string }[]>([
    {
      role: "model",
      text: "Hello! I am your Korea Apparel Works virtual manufacture coordinator. Ask me about our 30-year veteran Korean sewing ateliers, premium technical fabrics, design pattern drafting, or low-MOQ (1pcs) luxury apparel services."
    }
  ]);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        setMessages([
          {
            role: "model",
            text: "Hello! I am your Korea Apparel Works virtual manufacture coordinator. Ask me about our 30-year veteran Korean sewing ateliers, premium technical fabrics, design pattern drafting, or low-MOQ (1pcs) luxury apparel services."
          }
        ]);
        setCurrentView("client");
        setCurrentSlide(0);
        if (window.location.pathname !== "/") {
          window.history.pushState(null, "", "/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === "/admin") {
        setCurrentView("admin");
      } else if (path === "/start") {
        setCurrentView("start");
      } else if (path === "/welcome") {
        setCurrentView("welcome");
      } else {
        setCurrentView("client");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Dynamic SEO Metadata updates based on current view
  useEffect(() => {
    if (typeof document === "undefined") return;

    let title = "Korea Apparel Works | Custom Apparel Solutions & Manufacturing";
    let description = "Korea Apparel Works is the ultimate apparel production partner. From design pattern drafting to veteran sewing ateliers and low-MOQ premium custom apparel solutions.";
    let robots = "index, follow";
    let canonical = "https://k-apparel.works";

    switch (currentView) {
      case "admin":
        title = "Admin Dashboard | Korea Apparel Works";
        description = "Administrative control panel for Korea Apparel Works.";
        robots = "noindex, nofollow";
        canonical = "https://k-apparel.works/admin";
        break;
      case "start":
        title = "Start Custom Apparel Production | Korea Apparel Works";
        description = "Launch your custom apparel production. Get instant quotes, fabric consultations, and custom pattern design from Korean atelier veterans.";
        robots = "index, follow";
        canonical = "https://k-apparel.works/start";
        break;
      case "welcome":
        title = "Welcome to Korea Apparel Works | Premium Manufacturing Partner";
        description = "Learn how Korea Apparel Works delivers premium custom apparel solutions with flawless details, low-MOQ, and 30-year veteran ateliers.";
        robots = "index, follow";
        canonical = "https://k-apparel.works/welcome";
        break;
      case "client":
      default:
        title = "Korea Apparel Works | Custom Apparel Solutions & Manufacturing";
        description = "Korea Apparel Works is the ultimate apparel production partner. From design pattern drafting to veteran sewing ateliers and low-MOQ premium custom apparel solutions.";
        robots = "index, follow";
        canonical = "https://k-apparel.works";
        break;
    }

    // Update title
    document.title = title;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    // Update meta robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.setAttribute("name", "robots");
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute("content", robots);

    // Update canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonical);
  }, [currentView]);

  // Slide Change Scroll Reset
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentSlide]);

  const handleSetView = useCallback((view: "client" | "admin") => {
    setCurrentView(view);
    const targetPath = view === "admin" ? "/admin" : "/";
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  }, []);

  const handleQuoteSubmit = useCallback(async (email: string, password: string, isLogin: boolean, country?: string) => {
    try {
      if (isLogin) {
        // Sign In Flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          alert("Invalid email or password. Please try again.");
          return;
        }
      } else {
        // Sign Up Flow
        // 1. Send submission to original JSON backend only for new quotes
        await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "quote",
            email,
            country: country || "Unknown",
            createdAt: new Date().toISOString()
          })
        });
        localStorage.setItem("kaw_quote_submitted", "true");

        // 2. Sign Up via Supabase Auth
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: "Client", country: country || "Unknown" } }
        });

        if (signUpError && signUpError.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (signInError) {
            alert("This email is already registered. Please enter the correct password, or switch to Sign In mode.");
            return;
          }
          
          setMessages((prev) => [
            ...prev,
            { role: "model", text: `Welcome back! You have successfully signed in. How can we assist you with your apparel manufacturing projects today?` }
          ]);
        } else if (signUpError) {
          alert("Error creating account: " + signUpError.message);
          return;
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "model", text: `Thank you for your interest. We have received your request from ${country}. How can we assist you with apparel manufacturing today?` }
          ]);
        }
      }

      setIsQuoteModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const handleQuoteModalClose = useCallback(() => {
    setIsQuoteModalOpen(false);
    
    // 비로그인 상태에서 로그인 창을 껐다면 (로그인 포기),
    // 현재 대화가 몇 개든 상관없이 무조건 초기화하고 메인 홈 슬라이드로 돌려보냅니다.
    if (!user) {
      setMessages([
        {
          role: "model",
          text: "Hello! I am your Korea Apparel Works virtual manufacture coordinator. Ask me about our 30-year veteran Korean sewing ateliers, premium technical fabrics, design pattern drafting, or low-MOQ (1pcs) luxury apparel services."
        }
      ]);
      setCurrentSlide(0); // 홈(메인) 화면으로 확실하게 이동
    }
  }, [user]);

  const handleClearChat = useCallback(() => {
    setMessages([
      {
        role: "model",
        text: "Hello! I am your Korea Apparel Works virtual manufacture coordinator. Ask me about our 30-year veteran Korean sewing ateliers, premium technical fabrics, design pattern drafting, or low-MOQ (1pcs) luxury apparel services."
      }
    ]);
  }, []);

  const handleOpenPreOrder = useCallback((finish?: StreamColorFinish, size?: number) => {
    if (finish) setCustomFinish(finish);
    if (size) setCustomSize(size);
    setIsPreOrderOpen(true);
  }, []);

  const clientViewBackgroundStyle = useMemo(() => currentView === "client" ? (
    currentSlide === 0 ? {
      backgroundImage: "linear-gradient(to bottom, #ffffff 0%, #e0f2fe 60%)",
      backgroundColor: "#e0f2fe",
      backgroundAttachment: "fixed"
    } : {
      backgroundColor: "#ffffff"
    }
  ) : {}, [currentView, currentSlide]);

  return (
    <div 
      className={`relative min-h-screen antialiased selection:bg-neutral-800 selection:text-white transition-all duration-500 ease-in-out ${
        currentView === "admin" ? "bg-neutral-950 text-white" : "text-neutral-900"
      }`}
      style={clientViewBackgroundStyle}
    >


      {currentView === "admin" ? (
        <Suspense fallback={null}><AdminDashboard onExit={() => handleSetView("client")} /></Suspense>
      ) : currentView === "start" ? (
        <StartLanding />
      ) : currentView === "welcome" ? (
        <WelcomeLanding />
      ) : isMobile && currentSlide === 0 ? (
        <MobileChatView
          messages={messages}
          setMessages={setMessages}
          onClearChat={handleClearChat}
          user={user}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          onOpenLogin={() => setIsQuoteModalOpen(true)}
          onOpenAccount={() => setIsAccountModalOpen(true)}
          onLogout={() => supabase.auth.signOut()}
          onBackToStart={() => {
            setCurrentView("start");
            if (window.location.pathname !== "/start") {
              window.history.pushState(null, "", "/start");
            }
          }}
        />
      ) : (
        <>
          {/* 2. Brand sticky Navigation Header */}
          <Header 
            onPreOrderClick={() => handleOpenPreOrder()} 
            currentSlide={currentSlide} 
            setCurrentSlide={setCurrentSlide} 
            messages={messages}
            onClearChat={handleClearChat}
            onAdminClick={() => handleSetView("admin")}
            user={user}
            onOpenLogin={() => setIsQuoteModalOpen(true)}
            onOpenAccount={() => setIsAccountModalOpen(true)}
            onLogout={() => supabase.auth.signOut()}
          />

          {/* 3. Landing Modules */}
          <main>
            
            {/* 4. Layered 3D Ring Hero Showcase */}
            <Hero 
              onPreOrderClick={() => handleOpenPreOrder()} 
              currentSlide={currentSlide} 
              setCurrentSlide={setCurrentSlide} 
              messages={messages}
              setMessages={setMessages}
              onClearChat={handleClearChat}
              user={user}
              onOpenLogin={() => setIsQuoteModalOpen(true)}
              onLogout={() => supabase.auth.signOut()}
              onOpenAccount={() => setIsAccountModalOpen(true)}
            />

          </main>

          {/* 5. Standalone Premium legal bottom (home renders the transparent variant) */}
          <Footer currentSlide={currentSlide} onAdminClick={() => handleSetView("admin")} setCurrentSlide={setCurrentSlide} />
        </>
      )}

      {/* 6. Dynamic Priority queue reservation ticket dialog */}
      <Suspense fallback={null}>
        <PreOrderModal
          isOpen={isPreOrderOpen}
          onClose={() => setIsPreOrderOpen(false)}
          defaultFinish={customFinish}
          defaultSize={customSize}
        />
      </Suspense>

      {/* 7. Premium Cookie Consent banner */}
      <Suspense fallback={null}><CookieBanner /></Suspense>

      <Suspense fallback={null}>
        <QuoteModal 
          isOpen={isQuoteModalOpen} 
          onClose={handleQuoteModalClose} 
          onSubmit={handleQuoteSubmit} 
        />
      </Suspense>

      <Suspense fallback={null}>
        <UserAccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          user={user}
        />
      </Suspense>

    </div>
  );
}
