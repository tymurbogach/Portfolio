#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
  } catch { return ''; }
  return '';
}

function renderList(items, className) {
  const filtered = (items ?? []).filter(Boolean);
  if (filtered.length === 0) return '';
  return `<ul class="${className}">${filtered.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderExperience(items) {
  return (items ?? []).map((item) => {
    const location = item.location ? `<div class="exp-loc">${escapeHtml(item.location)}</div>` : '';
    const period = item.period ? `<div class="exp-period">${escapeHtml(item.period)}</div>` : '';
    return `
      <article class="exp-item">
        <header class="exp-head">
          <div class="exp-role">${escapeHtml(item.role ?? '')}</div>
          ${location}
        </header>
        <div class="exp-sub">
          <div class="exp-company">${escapeHtml(item.company ?? '')}</div>
          ${period}
        </div>
        ${renderList(item.bullets, 'exp-bullets')}
      </article>
    `;
  }).join('');
}

function renderEducation(items) {
  return (items ?? []).map((item) => {
    const period = item.period ? `<div class="edu-period">${escapeHtml(item.period)}</div>` : '';
    return `
      <article class="edu-item">
        <header class="edu-head">
          <div class="edu-degree">${escapeHtml(item.degree ?? '')}</div>
          ${period}
        </header>
        <div class="edu-school">${escapeHtml(item.institution ?? '')}</div>
        ${renderList(item.highlights, 'edu-highlights')}
      </article>
    `;
  }).join('');
}

const ICONS = {
  email: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  github: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
  website: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
  location: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
};

function contactLabel(url, fallback) {
  if (!url) return fallback ?? '';
  try {
    const parsed = new URL(url);
    const p = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
    return p || parsed.hostname;
  } catch { return url.replace(/^https?:\/\//, ''); }
}

function renderLinks(profile) {
  const links = [
    { icon: ICONS.email,    label: profile.email,                  href: profile.email ? `mailto:${profile.email}` : '' },
    { icon: ICONS.linkedin, label: contactLabel(profile.linkedin), href: profile.linkedin },
    { icon: ICONS.github,   label: contactLabel(profile.github),   href: profile.github },
    { icon: ICONS.website,  label: contactLabel(profile.website),  href: profile.website },
    { icon: ICONS.location, label: profile.location,               href: '' },
  ].filter((item) => item.label);

  return links.map((link) => {
    const icon = link.icon ? `<span class="icon">${link.icon}</span>` : '';
    const href = safeUrl(link.href);
    if (href) {
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${icon}${escapeHtml(link.label)}</a>`;
    }
    return `<span>${icon}${escapeHtml(link.label)}</span>`;
  }).join('<span class="dot">&bull;</span>');
}

