function makeLine(): HTMLDivElement {
    const el = document.createElement("div");
    el.style.cssText = "height:1px;width:100%;background:var(--accent-color);opacity:0.4;";
    return el;
}

function showSuccess(form: HTMLFormElement) {
    const wrapper = form.parentElement;
    if (!wrapper) return;

    const block = document.createElement("div");
    block.style.cssText = "display:flex;flex-direction:column;gap:1rem;padding:1.5rem 0;";

    const heading = document.createElement("p");
    heading.style.cssText = "margin:0;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;font-size:clamp(0.7rem,1.2vw,0.9rem);color:var(--accent-color);";
    heading.textContent = "Message received";

    const body = document.createElement("p");
    body.style.cssText = "margin:0;line-height:1.7;opacity:0.55;letter-spacing:0.06em;font-size:clamp(0.75rem,1.1vw,0.85rem);";
    body.textContent = "Thank you for reaching out. I'll get back to you within 24 h.";

    block.appendChild(makeLine());
    block.appendChild(heading);
    block.appendChild(body);
    block.appendChild(makeLine());

    wrapper.replaceChild(block, form);
}

export function initContactForm() {
    const form = document.getElementById("contact-form") as HTMLFormElement | null;
    const statusEl = document.getElementById("form-status") as HTMLElement | null;
    const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement | null;
    if (!form || !statusEl || !submitBtn) return;

    const ac = new AbortController();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        statusEl.classList.remove("hidden");
        statusEl.textContent = "Sending...";

        try {
            const data = new FormData(form);
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: data,
            });
            const result = await res.json();

            if (result.success) {
                showSuccess(form);
            } else {
                throw new Error(result.message || "Error");
            }
        } catch {
            const fallbackEmail = form.dataset.email ?? "contact@nastymur.com";
            statusEl.textContent = `Something went wrong. Email me directly: ${fallbackEmail}`;
            submitBtn.disabled = false;
        }
    }, { signal: ac.signal });

    document.addEventListener("astro:before-preparation", () => ac.abort(), { once: true });
}

document.addEventListener("astro:page-load", initContactForm);
