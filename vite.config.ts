import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative asset paths so it works on GitHub Pages, Vercel, Netlify, etc.
  server: {
    port: 3000,
    open: true
  }
});
