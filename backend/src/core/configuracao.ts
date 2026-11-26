import { Router } from 'express';
import {
  CHAVES_CONFIGURACAO,
  type ChaveConfiguracao,
  type ConfiguracaoLoja,
} from '@vitalis/shared';
import { prisma, type ClienteBanco } from './db';

/** Valores usados quando a chave não existe na tabela Configuracao. */
export const PADROES_CONFIGURACAO: Record<ChaveConfiguracao, string> = {
  nomeSistema: 'Vitalis',
  nomeLoja: 'Loja Savassi',
  prazoCartaoDebitoDias: '1',
  prazoCartaoCreditoDias: '30',
  diasAlertaValidade: '60',
  diasAlertaContas: '7',
};

export async function obterConfiguracao(
  chave: ChaveConfiguracao,
  db: ClienteBanco = prisma,
): Promise<string> {
  const registro = await db.configuracao.findUnique({ where: { chave } });
  return registro?.valor ?? PADROES_CONFIGURACAO[chave];
}

export async function obterConfiguracaoNumero(
  chave: ChaveConfiguracao,
  db: ClienteBanco = prisma,
): Promise<number> {
  const valor = Number(await obterConfiguracao(chave, db));
  if (!Number.isFinite(valor)) throw new Error(`Configuração ${chave} não é numérica`);
  return valor;
}

/** Rotas públicas de configuração (nome da loja para o login e o cabeçalho). */
export function rotasConfiguracao(): Router {
  const router = Router();
  router.get('/loja', async (_req, res) => {
    const resposta: ConfiguracaoLoja = {
      nomeSistema: await obterConfiguracao(CHAVES_CONFIGURACAO.nomeSistema),
      nomeLoja: await obterConfiguracao(CHAVES_CONFIGURACAO.nomeLoja),
    };
    res.json(resposta);
  });
  return router;
}
