import { defineConfig } from 'vitest/config';

process.loadEnvFile('../.env.test');

export default defineConfig({
  test: {
    globalSetup: './tests/global-setup.ts',
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
  },
});
