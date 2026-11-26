import { z } from 'zod';

/*
 * Valores fixos do sistema. Devem ser idênticos aos enums de backend/prisma/schema.prisma.
 * Cada enum tem a lista de valores, o esquema Zod e os rótulos para exibição.
 */

export const PERFIS = ['ADMIN', 'FARMACEUTICO', 'ATENDENTE', 'FINANCEIRO'] as const;
export const Perfil = z.enum(PERFIS);
export type Perfil = z.infer<typeof Perfil>;
export const ROTULOS_PERFIL: Record<Perfil, string> = {
  ADMIN: 'Administrador',
  FARMACEUTICO: 'Farmacêutico',
  ATENDENTE: 'Atendente',
  FINANCEIRO: 'Financeiro',
};

export const CLASSES_PRODUTO = ['GENERICO', 'REFERENCIA', 'SIMILAR', 'OUTRO'] as const;
export const ClasseProduto = z.enum(CLASSES_PRODUTO);
export type ClasseProduto = z.infer<typeof ClasseProduto>;
export const ROTULOS_CLASSE_PRODUTO: Record<ClasseProduto, string> = {
  GENERICO: 'Genérico',
  REFERENCIA: 'Referência',
  SIMILAR: 'Similar',
  OUTRO: 'Outro',
};

export const TIPOS_CONTROLE = ['NENHUM', 'ANTIMICROBIANO', 'CONTROLADO'] as const;
export const TipoControle = z.enum(TIPOS_CONTROLE);
export type TipoControle = z.infer<typeof TipoControle>;
export const ROTULOS_TIPO_CONTROLE: Record<TipoControle, string> = {
  NENHUM: 'Livre',
  ANTIMICROBIANO: 'Antimicrobiano',
  CONTROLADO: 'Controlado',
};

/** Listas da Portaria SVS/MS nº 344/1998 usadas pelo sistema. */
export const LISTAS_PORTARIA_344 = [
  'A1',
  'A2',
  'A3',
  'B1',
  'B2',
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
] as const;
export const ListaPortaria344 = z.enum(LISTAS_PORTARIA_344);
export type ListaPortaria344 = z.infer<typeof ListaPortaria344>;

export const FORMAS_PAGAMENTO = [
  'DINHEIRO',
  'CARTAO_DEBITO',
  'CARTAO_CREDITO',
  'PIX',
  'CONVENIO',
] as const;
export const FormaPagamento = z.enum(FORMAS_PAGAMENTO);
export type FormaPagamento = z.infer<typeof FormaPagamento>;
export const ROTULOS_FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  DINHEIRO: 'Dinheiro',
  CARTAO_DEBITO: 'Cartão de débito',
  CARTAO_CREDITO: 'Cartão de crédito',
  PIX: 'Pix',
  CONVENIO: 'Convênio',
};

export const FORMAS_PAGAMENTO_CONTA = [
  'BOLETO',
  'TRANSFERENCIA',
  'PIX',
  'DINHEIRO',
  'CARTAO',
  'DEBITO_AUTOMATICO',
] as const;
export const FormaPagamentoConta = z.enum(FORMAS_PAGAMENTO_CONTA);
export type FormaPagamentoConta = z.infer<typeof FormaPagamentoConta>;
export const ROTULOS_FORMA_PAGAMENTO_CONTA: Record<FormaPagamentoConta, string> = {
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'Transferência',
  PIX: 'Pix',
  DINHEIRO: 'Dinheiro',
  CARTAO: 'Cartão',
  DEBITO_AUTOMATICO: 'Débito automático',
};

export const STATUS_VENDA = ['FINALIZADA', 'CANCELADA'] as const;
export const StatusVenda = z.enum(STATUS_VENDA);
export type StatusVenda = z.infer<typeof StatusVenda>;

export const TIPOS_RECEITA = ['ANTIMICROBIANO', 'CONTROLE_ESPECIAL'] as const;
export const TipoReceita = z.enum(TIPOS_RECEITA);
export type TipoReceita = z.infer<typeof TipoReceita>;
export const ROTULOS_TIPO_RECEITA: Record<TipoReceita, string> = {
  ANTIMICROBIANO: 'Receita de antimicrobiano',
  CONTROLE_ESPECIAL: 'Receita de controle especial',
};

export const SEXOS = ['F', 'M'] as const;
export const Sexo = z.enum(SEXOS);
export type Sexo = z.infer<typeof Sexo>;

export const TIPOS_SOLICITACAO_TITULAR = ['ACESSO', 'CORRECAO', 'EXCLUSAO'] as const;
export const TipoSolicitacaoTitular = z.enum(TIPOS_SOLICITACAO_TITULAR);
export type TipoSolicitacaoTitular = z.infer<typeof TipoSolicitacaoTitular>;
export const ROTULOS_TIPO_SOLICITACAO: Record<TipoSolicitacaoTitular, string> = {
  ACESSO: 'Acesso aos dados',
  CORRECAO: 'Correção de dados',
  EXCLUSAO: 'Exclusão (anonimização)',
};

export const STATUS_SOLICITACAO_TITULAR = ['PENDENTE', 'ATENDIDA'] as const;
export const StatusSolicitacaoTitular = z.enum(STATUS_SOLICITACAO_TITULAR);
export type StatusSolicitacaoTitular = z.infer<typeof StatusSolicitacaoTitular>;

