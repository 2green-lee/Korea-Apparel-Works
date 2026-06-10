import React, { useState, useEffect } from "react";
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

export default function App() {
  const [currentView, setCurrentView] = useState<"client" | "admin">(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/admin") {
      return "admin";
    }
    return "client";
  });
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
          alert("This email is already registered. Please sign in instead.");
          return;
        } else if (signUpError) {
          alert("Error creating account: " + signUpError.message);
          return;
        }
        
        setMessages((prev) => [
          ...prev,
          { role: "model", text: `Thank you for your interest. We have received your request from ${country}. How can we assist you with apparel manufacturing today?` }
        ]);
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

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white antialiased selection:bg-neutral-800 selection:text-white">
      
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
