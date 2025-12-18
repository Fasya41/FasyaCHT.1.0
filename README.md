# FasyaCHT 🤖

FasyaCHT.1.0 adalah **Simple Chatbot Backend API** berbasis **Node.js, Express, dan Google Gemini LLM API**. Project ini menyediakan endpoint untuk melakukan percakapan dengan model Gemini serta menyimpan konteks percakapan (conversation memory) secara sementara.

Project ini cocok digunakan sebagai:
- Backend chatbot (Web / Mobile)
- Contoh integrasi Google Gemini LLM API
- Dasar pengembangan AI Assistant
- Project pembelajaran & portfolio

---

## 🧱 Teknologi yang Digunakan
- Node.js (ES Module)
- Express.js
- Google Gemini API (`@google/genai`)
- dotenv
- CORS
- Nodemon

---

## ⚙️ Prasyarat
- Node.js (disarankan versi LTS ≥ 18)
- npm
- Google Gemini API Key (https://ai.google.dev/)

---

## 🚀 Cara Menjalankan Project

### Clone Repository
git clone https://github.com/Fasya41/FasyaCHT.1.0.git  
cd FasyaCHT.1.0

### Install Dependencies
npm install

### Konfigurasi Environment Variable
Project ini **tidak menyertakan file `.env`** demi keamanan.

Buat file `.env` berdasarkan `.env.example`:
cp .env.example .env

Isi file `.env`:
GEMINI_API_KEY=YOUR_GEMINI_API_KEY  
PORT=3000

### Jalankan Server
Production:
npm start

Development:
npm run dev

Jika berhasil:
Server running at http://localhost:3000

---

## 🔌 Endpoint API

### Chat dengan Gemini
POST /api/chat

Request Body:
{
  "message": "Halo, apa itu AI?"
}

Response:
{
  "reply": "AI adalah kecerdasan buatan..."
}

### Reset Memory Percakapan
POST /api/reset

Response:
{
  "status": "conversation cleared"
}

---

## 🛠️ Konfigurasi Tambahan

### Model Gemini
Model dapat diubah di file index.js:
model: "gemini-1.5-flash"

Model lain:
- gemini-1.5-pro
- gemini-1.0-pro

### Memory Percakapan
Memory disimpan sementara menggunakan variabel:
let conversationHistory = [];

Catatan:
- Memory akan hilang saat server restart
- Untuk production disarankan menggunakan Redis atau MongoDB

### CORS
Default:
app.use(cors());

Atau dibatasi:
app.use(cors({ origin: "http://localhost:5173" }));

---

## 📂 Struktur Folder
FasyaCHT.1.0/
│── index.js
│── package.json
│── .env.example
│── public/
│── README.md
└── node_modules/ (tidak diupload ke GitHub)

---

## 📌 Catatan Penting
- Project ini backend only
- Tidak menggunakan autentikasi user
- Cocok untuk prototype dan pembelajaran
- Free tier Gemini API memiliki batas kuota request

---

## 📄 Lisensi
MIT License
