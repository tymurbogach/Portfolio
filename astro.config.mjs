// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nastymur.com',
  adapter: node({ mode: 'standalone' }),

  server: {
    host: '0.0.0.0',
    port: 4321
  },

  vite: {
    plugins: [tailwindcss()],

    // Acceso al dev server por Tailscale: Vite rechaza con 403 cualquier
    // Host header que no sea IP o localhost. Las IPs (LAN y 100.x) ya pasan.
    server: {
      allowedHosts: ['omarchy', 'omarchy.taildf8137.ts.net']
    },

    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    }
  },

  integrations: [react(), sitemap()]
});