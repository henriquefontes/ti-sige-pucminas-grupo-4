import type { Prisma } from '@prisma/client';
import { prisma, type ClienteBanco } from './db';

export interface RegistroAuditoria {
  /** Usuário que fez a operação (null para operações do sistema). */
  usuarioId: number | null;
  /** Verbo curto: 'venda.finalizar', 'cliente.anonimizar', 'conta-pagar.estornar'... */
  acao: string;
  /** Nome do modelo afetado: 'Venda', 'Cliente'... */
  entidade: string;
  entidadeId?: string | number | null;
  /** Dados relevantes da operação (sem senhas nem dados de saúde desnecessários). */
  dados?: Prisma.InputJsonValue;
}

/**
 * RNF-GER-03: registra quem fez cada operação e quando.
 * Passe o `tx` quando estiver dentro de uma transação, para que a auditoria
 * seja desfeita junto se a operação falhar.
 */
export async function registrarAuditoria(registro: RegistroAuditoria, db: ClienteBanco = prisma) {
  await db.auditoria.create({
    data: {
      usuarioId: registro.usuarioId,
      acao: registro.acao,
      entidade: registro.entidade,
      entidadeId: registro.entidadeId == null ? null : String(registro.entidadeId),
      dados: registro.dados,
    },
  });
}
