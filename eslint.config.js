import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Node.js files: config files and browser tests
    files: ['*.config.js', 'e2e/**/*.js'],
    languageOptions: { globals: globals.node },
    // Playwright fixtures call `use()`, which is not React's hook
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  {
    // shadcn/ui files export components + helpers (e.g. buttonVariants)
    files: ['src/components/ui/**/*.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
]);
