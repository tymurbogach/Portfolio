#!/usr/bin/env node
/**
 * Fetch approved general CVs from JobPilot instead of generating locally.
 *
 * Contract (see JobPilot docs/PDF_DOCUMENTS.md, "Publicación"):
 * - Only the explicitly published, approved general version is served.
 *   Drafts, specific variants and the master profile are never reachable here.
 * - Auth is a revocable per-language token via the Authorization header.
 *   Never put the token in a URL or commit it; pass it through the environment.
 * - The server pins the published version: the bytes and the
 *   X-Document-Sha256 header must match, or the local file is kept.
 * - On any failure the existing PDF is preserved and the command exits non-zero.
 *   Nothing is deleted.
 *
 * Usage:
 *   JOBPILOT_BASE_URL=https://jobpilot.example.test \
 *   JOBPILOT_CV_TOKEN_ES=<token> JOBPILOT_CV_TOKEN_EN=<token> \
 *   node scripts/cv/fetch-from-jobpilot.mjs [--lang es|en|all] [--out public]
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

function arg(name, fallback) {
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];
  const equals = process.argv.find((item) => item.startsWith(`${flag}=`));
  if (equals) return equals.slice(flag.length + 1);
  return fallback;
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("fetch-from-jobpilot.mjs [--lang es|en|all] [--out public]");
  console.log(
    "Env: JOBPILOT_BASE_URL, JOBPILOT_CV_TOKEN_ES, JOBPILOT_CV_TOKEN_EN",
  );
  process.exit(0);
}

const lang = arg("lang", "all");
const outDir = path.resolve(root, arg("out", "public"));
if (!["es", "en", "all"].includes(lang)) {
  console.error(`Unknown --lang ${lang}; use es, en or all.`);
  process.exit(2);
}

const base = (process.env.JOBPILOT_BASE_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);
const tokens = {
  es: process.env.JOBPILOT_CV_TOKEN_ES || process.env.JOBPILOT_CV_TOKEN || "",
  en: process.env.JOBPILOT_CV_TOKEN_EN || process.env.JOBPILOT_CV_TOKEN || "",
};
const outputs = {
  es: path.join(outDir, "TymurBogach_CV_ES.pdf"),
  en: path.join(outDir, "TymurBogach_CV_EN.pdf"),
};

const wanted = lang === "all" ? ["es", "en"] : [lang];
let failed = false;
for (const code of wanted) {
  const token = tokens[code];
  if (!token) {
    console.error(
      `✗ Missing token for ${code}: set JOBPILOT_CV_TOKEN_${code.toUpperCase()}. Keeping ${outputs[code]}.`,
    );
    failed = true;
    continue;
  }
  try {
    const response = await fetch(`${base}/public/cv/${code}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error(
        `✗ JobPilot answered ${response.status} for ${code}. Keeping ${outputs[code]}.`,
      );
      failed = true;
      continue;
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const actual = createHash("sha256").update(bytes).digest("hex");
    const expected = response.headers.get("x-document-sha256") || "";
    if (!expected || expected.toLowerCase() !== actual) {
      console.error(
        `✗ Hash mismatch for ${code} (server ${expected || "none"} vs ${actual}). Keeping ${outputs[code]}.`,
      );
      failed = true;
      continue;
    }
    const temporary = path.join(
      os.tmpdir(),
      `jobpilot-cv-${code}-${Date.now()}.pdf`,
    );
    fs.writeFileSync(temporary, bytes);
    fs.renameSync(temporary, outputs[code]);
    console.log(`✓ ${code}: ${outputs[code]} (sha256 ${actual.slice(0, 12)}…)`);
  } catch (error) {
    console.error(
      `✗ Cannot reach JobPilot for ${code}: ${error.message}. Keeping ${outputs[code]}.`,
    );
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
