import express, { type Express } from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { autenticar, rotasAuth } from './core/auth';
import { carregarModulos, PASTA_MODULOS, type ModuloBackend } from './core/carregarModulos';
import { rotasConfiguracao } from './core/configuracao';
import { RAIZ_REPOSITORIO } from './core/env';
import { rotaNaoEncontrada, tratarErros } from './core/erros';

export interface OpcoesApp {
  /** Pasta de módulos (os testes podem apontar para fixtures). */
  pastaModulos?: string;
}

/** Monta o Express: rotas da base, módulos encontrados em src/modules e tratamento de erros. */
export async function criarApp(
  opcoes: OpcoesApp = {},
): Promise<{ app: Express; modulos: ModuloBackend[] }> {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/saude', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api/auth', rotasAuth());
  app.use('/api/configuracao', rotasConfiguracao());

  const modulos = await carregarModulos(opcoes.pastaModulos ?? PASTA_MODULOS);
  for (const modulo of modulos) {
    // Toda rota de módulo exige login; permissões por perfil ficam a cargo do módulo.
    app.use(`/api/${modulo.nome}`, autenticar, modulo.router);
  }

  app.use('/api', rotaNaoEncontrada);

  // Em produção, serve o frontend compilado (npm run build) pela mesma porta.
  const frontendDist = resolve(RAIZ_REPOSITORIO, 'frontend/dist');
  if (process.env.NODE_ENV === 'production' && existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(resolve(frontendDist, 'index.html')));
  }

  app.use(tratarErros);
  return { app, modulos };
}
