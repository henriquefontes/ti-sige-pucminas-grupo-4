import './env';
import { Prisma, PrismaClient } from '@prisma/client';

/** Cliente Prisma único da aplicação. */
export const prisma = new PrismaClient();

/** Cliente de transação recebido em `prisma.$transaction(async (tx) => ...)`. */
export type Tx = Prisma.TransactionClient;

/** Aceita tanto o cliente principal quanto uma transação. */
export type ClienteBanco = PrismaClient | Tx;

/** Executa `fn` numa transação. Use sempre que a operação emitir eventos. */
export function emTransacao<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn, { timeout: 15_000 });
}

export { Prisma };
