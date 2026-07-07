import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import hpp from "hpp";

const upload = multer({ storage: multer.memoryStorage() });

// Load .env.local
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env if needed

// Initialize Supabase Client (use service role key on server to bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── Telegram Notification Helper ───────────────────────────────
// TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID 미설정 시 조용히 무시됩니다.
function escapeHtml(str: string): string {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (err) {
    console.error("Telegram notification failed:", err);
  }
}

// Lazy initialize Gemini client to prevent crash if not configured
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
    });
  }
  return aiClient;
}

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

interface AdminAccount {
  email: string;
  password?: string;
  name: string;
  role: "master" | "admin";
  createdAt: string;
}

const MASTER_ADMIN: AdminAccount = {
  email: "lgi12@naver.com",
  password: "!rmsrjfl12",
  name: "Master Admin",
  role: "master",
  createdAt: new Date().toISOString(),
};

const SEOJUN_ADMIN: AdminAccount = {
  email: "sj0822js@gmail.com",
  password: "Guqdpa1002@",
  name: "Seojun",
  role: "master",
  createdAt: new Date().toISOString(),
};

async function readSubmissions(): Promise<SubmissionItem[]> {
  try {
    // 휴지통(soft delete)에 있는 항목 제외 — deleted_at 컬럼이 아직 없으면 전체 조회로 폴백
    let { data, error } = await supabase
      .from("submissions")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      ({ data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false }));
    }

    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      type: item.type as "quote" | "preorder",
      email: item.email,
      fullName: item.full_name,
      finish: item.finish,
      size: item.size,
      country: item.country,
      shippingOption: item.shipping_option,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error("Error reading submissions from Supabase:", error);
    return [];
  }
}

async function readAdmins(): Promise<AdminAccount[]> {
  try {
    const { data, error } = await supabase.from("admins").select("*");
    if (error) throw error;

    const list: AdminAccount[] = (data || []).map(item => ({
      email: item.email,
      password: item.password,
      name: item.name,
      role: item.role as "master" | "admin",
      createdAt: item.created_at,
    }));

    // Always ensure the master account exists in the database
    if (!list.some(acc => acc.email === MASTER_ADMIN.email)) {
      const masterRecord = {
        email: MASTER_ADMIN.email,
        password: MASTER_ADMIN.password,
        name: MASTER_ADMIN.name,
        role: MASTER_ADMIN.role,
        created_at: MASTER_ADMIN.createdAt
      };
      await supabase.from("admins").insert([masterRecord]);
      list.unshift(MASTER_ADMIN);
    }

    // Always ensure the Seojun admin account exists in the database
    if (!list.some(acc => acc.email === SEOJUN_ADMIN.email)) {
      const seojunRecord = {
        email: SEOJUN_ADMIN.email,
        password: SEOJUN_ADMIN.password,
        name: SEOJUN_ADMIN.name,
        role: SEOJUN_ADMIN.role,
        created_at: SEOJUN_ADMIN.createdAt
      };
      await supabase.from("admins").insert([seojunRecord]);
      list.push(SEOJUN_ADMIN);
    }

    return list;
  } catch (error) {
    console.error("Error reading admins from Supabase:", error);
    return [MASTER_ADMIN, SEOJUN_ADMIN];
  }
}

const app = express();

// Apply Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow Vite HMR and inline scripts to work properly in dev
  crossOriginEmbedderPolicy: false
}));

