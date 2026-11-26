import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const arquivoEnv = resolve(__dirname, '../.env');
if (existsSync(arquivoEnv)) config({ path: arquivoEnv, quiet: true });

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
    // Os testes compartilham um único banco: rodam em série.
    fileParallelism: false,
    globalSetup: ['./test/globalSetup.ts'],
    setupFiles: ['./test/setup.ts'],
    testTimeout: 20_000,
    hookTimeout: 120_000,
    env: {
      NODE_ENV: 'test',
      // A aplicação, nos testes, usa SEMPRE o banco de teste.
      DATABASE_URL: process.env.DATABASE_URL_TESTE ?? '',
      JWT_SEGREDO: process.env.JWT_SEGREDO ?? 'segredo-somente-para-testes',
    },
  },
});
