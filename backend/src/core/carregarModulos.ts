import type { Router } from 'express';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { NomeEvento } from '@vitalis/shared';
import { prisma } from './db';
import { eventos, type Eventos, type OuvinteEvento } from './eventos';
import { ganchos, type Ganchos, type MapaGanchos, type NomeGancho } from './ganchos';

/** Contexto entregue a `registrar(ctx)` de cada módulo. */
export interface ContextoModulo {
  eventos: Eventos;
  ganchos: Ganchos;
  prisma: typeof prisma;
  /** Atalho para `eventos.ouvir` identificando o módulo. */
  ouvir<N extends NomeEvento>(nome: N, fn: OuvinteEvento<N>): void;
  /** Atalho para `ganchos.registrar` identificando o módulo. */
  registrarGancho<N extends NomeGancho>(nome: N, fn: MapaGanchos[N]): void;
}

/** O que cada `backend/src/modules/<nome>/index.ts` exporta por padrão. */
export interface ModuloBackend {
  /** Nome do módulo; as rotas são montadas em /api/<nome>. */
  nome: string;
  router: Router;
  /** Assina eventos e registra ganchos. */
  registrar?: (ctx: ContextoModulo) => void | Promise<void>;
}

export const PASTA_MODULOS = resolve(dirname(fileURLToPath(import.meta.url)), '../modules');

/**
 * Importa dinamicamente cada `modules/<pasta>/index.ts` e registra eventos e ganchos.
 * Pastas sem index são ignoradas; a ausência de um módulo nunca quebra a aplicação.
 */
export async function carregarModulos(pasta = PASTA_MODULOS): Promise<ModuloBackend[]> {
  eventos.limpar();
  ganchos.limpar();
  if (!existsSync(pasta)) return [];

  const pastas = readdirSync(pasta, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const modulos: ModuloBackend[] = [];
  for (const nomePasta of pastas) {
    const arquivo = ['index.ts', 'index.js'].map((a) => join(pasta, nomePasta, a)).find(existsSync);
    if (!arquivo) continue;

    const importado = (await import(pathToFileURL(arquivo).href)) as { default?: ModuloBackend };
    const modulo = importado.default;
    if (!modulo || typeof modulo.nome !== 'string' || !modulo.router) {
      throw new Error(
        `Módulo em ${nomePasta}/ deve exportar por padrão { nome, router, registrar? }`,
      );
    }
    if (modulos.some((m) => m.nome === modulo.nome)) {
      throw new Error(`Dois módulos com o mesmo nome: ${modulo.nome}`);
    }

    const ctx: ContextoModulo = {
      eventos,
      ganchos,
      prisma,
      ouvir: (nome, fn) => eventos.ouvir(nome, fn, modulo.nome),
      registrarGancho: (nome, fn) => ganchos.registrar(nome, fn, modulo.nome),
    };
    await modulo.registrar?.(ctx);
    modulos.push(modulo);
  }
  return modulos;
}
