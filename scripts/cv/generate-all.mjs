#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function generate(configPath, outputPath) {
  console.log(`\n→ Generating ${outputPath}...`);
  const result = spawnSync(
    'node',
    [
      path.join(root, 'scripts/cv/export-cv-pdf.mjs'),
      path.join(root, configPath),
      path.join(root, outputPath),
    ],
    { stdio: 'inherit', env: process.env },
  );
  if (result.status !== 0) {
    console.error(`✗ Failed: ${outputPath}`);
    process.exit(result.status ?? 1);
  }
  console.log(`✓ Done: ${outputPath}`);
}

generate('cv/cv.config.en.json', 'public/cv.pdf');
generate('cv/cv.config.es.json', 'public/cv-es.pdf');
