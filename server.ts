import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
