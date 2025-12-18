const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

/* ================= DARK MODE ================= */
const toggleBtn = document.getElementById("themeToggle");
const html = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", savedTheme);
toggleBtn.textContent =
  savedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

toggleBtn.addEventListener("click", () => {
  const newTheme =
    html.getAttribute("data-theme") === "light" ? "dark" : "light";

  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  toggleBtn.textContent =
    newTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
});

/* ================= ATTACH MENU ================= */
const plusBtn = document.getElementById("plusBtn");
const attachMenu = document.getElementById("attachMenu");

plusBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  attachMenu.style.display =
    attachMenu.style.display === "flex" ? "none" : "flex";
});

document.addEventListener("click", () => {
  attachMenu.style.display = "none";
});

/* ================= API ================= */
const CHAT_API = "http://localhost:2508/api/chat";
const FILE_API = "http://localhost:2508/api/chat-with-file";

/* ================= CHAT ================= */
function appendMessage(sender, text, isHTML = false) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg[isHTML ? "innerHTML" : "textContent"] = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

/* ================= ATTACHMENT ================= */
const attachmentPreview = document.getElementById("file-preview");
let attachedFile = null;
let fileInputRef = null;

/* ambil SEMUA input file */
document
  .querySelectorAll(".attach-menu input[type='file']")
  .forEach(input => {
    input.addEventListener("change", () => {
      if (!input.files.length) return;

      fileInputRef = input;          // simpan referensi input
      attachedFile = input.files[0];
      showAttachment(attachedFile);
    });
  });

function showAttachment(file) {
  attachmentPreview.innerHTML = "";

  const chip = document.createElement("div");
  chip.className = "file-chip";

  const typeLabel = file.type.startsWith("image")
    ? "Image"
    : file.type.startsWith("audio")
    ? "Audio"
    : file.type.startsWith("video")
    ? "Video"
    : "Document";

  chip.innerHTML = `
    <span>📎 ${file.name} <small>${typeLabel}</small></span>
    <button type="button" onclick="removeAttachment()">✖</button>
  `;

  attachmentPreview.appendChild(chip);
}

function removeAttachment() {
  attachedFile = null;
  attachmentPreview.innerHTML = "";

  if (fileInputRef) {
    fileInputRef.value = ""; // 🔥 reset input file browser
    fileInputRef = null;
  }
}

/* ================= SUBMIT ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message && !attachedFile) return;

  appendMessage("user", message || "📎 Attachment sent");
  input.value = "";

  const thinking = appendMessage("bot", "Fasya is thinking...");

  try {
    let response;

    // ====== DENGAN FILE ======
    if (attachedFile) {
      const formData = new FormData();
      if (message) formData.append("message", message);
      formData.append("file", attachedFile);

      response = await fetch(FILE_API, {
        method: "POST",
        body: formData
      });
    }

    // ====== TANPA FILE ======
    else {
      response = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
    }

    const data = await response.json();

    thinking.innerHTML = data?.result
      ? marked.parse(data.result)
      : "Tidak ada respons.";

  } catch (err) {
    console.error(err);
    thinking.textContent = "Gagal mengambil respons.";
  }

  // 🔥 WAJIB: reset attachment setelah submit
  removeAttachment();
});
