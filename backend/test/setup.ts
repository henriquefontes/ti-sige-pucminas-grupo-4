import { afterAll, beforeEach } from 'vitest';
import { garantirBancoSeguro } from '../scripts/bancoSeguro';
import { prisma } from '../src/core/db';
import { limparBanco } from './helpers';

// Segunda trava: a aplicação nos testes nunca pode apontar para um banco que não seja de teste.
garantirBancoSeguro(process.env.DATABASE_URL, 'Testes');

// Cada teste começa com o banco vazio. Use carregarSeed() se precisar dos dados de exemplo.
beforeEach(async () => {
  await limparBanco();
});

afterAll(async () => {
  await prisma.$disconnect();
});
