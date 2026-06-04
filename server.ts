import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import fs from "fs/promises";
import { existsSync } from "fs";

// Lazy initialize Gemini client to prevent crash if not configured
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const SUBMISSIONS_FILE = path.join(process.cwd(), "submissions.json");
const ADMINS_FILE = path.join(process.cwd(), "admins.json");

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

async function readSubmissions(): Promise<SubmissionItem[]> {
  try {
    if (!existsSync(SUBMISSIONS_FILE)) {
      return [];
    }
    const data = await fs.readFile(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading submissions:", error);
    return [];
  }
}

async function writeSubmissions(submissions: SubmissionItem[]) {
  try {
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing submissions:", error);
  }
}

async function readAdmins(): Promise<AdminAccount[]> {
  try {
    if (!existsSync(ADMINS_FILE)) {
      await fs.writeFile(ADMINS_FILE, JSON.stringify([MASTER_ADMIN], null, 2), "utf-8");
      return [MASTER_ADMIN];
    }
    const data = await fs.readFile(ADMINS_FILE, "utf-8");
    const parsed: AdminAccount[] = JSON.parse(data || "[]");
    // Always ensure the master account exists in the list
    if (!parsed.some(acc => acc.email === MASTER_ADMIN.email)) {
      parsed.unshift(MASTER_ADMIN);
      await fs.writeFile(ADMINS_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (error) {
    console.error("Error reading admins:", error);
    return [MASTER_ADMIN];
  }
}

async function writeAdmins(admins: AdminAccount[]) {
  try {
    await fs.writeFile(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing admins:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

      const newAdmin: AdminAccount = {
        email: email.trim(),
        password,
        name: name.trim(),
        role: role === "master" ? "master" : "admin",
        createdAt: new Date().toISOString(),
      };

      list.push(newAdmin);
      await writeAdmins(list);
      res.status(201).json({ success: true, admin: { email: newAdmin.email, name: newAdmin.name, role: newAdmin.role } });
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

      const list = await readAdmins();
      const filtered = list.filter((acc) => acc.email.toLowerCase() !== email.toLowerCase());
      await writeAdmins(filtered);
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

      const list = await readSubmissions();
      const newItem: SubmissionItem = {
        id: item.id || `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: item.type,
        email: item.email,
        fullName: item.fullName,
        finish: item.finish,
        size: item.size,
        country: item.country || "Unknown",
        shippingOption: item.shippingOption,
        createdAt: item.createdAt || new Date().toISOString(),
      };

      list.unshift(newItem); // store newest submissions first
      await writeSubmissions(list);
      res.status(201).json(newItem);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to delete a specific submission
  app.post("/api/submissions/delete", async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Submission ID is required" });
      }
      const list = await readSubmissions();
      const filtered = list.filter((i) => i.id !== id);
      await writeSubmissions(filtered);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API to clear all submissions in database
  app.post("/api/submissions/clear", async (req, res) => {
    try {
      await writeSubmissions([]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Route for AI Chat regarding Korean Apparel Manufacturing
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const client = getGeminiClient();

      // Structure conversation history for @google/genai SDK
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          });
        }
      }

      // Add target user query
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const systemInstruction = 
        "You are 'Korea Apparel Works Director AI', a world-class premium apparel manufacturing advisor based in South Korea.\n\n" +
        "We are proud of South Korea's 30-year veteran master tailors, premium fabric sourcing (including Dongdaemun and Daegu technical eco-knits), and high-quality local low-MOQ factories specialized in luxury golfwear, elegant activewear, and streetwear.\n\n" +
        "Explain to the client how South Korea's manufacturing ecosystem provides pristine quality, quick sample-to-production turnaround, strict ethical labor standards, and flexible low-MOQ (Minimum Order Quantities like 30-50 pieces) compared to mass-market countries.\n\n" +
        "Style rules:\n" +
        "- Maintain a sophisticated, premium, welcoming, and professional B2B advisor persona.\n" +
        "- Provide well-structured, clear Markdown responses with readable bullet points and short paragraphs.\n" +
        "- Do not make up fake prices or addresses, but provide actual workflow steps (Sinking fabric selection -> 3D mockup / pattern -> premium Korean sample -> production & strict inspection -> international express door-to-door delivery).\n" +
        "- Keep responses reasonably brief, engaging, and highly informative.";

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I was unable to generate a response. Please try again.";
      res.json({ text: replyText });
    } catch (error: any) {
      console.error("Gemini API Error in /api/chat: ", error);
      res.status(500).json({ 
        error: "Failed to communicate with AI.",
        details: error.message || error 
      });
    }
  });

  // Vite middleware setup for development, falling back to static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
