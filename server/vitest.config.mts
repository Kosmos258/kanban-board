import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Все тесты используют одну базу, поэтому файлы идут по очереди
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
