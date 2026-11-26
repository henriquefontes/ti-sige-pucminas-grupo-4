import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { garantirBancoSeguro } from './bancoSeguro';

const PASTA_BACKEND = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Apaga o esquema public e reaplica todas as migrações.
 * Recusa qualquer URL que não seja local ou de teste.
 */
export async function recriarEsquema(url: string | undefined, contexto: string): Promise<void> {
  const urlSegura = garantirBancoSeguro(url, contexto);
  const prisma = new PrismaClient({ datasources: { db: { url: urlSegura } } });
  try {
    await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE');
    await prisma.$executeRawUnsafe('CREATE SCHEMA public');
  } finally {
    await prisma.$disconnect();
  }
  execSync('npx prisma migrate deploy', {
    cwd: PASTA_BACKEND,
    env: { ...process.env, DATABASE_URL: urlSegura },
    stdio: 'pipe',
  });
}
