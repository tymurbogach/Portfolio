export function initContactForm() {
    const form = document.getElementById("contact-form") as HTMLFormElement | null;
    const statusEl = document.getElementById("form-status") as HTMLElement | null;
    const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement | null;
    if (!form || !statusEl || !submitBtn) return;

    const ac = new AbortController();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Deshabilita el botón mientras envía para evitar doble submit
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
                statusEl.textContent = "Message sent! I'll get back to you soon.";
                form.reset();
            } else {
                throw new Error(result.message || "Error");
            }
        } catch {
            // Fallback con email directo por si falla la API
            statusEl.textContent = "Something went wrong. Email me at Timurnator@gmail.com";
        } finally {
            submitBtn.disabled = false;
        }
    }, { signal: ac.signal });

    // Limpia el listener al navegar fuera de la página de contacto
    document.addEventListener("astro:before-preparation", () => ac.abort(), { once: true });
}

document.addEventListener("astro:page-load", initContactForm);
