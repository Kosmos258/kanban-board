import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  // Не линтим сборку и сгенерированный Prisma-клиент (он не наш код)
  globalIgnores(['dist', 'server/dist', 'server/src/generated']),
  {
    // Фронтенд: браузер + React
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      eslintConfigPrettier, // ДОЛЖЕН БЫТЬ ПОСЛЕДНИМ, отключает правила, конфликтующие с Prettier
    ],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    // Бэкенд и конфиги сборки: Node, без React
    files: ['server/**/*.ts', '*.config.ts'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // Параметры с префиксом _ (например, _next в обработчике ошибок) намеренно не используются
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
]);
