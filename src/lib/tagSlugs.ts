/**
 * Maps project tags to simple-icons slugs; unmapped tags render as plain text
 * badges. Brand colors are the documented AGENTS.md exception to theme tokens.
 */
export const TAG_SLUGS: Record<string, { slug: string; color?: string }> = {
  Angular: { slug: "angular", color: "#DD0031" },
  Laravel: { slug: "laravel" },
  TypeScript: { slug: "typescript" },
  JavaScript: { slug: "javascript" },
  Docker: { slug: "docker" },
  HTML: { slug: "html5" },
  CSS: { slug: "css" },
  PHP: { slug: "php" },
  MySQL: { slug: "mysql" },
  PostgreSQL: { slug: "postgresql" },
  Vue: { slug: "vuedotjs" },
  React: { slug: "react" },
  Node: { slug: "nodedotjs" },
  Python: { slug: "python" },
  Bash: { slug: "gnubash" },
  "Qt/QML": { slug: "qt" },
  SQLite: { slug: "sqlite" },
  Hyprland: { slug: "hyprland" },
  Astro: { slug: "astro" },
  Tailwind: { slug: "tailwindcss" },
  TailwindCSS: { slug: "tailwindcss" },
  API: { slug: "postman" },
};
