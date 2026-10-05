import { readFileSync } from "node:fs";

const css = readFileSync("src/styles/global.css", "utf8");
const blocks = new Map();
const blockPattern =
  /(^:root|^\.dark|^\[data-theme="[^"]+"\](?:\.dark)?)\s*\{([\s\S]*?)^\}/gm;

for (const match of css.matchAll(blockPattern)) {
  const [, selector, body] = match;
  const tokens = Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*(rgb\([^;]+\));/g)].map(
      ([, key, value]) => [key, value],
    ),
  );
  blocks.set(selector, { ...blocks.get(selector), ...tokens });
}

function luminance(rgb) {
  const channels = rgb
    .match(/\d+/g)
    .map(Number)
    .map((value) => {
      const normalized = value / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(first, second) {
  const [light, dark] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return (light + 0.05) / (dark + 0.05);
}

const root = blocks.get(":root");
const themes = [
  "cyberpunk",
  "void",
  "matrix",
  "bubblegum",
  "doom",
  "claude",
  "bladerunner",
];
const variants = [
  ["cyberpunk dark", root],
  ["cyberpunk light", { ...root, ...blocks.get(".dark") }],
  ...themes.slice(1).flatMap((theme) => [
    [`${theme} light`, { ...root, ...blocks.get(`[data-theme="${theme}"]`) }],
    [
      `${theme} dark`,
      {
        ...root,
        ...blocks.get(`[data-theme="${theme}"]`),
        ...blocks.get(`[data-theme="${theme}"].dark`),
      },
    ],
  ]),
];

const pairs = [
  ["background", "foreground"],
  ["card", "card-foreground"],
  ["primary", "primary-foreground"],
  ["accent", "accent-foreground"],
  ["muted", "muted-foreground"],
];
const failures = [];

for (const [name, tokens] of variants) {
  for (const [background, foreground] of pairs) {
    const ratio = contrast(tokens[background], tokens[foreground]);
    if (ratio < 4.5) {
      failures.push(
        `${name}: ${background}/${foreground} is ${ratio.toFixed(2)}:1`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("Theme contrast check failed:\n" + failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Theme contrast check passed for ${variants.length} variants.`);
}
