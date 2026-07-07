import React, { useState, useEffect } from "react";
import { 
  Users, 
  FileText, 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  ArrowLeft, 
  Lock, 
  RefreshCw, 
  ShieldAlert,
  SlidersHorizontal,
  Mail,
  Globe,
  Inbox,
  MessageCircle,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Eye,
  Languages,
  RotateCcw,
  XCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SubmissionItem {
  id: string;
  type: "quote" | "preorder";
  email: string;
  fullName?: string;
  finish?: string;
  size?: number;
  country: string;
  shippingOption?: string;
  createdAt: string;
}

interface AdminDashboardProps {
  onExit: () => void;
}

export default function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState<{ email: string; name: string; role: "master" | "admin" } | null>(null);
  
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "quote" | "preorder">("all");

  const [activeMainTab, setActiveMainTab] = useState<"dashboard" | "pageEdit" | "adminManagement" | "chats" | "orders" | "trash">("dashboard");

  // Chats & Orders State
  const [chatData, setChatData] = useState<{ sessions: any[], messages: any[] }>({ sessions: [], messages: [] });
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [showPoSummaryFor, setShowPoSummaryFor] = useState<Record<string, boolean>>({});
  const [pos, setPos] = useState<any[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const [isPosLoading, setIsPosLoading] = useState(false);

  // Dashboard Stats (견적수, 조회수 등)
  const [stats, setStats] = useState<{
    totalViews: number | null;
    todayViews: number | null;
    uniqueVisitors: number | null;
    chatSessions: number | null;
    poCount: number | null;
    submissionCount: number | null;
  } | null>(null);

  // Analytics Drilldown State
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [todayPageStats, setTodayPageStats] = useState<{path: string, count: number}[] | null>(null);
  const [selectedAnalyticsPath, setSelectedAnalyticsPath] = useState<string | null>(null);
  const [historicalStats, setHistoricalStats] = useState<{date: string, count: number}[] | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<"week" | "month" | "year">("week");

  // Chat Translation State
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [showTranslated, setShowTranslated] = useState<Record<string, boolean>>({});
  const [translatingKey, setTranslatingKey] = useState<string | null>(null);

  // Trash (휴지통) State
  const [trashData, setTrashData] = useState<{ sessions: any[]; submissions: any[]; pos: any[] }>({ sessions: [], submissions: [], pos: [] });
  const [isTrashLoading, setIsTrashLoading] = useState(false);
  
  // Admin management state
  const [allAdmins, setAllAdmins] = useState<{ email: string; name: string; role: "master" | "admin"; createdAt: string }[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [adminSuccessMsg, setAdminSuccessMsg] = useState("");
  const [adminErrorMsg, setAdminErrorMsg] = useState("");

  // Quote detail modal state
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);

  // Restore authenticated session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("currentAdmin");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setIsAuthenticated(true);
          setCurrentAdmin(parsed);
        }
      } catch (err) {
        // ignore
      }
    }
  }, []);

  // Load submissions from server
  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load admins list
  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try {
      const res = await fetch("/api/admins");
      if (res.ok) {
        const data = await res.json();
        setAllAdmins(data);
      }
    } catch (err) {
      console.error("Failed to load administrators:", err);
    } finally {
      setAdminsLoading(false);
    }
  };

  const fetchChats = async () => {
    setIsChatsLoading(true);
    try {
      const res = await fetch("/api/admin/chats");
      if (res.ok) setChatData(await res.json());
    } catch (err) { console.error(err); }
    finally { setIsChatsLoading(false); }
  };

  const fetchPos = async () => {
    setIsPosLoading(true);
    try {
      const res = await fetch("/api/admin/pos");
      if (res.ok) setPos(await res.json());
    } catch (err) { console.error(err); }
    finally { setIsPosLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error("Failed to load stats:", err); }
  };

  const fetchTodayAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics/today-by-page");
      if (res.ok) setTodayPageStats(await res.json());
    } catch (err) { console.error("Failed to load today's analytics:", err); }
  };

  const fetchHistoricalAnalytics = async (path: string, range: string) => {
    try {
      const res = await fetch(`/api/admin/analytics/historical?path=${encodeURIComponent(path)}&range=${range}`);
      if (res.ok) setHistoricalStats(await res.json());
    } catch (err) { console.error("Failed to load historical analytics:", err); }
  };

  useEffect(() => {
    if (selectedAnalyticsPath) {
      fetchHistoricalAnalytics(selectedAnalyticsPath, analyticsRange);
    }
  }, [selectedAnalyticsPath, analyticsRange]);

  const fetchTrash = async () => {
    setIsTrashLoading(true);
    try {
      const res = await fetch("/api/admin/trash");
      if (res.ok) setTrashData(await res.json());
    } catch (err) { console.error(err); }
    finally { setIsTrashLoading(false); }
  };

  // 채팅 세션을 휴지통으로 이동 / 복원 / 영구삭제
  const handleTrashItem = async (kind: "session" | "submission" | "po", id: string, label: string) => {
    if (!window.confirm(`"${label}" 항목을 휴지통으로 이동하시겠습니까?\n(휴지통에서 복원하거나 영구 삭제할 수 있습니다.)`)) return;
    try {
      const res = await fetch("/api/admin/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id })
      });
      if (res.ok) {
        if (kind === "session") fetchChats();
        if (kind === "po") fetchPos();
        if (kind === "submission") fetchSubmissions();
      } else {
        const errData = await res.json();
        alert(
          "휴지통 이동에 실패했습니다.\n\n" +
          "Supabase SQL Editor에서 supabase_admin_upgrade.sql 파일의 내용을 실행했는지 확인해 주세요.\n\n" +
          `상세: ${errData.error || "알 수 없는 오류"}`
        );
      }
    } catch (err) { console.error(err); }
  };

  // 고객 단위(세션 여러 개)를 한 번에 휴지통으로 이동
  const handleTrashCustomer = async (customerKey: string, sessions: any[]) => {
    if (!window.confirm(`"${customerKey}" 고객의 채팅 세션 ${sessions.length}개를 모두 휴지통으로 이동하시겠습니까?\n(휴지통에서 복원하거나 영구 삭제할 수 있습니다.)`)) return;
    try {
      let failed = 0;
      for (const s of sessions) {
        const res = await fetch("/api/admin/trash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "session", id: s.session_id })
        });
        if (!res.ok) failed++;
      }
      if (failed > 0) {
        alert(
          "일부 세션의 휴지통 이동에 실패했습니다.\n\n" +
          "Supabase SQL Editor에서 supabase_admin_upgrade.sql 파일의 내용을 실행했는지 확인해 주세요."
        );
      }
      fetchChats();
    } catch (err) { console.error(err); }
  };

  const handleRestoreItem = async (kind: "session" | "submission" | "po", id: string) => {
    try {
      const res = await fetch("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id })
      });
      if (res.ok) fetchTrash();
    } catch (err) { console.error(err); }
  };

  const handlePurgeItem = async (kind: "session" | "submission" | "po", id: string) => {
    if (!window.confirm("이 항목을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      const res = await fetch("/api/admin/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id })
      });
      if (res.ok) fetchTrash();
    } catch (err) { console.error(err); }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm("휴지통을 완전히 비우시겠습니까? 모든 항목이 영구 삭제되며 되돌릴 수 없습니다.")) return;
    try {
      const res = await fetch("/api/admin/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) fetchTrash();
    } catch (err) { console.error(err); }
  };

  // 세션 단위 채팅 한국어 번역 (Gemini)
  const handleTranslateSession = async (sessionId: string) => {
    // 이미 번역돼 있으면 토글만
    const msgs = chatData.messages.filter((m: any) => m.session_id === sessionId);
    if (msgs.length === 0) return;

    const untranslated = msgs.filter((m: any) => !translations[m.message_id]);
    if (untranslated.length === 0) {
      setShowTranslated(prev => ({ ...prev, [sessionId]: !prev[sessionId] }));
      return;
    }

    setTranslatingKey(sessionId);
    try {
      const texts = untranslated.map((m: any) =>
        String(m.content).replace(/\[Image Attached:[^\]]*\]/g, "[이미지 첨부]")
      );
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts })
      });
      if (res.ok) {
        const data = await res.json();
        setTranslations(prev => {
          const next = { ...prev };
          untranslated.forEach((m: any, i: number) => { next[m.message_id] = data.translations[i]; });
          return next;
        });
        setShowTranslated(prev => ({ ...prev, [sessionId]: true }));
      } else {
        alert("번역에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch (err) {
      console.error(err);
      alert("번역 서버와의 통신에 실패했습니다.");
    } finally {
      setTranslatingKey(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeMainTab === "dashboard") { fetchSubmissions(); fetchStats(); }
      if (activeMainTab === "adminManagement" && currentAdmin?.role === "master") fetchAdmins();
      if (activeMainTab === "chats") { fetchChats(); fetchPos(); }
      if (activeMainTab === "orders") { fetchPos(); fetchChats(); }
      if (activeMainTab === "trash") fetchTrash();
    }
  }, [isAuthenticated, activeMainTab, currentAdmin?.role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await fetch("/api/admins/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setCurrentAdmin(data.admin);
        localStorage.setItem("currentAdmin", JSON.stringify(data.admin));
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "올바르지 않은 관리자 로그인 정보입니다.");
      }
    } catch (err) {
      setErrorMsg("인증 서버와의 통신에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    localStorage.removeItem("currentAdmin");
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSuccessMsg("");
    setAdminErrorMsg("");
    try {
      const res = await fetch("/api/admins/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          password: newAdminPassword,
          name: newAdminName.trim(),
          role: "admin"
        })
      });
      if (res.ok) {
        setAdminSuccessMsg(`신규 서브 관리자가 성공적으로 승인되었습니다: ${newAdminEmail}`);
        setNewAdminEmail("");
        setNewAdminPassword("");
        setNewAdminName("");
        fetchAdmins();
      } else {
        const errData = await res.json();
        setAdminErrorMsg(errData.error || "관리자 계정 생성에 실패했습니다.");
      }
    } catch (err) {
      setAdminErrorMsg("보안 관리 인프라와의 동기화 및 설정에 실패했습니다.");
    }
  };

  const handleDeleteAdmin = async (adminEmail: string) => {
    if (adminEmail.toLowerCase() === "lgi12@naver.com") {
      alert("마스터 최상위 관리자 계정은 권한 삭제 및 제거가 불가합니다.");
      return;
    }
    if (!window.confirm(`정말로 "${adminEmail}" 서브 관리자 권한을 영구 취소 및 삭제하시겠습니까?`)) {
      return;
    }
    try {
      const res = await fetch("/api/admins/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail })
      });
      if (res.ok) {
        setAllAdmins(prev => prev.filter(acc => acc.email !== adminEmail));
      } else {
        const errData = await res.json();
        alert(errData.error || "관리자 권한 삭제 작업에 실패했습니다.");
      }
    } catch (err) {
      console.error("Failed to delete admin:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("해당 고객의 리드 문의 내역을 휴지통으로 이동하시겠습니까?\n(휴지통에서 복원하거나 영구 삭제할 수 있습니다.)")) return;
    try {
      const res = await fetch("/api/submissions/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete submission:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("모든 고객 문의 내역을 휴지통으로 이동합니다. 계속 진행하시겠습니까?\n(휴지통에서 복원하거나 영구 삭제할 수 있습니다.)")) return;
    try {
      const res = await fetch("/api/submissions/clear", {
        method: "POST"
      });
      if (res.ok) {
        setSubmissions([]);
      }
    } catch (err) {
      console.error("Failed to clear database:", err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export submissions to a clean CSV report
  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    
    // Header
    const headers = ["ID", "구분", "이메일", "고객명", "옵션 피니시", "피팅 사이즈", "국가", "배송옵션", "생성일자"];
    
    // Rows
    const rows = submissions.map(item => [
      item.id,
      item.type === "quote" ? "1:1 상담 견적" : "우선 사전예약",
      item.email,
      item.fullName || "-",
      item.finish || "-",
      item.size || "-",
      item.country,
      item.shippingOption || "-",
      new Date(item.createdAt).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `제작소_리드_보고서_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter metrics
  const totalLeads = submissions.length;
  const quoteCount = submissions.filter(s => s.type === "quote").length;
  const preorderCount = submissions.filter(s => s.type === "preorder").length;

  const filteredSubmissions = submissions.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      item.email.toLowerCase().includes(query) ||
      item.country.toLowerCase().includes(query) ||
      (item.fullName && item.fullName.toLowerCase().includes(query)) ||
      item.id.toLowerCase().includes(query);
    
    if (filterType === "all") return matchesSearch;
    return item.type === filterType && matchesSearch;
  });

  if (!isAuthenticated) {
    /* ADMIN LOGIN PANEL overlay */
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 font-sans py-20 select-none animate-fadeIn text-left">
        <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white"></div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-white font-sans">제작소 관리자 포털</h2>
              <p className="text-xs text-neutral-400 font-light max-w-xs font-sans mt-1 leading-relaxed">
                허가되지 않은 접근은 제한됩니다. 견적 상담 및 사전 예약 등록부를 확인하려면 등록된 관리자 계정 정보로 서명하십시오.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block font-sans">
                관리자 이메일 계정
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="w-full bg-neutral-950/80 border border-white/10 hover:border-white/20 rounded-xl py-3 px-4 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/10 transition-all font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block font-sans">
                보안 비밀번호
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full bg-neutral-950/80 border border-white/10 hover:border-white/20 rounded-xl py-3 px-4 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/10 transition-all font-sans"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-950/20 border border-red-500/20 text-red-400 text-[11px] rounded-xl py-2 px-3 flex items-center space-x-2 font-sans">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onExit}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold py-3 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center space-x-2 font-sans"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>포털 나가기</span>
              </button>
              <button
                type="submit"
                className="flex-1 bg-white hover:bg-neutral-200 text-black text-xs font-semibold py-3 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center font-medium font-sans"
              >
                관리자 인증하기
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-4 border-t border-white/5 text-center">
            <span className="text-[9px] font-sans font-medium text-neutral-500 tracking-wider">
              KOREA APPAREL WORKS • 보안 암호화 인증 수트 가동 중
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* AUTHENTICATED REAL-TIME LEADS DASHBOARD */
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10 font-sans min-h-[90vh] flex flex-col lg:flex-row gap-8 lg:gap-12">
      
      {/* Sidebar Navigation */}
      <aside className="w-[170px] flex-shrink-0 flex flex-col space-y-8 select-text">
        <nav className="flex flex-col space-y-2 flex-1 pt-2">
          <button
            onClick={() => setActiveMainTab("dashboard")}
            className={`text-left px-4 py-3 rounded-xl transition duration-200 cursor-pointer text-sm font-semibold flex items-center space-x-3.5 border border-transparent ${
              activeMainTab === "dashboard"
                ? "bg-white text-black border-white/10"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>대시보드</span>
          </button>
          <button
            onClick={() => setActiveMainTab("pageEdit")}
            className={`text-left px-4 py-3 rounded-xl transition duration-200 cursor-pointer text-sm font-semibold flex items-center space-x-3.5 border border-transparent ${
              activeMainTab === "pageEdit"
                ? "bg-white text-black border-white/10"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>페이지 편집</span>
          </button>
          
          <button
            onClick={() => setActiveMainTab("chats")}
            className={`text-left px-4 py-3 rounded-xl transition duration-200 cursor-pointer text-sm font-semibold flex items-center space-x-3.5 border border-transparent ${
              activeMainTab === "chats"
                ? "bg-white text-black border-white/10"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>AI 채팅 내역</span>
          </button>

          <button
            onClick={() => setActiveMainTab("orders")}
            className={`text-left px-4 py-3 rounded-xl transition duration-200 cursor-pointer text-sm font-semibold flex items-center space-x-3.5 border border-transparent ${
              activeMainTab === "orders"
                ? "bg-white text-black border-white/10"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>발주서 목록(PO)</span>
          </button>

          <button
            onClick={() => setActiveMainTab("trash")}
            className={`text-left px-4 py-3 rounded-xl transition duration-200 cursor-pointer text-sm font-semibold flex items-center space-x-3.5 border border-transparent ${
              activeMainTab === "trash"
                ? "bg-white text-black border-white/10"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>휴지통</span>
          </button>

          {currentAdmin?.role === "master" && (
            <button
              onClick={() => setActiveMainTab("adminManagement")}
              className={`text-left px-4 py-3 rounded-xl transition duration-200 cursor-pointer text-sm font-semibold flex items-center space-x-3.5 border border-transparent ${
                activeMainTab === "adminManagement"
                  ? "bg-white text-black border-white/10"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>관리자 관리</span>
            </button>
          )}
        </nav>

        {/* Global Controls */}
        <div className="pt-8 border-t border-white/10 flex flex-col space-y-2.5 mt-auto">
          <button
            onClick={onExit}
            className="w-full text-left px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 text-xs font-semibold cursor-pointer transition flex items-center space-x-2.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 text-xs font-semibold cursor-pointer transition flex items-center space-x-2.5"
          >
            <Lock className="w-4 h-4 text-neutral-500" />
            <span>관리자 로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">

        {/* Welcome banner with logged-in user profile */}
        {currentAdmin && (
          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs font-sans text-neutral-400 bg-neutral-900/40 rounded-2xl border border-white/5 px-6 py-3.5 gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>로그인된 세션 계정: <strong className="text-white font-sans">{currentAdmin.name}</strong> ({currentAdmin.email})</span>
            </div>
            <div>
              <span className="uppercase bg-neutral-800 border border-white/10 text-neutral-300 px-2.5 py-0.5 rounded text-[10px] font-bold font-sans tracking-wider">
                권한 레벨: {currentAdmin.role === "master" ? "최상위 마스터(Master)" : "서브 관리자(Admin)"}
              </span>
            </div>
          </div>
        )}

      {activeMainTab === "dashboard" ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-xl font-light text-white font-sans">
                비즈니스 실시간 모니터링
              </h2>
              <p className="text-xs text-neutral-400 font-light font-sans mt-1">
                스토어프론트에서 수집된 고객 문의와 리드 데이터를 확인합니다.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchSubmissions}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-neutral-900 border border-white/15 text-neutral-400 hover:text-white hover:border-white/30 transition cursor-pointer disabled:opacity-40"
                title="데이터 새로고침"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={handleExportCSV}
                disabled={submissions.length === 0}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-neutral-200 hover:text-white text-xs font-medium cursor-pointer transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 text-white" />
                <span>보고서 내보내기 (CSV)</span>
              </button>
            </div>
          </div>

          {/* KPI Stats Cards - Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8 select-text">
            {/* Card 1: Page Views */}
            <div 
              className={`bg-neutral-900 rounded-2xl p-6 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${isAnalyticsOpen ? 'border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-white/5 hover:bg-neutral-800'}`}
              onClick={() => {
                if (!isAnalyticsOpen) fetchTodayAnalytics();
                setIsAnalyticsOpen(!isAnalyticsOpen);
                setSelectedAnalyticsPath(null);
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-sans">오늘 사이트 접속수</span>
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extralight text-white font-sans">
                  {stats?.todayViews ?? "—"}
                </span>
                <span className="block text-[10px] text-neutral-500 font-light mt-1 font-sans">
                  {stats?.todayViews === null
                    ? "page_views 테이블 생성 필요 (SQL 실행)"
                    : `전체 누적 ${stats?.totalViews ?? 0}회 · 순 방문자 ${stats?.uniqueVisitors ?? 0}명`}
                </span>
              </div>
            </div>

            {/* Card 2: AI Chat Sessions */}
            <div className="bg-neutral-900 rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-sans">AI 채팅 세션</span>
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extralight text-white font-sans">{stats?.chatSessions ?? "—"}</span>
                <span className="block text-[10px] text-neutral-500 font-light mt-1 font-sans">
                  고객이 AI 상담원과 진행한 채팅 세션 수입니다.
                </span>
              </div>
            </div>

            {/* Card 3: Quotes / POs */}
            <div className="bg-neutral-900 rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-sans">견적·발주서 (PO)</span>
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extralight text-white font-sans">{stats?.poCount ?? "—"}</span>
                <span className="block text-[10px] text-neutral-500 font-light mt-1 font-sans">
                  AI 상담을 통해 자동 생성된 견적(발주서) 건수입니다.
                </span>
              </div>
            </div>

            {/* Card 4: Total Leads */}
            <div className="bg-neutral-900 rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-sans">문의 접수 (리드)</span>
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extralight text-white font-sans">{totalLeads}</span>
                <span className="block text-[10px] text-neutral-500 font-light mt-1 font-sans">
                  견적 요청 {quoteCount}건 · 사전 예약 {preorderCount}건
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Drilldown Section */}
          {isAnalyticsOpen && (
            <div className="bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden shadow-xl mb-6 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">상세 접속 통계</h3>
                <button onClick={() => setIsAnalyticsOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer transition">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {!selectedAnalyticsPath ? (
                <div>
                  <h4 className="text-sm text-neutral-400 mb-4 font-semibold">오늘 페이지별 접속수 (클릭하여 추이 확인)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {todayPageStats?.map((stat, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedAnalyticsPath(stat.path)}
                        className="p-4 bg-neutral-950 border border-white/5 rounded-xl cursor-pointer hover:border-white/20 transition flex justify-between items-center"
                      >
                        <span className="text-sm font-medium text-neutral-300 truncate mr-3">{stat.path || '/'}</span>
                        <span className="text-lg font-semibold text-white">{stat.count}</span>
                      </div>
                    ))}
                    {!todayPageStats && <div className="text-neutral-500 text-sm">데이터를 불러오는 중...</div>}
                    {todayPageStats && todayPageStats.length === 0 && <div className="text-neutral-500 text-sm">오늘 방문 기록이 없습니다.</div>}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setSelectedAnalyticsPath(null)} className="text-neutral-400 hover:text-white cursor-pointer p-1 rounded hover:bg-neutral-800 transition">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h4 className="text-sm text-neutral-300 font-semibold">{selectedAnalyticsPath || '/'} <span className="text-neutral-500 font-normal ml-2">접속 추이</span></h4>
                    </div>
                    <div className="flex bg-neutral-950 rounded-lg p-1 border border-white/5">
                      {(['week', 'month', 'year'] as const).map(range => (
                        <button
                          key={range}
                          onClick={() => setAnalyticsRange(range)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${analyticsRange === range ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
                        >
                          {range === 'week' ? '1주일' : range === 'month' ? '1개월' : '1년'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-64 w-full">
                    {!historicalStats ? (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500">데이터를 불러오는 중...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis dataKey="date" stroke="#666" fontSize={10} tickMargin={10} />
                          <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Line type="monotone" dataKey="count" name="접속수" stroke="#fff" strokeWidth={2} dot={{ r: 3, fill: '#fff' }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Controls & Filters */}
          <div className="bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden shadow-xl mb-6">
            
            <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 select-text bg-neutral-900/60">
              
              {/* SEARCH BAR */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="이메일, 이름, 국가 또는 접수 고유 ID로 검색..."
                  className="w-full bg-neutral-950 border border-white/5 hover:border-white/15 focus:border-neutral-400 focus:outline-none rounded-xl py-2 pl-10 pr-4 text-xs font-sans text-white transition placeholder-neutral-500"
                />
              </div>

              {/* FILTERS */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 bg-neutral-950 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer font-sans ${
                      filterType === "all" ? "bg-white text-black font-semibold shadow-inner" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    전체 리드
                  </button>
                  <button
                    onClick={() => setFilterType("quote")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer font-sans ${
                      filterType === "quote" ? "bg-white text-black font-semibold shadow-inner" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    견적서만
                  </button>
                  <button
                    onClick={() => setFilterType("preorder")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer font-sans ${
                      filterType === "preorder" ? "bg-white text-black font-semibold shadow-inner" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    사전예약만
                  </button>
                </div>

                {submissions.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-3.5 py-2.5 rounded-xl bg-red-950/20 border border-red-900/40 hover:border-red-500/50 hover:bg-red-950/40 text-red-400 text-xs font-medium cursor-pointer transition flex items-center space-x-1.5 font-sans"
                    title="전체 데이터 영구 파괴"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">전체 삭제</span>
                  </button>
                )}
              </div>

            </div>

            {/* CORE LEADS DATA TABLE VIEW */}
            <div className="overflow-x-auto scrollbar-thin select-text">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3.5">
                  <RefreshCw className="w-6 h-6 text-white animate-spin" />
                  <span className="text-xs text-neutral-400 font-sans font-medium">서버 데이터 카탈로그 동기화 중...</span>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-950 border border-white/5 flex items-center justify-center text-neutral-600">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="block text-xs font-medium text-neutral-400 font-sans">조건에 부합하는 상담 신청 데이터가 없습니다</span>
                    <span className="block text-[10.5px] text-neutral-600 font-light max-w-xs mx-auto leading-relaxed font-sans">
                      고객이 스토어프론트를 통해 제출한 실시간 요청서가 이곳에 기재됩니다. 검색어나 필터 조건 설정을 다시 확인해 주십시오.
                    </span>
                  </div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-950 border-b border-white/5 font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      <th className="py-4 px-6 text-neutral-400">ID 및 접수 일시</th>
                      <th className="py-4 px-6 text-neutral-400">구분</th>
                      <th className="py-4 px-6 text-neutral-400">고객 이메일</th>
                      <th className="py-4 px-6 text-neutral-400">고객 성함</th>
                      <th className="py-4 px-6 text-neutral-400">국가 및 피팅 스펙</th>
                      <th className="py-4 px-6 text-neutral-400">배송/제작 대기 열</th>
                      <th className="py-4 px-6 text-right text-neutral-400">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSubmissions.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition duration-150 group">
                        
                        {/* ID & Date */}
                        <td className="py-4.5 px-6 font-sans text-xs whitespace-nowrap">
                          <span className="font-semibold block text-white text-[11px] tracking-wide">{item.id}</span>
                          <span className="block text-neutral-400 text-[10px] font-normal leading-relaxed mt-1 font-sans">
                            {new Date(item.createdAt).toLocaleString("ko-KR", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </td>

                        {/* Type Badge */}
                        <td className="py-4.5 px-6 whitespace-nowrap">
                          {item.type === "quote" ? (
                            <span className="px-2 py-1 rounded bg-neutral-850 border border-white/10 text-neutral-200 text-[10px] font-sans tracking-wide font-semibold uppercase select-none">
                              상담 견적서
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-[10px] font-sans tracking-wide font-semibold uppercase select-none">
                              우선 사전예약
                            </span>
                          )}
                        </td>

                        {/* Email Contact info */}
                        <td className="py-4.5 px-6 font-sans text-xs">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3.5 h-3.5 text-neutral-500" />
                            <span className="text-white font-medium select-all font-sans">{item.email}</span>
                            <button
                              onClick={() => handleCopy(item.email, item.id)}
                              className="text-neutral-500 hover:text-white transition p-1 rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none cursor-pointer"
                              title="이메일 주소 복사하기"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3 h-3 text-white" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Full Name */}
                        <td className="py-4.5 px-6 font-sans text-xs text-neutral-300">
                          {item.fullName ? (
                            <span className="text-white font-medium font-sans">{item.fullName}</span>
                          ) : (
                            <span className="text-neutral-600 font-light italic font-sans text-[11px]">미지정</span>
                          )}
                        </td>

                        {/* Country & Details */}
                        <td className="py-4.5 px-6 text-xs text-neutral-300">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5 font-sans">
                              <Globe className="w-3 h-3 text-neutral-500 shrink-0" />
                              <span className="text-neutral-300 font-medium font-sans">{item.country}</span>
                            </div>
                            {item.type === "preorder" && (
                              <div className="font-sans text-[10px] text-neutral-400 uppercase flex items-center space-x-2 font-medium tracking-wide">
                                <span>피니시: {item.finish === "titanium-silver" ? "실버" : item.finish === "matte-obsidian" ? "옵시디언" : "골드"}</span>
                                <span>•</span>
                                <span>반지 호수: {item.size}호</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Preferences / Shipping Option */}
                        <td className="py-4.5 px-6 text-xs text-neutral-300 font-sans">
                          {item.shippingOption ? (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full font-sans ${
                              item.shippingOption === "priority" 
                                ? "bg-white/10 text-neutral-200 border border-white/10" 
                                : "bg-neutral-800 text-neutral-450"
                            }`}>
                              {item.shippingOption === "standard" ? "일반 해외 배송" : "익스프레스 우선순위 대기열"}
                            </span>
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </td>

                        {/* Actions Menu */}
                        <td className="py-4.5 px-6 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => setSelectedSubmission(item)}
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-950/20 p-2 rounded-xl border border-transparent hover:border-amber-500/20 transition cursor-pointer"
                            title="상세 보기"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-neutral-550 hover:text-red-400 hover:bg-red-950/20 p-2 rounded-xl border border-transparent hover:border-red-500/20 transition cursor-pointer"
                            title="데이터 영구적으로 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table Footer Stats Summary row */}
            <div className="bg-neutral-950 text-neutral-500 py-3.5 px-6 border-t border-white/5 text-[10px] font-sans font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 select-text tracking-wide">
              <span className="font-sans">
                전체 {submissions.length}건 중 {filteredSubmissions.length}건 기재 중
              </span>
              <span className="text-neutral-500 font-sans tracking-wide">
                코리아 어패럴 워크스 제작소 보안 데이터베이스 리포지토리 • TLS/SSL 보안 암호화 가동 중
              </span>
            </div>

          </div>
        </>
      ) : null}

      {activeMainTab === "chats" ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-xl font-light text-white font-sans">AI 채팅 내역</h2>
              <p className="text-xs text-neutral-400 font-light font-sans mt-1">
                고객과 AI 상담원의 실시간 대화 내역을 조회합니다.
              </p>
            </div>
            <button onClick={fetchChats} className="p-2.5 rounded-xl bg-neutral-900 border border-white/15 text-neutral-400 hover:text-white">
              <RefreshCw className={`w-4 h-4 ${isChatsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex flex-col gap-6 select-text">
            {(() => {
              const grouped: Record<string, any[]> = {};
              chatData.sessions.forEach(session => {
                const po = pos.find(p => p.session_id === session.session_id);
                
                const loggedInEmail = session.user_email;
                const poCustomerName = po?.customer_name && po.customer_name !== "Unknown" ? po.customer_name : null;
                
                // Merge logic for UI display
                let keyParts = [];
                if (loggedInEmail) keyParts.push(`가입 이메일: ${loggedInEmail}`);
                if (poCustomerName) keyParts.push(`AI 수집 정보: ${poCustomerName}`);
                
                let key = keyParts.length > 0 ? keyParts.join(" / ") : `미식별 고객 (세션: ${session.session_id.substring(0, 8)})`;
                
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(session);
              });

              const entries = Object.entries(grouped);

              if (entries.length === 0) {
                return (
                  <div className="py-16 flex flex-col items-center justify-center space-y-4 bg-neutral-900 border border-white/10 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-neutral-950 border border-white/5 flex items-center justify-center text-neutral-600">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-neutral-500 font-sans">채팅 내역이 존재하지 않습니다.</span>
                  </div>
                );
              }

              // 고객별 아코디언 목록 — 클릭 시 그 자리에서 바로 펼쳐짐
              return entries.map(([customerKey, sessions]) => {
                const isCustomerOpen = !!expandedCustomers[customerKey];
                const showSummary = !!showPoSummaryFor[customerKey];

                // Extract all data from all messages for PO summary
                const allCustomerMsgs = sessions.flatMap(s => chatData.messages.filter(m => m.session_id === s.session_id));
                const allImages: string[] = [];
                const allPdfs: string[] = [];
                const allUserTexts: string[] = [];

                allCustomerMsgs.forEach(msg => {
                  const imgRegex = /\[Image Attached:\s*(https?:\/\/[^\]]+)\]/g;
                  let m;
                  while ((m = imgRegex.exec(msg.content)) !== null) {
                    const url = m[1];
                    if (url.match(/\.(pdf)$/i) || url.includes('/tech-packs/')) {
                      allPdfs.push(url);
                    } else {
                      allImages.push(url);
                    }
                  }
                  if (msg.sender_role === 'user') {
                    allUserTexts.push(msg.content.replace(/\[Image Attached:[^\]]*\]/g, '').trim());
                  }
                });

                const customerEmail = customerKey.split(' / ')[0];
                const customerCountry = customerKey.split(' / ')[1] || '—';

                return (
                  <div key={customerKey} className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                    {/* 고객 아코디언 헤더 */}
                    <div className="flex items-center bg-neutral-800/50 hover:bg-white/5 transition">
                      <button
                        onClick={() => setExpandedCustomers(prev => ({ ...prev, [customerKey]: !prev[customerKey] }))}
                        className="flex-1 min-w-0 text-left px-5 py-4 flex justify-between items-center cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-amber-400" />
                          </div>
                          <span className="font-semibold text-xs text-white font-sans truncate">{customerKey}</span>
                          <span className="text-[10px] text-neutral-500 whitespace-nowrap shrink-0 hidden sm:inline">{sessions.length}개 세션 · {allCustomerMsgs.length}개 메시지</span>
                        </div>
                        <div className="text-neutral-500 shrink-0 pl-3">
                          {isCustomerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>
                      <div className="flex items-center space-x-1.5 px-3 shrink-0">
                        <button
                          onClick={() => setShowPoSummaryFor(prev => ({ ...prev, [customerKey]: !prev[customerKey] }))}
                          className={`px-3 py-2 text-[11px] font-semibold rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
                            showSummary
                              ? 'bg-amber-500 text-black hover:bg-amber-400'
                              : 'bg-neutral-700 text-white hover:bg-neutral-600'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{showSummary ? '발주서 닫기' : '발주서 추출'}</span>
                        </button>
                        <button
                          onClick={() => handleTrashCustomer(customerKey, sessions)}
                          className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 transition cursor-pointer"
                          title="이 고객의 채팅 전체를 휴지통으로 이동"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  {/* PO Summary Table */}
                  {showSummary && (
                    <div className="border-t border-amber-500/30 overflow-hidden">
                      <div className="bg-amber-500/10 px-6 py-4 border-b border-amber-500/20 flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-semibold text-amber-300 font-sans">발주서 요약 (PO Summary)</h4>
                      </div>
                      <div className="p-6">
                        <table className="w-full text-left text-xs">
                          <tbody className="divide-y divide-white/5">
                            <tr>
                              <td className="py-3 pr-4 font-semibold text-neutral-400 w-[160px] align-top">고객 이메일</td>
                              <td className="py-3 text-white">{customerEmail}</td>
                            </tr>
                            <tr>
                              <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">국가</td>
                              <td className="py-3 text-white">{customerCountry}</td>
                            </tr>
                            <tr>
                              <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">최초 상담일</td>
                              <td className="py-3 text-white">{sessions.length > 0 ? new Date(sessions[sessions.length - 1].created_at).toLocaleString() : '—'}</td>
                            </tr>
                            <tr>
                              <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">총 세션 수</td>
                              <td className="py-3 text-white">{sessions.length} 개</td>
                            </tr>
                            <tr>
                              <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">총 메시지 수</td>
                              <td className="py-3 text-white">{allCustomerMsgs.length} 건</td>
                            </tr>
                            <tr>
                              <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">고객 요청 내용 전체</td>
                              <td className="py-3 text-white">
                                <div className="bg-neutral-950 border border-white/10 rounded-xl p-4 max-h-[200px] overflow-y-auto space-y-2">
                                  {allUserTexts.filter(t => t.length > 0).map((t, i) => (
                                    <div key={i} className="text-neutral-300 text-xs whitespace-pre-wrap leading-relaxed border-b border-white/5 pb-2 last:border-0">
                                      {t}
                                    </div>
                                  ))}
                                  {allUserTexts.filter(t => t.length > 0).length === 0 && <span className="text-neutral-500">텍스트 요청 없음</span>}
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">첨부 이미지 ({allImages.length}건)</td>
                              <td className="py-3">
                                {allImages.length > 0 ? (
                                  <div className="flex flex-wrap gap-3">
                                    {allImages.map((url, i) => (
                                      <a key={i} href={url} target="_blank" rel="noreferrer" className="block hover:opacity-80 transition">
                                        <img src={url} alt={`첨부 ${i+1}`} className="w-[120px] h-[120px] object-cover rounded-lg border border-white/20 shadow-md" />
                                      </a>
                                    ))}
                                  </div>
                                ) : <span className="text-neutral-500">없음</span>}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">첨부 PDF / 테크팩 ({allPdfs.length}건)</td>
                              <td className="py-3">
                                {allPdfs.length > 0 ? (
                                  <div className="flex flex-col gap-2">
                                    {allPdfs.map((url, i) => (
                                      <a key={i} href={url} target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 underline text-xs flex items-center space-x-2">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Tech Pack / PDF #{i + 1}</span>
                                      </a>
                                    ))}
                                  </div>
                                ) : <span className="text-neutral-500">없음</span>}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Chat Sessions - 고객 아코디언을 펼쳤을 때만 표시 */}
                  {isCustomerOpen && (
                    <div className="border-t border-white/5 p-5 flex flex-col gap-5 bg-neutral-950/20">
                      {sessions.map(session => {
                        const sessionMsgs = chatData.messages.filter(m => m.session_id === session.session_id);
                        if (sessionMsgs.length === 0) return null;
                        const isExpanded = expandedSessions[session.session_id];

                        return (
                          <div key={session.session_id} className="border border-white/10 rounded-2xl bg-neutral-900/50 shadow-lg overflow-hidden">
                            <div className="flex items-center hover:bg-white/5 transition">
                              <button
                                onClick={() => setExpandedSessions(prev => ({...prev, [session.session_id]: !prev[session.session_id]}))}
                                className="flex-1 text-left px-5 py-4 flex justify-between items-center cursor-pointer"
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="font-mono bg-black/50 px-2 py-1 rounded text-neutral-400 text-[10px]">ID: {session.session_id.substring(0,8)}</span>
                                  <span className="font-medium text-xs text-white">{new Date(session.created_at).toLocaleString()}</span>
                                  <span className="text-[10px] text-neutral-500">{sessionMsgs.length}개 메시지</span>
                                </div>
                                <div className="text-neutral-500">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </button>
                              <div className="flex items-center space-x-1 px-3">
                                <button
                                  onClick={() => handleTranslateSession(session.session_id)}
                                  disabled={translatingKey === session.session_id}
                                  className={`p-2 rounded-lg border border-transparent transition cursor-pointer disabled:opacity-50 ${
                                    showTranslated[session.session_id]
                                      ? "text-blue-300 bg-blue-950/40 border-blue-500/30"
                                      : "text-neutral-400 hover:text-blue-300 hover:bg-blue-950/20"
                                  }`}
                                  title={showTranslated[session.session_id] ? "원문 보기" : "한국어로 번역"}
                                >
                                  {translatingKey === session.session_id
                                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                                    : <Languages className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleTrashItem("session", session.session_id, `채팅 세션 ${session.session_id.substring(0,8)}`)}
                                  className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 transition cursor-pointer"
                                  title="휴지통으로 이동"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="p-5 pt-0 space-y-4 border-t border-white/5 mt-2 pt-4">
                                {sessionMsgs.map((msg: any) => {
                                  const imgRegex = /\[Image Attached:\s*(https?:\/\/[^\]]+)\]/g;
                                  let contentText = msg.content;
                                  const images: string[] = [];
                                  
                                  let match2;
                                  while ((match2 = imgRegex.exec(msg.content)) !== null) {
                                    images.push(match2[1]);
                                  }
                                  
                                  if (images.length > 0) {
                                    contentText = contentText.replace(/\[Image Attached:\s*https?:\/\/[^\]]+\]/g, "").trim();
                                  }

                                  const isTranslatedView = showTranslated[session.session_id] && translations[msg.message_id];
                                  const displayText = isTranslatedView
                                    ? translations[msg.message_id].replace(/\[이미지 첨부\]/g, "").trim()
                                    : contentText;

                                  return (
                                    <div key={msg.message_id} className={`p-4 rounded-xl text-xs font-sans shadow-sm ${msg.sender_role === 'user' ? 'bg-neutral-800 text-white ml-8 sm:ml-16 border border-white/5' : 'bg-white/10 text-neutral-200 mr-8 sm:mr-16 border border-white/10'}`}>
                                      <div className="flex items-center mb-2 space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${msg.sender_role === 'user' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                                        <span className="font-bold text-[10px] uppercase text-neutral-400">{msg.sender_role === 'user' ? 'Client' : 'AI Advisor'}</span>
                                        {isTranslatedView && (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-500/30 text-blue-300 font-semibold">번역됨</span>
                                        )}
                                      </div>
                                      {images.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                          {images.map((imgUrl, i) => (
                                            <a key={i} href={imgUrl} target="_blank" rel="noreferrer" className="block hover:opacity-80 transition shadow-md">
                                              <img src={imgUrl} alt="Attached" className="max-w-full sm:max-w-[300px] max-h-[300px] rounded-lg object-contain border border-white/20" />
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                      <div className="whitespace-pre-wrap leading-relaxed text-[13px]">{displayText}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  </div>
                );
              });
            })()}
          </div>
        </>
      ) : null}

      {activeMainTab === "orders" ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-xl font-light text-white font-sans">자동 생성 발주서(PO)</h2>
              <p className="text-xs text-neutral-400 font-light font-sans mt-1">
                상담이 완료된 고객의 발주서 목록입니다. 각 발주서를 클릭하면 상세 내역과 첨부파일을 확인할 수 있습니다.
              </p>
            </div>
            <button onClick={fetchPos} className="p-2.5 rounded-xl bg-neutral-900 border border-white/15 text-neutral-400 hover:text-white">
              <RefreshCw className={`w-4 h-4 ${isPosLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {pos.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-neutral-900 border border-white/10 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-neutral-950 border border-white/5 flex items-center justify-center text-neutral-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-xs text-neutral-500 font-sans">생성된 발주서가 없습니다.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {pos.map(po => {
                const isExpanded = expandedSessions[`po-${po.order_id}`];
                
                // Get chat messages for this PO's session
                const poSessionMsgs = po.session_id ? chatData.messages.filter((m: any) => m.session_id === po.session_id) : [];
                const showChat = expandedSessions[`po-chat-${po.order_id}`];

                // Extract all images and PDFs from actual user messages in this session
                const actualImages: string[] = [];
                const actualPdfs: string[] = [];
                
                poSessionMsgs.forEach((msg: any) => {
                  if (msg.sender_role === 'user') {
                    const imgRegex = /\[Image Attached:\s*(https?:\/\/[^\]]+)\]/g;
                    let m;
                    while ((m = imgRegex.exec(msg.content)) !== null) {
                      const url = m[1];
                      if (url.match(/\.(pdf)$/i) || url.includes('/tech-packs/')) {
                        actualPdfs.push(url);
                      } else {
                        actualImages.push(url);
                      }
                    }
                  }
                });

                // Dedup URLs
                const poImages = Array.from(new Set(actualImages));
                const poPdfs = Array.from(new Set(actualPdfs));

                return (
                  <div key={po.order_id} className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                    {/* PO Header - clickable accordion */}
                    <div className="flex items-center bg-neutral-800/50 hover:bg-white/5 transition">
                      <button
                        onClick={() => setExpandedSessions(prev => ({...prev, [`po-${po.order_id}`]: !prev[`po-${po.order_id}`]}))}
                        className="flex-1 text-left px-6 py-4 flex justify-between items-center cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white font-sans">{po.customer_name || '미지정'}</div>
                            <div className="text-[10px] text-neutral-400 font-sans mt-0.5">
                              {po.item_category || '품목 미정'} • {new Date(po.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold rounded-lg uppercase">
                            {po.status}
                          </span>
                          <div className="text-neutral-500">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleTrashItem("po", po.order_id, `${po.customer_name || '미지정'} 발주서`)}
                        className="p-2 mx-3 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 transition cursor-pointer"
                        title="휴지통으로 이동"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* PO Detail - expanded */}
                    {isExpanded && (
                      <div className="border-t border-white/5">
                        <div className="p-6">
                          <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-white/5">
                              <tr>
                                <td className="py-3 pr-4 font-semibold text-neutral-400 w-[180px] align-top">발주서 ID</td>
                                <td className="py-3 text-white font-mono text-[11px]">{po.order_id}</td>
                              </tr>
                              <tr>
                                <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">고객명</td>
                                <td className="py-3 text-white">{po.customer_name || '—'}</td>
                              </tr>
                              <tr>
                                <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">품목 카테고리</td>
                                <td className="py-3 text-white">{po.item_category || '—'}</td>
                              </tr>
                              {(() => {
                                // Extract values directly from DB (populated by Gemini)
                                let fabric = "—";
                                let quantity = "—";
                                let techPack = "—";

                                if (po.manufacturing_specs && po.manufacturing_specs.includes('|')) {
                                  po.manufacturing_specs.split('|').forEach((s: string) => {
                                    if (s.includes('원단:')) fabric = s.split('원단:')[1].trim();
                                    if (s.includes('수량:')) quantity = s.split('수량:')[1].trim();
                                    if (s.includes('테크팩:')) techPack = s.split('테크팩:')[1].trim();
                                  });
                                }

                                const hasSummary = po.additional_requests && po.additional_requests !== '—' && po.additional_requests !== '없음';

                                return (
                                  <>
                                    <tr>
                                      <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">원단</td>
                                      <td className="py-3 text-white">{fabric}</td>
                                    </tr>
                                    <tr>
                                      <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">수량</td>
                                      <td className="py-3 text-white">{quantity}</td>
                                    </tr>
                                    {hasSummary && (
                                      <tr>
                                        <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">기타 요청사항</td>
                                        <td className="py-3 text-white">
                                          <div className="bg-neutral-950 border border-white/10 rounded-xl p-4 max-h-[250px] overflow-y-auto space-y-3">
                                            <div className="text-neutral-300 text-xs whitespace-pre-wrap leading-relaxed">
                                              <div className="text-[10px] text-amber-400/80 mb-1.5 font-semibold flex items-center space-x-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                                <span>AI 종합 요약</span>
                                              </div>
                                              <div className="text-white pl-3 border-l-2 border-white/10">{po.additional_requests}</div>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                );
                              })()}
                              <tr>
                                <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">상태</td>
                                <td className="py-3">
                                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold rounded-lg">
                                    {po.status}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">접수 일시</td>
                                <td className="py-3 text-white">{new Date(po.created_at).toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">첨부 이미지 ({poImages.length}건)</td>
                                <td className="py-3">
                                  {poImages.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                      {poImages.map((url: string, i: number) => {
                                        const fullUrl = url.startsWith('http') ? url : `https://tznhtceeqozjndfllknm.supabase.co/storage/v1/object/public/apparel_files/sample-images/${url}`;
                                        return (
                                          <a key={i} href={fullUrl} target="_blank" rel="noreferrer" className="block hover:opacity-80 transition">
                                            <img src={fullUrl} alt={`샘플 ${i+1}`} className="w-[120px] h-[120px] object-cover rounded-lg border border-white/20 shadow-md" />
                                          </a>
                                        );
                                      })}
                                    </div>
                                  ) : <span className="text-neutral-500">없음</span>}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">첨부 PDF / 테크팩 ({poPdfs.length}건)</td>
                                <td className="py-3">
                                  {poPdfs.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                      {poPdfs.map((url: string, i: number) => {
                                        const fullUrl = url.startsWith('http') ? url : `https://tznhtceeqozjndfllknm.supabase.co/storage/v1/object/public/apparel_files/tech-packs/${url}`;
                                        return (
                                          <a key={i} href={fullUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 underline text-xs flex items-center space-x-2">
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>Tech Pack / PDF #{i + 1}</span>
                                          </a>
                                        );
                                      })}
                                    </div>
                                  ) : <span className="text-neutral-500">없음</span>}
                                </td>
                              </tr>
                              {po.work_order_pdf_url && (
                                <tr>
                                  <td className="py-3 pr-4 font-semibold text-neutral-400 align-top">작업지시서 PDF</td>
                                  <td className="py-3">
                                    <a href={po.work_order_pdf_url} target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 underline text-xs flex items-center space-x-2">
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>작업지시서 확인</span>
                                    </a>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Inline chat for this session - accordion */}
                        {po.session_id && (
                          <div className="px-6 pb-5">
                            <div className="border border-white/10 rounded-2xl overflow-hidden bg-neutral-900/60">
                              <div className="flex items-center hover:bg-white/5 transition">
                                <button
                                  onClick={() => {
                                    if (poSessionMsgs.length === 0) fetchChats();
                                    setExpandedSessions(prev => ({...prev, [`po-chat-${po.order_id}`]: !prev[`po-chat-${po.order_id}`]}));
                                  }}
                                  className="flex-1 text-left px-5 py-3.5 flex justify-between items-center cursor-pointer"
                                >
                                  <div className="flex items-center space-x-2.5">
                                    <MessageCircle className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs text-white font-semibold font-sans">상담 채팅 내역</span>
                                    {poSessionMsgs.length > 0 && (
                                      <span className="text-[10px] text-neutral-500">{poSessionMsgs.length}개 메시지</span>
                                    )}
                                  </div>
                                  <div className="text-neutral-500">
                                    {showChat ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </div>
                                </button>
                                {showChat && poSessionMsgs.length > 0 && (
                                  <button
                                    onClick={() => handleTranslateSession(po.session_id)}
                                    disabled={translatingKey === po.session_id}
                                    className={`p-2 mx-3 rounded-lg border border-transparent transition cursor-pointer disabled:opacity-50 ${
                                      showTranslated[po.session_id]
                                        ? "text-blue-300 bg-blue-950/40 border-blue-500/30"
                                        : "text-neutral-400 hover:text-blue-300 hover:bg-blue-950/20"
                                    }`}
                                    title={showTranslated[po.session_id] ? "원문 보기" : "한국어로 번역"}
                                  >
                                    {translatingKey === po.session_id
                                      ? <RefreshCw className="w-4 h-4 animate-spin" />
                                      : <Languages className="w-4 h-4" />}
                                  </button>
                                )}
                              </div>

                              {showChat && (
                                <div className="border-t border-white/5 bg-neutral-950/30 p-5 max-h-[500px] overflow-y-auto space-y-3">
                                  {poSessionMsgs.length > 0 ? poSessionMsgs.map((msg: any) => {
                                    const imgRegex2 = /\[Image Attached:\s*(https?:\/\/[^\]]+)\]/g;
                                    let ct = msg.content;
                                    const imgs: string[] = [];
                                    let m2;
                                    while ((m2 = imgRegex2.exec(msg.content)) !== null) imgs.push(m2[1]);
                                    if (imgs.length > 0) ct = ct.replace(/\[Image Attached:\s*https?:\/\/[^\]]+\]/g, '').trim();

                                    const isTranslatedPoView = showTranslated[po.session_id] && translations[msg.message_id];
                                    const displayCt = isTranslatedPoView
                                      ? translations[msg.message_id].replace(/\[이미지 첨부\]/g, "").trim()
                                      : ct;

                                    return (
                                      <div key={msg.message_id} className={`p-3 rounded-xl text-xs font-sans ${msg.sender_role === 'user' ? 'bg-neutral-800 text-white ml-6 sm:ml-12 border border-white/5' : 'bg-white/10 text-neutral-200 mr-6 sm:mr-12 border border-white/10'}`}>
                                        <div className="flex items-center mb-1.5 space-x-2">
                                          <div className={`w-2 h-2 rounded-full ${msg.sender_role === 'user' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                                          <span className="font-bold text-[10px] uppercase text-neutral-400">{msg.sender_role === 'user' ? 'Client' : 'AI Advisor'}</span>
                                          {isTranslatedPoView && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-500/30 text-blue-300 font-semibold">번역됨</span>
                                          )}
                                        </div>
                                        {imgs.length > 0 && (
                                          <div className="mb-2 flex flex-wrap gap-2">
                                            {imgs.map((iu, ii) => (
                                              <a key={ii} href={iu} target="_blank" rel="noreferrer" className="block hover:opacity-80 transition">
                                                <img src={iu} alt="Attached" className="max-w-[200px] max-h-[200px] rounded-lg object-contain border border-white/20" />
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                        <div className="whitespace-pre-wrap leading-relaxed">{displayCt}</div>
                                      </div>
                                    );
                                  }) : (
                                    <div className="text-center text-neutral-500 text-xs py-6">
                                      채팅 데이터를 불러오는 중... 새로고침 버튼을 눌러주세요.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : null}

      {activeMainTab === "trash" ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-xl font-light text-white font-sans">휴지통</h2>
              <p className="text-xs text-neutral-400 font-light font-sans mt-1">
                삭제된 채팅 세션, 문의, 견적(발주서)이 이곳에 보관됩니다. 복원하거나 영구 삭제할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={fetchTrash} className="p-2.5 rounded-xl bg-neutral-900 border border-white/15 text-neutral-400 hover:text-white transition cursor-pointer">
                <RefreshCw className={`w-4 h-4 ${isTrashLoading ? "animate-spin" : ""}`} />
              </button>
              {(trashData.sessions.length + trashData.submissions.length + trashData.pos.length) > 0 && (
                <button
                  onClick={handleEmptyTrash}
                  className="px-4 py-2.5 rounded-xl bg-red-950/20 border border-red-900/40 hover:border-red-500/50 hover:bg-red-950/40 text-red-400 text-xs font-medium cursor-pointer transition flex items-center space-x-1.5 font-sans"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>휴지통 비우기 (전체 영구삭제)</span>
                </button>
              )}
            </div>
          </div>

          {isTrashLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3.5">
              <RefreshCw className="w-6 h-6 text-white animate-spin" />
              <span className="text-xs text-neutral-400 font-sans font-medium">휴지통 동기화 중...</span>
            </div>
          ) : (trashData.sessions.length + trashData.submissions.length + trashData.pos.length) === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-neutral-900 border border-white/10 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-neutral-950 border border-white/5 flex items-center justify-center text-neutral-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="text-xs text-neutral-500 font-sans">휴지통이 비어 있습니다.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-8 select-text">
              {/* Trashed Chat Sessions */}
              {trashData.sessions.length > 0 && (
                <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center space-x-2.5">
                    <MessageCircle className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold text-white font-sans">삭제된 채팅 세션 ({trashData.sessions.length})</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {trashData.sessions.map((s: any) => (
                      <div key={s.session_id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition">
                        <div className="text-xs font-sans">
                          <span className="font-mono bg-black/50 px-2 py-1 rounded text-neutral-400 text-[10px] mr-3">ID: {s.session_id.substring(0, 8)}</span>
                          <span className="text-neutral-300">{new Date(s.created_at).toLocaleString()}</span>
                          <span className="block text-[10px] text-neutral-500 mt-1">삭제일: {s.deleted_at ? new Date(s.deleted_at).toLocaleString() : "—"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRestoreItem("session", s.session_id)}
                            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                            title="복원"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>복원</span>
                          </button>
                          <button
                            onClick={() => handlePurgeItem("session", s.session_id)}
                            className="px-3 py-2 rounded-lg bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 text-red-400 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                            title="영구 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>영구삭제</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trashed Submissions */}
              {trashData.submissions.length > 0 && (
                <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center space-x-2.5">
                    <Inbox className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold text-white font-sans">삭제된 문의 (리드) ({trashData.submissions.length})</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {trashData.submissions.map((sub: any) => (
                      <div key={sub.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition">
                        <div className="text-xs font-sans">
                          <span className="text-white font-medium">{sub.email}</span>
                          <span className="text-neutral-500 ml-2">({sub.type === "quote" ? "견적 요청" : "사전 예약"} · {sub.country})</span>
                          <span className="block text-[10px] text-neutral-500 mt-1">삭제일: {sub.deleted_at ? new Date(sub.deleted_at).toLocaleString() : "—"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRestoreItem("submission", sub.id)}
                            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>복원</span>
                          </button>
                          <button
                            onClick={() => handlePurgeItem("submission", sub.id)}
                            className="px-3 py-2 rounded-lg bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 text-red-400 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>영구삭제</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trashed POs */}
              {trashData.pos.length > 0 && (
                <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center space-x-2.5">
                    <ShoppingCart className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold text-white font-sans">삭제된 견적·발주서 (PO) ({trashData.pos.length})</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {trashData.pos.map((po: any) => (
                      <div key={po.order_id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition">
                        <div className="text-xs font-sans">
                          <span className="text-white font-medium">{po.customer_name || "미지정"}</span>
                          <span className="text-neutral-500 ml-2">({po.item_category || "품목 미정"})</span>
                          <span className="block text-[10px] text-neutral-500 mt-1">삭제일: {po.deleted_at ? new Date(po.deleted_at).toLocaleString() : "—"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRestoreItem("po", po.order_id)}
                            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>복원</span>
                          </button>
                          <button
                            onClick={() => handlePurgeItem("po", po.order_id)}
                            className="px-3 py-2 rounded-lg bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 text-red-400 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>영구삭제</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}

      {activeMainTab === "adminManagement" && currentAdmin?.role === "master" ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-xl font-light text-white font-sans">
                콘솔 관리자 계정 승인
              </h2>
              <p className="text-xs text-neutral-400 font-light font-sans mt-1">
                제작소 콘솔 서버에 접근 가능한 서브 어드민들을 관리합니다.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-text">
            
            {/* List of Registered Admin Accounts (7 cols) */}
            <div className="lg:col-span-7 bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-medium text-white tracking-tight">등록된 보안 관리진 명부</h2>
                <p className="text-xs text-neutral-400 mt-1">시스템 권한을 가진 어드민 계정 목록입니다. 마스터 외 서브 계정은 추가 취소할 수 있습니다.</p>
              </div>
              
              <div className="overflow-x-auto">
                {adminsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3.5">
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    <span className="text-xs text-neutral-500 font-sans font-medium">관리자 계정 매니페스트 동기화 중...</span>
                  </div>
                ) : allAdmins.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-500 font-sans">
                    등록된 부관리자 정보가 존재하지 않습니다.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-950 border-b border-white/5 font-sans text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                        <th className="py-3.5 px-6">관리자 이름</th>
                        <th className="py-3.5 px-6">이메일 주소</th>
                        <th className="py-3.5 px-6">등급</th>
                        <th className="py-3.5 px-6 text-right">관리 작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-sans">
                      {allAdmins.map((acc) => (
                        <tr key={acc.email} className="hover:bg-white/[0.01]">
                          <td className="py-4 px-6 text-white font-medium">{acc.name}</td>
                          <td className="py-4 px-6 font-sans text-neutral-300">{acc.email}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-sans tracking-wide uppercase font-semibold ${
                              acc.role === "master" ? "bg-white/10 text-white border border-white/20" : "bg-neutral-800 text-neutral-400"
                            }`}>
                              {acc.role === "master" ? "최상위 마스터" : "일반 서브 어드민"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {acc.email.toLowerCase() !== "lgi12@naver.com" ? (
                              <button
                                onClick={() => handleDeleteAdmin(acc.email)}
                                className="text-neutral-500 hover:text-red-450 hover:bg-red-950/20 p-2 rounded-xl border border-transparent hover:border-red-500/20 transition cursor-pointer"
                                title="관리자 계정 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-neutral-600 font-sans italic mr-2 select-none">삭제 방지 보호됨</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div className="bg-neutral-950 py-3.5 px-6 border-t border-white/5 text-[10px] font-sans font-medium text-neutral-500 tracking-wider">
                총 {allAdmins.length}개의 가동 관리 권한 등급 프로필이 로컬 노드에 승인되어 기재되었습니다.
              </div>
            </div>

            {/* Create New Administrator Account Form (5 cols) */}
            <div className="lg:col-span-12 xl:col-span-5 bg-neutral-900 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden h-fit">
              <div className="absolute top-0 left-0 right-0 h-1 bg-white"></div>
              
              <div className="space-y-1 mb-6">
                <h2 className="text-lg font-medium text-white tracking-tight">신규 서브 관리자 추가 및 발급</h2>
                <p className="text-xs text-neutral-400 leading-relaxed font-light mt-1">
                  추가적인 제작소 보조 계정을 승인 및 생성합니다. 인증 기밀 자격 증명이 주어지며, 실시간 고객 신청 데이터에 접근이 동기화됩니다.
                </p>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    실명 / 담당자 명칭
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="예: 어시스턴트 테일러"
                    className="w-full bg-neutral-950/80 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-neutral-750 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/10 transition-all font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block font-sans">
                    로그인 이메일 주소
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="예: staff123@naver.com"
                    className="w-full bg-neutral-950/80 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-neutral-750 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/10 transition-all font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block font-sans">
                    배정 비밀번호 입력
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="문자 및 숫자 포함 권장"
                    className="w-full bg-neutral-950/80 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-neutral-750 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/10 transition-all font-sans"
                  />
                </div>

                {adminSuccessMsg && (
                  <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-xl py-2.5 px-3 flex items-center space-x-2 font-sans">
                    <span>{adminSuccessMsg}</span>
                  </div>
                )}

                {adminErrorMsg && (
                  <div className="bg-red-950/20 border border-red-500/20 text-red-400 text-[11px] rounded-xl py-2.5 px-3 flex items-center space-x-2 font-sans">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>{adminErrorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold py-3 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center mt-2 font-sans"
                >
                  관리자 권한 배정 및 계정 발급
                </button>
              </form>
            </div>

          </div>
        </>
      ) : null}

      {activeMainTab === "pageEdit" ? (
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center mb-4">
             <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-light text-white tracking-tight mb-2">페이지 디자인 편집기</h2>
          <p className="text-sm text-neutral-400 font-light max-w-sm">
            온라인 스토어의 테마, 색상 및 레이아웃을 수정할 수 있는 비주얼 편집 도구가 준비 중입니다. 차기 업데이트 시 배포됩니다.
          </p>
        </div>
      ) : null}

      </main>
    </div>
  );
}
