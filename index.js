import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// ES Module fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- CHECK API KEY ---
if (!process.env.GEMINI_API_KEY) {
  console.log("❌ ERROR: GEMINI_API_KEY not found in .env");
  process.exit(1);
}

// Inisialisasi Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// MODEL Gemini yang benar
const GEMINI_MODEL = "gemini-2.5-flash";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "Public")));

const PORT = process.env.PORT || 3000;

// ========= 🧠 GLOBAL MEMORY =========
let conversationHistory = [];


// --- Helper: Ambil teks dari response ---
function extractText(resp) {
  try {
    return (
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response text found"
    );
  } catch (e) {
    return "Error extracting text";
  }
}


// ==============================
//   CHAT MODE (MEMORY ENABLED)
// ==============================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "message is required" });

    // Simpan pesan user ke history
    conversationHistory.push({ role: "user", parts: [{ text: message }] });

    // Kirim seluruh riwayat ke model
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: conversationHistory
    });

    const replyText = extractText(resp);

    // Simpan balasan ke history
    conversationHistory.push({ role: "model", parts: [{ text: replyText }] });

    res.json({ result: replyText });

  } catch (err) {
    console.error("❌ Backend Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
//   RESET MEMORY
// ==============================
app.post("/api/reset", (req, res) => {
  conversationHistory = [];
  res.json({ status: "conversation cleared" });
});


// ==============================
//   START SERVER
// ==============================
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