// Apply Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api/", limiter); // Apply to all API routes

  // Apply CORS
  app.use(cors());

  app.use(express.json());

  // Protect against HTTP Parameter Pollution attacks (must be after express.json)
  app.use(hpp());

  // API to retrieve all persistent submissions (Quotes & Pre-Orders) for the Admin Dashboard
  app.get("/api/submissions", async (req, res) => {
    try {
      const list = await readSubmissions();
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to authenticate administrative accounts
  app.post("/api/admins/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const list = await readAdmins();
      const match = list.find(
        (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
      );

      if (match) {
        res.json({
          success: true,
          admin: {
            email: match.email,
            name: match.name,
            role: match.role,
          },
        });
      } else {
        res.status(401).json({ error: "Invalid administrative credentials." });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to retrieve list of other admin accounts (excluding sensitive passwords)
  app.get("/api/admins", async (req, res) => {
    try {
      const list = await readAdmins();
      const sanitized = list.map((acc) => ({
        email: acc.email,
        name: acc.name,
        role: acc.role,
        createdAt: acc.createdAt,
      }));
      res.json(sanitized);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to register a new administrator account (By the Master admin)
  app.post("/api/admins/create", async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required admin account fields" });
      }

      const list = await readAdmins();
      if (list.some((acc) => acc.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: "An administrator account with this email already exists" });
      }

      const newAdminRecord = {
        email: email.trim(),
        password,
        name: name.trim(),
        role: role === "master" ? "master" : "admin",
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("admins").insert([newAdminRecord]);
      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        admin: { email: newAdminRecord.email, name: newAdminRecord.name, role: newAdminRecord.role } 
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to delete a secondary administrator account
  app.post("/api/admins/delete", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      if (email.toLowerCase() === "lgi12@naver.com") {
        return res.status(403).json({ error: "The primary master administrator account cannot be deleted." });
      }

      const { error } = await supabase.from("admins").delete().eq("email", email);
      if (error) throw error;

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to append a new submission (either a quote request or a pre-order reservation)
  app.post("/api/submissions", async (req, res) => {
    try {
      const item = req.body;
      if (!item.email || !item.type) {
        return res.status(400).json({ error: "Missing required fields: email and type" });
      }

      const newItemRecord = {
        id: item.id || `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: item.type,
        email: item.email,
        full_name: item.fullName,
        finish: item.finish,
        size: item.size,
        country: item.country || "Unknown",
        shipping_option: item.shippingOption,
        created_at: item.createdAt || new Date().toISOString(),
      };

      const { error } = await supabase.from("submissions").insert([newItemRecord]);
      if (error) throw error;

      // 텔레그램 알림 (비동기, 실패해도 접수는 정상 처리)
      const typeLabel = newItemRecord.type === "quote" ? "1:1 견적 요청" : "사전 예약";
      sendTelegram(
        `📨 <b>새 ${typeLabel} 접수</b>\n\n` +
        `이메일: ${escapeHtml(newItemRecord.email)}\n` +
        (newItemRecord.full_name ? `고객명: ${escapeHtml(newItemRecord.full_name)}\n` : "") +
        `국가: ${escapeHtml(newItemRecord.country)}\n` +
        `접수 ID: ${escapeHtml(newItemRecord.id)}`
      );

      res.status(201).json({
        id: newItemRecord.id,
        type: newItemRecord.type as "quote" | "preorder",
        email: newItemRecord.email,
        fullName: newItemRecord.full_name,
        finish: newItemRecord.finish,
        size: newItemRecord.size,
        country: newItemRecord.country,
        shippingOption: newItemRecord.shipping_option,
        createdAt: newItemRecord.created_at,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to upload files to Supabase Storage bypassing RLS
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const { folderName, fileName } = req.body;
      if (!folderName || !fileName) {
        return res.status(400).json({ error: "Missing folderName or fileName" });
      }

      // Use the server's Supabase client (which has SERVICE_ROLE_KEY)
      const { data, error } = await supabase.storage
        .from('apparel_files')
        .upload(`${folderName}/${fileName}`, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('apparel_files')
        .getPublicUrl(`${folderName}/${fileName}`);

      res.json({ publicUrl: publicUrlData.publicUrl });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to move a specific submission to trash (soft delete)
  app.post("/api/submissions/delete", async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Submission ID is required" });
      }
      // 휴지통으로 이동 — deleted_at 컬럼이 없으면 기존처럼 완전 삭제로 폴백
      const { error } = await supabase
        .from("submissions")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        const { error: hardError } = await supabase.from("submissions").delete().eq("id", id);
        if (hardError) throw hardError;
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to move all submissions to trash
  app.post("/api/submissions/clear", async (req, res) => {
    try {
      const { error } = await supabase
        .from("submissions")
        .update({ deleted_at: new Date().toISOString() })
        .is("deleted_at", null);
      if (error) {
        const { error: hardError } = await supabase.from("submissions").delete().neq("id", "");
        if (hardError) throw hardError;
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to retrieve chat sessions for Admin
  app.get("/api/admin/chats", async (req, res) => {
    try {
      // Fetch sessions and their latest messages (휴지통 제외, 컬럼 없으면 폴백)
      let { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (sessionsError) {
        ({ data: sessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("*")
          .order("created_at", { ascending: false }));
      }

      if (sessionsError) throw sessionsError;
      sessions = sessions || [];

      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch user emails to attach to sessions
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      const userMap = new Map();
      if (!usersError && usersData?.users) {
        usersData.users.forEach((u: any) => userMap.set(u.id, u.email));
      }

      const enhancedSessions = sessions.map(session => {
        // In older versions, userId was mistakenly stored in visitor_id
        const actualUserId = session.user_id || (userMap.has(session.visitor_id) ? session.visitor_id : null);
        return {
          ...session,
          user_email: actualUserId ? userMap.get(actualUserId) : null
        };
      });

      res.json({ sessions: enhancedSessions, messages });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to retrieve POs for Admin (휴지통 제외, 컬럼 없으면 폴백)
  app.get("/api/admin/pos", async (req, res) => {
    try {
      let { data: pos, error } = await supabase
        .from("apparel_orders")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        ({ data: pos, error } = await supabase
          .from("apparel_orders")
          .select("*")
          .order("created_at", { ascending: false }));
      }

      if (error) throw error;
      res.json(pos || []);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Route for AI Chat regarding Korean Apparel Manufacturing
  app.post("/api/chat", async (req, res) => {
    try {
      const { sessionId, userId, userEmail, message, imageUrl, history } = req.body;
      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId are required" });
      }

      // Ensure session exists
      const { data: existingSession } = await supabase
        .from("sessions")
        .select("session_id")
        .eq("session_id", sessionId)
        .single();
      
      if (!existingSession) {
        await supabase.from("sessions").insert([{
          session_id: sessionId,
          visitor_id: "guest",
          user_id: userId || null
        }]);

        // 새 고객이 채팅으로 연락 시작 → 텔레그램 알림
        const preview = String(message).replace(/\[Image Attached:[^\]]*\]/g, "[이미지 첨부]").slice(0, 300);
        sendTelegram(
          `💬 <b>새 채팅 문의가 시작되었습니다</b>\n\n` +
          (userEmail ? `고객: ${escapeHtml(userEmail)}\n` : `고객: 비로그인 방문자\n`) +
          `첫 메시지: ${escapeHtml(preview)}\n` +
          `세션: ${escapeHtml(String(sessionId).substring(0, 8))}`
        );
      } else if (userId) {
        await supabase.from("sessions").update({ user_id: userId }).eq("session_id", sessionId);
      }

      // Save user message
      await supabase.from("messages").insert([{
        session_id: sessionId,
        sender_role: "user",
        content: message
      }]);

      const client = getGeminiClient();

      // Structure conversation history for @google/genai SDK
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          });
        }
      }

      // Add target user query
      const userParts: any[] = [{ text: message }];

      if (imageUrl) {
        try {
          const imgRes = await fetch(imageUrl);
          const arrayBuffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
          
          userParts.push({
            inlineData: {
              data: base64,
              mimeType
            }
          });
        } catch (err) {
          console.error("Failed to fetch image for Gemini:", err);
        }
      }

      contents.push({
        role: 'user',
        parts: userParts
      });

      const systemInstruction = 
        "[System Instructions] K-Fashion 플랫폼 리드 수집 챗봇\n\n" +
        "당신은 한국의 부산에 위치한 30년 한국 전통의 프리미엄 의류 제조 공장(Korea Apparel Works)의 글로벌 소싱 어시스턴트인 'Mark'입니다.\n" +
        "부산(한국 섬유 산업의 허브이자 대형 항만 물류 중심지) 스토리는 첫인사에서 언급하지 마세요. 원단을 논의할 때나 생산/배송 관련 질문이 나올 때, 신뢰를 더하는 한 문장으로만 자연스럽게 언급하세요.\n\n" +
        "[당신의 유일한 최종 목표]\n" +
        "웹사이트에 방문한 해외 바이어(주로 미국, 동남아 신진 브랜드 창업자)와 짧고 친절하게 대화하여, " +
        "그들이 만들고 싶어 하는 옷의 1) 종류, 2) 원단 촉감, 3) 수량을 파악한 뒤, 최종적으로 견적서를 보내기 위한 4) '이메일 주소'를 수집하는 것입니다.\n\n" +
        "[절대 지켜야 할 핵심 규칙]\n" +
        "- 짧고 명확하게: 한 번에 하나의 질문만 하세요. 절대 길게 설명하지 마세요. (최대 2~3문장 이내)\n" +
        "- 가격 확답 금지: 바이어가 정확한 가격을 물어보면, '수량과 원단에 따라 다르므로, 생산 총괄 디렉터가 이메일로 정확한 견적을 보내드립니다.'라고 안내하며 이메일을 요구하세요.\n" +
        "- 타겟 품목 유도: 우리의 주력 품목은 '상의(티셔츠, 맨투맨, 후디, 카라티 등)와 스포츠웨어'입니다. 바이어가 너무 복잡한 드레스나 아우터를 요구하면, '저희는 상의와 스포츠웨어의 소량 생산에 가장 특화되어 있습니다.'라고 안내하세요.\n" +
        "- 과한 칭찬 금지: 'Great choice!', 'Excellent!' 같은 과장된 칭찬이나 아부성 표현을 남발하지 마세요. 꼭 필요한 경우 절제된 긍정 표현 한 번이면 충분합니다. 차분하고 신뢰감 있는 전문가 톤을 유지하세요.\n" +
        "- 언어: 사용자가 질문하는 언어(영어, 한국어, 태국어 등)에 맞춰서 자연스럽게 대답하되, 어조는 매우 전문적이고 친절하며 환영하는 태도여야 합니다.\n\n" +
        "[대화 시나리오 흐름 (이 순서를 반드시 따르세요)]\n\n" +
        "Step 1. 환영 + 가치 제안 + 품목/사진 유도\n" +
        "사용자가 먼저 말을 걸면: ① 한 문장으로 본인('Mark from Korea Apparel Works')과 특화 분야(상의·스포츠웨어)를 소개하고, ② 핵심 가치(샘플 1장부터 제작, 24시간 내 견적)를 전달한 뒤, ③ 만들고 싶은 품목을 물으면서 '참고할 디자인 사진이 있으면 지금 바로 올려달라'고 명시적으로 유도하세요. 부산/공장 입지 소개는 이 단계에서 하지 마세요.\n" +
        "(예: 'Hello, I\\'m Mark from Korea Apparel Works — we specialize in premium tops and sportswear, with samples from just 1 pc and quotes within 24 hours. What are you looking to produce? If you have a design photo, just upload it here and I\\'ll take it from there.')\n\n" +
        "Step 2. 원단 '촉감' 파악\n" +
        "품목을 대답하면, 어떤 원단 느낌을 원하는지 묻습니다. 과한 칭찬 없이 바로 본론으로, 전문 용어 대신 일상적인 단어를 사용하세요.\n" +
        "(예: 'For the fabric, what kind of feel are you looking for? (e.g., Soft & lightweight, Heavy & sturdy, or Moisture-wicking stretchy?)')\n\n" +
        "Step 3. 수량(MOQ) 파악\n" +
        "원단을 대답하면, 생각하는 총 생산 수량을 묻습니다. 샘플은 1장부터 가능하고, 벌크(대량생산) MOQ는 50장부터라는 점을 안내하세요.\n" +
        "(예: 'We have suitable premium fabrics for that in our Busan factory. Roughly how many pieces are you planning to produce? (Samples start from 1 pc, and bulk MOQs from 50 pcs.)')\n\n" +
        "Step 4. 작업지시서\n" +
        "주문하실 품목의 작업지시서(Tech Pack)가 있는지 물어봐야 합니다.\n\n" +
        "Step 5. 샘플이미지\n" +
        "참고할만한 샘플이미지가 있는지 물어봐야 합니다. 단, 고객이 앞 단계에서 이미 사진을 올렸다면 이 단계는 건너뛰세요.\n\n" +
        "Step 6. 추가 요청사항 확인\n" +
        "추가로 문의를 남기실 내용이 있는지, 디자인/포장 등 기타 특이사항이 더 있는지 질문합니다.\n" +
        "이 단계에서는 절대로 이메일이나 성함을 먼저 묻지 말고, 오직 추가 요청사항이 있는지만 확인하세요.\n\n" +
        "Step 7. 최종 요약 및 연락처 수집\n" +
        "고객이 더 이상 추가 요청사항이 없다고 대답하면, 지금까지 파악한 내용(품목, 원단, 수량, 기타 요청사항 등)을 한 번에 정리해서 보여주며 내용이 맞는지 확인합니다.\n" +
        "요약 내용이 맞다고 하면, 최종 견적 안내를 위해 연락처 정보(기업명/성함 및 이메일/전화번호)를 수집해야 합니다.\n" +
        (userEmail 
          ? "이때, '현재 가입하신 이메일 주소(" + userEmail + ")로 견적서를 보내드려도 될까요? 다른 연락처(전화번호, 메신저 등)를 추가로 원하시면 함께 알려주세요.' 라고 물어보세요.\n" 
          : "이때, '정확한 견적서 발송을 위해 연락 받으실 이메일 주소와 기업명(또는 성함)을 남겨주시겠습니까?' 라고 정중하게 요구하세요.\n"
        ) +
        "고객이 연락처 확인 및 확정을 마치면 진심을 담아 감사하다고 하고, 1영업일 이내로 생산 총괄 디렉터가 상세 견적을 보내드릴 예정이라고 안내하며 대화를 마무리합니다.\n\n" +
        "[마무리 시 JSON 출력 규칙]\n" +
        "대화가 완전히 마무리되면(고객이 이메일을 남기고 상담이 종료될 때), 메시지의 맨 끝에 아래 형식의 JSON 블록을 반드시 추가하세요:\n" +
        "- CRITICAL: JSON의 모든 항목 값(value)은 고객이 외국어로 답변했더라도, 한국 공장 생산팀이 바로 읽을 수 있도록 반드시 '한국어'로 번역하여 작성해야 합니다. (예: 'Cotton 100%' -> '면 100%')\n" +
        "```json\n" +
        "{\n" +
        "  \"po_type\": \"PO_SUBMISSION\",\n" +
        "  \"customer_name\": \"...\",\n" +
        "  \"item_category\": \"...\",\n" +
        "  \"fabric_preference\": \"...\",\n" +
        "  \"quantity\": \"...\",\n" +
        "  \"has_tech_pack\": \"...\",\n" +
        "  \"sample_image_urls\": \"...\",\n" +
        "  \"additional_requests\": \"Provide a concise, bullet-point summary of all other requests, design details, fit, and important context in KOREAN. Do NOT just dump the raw chat log.\"\n" +
        "}\n" +
        "```\n\n" +
        "[상세 상담 및 예외 상황 대처법]\n" +
        "- 샘플 이미지/디자인 요구: 바이어가 샘플 이미지를 업로드하거나 디자인을 설명하면, 단순히 알겠다고 넘어가지 마세요. AI의 전문적인 판단하에 해당 디자인을 공장에서 구현하기 위해 추가로 꼭 확인해야 할 정보(예: 인쇄/자수 방식, 핏, 특수 부자재, 라벨링 등)가 있다면 주도적으로 후속 질문을 던져 최대한 디테일을 이끌어내야 합니다.\n" +
        "- 바이어가 의류 제조와 관련된 상세한 질문이나 요구사항을 말하면: 정해진 질문 순서(Step)에서 잠시 벗어나더라도 유연하게 대화를 이어가며, 바이어가 원하는 바를 상세히 모두 듣고 긍정적으로 상담해 주세요.\n" +
        "- 바이어가 의류 제조와 상관없는 질문을 하면: '저는 의류 생산을 돕는 어시스턴트입니다. 의류 제작에 관해 무엇이든 물어보세요!'라고 원래 대화로 끌고 옵니다.\n" +
        "- 바이어가 처음부터 '다짜고짜 티셔츠 100장 견적 줘'라고 하면: 유연하게 Step 1~3을 건너뛰세요.\n\n" +
        "Style rules:\n" +
        "- CRITICAL: Always respond in the SAME LANGUAGE the user writes in. Match their language exactly.\n" +
        "- Keep responses SHORT (2-3 sentences max per turn).\n" +
        "- Maintain a sophisticated, premium, welcoming, and professional B2B advisor persona.\n" +
        "- Do NOT overuse compliments, flattery, or exclamation marks. Stay calm, measured, and professional — one restrained positive remark is enough when genuinely warranted.";

      const response = await client.models.generateContent({
        // NOTE: gemini-3.1-flash-lite is the latest model. It does NOT appear in ListModels API results, but it IS a valid model. Do NOT change this.
        model: "gemini-3.1-flash-lite",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.6,
        }
      });

      let replyText = response.text || "I was unable to generate a response. Please try again.";

      // Extract JSON if present
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = replyText.match(jsonRegex);
      
      if (match) {
        try {
          const poData = JSON.parse(match[1]);
          if (poData.po_type === "PO_SUBMISSION") {
            // Remove the JSON block from the reply sent to the user
            replyText = replyText.replace(match[0], "").trim();

            // Build comprehensive manufacturing_specs from new fields
            const specParts = [];
            if (poData.fabric_preference && poData.fabric_preference !== '...') specParts.push(`원단: ${poData.fabric_preference}`);
            if (poData.quantity && poData.quantity !== '...') specParts.push(`수량: ${poData.quantity}`);
            if (poData.has_tech_pack && poData.has_tech_pack !== '...') specParts.push(`테크팩: ${poData.has_tech_pack}`);
            const fullSpecs = specParts.length > 0 ? specParts.join(' | ') : (poData.manufacturing_specs || "미정");

            const poPayload = {
              session_id: sessionId,
              customer_name: poData.customer_name || "Unknown",
              style_no: poData.style_no || null,
              item_category: poData.item_category || "미정",
              product_name: poData.product_name || null,
              manufacturing_specs: fullSpecs,
              sample_image_urls: poData.sample_image_urls,
              additional_requests: poData.additional_requests && poData.additional_requests !== '...' ? poData.additional_requests : "없음"
            };

            // Check if PO exists for this session to prevent duplicates
            const { data: existingPo } = await supabase
              .from("apparel_orders")
              .select("order_id")
              .eq("session_id", sessionId)
              .maybeSingle();

            if (existingPo) {
              await supabase.from("apparel_orders").update(poPayload).eq("order_id", existingPo.order_id);
            } else {
              await supabase.from("apparel_orders").insert([poPayload]);
            }

            // 견적(발주서) 접수 → 텔레그램 알림
            sendTelegram(
              `📋 <b>${existingPo ? "견적(발주서) 업데이트" : "새 견적(발주서) 접수"}</b>\n\n` +
              `고객명: ${escapeHtml(poPayload.customer_name)}\n` +
              `품목: ${escapeHtml(poPayload.item_category)}\n` +
              `스펙: ${escapeHtml(poPayload.manufacturing_specs)}\n` +
              `요청사항: ${escapeHtml(String(poPayload.additional_requests).slice(0, 500))}\n` +
              (userEmail ? `가입 이메일: ${escapeHtml(userEmail)}\n` : "") +
              `세션: ${escapeHtml(String(sessionId).substring(0, 8))}`
            );
          }
        } catch (err) {
          console.error("Failed to parse PO JSON:", err);
        }
      }

      // Save model message
      await supabase.from("messages").insert([{
        session_id: sessionId,
        sender_role: "model",
        content: replyText
      }]);

      res.json({ text: replyText });
    } catch (error: any) {
      console.error("Gemini API Error in /api/chat: ", error);
      res.status(500).json({ 
        error: "Failed to communicate with AI.",
        details: error.message || error 
      });
    }
  });

  // GDPR: Export User Data
  app.get("/api/user/data", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      const { data: sessions } = await supabase.from("sessions").select("*").eq("visitor_id", userId);
      const sessionIds = sessions?.map(s => s.session_id) || [];
      
      let messages = [];
      let pos = [];
      
      if (sessionIds.length > 0) {
        const { data: m } = await supabase.from("messages").select("*").in("session_id", sessionIds);
        messages = m || [];
        
        const { data: p } = await supabase.from("apparel_orders").select("*").in("session_id", sessionIds);
        pos = p || [];
      }

      res.json({ sessions, messages, pos });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GDPR: Delete User Account
  app.post("/api/user/delete", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      // Note: In Supabase, deleting a user using auth.admin requires a service_role key.
      // Since this is a public client, we normally cannot hard-delete the Auth user from here without a secure edge function or service key.
      // We will delete the related app data and assume auth deletion is handled via Supabase Dashboard or an Edge Function.
      
      const { data: sessions } = await supabase.from("sessions").select("session_id").eq("visitor_id", userId);
      const sessionIds = sessions?.map(s => s.session_id) || [];

      if (sessionIds.length > 0) {
        await supabase.from("messages").delete().in("session_id", sessionIds);
        await supabase.from("apparel_orders").delete().in("session_id", sessionIds);
        await supabase.from("sessions").delete().in("session_id", sessionIds);
      }

      // Also clean up any auth user via admin API if NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is provided
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
        await adminSupabase.auth.admin.deleteUser(userId as string);
      }

      res.json({ success: true, message: "Data deleted." });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Page View Tracking ─────────────────────────────────────────
  app.post("/api/track-view", async (req, res) => {
    try {
      const { path: viewPath, visitorId } = req.body || {};
      const { error } = await supabase.from("page_views").insert([{
        path: typeof viewPath === "string" ? viewPath.slice(0, 200) : "/",
        visitor_id: typeof visitorId === "string" ? visitorId.slice(0, 64) : null,
      }]);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      // page_views 테이블이 아직 없어도 사이트 동작에 영향 없도록 조용히 처리
      res.json({ success: false });
    }
  });

  // ─── Admin Dashboard Stats (견적수, 조회수 등) ───────────────────
  app.get("/api/admin/stats", async (req, res) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const safeCount = async (query: any): Promise<number | null> => {
      try {
        const { count, error } = await query;
        if (error) return null;
        return count ?? 0;
      } catch {
        return null;
      }
    };

    const notDeletedCount = async (table: string) => {
      let c = await safeCount(supabase.from(table).select("*", { count: "exact", head: true }).is("deleted_at", null));
      if (c === null) {
        c = await safeCount(supabase.from(table).select("*", { count: "exact", head: true }));
      }
      return c;
    };

    const [totalViews, todayViews, uniqueVisitorsRaw, chatSessions, poCount, submissionCount] = await Promise.all([
      safeCount(supabase.from("page_views").select("*", { count: "exact", head: true })),
      safeCount(supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString())),
      (async () => {
        try {
          const { data, error } = await supabase.from("page_views").select("visitor_id");
          if (error) return null;
          return new Set((data || []).map((r: any) => r.visitor_id).filter(Boolean)).size;
        } catch { return null; }
      })(),
      notDeletedCount("sessions"),
      notDeletedCount("apparel_orders"),
      notDeletedCount("submissions"),
    ]);

    res.json({
      totalViews,           // null이면 page_views 테이블 미생성 상태
      todayViews,
      uniqueVisitors: uniqueVisitorsRaw,
      chatSessions,
      poCount,
      submissionCount,
    });
  });

  // ─── Chat Translation (Gemini) ──────────────────────────────────
  app.post("/api/translate", async (req, res) => {
    try {
      const { texts } = req.body;
      if (!Array.isArray(texts) || texts.length === 0 || texts.length > 200) {
        return res.status(400).json({ error: "texts must be a non-empty array (max 200)" });
      }

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        // NOTE: gemini-3.1-flash-lite is the latest model. It does NOT appear in ListModels API results, but it IS a valid model. Do NOT change this.
        model: "gemini-3.1-flash-lite",
        contents: [{ role: "user", parts: [{ text: JSON.stringify(texts) }] }],
        config: {
          systemInstruction:
            "You are a professional translator for a Korean apparel factory. " +
            "The input is a JSON array of chat messages in any language. " +
            "Translate each message into natural Korean. If a message is already Korean, return it unchanged. " +
            "Preserve line breaks and placeholders like [Image Attached: ...] or [이미지 첨부] as-is. " +
            "Return ONLY a valid JSON array of strings with the same length and order as the input. No commentary.",
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      let translations: string[];
      try {
        translations = JSON.parse(response.text || "[]");
      } catch {
        return res.status(500).json({ error: "Failed to parse translation response" });
      }
      if (!Array.isArray(translations) || translations.length !== texts.length) {
        return res.status(500).json({ error: "Translation response mismatch" });
      }

      res.json({ translations });
    } catch (e: any) {
      console.error("Translation error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Trash (휴지통) : 채팅 세션 / 문의 / 견적(PO) ────────────────
  const TRASH_TARGETS: Record<string, { table: string; key: string }> = {
    session: { table: "sessions", key: "session_id" },
    submission: { table: "submissions", key: "id" },
    po: { table: "apparel_orders", key: "order_id" },
  };

  // 휴지통 목록 조회
  app.get("/api/admin/trash", async (req, res) => {
    const fetchTrashed = async (table: string) => {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .not("deleted_at", "is", null)
          .order("deleted_at", { ascending: false });
        if (error) return [];
        return data || [];
      } catch { return []; }
    };

    const [sessions, submissions, pos] = await Promise.all([
      fetchTrashed("sessions"),
      fetchTrashed("submissions"),
      fetchTrashed("apparel_orders"),
    ]);

    res.json({ sessions, submissions, pos });
  });

  // 휴지통으로 이동 (소프트 삭제)
  app.post("/api/admin/trash", async (req, res) => {
    try {
      const { kind, id } = req.body;
      const target = TRASH_TARGETS[kind];
      if (!target || !id) return res.status(400).json({ error: "kind and id are required" });

      const { error } = await supabase
        .from(target.table)
        .update({ deleted_at: new Date().toISOString() })
        .eq(target.key, id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 휴지통에서 복원
  app.post("/api/admin/restore", async (req, res) => {
    try {
      const { kind, id } = req.body;
      const target = TRASH_TARGETS[kind];
      if (!target || !id) return res.status(400).json({ error: "kind and id are required" });

      const { error } = await supabase
        .from(target.table)
        .update({ deleted_at: null })
        .eq(target.key, id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 휴지통에서 영구 삭제 (id 지정 또는 all: true 로 전체 비우기)
  app.post("/api/admin/purge", async (req, res) => {
    try {
      const { kind, id, all } = req.body;

      const purgeSession = async (sessionId: string) => {
        await supabase.from("messages").delete().eq("session_id", sessionId);
        // PO가 이 세션을 참조 중이면 참조만 해제 (PO 자체는 유지)
        await supabase.from("apparel_orders").update({ session_id: null }).eq("session_id", sessionId);
        await supabase.from("sessions").delete().eq("session_id", sessionId);
      };

      if (all === true) {
        // 휴지통 전체 비우기
        const { data: trashedSessions } = await supabase
          .from("sessions").select("session_id").not("deleted_at", "is", null);
        for (const s of trashedSessions || []) {
          await purgeSession(s.session_id);
        }
        await supabase.from("submissions").delete().not("deleted_at", "is", null);
        await supabase.from("apparel_orders").delete().not("deleted_at", "is", null);
        return res.json({ success: true });
      }

      const target = TRASH_TARGETS[kind];
      if (!target || !id) return res.status(400).json({ error: "kind and id are required" });

      if (kind === "session") {
        await purgeSession(id);
      } else {
        const { error } = await supabase.from(target.table).delete().eq(target.key, id);
        if (error) throw error;
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

export default app;
