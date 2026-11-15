import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier/flat';

export default defineConfig(
  { ignores: ['dist/'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
);
