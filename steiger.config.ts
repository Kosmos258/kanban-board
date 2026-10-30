import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Для небольшого учебного проекта эти правила избыточны
    files: ['./src/**'],
    rules: {
      'fsd/insignificant-slice': 'off',
      'fsd/public-api': 'error',
    },
  },
]);
