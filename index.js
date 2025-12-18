import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

/* ===============================
   ES MODULE FIX
================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===============================
   APP & MIDDLEWARE
================================ */
const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "Public")));

/* ===============================
   ENV CHECK
================================ */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY tidak ditemukan di .env");
  process.exit(1);
}

/* ===============================
   GEMINI INIT
================================ */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const GEMINI_MODEL = "gemini-2.5-flash";

/* ===============================
   SERVER CONFIG
================================ */
const PORT = process.env.PORT || 3000;

/* ===============================
   GLOBAL CHAT MEMORY
   (bisa kamu upgrade ke Redis / DB)
================================ */
let conversationHistory = [];

/* ===============================
   HELPER: EXTRACT TEXT
================================ */
function extractText(resp) {
  try {
    return (
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Tidak ada teks balasan."
    );
  } catch (err) {
    console.error("Extract Error:", err);
    return "❌ Error extracting response";
  }
}

/* ===============================
   CHAT TEXT ONLY
================================ */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    conversationHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: conversationHistory
    });

    const replyText = extractText(resp);

    conversationHistory.push({
      role: "model",
      parts: [{ text: replyText }]
    });

    res.json({ result: replyText });

  } catch (err) {
    console.error("❌ CHAT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   CHAT + FILE (IMAGE / DOC / AUDIO / VIDEO)
================================ */
app.post(
  "/api/chat-with-file",
  upload.single("file"),
  async (req, res) => {
    try {
      const { message } = req.body;
      const file = req.file;

      if (!message && !file) {
        return res.status(400).json({
          error: "Message or file is required"
        });
      }

      const parts = [];

      // Text prompt
      if (message) {
        parts.push({ text: message });
      }

      // File part
      if (file) {
        parts.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString("base64")
          }
        });
      }

      // Save user message
      conversationHistory.push({
        role: "user",
        parts
      });

      const resp = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: conversationHistory
      });

      const replyText = extractText(resp);

      conversationHistory.push({
        role: "model",
        parts: [{ text: replyText }]
      });

      res.json({ result: replyText });

    } catch (err) {
      console.error("❌ FILE CHAT ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ===============================
   RESET CHAT MEMORY
================================ */
app.post("/api/reset", (req, res) => {
  conversationHistory = [];
  res.json({ status: "✅ Conversation cleared" });
});

/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Fasya AI running at http://localhost:${PORT}`);
});
