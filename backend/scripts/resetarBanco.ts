/**
 * npm run db:reset — apaga o banco de DATABASE_URL, reaplica as migrações e roda o seed.
 * Só funciona com banco local ou de teste (ver bancoSeguro.ts).
 */
import '../src/core/env';
import { PrismaClient } from '@prisma/client';
import { semear } from '../prisma/seed';
import { descreverUrl } from './bancoSeguro';
import { recriarEsquema } from './recriarEsquema';

const url = process.env.DATABASE_URL;

try {
  await recriarEsquema(url, 'db:reset');
  const { host, banco } = descreverUrl(url!);
  console.log(`Banco "${banco}" em ${host} recriado com as migrações.`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await semear(prisma);
  } finally {
    await prisma.$disconnect();
  }
  console.log('Dados de exemplo inseridos.');
} catch (erro) {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
}
