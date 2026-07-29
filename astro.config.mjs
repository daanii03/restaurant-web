// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';
import { fileURLToPath } from 'url';

import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

import react from '@astrojs/react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({mode: 'standalone'}),

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@data": path.resolve(__dirname, "src/data"),
      },
    },
  },

  integrations: [react()]
});