import React, { useState } from "react";
import { Camera, Mic, ArrowUp, RefreshCw, History, FileText, Menu, X, Home, Factory, Shirt, User, LogOut } from "lucide-react";
import { useChat, Message } from "../../lib/useChat";
import BballyChatPanel from "../bbally/BballyChatPanel";

interface MobileChatViewProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onClearChat: () => void;
  user: any;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  onOpenLogin: () => void;
  onOpenAccount?: () => void;
  onLogout?: () => void;
  onBackToStart: () => void;
}


export default function MobileChatView({
  messages,
  setMessages,
  onClearChat,
  user,
  currentSlide,
  setCurrentSlide,
  onOpenLogin,
  onOpenAccount,
  onLogout,
  onBackToStart,
}: MobileChatViewProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    chatInput,
    setChatInput,
    isGenerating,
    textareaRef,
    fileInputRef,
    scrollRef,
    isListening,
    toggleListening,
    handleSendMessage,
    handleQuickCommand,
    handleImageSelect,
    handleAnalyzeImage,
  } = useChat({ messages, setMessages, user, onOpenLogin });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-transparent font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)] sticky top-0 z-10 shrink-0">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 -ml-2 text-neutral-700 hover:text-black transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <button
          onClick={() => {
            setCurrentSlide(0);
            onClearChat();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center justify-center focus:outline-none cursor-pointer"
        >
          <img src="/logo12345.jpg" alt="Korea Apparel Works Logo" className="h-[60px] object-contain" />
        </button>
        <div className="w-8" /> {/* Placeholder for balance */}
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-[85%] max-w-[285px] bg-[#1e1e1e] text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl rounded-r-2xl ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex items-center space-x-3">
            <img src="/logo12345.jpg" alt="Logo" className="w-8 h-8 object-contain rounded-md" />
            <span className="font-medium text-[15px] tracking-wide text-neutral-100 whitespace-nowrap">Korea Apparel Works</span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-hide">
          <button
            onClick={() => {
              setIsMenuOpen(false);
              onClearChat();
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-neutral-400" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              onBackToStart();
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <Home className="w-5 h-5 text-neutral-400" />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setCurrentSlide(1);
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <Factory className="w-5 h-5 text-neutral-400" />
            <span>Manufacturing</span>
          </button>
          
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setCurrentSlide(2);
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <Shirt className="w-5 h-5 text-neutral-400" />
            <span>Product</span>
          </button>


        </div>

        {/* 사업자 정보 — 모바일에는 주소 없이 상호·등록번호·메일만 */}
        <div className="shrink-0 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] border-t border-white/10 font-dm-sans font-light text-[12px] leading-[1.7] text-neutral-500">
          KAW Inc.<br />
          Business Reg. No. 179-86-04548<br />
          <a href="mailto:contact@k-apparel.works" className="hover:text-neutral-300">contact@k-apparel.works</a>
        </div>
      </div>

      {/* 채팅 영역 — 인더엑스 시안 기반 빨리 대화 화면 (위쪽 상단 바와 메뉴는 그대로) */}
      <BballyChatPanel
        mode="mobile"
        messages={messages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        isGenerating={isGenerating}
        isListening={isListening}
        textareaRef={textareaRef}
        fileInputRef={fileInputRef}
        scrollRef={scrollRef}
        onSend={handleSendMessage}
        onQuick={handleQuickCommand}
        onToggleVoice={toggleListening}
        onPickFile={handleAnalyzeImage}
        onFileSelected={handleImageSelect}
        onNewChat={onClearChat}
      />
    </div>
  );
}
