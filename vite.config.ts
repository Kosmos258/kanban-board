import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const dirname = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@app': path.resolve(dirname, './src/app'),
      '@pages': path.resolve(dirname, './src/pages'),
      '@widgets': path.resolve(dirname, './src/widgets'),
      '@features': path.resolve(dirname, './src/features'),
      '@entities': path.resolve(dirname, './src/entities'),
      '@shared': path.resolve(dirname, './src/shared'),
    },
  },
});
