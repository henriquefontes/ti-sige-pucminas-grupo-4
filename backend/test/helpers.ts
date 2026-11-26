/**
 * Helpers de teste da base. Use nos testes dos módulos:
 *
 *   import { criarAppDeTeste, loginComo, carregarSeed, bancoDeTeste } from '../../../test/helpers';
 *
 *   const app = await criarAppDeTeste();
 *   const { autorizacao } = await loginComo('FARMACEUTICO');
 *   await request(app).get('/api/vendas').set('Authorization', autorizacao);
 */
import type { Express } from 'express';
import type { Perfil } from '@vitalis/shared';
import { semear } from '../prisma/seed';
import { criarApp, type OpcoesApp } from '../src/app';
import { gerarToken } from '../src/core/auth/token';
import { prisma } from '../src/core/db';

/** Monta a aplicação com os módulos existentes (eventos e ganchos são registrados de novo). */
export async function criarAppDeTeste(opcoes: OpcoesApp = {}): Promise<Express> {
  const { app } = await criarApp(opcoes);
  return app;
}

/** Cliente Prisma conectado ao banco de teste. */
export function bancoDeTeste() {
  return prisma;
}

/** Esvazia todas as tabelas (executado automaticamente antes de cada teste). */
export async function limparBanco(): Promise<void> {
  const tabelas = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tabelas.length === 0) return;
  const lista = tabelas.map((t) => `"public"."${t.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${lista} RESTART IDENTITY CASCADE`);
}

/** Insere os dados de exemplo do seed (usuários, produtos, lotes, clientes, contas...). */
export async function carregarSeed(): Promise<void> {
  await semear(prisma);
}

/**
 * Garante um usuário do perfil informado e devolve um token válido.
 * Reaproveita o usuário do seed se existir; senão, cria `teste-<perfil>`.
 */
export async function loginComo(perfil: Perfil) {
  const existente = await prisma.usuario.findFirst({
    where: { perfil, ativo: true },
    orderBy: { id: 'asc' },
  });
  const usuario =
    existente ??
    (await prisma.usuario.create({
      data: {
        nome: `Usuário de teste (${perfil})`,
        login: `teste-${perfil.toLowerCase()}`,
        senhaHash: 'sem-login-por-senha',
        perfil,
      },
    }));
  const token = gerarToken({
    id: usuario.id,
    nome: usuario.nome,
    login: usuario.login,
    perfil: usuario.perfil,
  });
  return { usuario, token, autorizacao: `Bearer ${token}` };
}
