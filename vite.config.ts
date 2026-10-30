import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const dirname = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(dirname, './src/app'),
      '@pages': path.resolve(dirname, './src/pages'),
      '@widgets': path.resolve(dirname, './src/widgets'),
      '@features': path.resolve(dirname, './src/features'),
      '@entities': path.resolve(dirname, './src/entities'),
      '@shared': path.resolve(dirname, './src/shared'),
    },
  },
  server: {
    // В разработке запросы к /api уходят на сервер, поэтому CORS не нужен
    proxy: { '/api': 'http://localhost:5000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/shared/config/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
