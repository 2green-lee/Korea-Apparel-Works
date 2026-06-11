import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import PreOrderModal from "./components/PreOrderModal";
import AdminDashboard from "./components/AdminDashboard";
import CookieBanner from "./components/CookieBanner";
import QuoteModal from "./components/QuoteModal";
import UserAccountModal from "./components/UserAccountModal";
import { StreamColorFinish } from "./types";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import bgImage from "./components/white-fabric-texture-background-design-element.jpg";

export default function App() {
  const [currentView, setCurrentView] = useState<"client" | "admin">(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/admin") {
      return "admin";
    }
    return "client";
  });
  
  const reachedBottomTimeRef = useRef<number | null>(null);
  const reachedTopTimeRef = useRef<number | null>(null);

  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);
  const [customFinish, setCustomFinish] = useState<StreamColorFinish>("titanium-silver");
  const [customSize, setCustomSize] = useState<number>(9);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string; imageUrl?: string }[]>([
    {
      role: "model",
      text: "Hello! I am your Korea Apparel Works virtual manufacture coordinator. Ask me about our 30-year veteran Korean sewing ateliers, premium technical fabrics, design pattern drafting, or low-MOQ (30pcs) luxury apparel services."
    }
  ]);
  const [savedChats, setSavedChats] = useState<{ role: "user" | "model"; text: string; imageUrl?: string }[][]>([]);

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
            text: "Hello! I am your Korea Apparel Works virtual manufacture coordinator. Ask me about our 30-year veteran Korean sewing ateliers, premium technical fabrics, design pattern drafting, or low-MOQ (30pcs) luxury apparel services."
          }
        ]);
        setSavedChats([]);
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
      if (window.location.pathname === "/admin") {
        setCurrentView("admin");
      } else {
        setCurrentView("client");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Scroll/Wheel-based Page Transitions with Mobile Swipe support
  useEffect(() => {
    if (currentView !== "client") return;

    let isTransitioning = false;
    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) return;

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      const isAtTop = window.scrollY <= 10;

      const now = Date.now();

      // Wheel Down -> Next Page
      if (e.deltaY > 0 && isAtBottom) {
        if (currentSlide < 2) {
          if (!reachedBottomTimeRef.current) {
            reachedBottomTimeRef.current = now;
            return;
          }
          // Enforce a pause of at least 400ms after reaching boundary
          if (now - reachedBottomTimeRef.current > 400) {
            e.preventDefault();
            triggerSlideChange(currentSlide + 1);
          }
        }
      } 
      // Wheel Up -> Prev Page
      else if (e.deltaY < 0 && isAtTop) {
        if (currentSlide > 0) {
          if (!reachedTopTimeRef.current) {
            reachedTopTimeRef.current = now;
            return;
          }
          if (now - reachedTopTimeRef.current > 400) {
            e.preventDefault();
            triggerSlideChange(currentSlide - 1);
          }
        }
      } else {
        // Reset boundary timestamp if not at boundary
        if (!isAtBottom) reachedBottomTimeRef.current = null;
        if (!isAtTop) reachedTopTimeRef.current = null;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioning) return;

      const touchCurrentY = e.touches[0].clientY;
      const diffY = touchStartY - touchCurrentY; // Positive = Swiped Up (Scroll Down)

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      const isAtTop = window.scrollY <= 10;

      const now = Date.now();

      if (Math.abs(diffY) > 60) {
        if (diffY > 0 && isAtBottom) {
          if (currentSlide < 2) {
            if (!reachedBottomTimeRef.current) {
              reachedBottomTimeRef.current = now;
              return;
            }
            if (now - reachedBottomTimeRef.current > 600) {
              e.preventDefault();
              triggerSlideChange(currentSlide + 1);
            }
          }
        } else if (diffY < 0 && isAtTop) {
          if (currentSlide > 0) {
            if (!reachedTopTimeRef.current) {
              reachedTopTimeRef.current = now;
              return;
            }
            if (now - reachedTopTimeRef.current > 600) {
              e.preventDefault();
              triggerSlideChange(currentSlide - 1);
            }
          }
        }
      }
    };

    const triggerSlideChange = (nextSlide: number) => {
      isTransitioning = true;
      setCurrentSlide(nextSlide);
      window.scrollTo(0, 0);
      reachedBottomTimeRef.current = null;
      reachedTopTimeRef.current = null;
      setTimeout(() => {
        isTransitioning = false;
      }, 1000);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [currentSlide, currentView]);

  // Slide Change Scroll Reset
  useEffect(() => {
    window.scrollTo(0, 0);
    reachedBottomTimeRef.current = null;
    reachedTopTimeRef.current = null;
  }, [currentSlide]);

  const handleSetView = (view: "client" | "admin") => {
    setCurrentView(view);
    const targetPath = view === "admin" ? "/admin" : "/";
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  };

  const handleQuoteSubmit = async (email: string, password: string, isLogin: boolean, country?: string) => {
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
  };

  const handleClearChat = () => {
    if (messages.length > 1) {
      setSavedChats(prev => {
        const updated = [messages, ...prev];
        return updated.slice(0, 5);
      });
    }
    setMessages([
      {
        role: "model",
        text: "Hello! I am your Korea Apparel Works virtual manufacture coordinator. Ask me about our 30-year veteran Korean sewing ateliers, premium technical fabrics, design pattern drafting, or low-MOQ (30pcs) luxury apparel services."
      }
    ]);
  };

  const handleRestoreChat = (index: number) => {
    const chatToRestore = savedChats[index];
    if (chatToRestore) {
      setMessages(chatToRestore);
      setSavedChats(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleOpenPreOrder = (finish?: StreamColorFinish, size?: number) => {
    if (finish) setCustomFinish(finish);
    if (size) setCustomSize(size);
    setIsPreOrderOpen(true);
  };

  const clientViewBackgroundStyle = currentView === "client" ? (
    currentSlide === 0 ? {
      backgroundImage: `linear-gradient(to bottom, transparent 60%, var(--color-luxury-cream) 100%), url(${bgImage})`,
      backgroundSize: "cover, cover",
      backgroundPosition: "center, center top",
      backgroundRepeat: "no-repeat, no-repeat",
      backgroundAttachment: "fixed, fixed",
      backgroundColor: "var(--color-luxury-cream)"
    } : {
      backgroundColor: "var(--color-luxury-cream)"
    }
  ) : {};

  return (
    <div 
      className={`relative min-h-screen antialiased selection:bg-neutral-800 selection:text-white transition-all duration-500 ease-in-out ${
        currentView === "admin" ? "bg-neutral-950 text-white" : "text-neutral-900"
      }`}
      style={clientViewBackgroundStyle}
    >

      {currentView === "admin" ? (
        <AdminDashboard onExit={() => handleSetView("client")} />
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
              savedChats={savedChats}
              onClearChat={handleClearChat}
              onRestoreChat={handleRestoreChat}
              user={user}
              onOpenLogin={() => setIsQuoteModalOpen(true)}
              onLogout={() => supabase.auth.signOut()}
              onOpenAccount={() => setIsAccountModalOpen(true)}
            />

          </main>

          {/* 5. Standalone Premium legal bottom */}
          <Footer onAdminClick={() => handleSetView("admin")} setCurrentSlide={setCurrentSlide} />
        </>
      )}

      {/* 6. Dynamic Priority queue reservation ticket dialog */}
      <PreOrderModal
        isOpen={isPreOrderOpen}
        onClose={() => setIsPreOrderOpen(false)}
        defaultFinish={customFinish}
        defaultSize={customSize}
      />

      {/* 7. Premium Cookie Consent banner */}
      <CookieBanner />

      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
        onSubmit={handleQuoteSubmit} 
      />

      <UserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={user}
      />

    </div>
  );
}
