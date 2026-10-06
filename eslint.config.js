import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores(['dist']), // Игнорируем папку dist
  {
    files: ['**/*.{ts,tsx}'], // Применяем правила только к TS и TSX файлам
    extends: [
      js.configs.recommended, // Базовые правила JS
      ...tseslint.configs.recommended, // Рекомендованные правила TS
      reactHooks.configs.flat['recommended-latest'],  // Правила для React Hooks
      reactRefresh.configs.vite, // Правила для Fast Refresh в Vite
      eslintConfigPrettier, // ОБЯЗАТЕЛЬНО ДОЛЖЕН БЫТЬ ПОСЛЕДНИМ, чтобы отключить конфликтующие правила
    ],
    languageOptions: {
      globals: {
        ...globals.browser, // Добавляем глобальные переменные браузера (window, document и т.д.)
      },
    },
  },
]);