export const MOTIVOS_PERDA = ['VENCIMENTO', 'AVARIA', 'FURTO'] as const;
export const MotivoPerda = z.enum(MOTIVOS_PERDA);
export type MotivoPerda = z.infer<typeof MotivoPerda>;
export const ROTULOS_MOTIVO_PERDA: Record<MotivoPerda, string> = {
  VENCIMENTO: 'Vencimento',
  AVARIA: 'Avaria',
  FURTO: 'Furto',
};

export const STATUS_INVENTARIO = ['ABERTO', 'FECHADO'] as const;
export const StatusInventario = z.enum(STATUS_INVENTARIO);
export type StatusInventario = z.infer<typeof StatusInventario>;

export const TIPOS_MOVIMENTO_CONTROLADO = ['ENTRADA', 'SAIDA', 'PERDA', 'AJUSTE'] as const;
export const TipoMovimentoControlado = z.enum(TIPOS_MOVIMENTO_CONTROLADO);
export type TipoMovimentoControlado = z.infer<typeof TipoMovimentoControlado>;

export const STATUS_MOVIMENTO_CONTROLADO = ['OK', 'INCONSISTENTE', 'TRANSMITIDO'] as const;
export const StatusMovimentoControlado = z.enum(STATUS_MOVIMENTO_CONTROLADO);
export type StatusMovimentoControlado = z.infer<typeof StatusMovimentoControlado>;

export const ORIGENS_MOVIMENTO_CONTROLADO = [
  'NOTA_ENTRADA',
  'VENDA',
  'CANCELAMENTO_VENDA',
  'PERDA',
  'INVENTARIO',
  'CORRECAO',
] as const;
export const OrigemMovimentoControlado = z.enum(ORIGENS_MOVIMENTO_CONTROLADO);
export type OrigemMovimentoControlado = z.infer<typeof OrigemMovimentoControlado>;

export const STATUS_TRANSMISSAO = ['ACEITA', 'REJEITADA'] as const;
export const StatusTransmissao = z.enum(STATUS_TRANSMISSAO);
export type StatusTransmissao = z.infer<typeof StatusTransmissao>;

export const ORIGENS_CONTA_PAGAR = ['MANUAL', 'NOTA_ENTRADA'] as const;
export const OrigemContaPagar = z.enum(ORIGENS_CONTA_PAGAR);
export type OrigemContaPagar = z.infer<typeof OrigemContaPagar>;

export const STATUS_CONTA_PAGAR = ['ABERTA', 'PAGA', 'ESTORNADA'] as const;
export const StatusContaPagar = z.enum(STATUS_CONTA_PAGAR);
export type StatusContaPagar = z.infer<typeof StatusContaPagar>;

export const ORIGENS_CONTA_RECEBER = ['MANUAL', 'VENDA_CARTAO', 'FATURA_CONVENIO'] as const;
export const OrigemContaReceber = z.enum(ORIGENS_CONTA_RECEBER);
export type OrigemContaReceber = z.infer<typeof OrigemContaReceber>;

export const STATUS_CONTA_RECEBER = ['ABERTA', 'RECEBIDA', 'ESTORNADA'] as const;
export const StatusContaReceber = z.enum(STATUS_CONTA_RECEBER);
export type StatusContaReceber = z.infer<typeof StatusContaReceber>;

export const TIPOS_MOVIMENTO_CAIXA = ['ENTRADA', 'SAIDA'] as const;
export const TipoMovimentoCaixa = z.enum(TIPOS_MOVIMENTO_CAIXA);
export type TipoMovimentoCaixa = z.infer<typeof TipoMovimentoCaixa>;

export const ORIGENS_MOVIMENTO_CAIXA = [
  'VENDA',
  'CANCELAMENTO_VENDA',
  'CONTA_PAGAR',
  'CONTA_RECEBER',
  'ESTORNO_CONTA_PAGAR',
  'ESTORNO_CONTA_RECEBER',
  'MANUAL',
] as const;
export const OrigemMovimentoCaixa = z.enum(ORIGENS_MOVIMENTO_CAIXA);
export type OrigemMovimentoCaixa = z.infer<typeof OrigemMovimentoCaixa>;

/** Situação de prazo usada para destacar contas (RF-FIN-06) e lotes (RF-EST-04). */
export const SITUACOES_PRAZO = ['VENCIDA', 'VENCE_EM_BREVE', 'NO_PRAZO'] as const;
export const SituacaoPrazo = z.enum(SITUACOES_PRAZO);
export type SituacaoPrazo = z.infer<typeof SituacaoPrazo>;

export const SITUACOES_LOTE = ['OK', 'VENCENDO', 'VENCIDO'] as const;
export const SituacaoLote = z.enum(SITUACOES_LOTE);
export type SituacaoLote = z.infer<typeof SituacaoLote>;

/** Chaves da tabela Configuracao. */
export const CHAVES_CONFIGURACAO = {
  nomeSistema: 'nomeSistema',
  nomeLoja: 'nomeLoja',
  prazoCartaoDebitoDias: 'prazoCartaoDebitoDias',
  prazoCartaoCreditoDias: 'prazoCartaoCreditoDias',
  diasAlertaValidade: 'diasAlertaValidade',
  diasAlertaContas: 'diasAlertaContas',
} as const;
export type ChaveConfiguracao = (typeof CHAVES_CONFIGURACAO)[keyof typeof CHAVES_CONFIGURACAO];
