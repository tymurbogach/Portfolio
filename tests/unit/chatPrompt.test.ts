import { describe, expect, it } from "vitest";
import { composeSystemPrompt } from "../../src/lib/chatPrompt";
import type { PromptFacts } from "../../src/lib/chatPrompt";

const facts: PromptFacts = {
  contact: {
    intro: "intro",
    email: "test@example.com",
    location: "Test City",
    statusStr: "Available",
    statusActive: true,
    cv_url: "/cv-en.pdf",
    cv_url_es: "/cv-es.pdf",
    formSubject: "subject",
    web3formsKey: "key",
  },
  resume: {
    frontend: [
      { slug: "typescript", color: "#3178c6", label: "TypeScript" },
      { slug: "astro", color: "#ff5d01", label: "Astro" },
    ],
    backend: [{ slug: "php", color: "#777bb3", label: "PHP" }],
    homelab: Array.from({ length: 12 }, (_, i) => ({
      slug: `svc-${i}`,
      color: "#000000",
      label: `Service ${i}`,
    })),
    ai: [{ slug: "codex", color: "#10a37f", label: "Codex" }],
    languages: [
      { flag: "🇪🇸", lang: "Spanish", level: "fluent" as const },
      { flag: "🇬🇧", lang: "English", level: "intermediate" as const },
    ],
  },
  about: {
    journey: [
      {
        year: "2022",
        event: "Switched to code",
        detail: "Started web development.",
        active: false,
      },
    ],
    education: [{ years: "2023 — 2025", title: "Certificate", sub: "School" }],
    hobbies: [],
  },
  projects: [
    {
      data: {
        title: "Demo Project",
        description: "A demo project.",
      },
    },
  ],
};

describe("composeSystemPrompt", () => {
  const prompt = composeSystemPrompt(facts);

  it("locks the bot identity", () => {
    expect(prompt).toContain("TymurBot");
    expect(prompt).toContain("IDENTITY LOCK");
  });

  it("derives the contact facts from the collections", () => {
    expect(prompt).toContain("Email: test@example.com");
    expect(prompt).toContain("Location: Test City");
    expect(prompt).toContain("available for work");
  });

  it("derives the journey, education and languages", () => {
    expect(prompt).toContain(
      "- 2022: Switched to code — Started web development.",
    );
    expect(prompt).toContain("- 2023 — 2025: Certificate — School");
    expect(prompt).toContain("Spanish: fluent | English: intermediate");
  });

  it("summarizes the homelab inventory instead of listing all of it", () => {
    expect(prompt).toContain("Service 0, Service 1");
    expect(prompt).toContain("(+2 self-hosted services)");
    expect(prompt).not.toContain("Service 11");
  });

  it("lists the projects and the stack", () => {
    expect(prompt).toContain("- Demo Project — A demo project.");
    expect(prompt).toContain("Frontend: TypeScript, Astro");
    expect(prompt).toContain("Backend: PHP");
    expect(prompt).toContain("AI tooling: Codex");
  });

  it("keeps the reply rules", () => {
    expect(prompt).toContain("Never invent facts not listed here.");
    expect(prompt).toContain("Stay under 70 words.");
  });
});
