import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // "@/components/ui/button" instead of "../../components/ui/button"
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: { port: 5173 },
});
