/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const portaApi = process.env.PORTA ?? '3333';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': `http://localhost:${portaApi}`,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/testes/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
