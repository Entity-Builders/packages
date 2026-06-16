import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'gallery',
  plugins: [react()],
  build: {
    outDir: '../dist-gallery',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'gallery/index.html'),
        'status-banner-element': resolve(
          __dirname,
          'gallery/status-banner-element.html',
        ),
      },
    },
  },
  server: {
    allowedHosts: true,
  },
});
