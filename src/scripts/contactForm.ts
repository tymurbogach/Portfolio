function makeSpinner(): SVGSVGElement {
    const ns  = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "form-spinner");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("aria-hidden", "true");
    const circle = document.createElementNS(ns, "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "10");
    circle.setAttribute("stroke-opacity", "0.25");
    const arc = document.createElementNS(ns, "path");
    arc.setAttribute("d", "M12 2a10 10 0 0 1 10 10");
    arc.setAttribute("stroke-opacity", "1");
    svg.appendChild(circle);
    svg.appendChild(arc);
    return svg;
}

function validate(name: string, email: string, message: string): string | null {
    if (!name.trim())    return "Name is required.";
    if (!email.trim())   return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    if (!message.trim()) return "Message is required.";
    return null;
}

function setStatus(el: HTMLElement, text: string, error = false) {
    el.textContent = text;
    el.classList.remove("hidden");
    el.classList.toggle("form-status--error", error);
}

function showSuccess(form: HTMLFormElement) {
    const wrapper = form.parentElement;
    if (!wrapper) return;

    const block   = document.createElement("div");
    block.className = "form-success";

    const line1   = document.createElement("div");
    line1.className = "form-success__line";

    const heading = document.createElement("p");
    heading.className = "form-success__heading";
    heading.textContent = "Message received";

    const body    = document.createElement("p");
    body.className = "form-success__body";
    body.textContent = "Thank you for reaching out. I'll get back to you within 24 h.";

    const line2   = document.createElement("div");
    line2.className = "form-success__line";

    block.appendChild(line1);
    block.appendChild(heading);
    block.appendChild(body);
    block.appendChild(line2);

    wrapper.replaceChild(block, form);
}

export function initContactForm() {
    const form      = document.getElementById("contact-form") as HTMLFormElement | null;
    const statusEl  = document.getElementById("form-status")  as HTMLElement | null;
    const submitBtn = document.getElementById("submit-btn")   as HTMLButtonElement | null;
    if (!form || !statusEl || !submitBtn) return;

    const ac = new AbortController();
    const originalBtnChildren = Array.from(submitBtn.childNodes).map(n => n.cloneNode(true));

    const restoreBtn = () => {
        submitBtn.disabled = false;
        submitBtn.replaceChildren(...originalBtnChildren.map(n => n.cloneNode(true)));
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name    = (form.elements.namedItem("name")    as HTMLInputElement).value;
        const email   = (form.elements.namedItem("email")   as HTMLInputElement).value;
        const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;

        const validationError = validate(name, email, message);
        if (validationError) {
            setStatus(statusEl, validationError, true);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.replaceChildren(makeSpinner(), document.createTextNode(" Sending…"));
        statusEl.classList.add("hidden");

        try {
            const res    = await fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(form) });
            const result = await res.json();

            if (result.success) {
                showSuccess(form);
            } else {
                throw new Error(result.message || "Submission failed.");
            }
        } catch (err) {
            const fallbackEmail = form.dataset.email ?? "contact@nastymur.com";
            const msg = err instanceof Error ? err.message : "Something went wrong.";
            setStatus(statusEl, `${msg} Email me directly: ${fallbackEmail}`, true);
            restoreBtn();
        }
    }, { signal: ac.signal });

    document.addEventListener("astro:before-preparation", () => ac.abort(), { once: true });
}

document.addEventListener("astro:page-load", initContactForm);