function render(config) {
  const { profile, summary, experience, education, theme, layout, labels } = config;
  const labelSummary    = labels?.summary    ?? 'Summary';
  const labelExperience = labels?.experience ?? 'Professional Experience';
  const labelEducation  = labels?.education  ?? 'Education';
  const marginMm    = layout?.page?.marginMm ?? 10;
  const baseFont    = layout?.density?.baseFontPx ?? 8.6;
  const headingFont = layout?.density?.headingFontPx ?? 11;
  const sectionGap  = layout?.density?.sectionGapPx ?? 10;
  const itemGap     = layout?.density?.itemGapPx ?? 8;
  const photoUrl    = safeUrl(profile?.photoUrl ?? '');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme?.headingFont ?? 'Rubik')}:wght@400;500;700&family=${encodeURIComponent(theme?.bodyFont ?? 'Rubik')}:wght@400;500;700&display=swap" rel="stylesheet" />
    <title>${escapeHtml(profile?.fullName ?? 'CV')}</title>
    <style>
      :root {
        --c-primary: ${escapeHtml(theme?.primary ?? '#1c2a3b')};
        --c-accent:  ${escapeHtml(theme?.accent  ?? '#b68b47')};
        --c-text:    #1f2a37;
        --c-muted:   #5d6775;
        --font-head: ${escapeHtml(theme?.headingFont ?? 'Rubik')}, Arial, sans-serif;
        --font-body: ${escapeHtml(theme?.bodyFont ?? 'Rubik')}, Arial, sans-serif;
        --font-base:    ${baseFont}px;
        --font-heading: ${headingFont}px;
        --section-gap:  ${sectionGap}px;
        --item-gap:     ${itemGap}px;
        --page-margin:  ${marginMm}mm;
      }
      * { box-sizing: border-box; }
      @page { size: A4; margin: 0; }
      body { margin: 0; background: #eff3f7; font-family: var(--font-body); font-size: var(--font-base); color: var(--c-text); }
      .page { width: 210mm; height: 297mm; margin: 0 auto; background: #fff; overflow: hidden; }
      .page-flow { height: 100%; padding: var(--page-margin); display: flex; flex-direction: column; gap: var(--section-gap); }
      .header { display: grid; grid-template-columns: 1fr auto; gap: 10px; padding-bottom: 8px; }
      .name { margin: 0; font-family: var(--font-head); font-size: 23px; letter-spacing: 1.2px; color: var(--c-primary); }
      .headline { margin-top: 2px; font-family: var(--font-head); font-size: 11px; color: var(--c-accent); font-weight: 700; }
      .contacts { margin-top: 6px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; color: var(--c-muted); }
      .contacts a, .contacts > span { color: var(--c-muted); text-decoration: none; line-height: 1.3; display: inline-flex; align-items: center; gap: 3px; }
      .icon { display: inline-flex; align-items: center; }
      .icon svg { vertical-align: middle; }
      .dot { color: #97a3b4; }
      .photo { width: 68px; height: 68px; border-radius: 50%; object-fit: cover; border: 2px solid #ecf0f5; }
      .section-title { margin: 0; color: var(--c-primary); font-family: var(--font-head); font-size: var(--font-heading); font-weight: 500; letter-spacing: 0.4px; text-transform: uppercase; padding-bottom: 4px; border-bottom: 0.5px solid #d0d6de; }
      .summary { margin: 6px 0 0; line-height: 1.35; }
      .exp-list, .edu-list { margin-top: 6px; display: grid; gap: var(--item-gap); }
      .exp-head, .edu-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
      .exp-role { color: var(--c-primary); font-weight: 700; font-family: var(--font-head); }
      .exp-loc, .exp-period { color: var(--c-muted); white-space: nowrap; font-size: calc(var(--font-base) - 0.5px); }
      .exp-sub { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
      .exp-company { color: var(--c-accent); font-weight: 500; }
      .edu-degree { color: var(--c-primary); font-weight: 700; font-family: var(--font-head); }
      .edu-period, .edu-school { color: var(--c-muted); }
      ul { margin: 4px 0 0 0; padding-left: 14px; }
      li { margin: 2px 0; line-height: 1.3; }
      .edu-highlights li { line-height: 1.25; }
      .overflow-banner { display: none; margin-top: 4px; padding: 6px; border: 1px solid #8b0000; background: #ffe5e5; color: #8b0000; font-size: 10px; font-weight: 700; }
      html[data-overflow="1"] .overflow-banner { display: block; }
      @media print { body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
  </head>
  <body>
    <main class="page">
      <div id="flow" class="page-flow">
        <section class="header">
          <div>
            <h1 class="name">${escapeHtml(profile?.fullName ?? '')}</h1>
            <div class="headline">${escapeHtml(profile?.headline ?? '')}</div>
            <div class="contacts">${renderLinks(profile ?? {})}</div>
          </div>
          ${photoUrl ? `<img class="photo" src="${photoUrl}" alt="Profile photo" />` : ''}
        </section>
        <section>
          <h2 class="section-title">${escapeHtml(labelSummary)}</h2>
          <p class="summary">${escapeHtml(summary ?? '')}</p>
        </section>
        <section>
          <h2 class="section-title">${escapeHtml(labelExperience)}</h2>
          <div class="exp-list">${renderExperience(experience ?? [])}</div>
        </section>
        <section>
          <h2 class="section-title">${escapeHtml(labelEducation)}</h2>
          <div class="edu-list">${renderEducation(education ?? [])}</div>
          <div class="overflow-banner">Content overflow detected. Reduce text to keep the CV at one page.</div>
        </section>
      </div>
    </main>
    <script>
      (function checkOverflow() {
        const flow = document.getElementById('flow');
        const overflowPx = Math.max(0, Math.ceil(flow.scrollHeight - flow.clientHeight));
        document.documentElement.setAttribute('data-overflow', overflowPx > 0 ? '1' : '0');
        document.documentElement.setAttribute('data-overflow-px', String(overflowPx));
      })();
    </script>
  </body>
</html>`;
}

const configPath = process.argv[2] ?? 'cv.config.json';
const outPath    = process.argv[3] ?? 'cv.html';

const config = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf8'));
fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
fs.writeFileSync(path.resolve(outPath), render(config), 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), path.resolve(outPath))}`);
