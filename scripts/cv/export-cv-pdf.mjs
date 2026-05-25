#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}\n${result.stderr || result.stdout}`);
  return result;
}

function toFileUrl(absolutePath) {
  return `file://${absolutePath}`;
}

function findChromeBinary() {
  const fromEnv = process.env.CHROME_BIN;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  const candidates = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  // Puppeteer cache fallback
  const puppeteerDir = path.join(process.env.HOME ?? '', '.cache/puppeteer/chrome');
  if (fs.existsSync(puppeteerDir)) {
    for (const entry of fs.readdirSync(puppeteerDir)) {
      const candidate = path.join(puppeteerDir, entry, 'chrome-linux64/chrome');
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  throw new Error('Chrome/Chromium not found. Set CHROME_BIN env var or install chromium.');
}

function parseOverflow(dom) {
  return {
    overflow:   dom.match(/data-overflow="([01])"/)?.[1] === '1',
    overflowPx: Number(dom.match(/data-overflow-px="(\d+)"/)?.[1] ?? '0'),
  };
}

const configPath    = process.argv[2] ?? 'cv.config.json';
const outputPdfPath = process.argv[3] ?? 'cv.pdf';
const absoluteConfig    = path.resolve(configPath);
const absoluteOutputPdf = path.resolve(outputPdfPath);
const absoluteHtml      = path.resolve('_cv_build_tmp.html');

fs.mkdirSync(path.dirname(absoluteOutputPdf), { recursive: true });

run('node', ['scripts/cv/build-cv-html.mjs', absoluteConfig, absoluteHtml]);

const chrome = findChromeBinary();
const htmlUrl = toFileUrl(absoluteHtml);

const overflowDom = run(chrome, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  '--allow-file-access-from-files', '--virtual-time-budget=2500',
  '--dump-dom', htmlUrl,
]);

const { overflow, overflowPx } = parseOverflow(overflowDom.stdout);
if (overflow) {
  console.error(`Refusing to generate PDF: content overflows by ${overflowPx}px. Shorten cv.config.json content.`);
  process.exit(2);
}

const pdfBase = ['--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files', `--print-to-pdf=${absoluteOutputPdf}`, htmlUrl];
try {
  run(chrome, ['--no-pdf-header-footer', ...pdfBase]);
} catch {
  run(chrome, ['--print-to-pdf-no-header', ...pdfBase]);
}

fs.unlinkSync(absoluteHtml);

if (!fs.existsSync(absoluteOutputPdf)) throw new Error('Expected output PDF was not created.');
console.log(`Wrote ${path.relative(process.cwd(), absoluteOutputPdf)} (${Math.round(fs.statSync(absoluteOutputPdf).size / 1024)} KB)`);
