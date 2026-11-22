const CHAT_API = "/api/chat";
const SESSION_KEY = "chat_session_id";

/*
 * sessionStorage throws in some privacy modes; keep the chat alive with an
 * in-memory fallback instead of crashing on the first read.
 */
const memorySession = new Map<string, string>();
function safeSessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return memorySession.get(key) ?? null;
  }
}
function safeSessionSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    memorySession.set(key, value);
  }
}

function getSessionId(): string {
  let id = safeSessionGet(SESSION_KEY);
  if (!id) {
    // crypto.randomUUID() requires secure context; fallback for plain HTTP
    id =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    safeSessionSet(SESSION_KEY, id);
  }
  return id;
}

function createMsgEl(role: "user" | "bot", text = ""): HTMLElement {
  const el = document.createElement("div");
  el.dataset.role = role;
  el.className =
    role === "user" ? "chat-msg chat-msg--user" : "chat-msg chat-msg--bot";
  el.textContent = text;
  return el;
}

function createTypingEl(): HTMLElement {
  const el = document.createElement("div");
  el.className = "chat-typing";
  el.setAttribute("aria-label", "Typing…");
  for (let i = 0; i < 3; i++) el.appendChild(document.createElement("span"));
  return el;
}

// One send at a time: concurrent sends interleave bubbles and server history.
let inFlight: AbortController | null = null;

async function sendMessage(
  text: string,
  messagesEl: HTMLElement,
  inputEl: HTMLInputElement,
  sendBtn: HTMLElement,
): Promise<void> {
  if (!text.trim() || inFlight) return;

  const controller = new AbortController();
  inFlight = controller;

  inputEl.value = "";
  inputEl.disabled = true;
  sendBtn.setAttribute("disabled", "");

  // User bubble
  messagesEl.appendChild(createMsgEl("user", text));

  // Typing indicator while waiting for first token
  const typingEl = createTypingEl();
  messagesEl.appendChild(typingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Bot bubble (streaming) — inserted when first token arrives
  const botEl = createMsgEl("bot");
  let botInserted = false;

  try {
    const res = await fetch(CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, sessionId: getSessionId() }),
      signal: controller.signal,
    });

    if (!res.ok || !res.body) {
      typingEl.remove();
      botEl.textContent = "⚠ Service unavailable";
      messagesEl.appendChild(botEl);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

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
            if (!botInserted) {
              typingEl.remove();
              messagesEl.appendChild(botEl);
              botInserted = true;
            }
            botEl.textContent += chunk.token;
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
          if (chunk.error) {
            typingEl.remove();
            if (!botInserted) {
              messagesEl.appendChild(botEl);
              botInserted = true;
            }
            botEl.textContent = `⚠ ${chunk.error}`;
          }
        } catch {
          /* partial */
        }
      }
    }
  } catch (err) {
    // Navigation aborts the in-flight request: the DOM is going away, so
    // leave quietly instead of painting an error nobody will read.
    if (err instanceof DOMException && err.name === "AbortError") return;
    typingEl.remove();
    if (!botInserted) {
      messagesEl.appendChild(botEl);
      botInserted = true;
    }
    botEl.textContent = "⚠ Could not connect to chat service";
  } finally {
    inFlight = null;
    inputEl.disabled = false;
    sendBtn.removeAttribute("disabled");
    inputEl.focus();
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

function initChat(): void {
  const widget = document.getElementById("chat-widget");
  const toggles = document.querySelectorAll<HTMLElement>(".chat-toggle");
  const closeBtn = document.getElementById("chat-close-btn");
  const messages = document.getElementById("chat-messages");
  const input = document.getElementById(
    "chat-input",
  ) as HTMLInputElement | null;
  const sendBtn = document.getElementById("chat-send-btn");
  const starters = document.querySelectorAll<HTMLElement>(".chat-starter");

  if (!widget || !toggles.length || !messages || !input || !sendBtn) return;

  const controller = new AbortController();
  const { signal } = controller;

  let isOpen = false;
  let lastToggle: HTMLElement | null = null;

  function open(trigger?: HTMLElement): void {
    isOpen = true;
    if (trigger) lastToggle = trigger;
    widget!.dataset.open = "true";
    widget!.removeAttribute("aria-hidden");
    input!.focus();
  }

  function close(): void {
    isOpen = false;
    widget!.dataset.open = "false";
    widget!.setAttribute("aria-hidden", "true");
    lastToggle?.focus();
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener(
      "click",
      (e) => {
        e.stopPropagation();
        isOpen ? close() : open(toggle);
      },
      { signal },
    );
  });

  closeBtn?.addEventListener(
    "click",
    (e) => {
      e.stopPropagation();
      close();
    },
    { signal },
  );

  // Close on outside click only when conversation hasn't started (input empty + no user messages)
  document.addEventListener(
    "click",
    (e) => {
      if (!isOpen) return;
      if (widget.contains(e.target as Node)) return;
      if ((e.target as Element).closest(".chat-toggle")) return;
      const hasConversation =
        messages.querySelector(".chat-msg--user") !== null ||
        (input?.value.trim().length ?? 0) > 0 ||
        input === document.activeElement;
      if (!hasConversation) close();
    },
    { signal },
  );

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && isOpen) close();
    },
    { signal },
  );

  sendBtn.addEventListener(
    "click",
    () => sendMessage(input.value, messages, input, sendBtn),
    { signal },
  );

  input.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value, messages, input, sendBtn);
      }
    },
    { signal },
  );

  starters.forEach((s) => {
    s.addEventListener(
      "click",
      () => {
        const q = s.dataset.q ?? s.textContent ?? "";
        sendMessage(q, messages, input, sendBtn);
        s.closest(".chat-starters")?.remove();
      },
      { signal },
    );
  });

  document.addEventListener(
    "astro:before-preparation",
    () => {
      inFlight?.abort();
      controller.abort();
    },
    { once: true },
  );
}

document.addEventListener("astro:page-load", initChat);
