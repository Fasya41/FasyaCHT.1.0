const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

/** === DARK MODE === **/
const toggleBtn = document.getElementById("themeToggle");
const html = document.documentElement;

let currentTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", currentTheme);
toggleBtn.textContent = currentTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

toggleBtn.addEventListener("click", () => {
  const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  toggleBtn.textContent = newTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
});


/** === CHATBOT CODE === **/
const API_URL = 'http://localhost:2508/api/chat';

// Fungsi menampilkan pesan
function appendMessage(sender, text, isHTML = false) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  msg[isHTML ? 'innerHTML' : 'textContent'] = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Tampilkan pesan user
  appendMessage('user', userMessage);
  input.value = '';

  // Placeholder bot
  const thinkingMessage = appendMessage('bot', 'Fasya is thinking...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();

    if (data && data.result) {
      // Format markdown
      const htmlText = marked.parse(data.result);
      thinkingMessage.innerHTML = htmlText;

    } else {
      thinkingMessage.textContent = 'Tidak ada respons.';
    }

  } catch (error) {
    console.error(error);
    thinkingMessage.textContent = 'Gagal mengambil respons.';
  }
});
