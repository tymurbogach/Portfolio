const CHAT_API = "/api/chat";
const SESSION_KEY = "chat_session_id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function createMsgEl(role: "user" | "bot", text = ""): HTMLElement {
  const el   = document.createElement("div");
  el.dataset.role = role;
  el.className = role === "user" ? "chat-msg chat-msg--user" : "chat-msg chat-msg--bot";
  el.textContent = text;
  return el;
}

async function sendMessage(text: string, messagesEl: HTMLElement, inputEl: HTMLInputElement, sendBtn: HTMLElement): Promise<void> {
  if (!text.trim()) return;

  inputEl.value  = "";
  inputEl.disabled = true;
  sendBtn.setAttribute("disabled", "");

  // User bubble
  messagesEl.appendChild(createMsgEl("user", text));

  // Bot bubble (streaming)
  const botEl = createMsgEl("bot");
  messagesEl.appendChild(botEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const res = await fetch(CHAT_API, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ message: text, sessionId: getSessionId() }),
    });

    if (!res.ok || !res.body) {
      botEl.textContent = "⚠ Service unavailable";
      return;
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const stripped = line.startsWith("data: ") ? line.slice(6) : line;
        if (!stripped) continue;
        if (stripped === "[DONE]") break;
        try {
          const chunk = JSON.parse(stripped);
          if (chunk.token) {
            botEl.textContent += chunk.token;
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
          if (chunk.error) botEl.textContent = `⚠ ${chunk.error}`;
        } catch { /* partial */ }
      }
    }
  } catch {
    botEl.textContent = "⚠ Could not connect to chat service";
  } finally {
    inputEl.disabled = false;
    sendBtn.removeAttribute("disabled");
    inputEl.focus();
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

function initChat(): void {
  const widget    = document.getElementById("chat-widget");
  const toggle    = document.getElementById("chat-toggle-btn");
  const closeBtn  = document.getElementById("chat-close-btn");
  const messages  = document.getElementById("chat-messages");
  const input     = document.getElementById("chat-input") as HTMLInputElement | null;
  const sendBtn   = document.getElementById("chat-send-btn");
  const starters  = document.querySelectorAll<HTMLElement>(".chat-starter");

  if (!widget || !toggle || !messages || !input || !sendBtn) return;

  let isOpen = false;

  function open(): void {
    isOpen = true;
    widget.dataset.open = "true";
    input!.focus();
  }

  function close(): void {
    isOpen = false;
    widget.dataset.open = "false";
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    isOpen ? close() : open();
  });

  closeBtn?.addEventListener("click", (e) => { e.stopPropagation(); close(); });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!isOpen) return;
    if (widget.contains(e.target as Node)) return;
    if ((e.target as Element).id === "chat-toggle-btn") return;
    close();
  });

  sendBtn.addEventListener("click", () => sendMessage(input.value, messages, input, sendBtn));

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value, messages, input, sendBtn);
    }
  });

  starters.forEach((s) => {
    s.addEventListener("click", () => {
      const q = s.dataset.q ?? s.textContent ?? "";
      sendMessage(q, messages, input, sendBtn);
      s.closest(".chat-starters")?.remove();
    });
  });
}

document.addEventListener("astro:page-load", initChat);
