import { z } from 'zod';
import {
  FORMAS_PAGAMENTO,
  FormaPagamentoConta,
  OrigemContaPagar,
  OrigemContaReceber,
  SituacaoPrazo,
  StatusContaPagar,
  StatusContaReceber,
} from '../enums';
import { CentavosPositivo, DataHoraISO, DataISO, Id, rota, TextoObrigatorio } from './comum';

// ---------- Contas a pagar ----------

export const ContaPagar = z.object({
  id: z.number().int(),
  credor: z.string(),
  fornecedorId: z.number().int().nullable(),
  origemTipo: OrigemContaPagar,
  origemId: z.number().int().nullable(),
  /** Texto da origem para a tela (ex.: "NF-e 118.442 · dup. 001"). */
  origemDescricao: z.string(),
  descricao: z.string(),
  vencimento: DataISO,
  valorCentavos: z.number().int(),
  formaPagamento: FormaPagamentoConta.nullable(),
  status: StatusContaPagar,
  pagaEm: DataHoraISO.nullable(),
  estornoDeId: z.number().int().nullable(),
  /** Gerada automaticamente (não pode ser excluída, só estornada — RNF-FIN-02). */
  automatica: z.boolean(),
  /** Destaque de prazo para contas abertas (RF-FIN-06); null quando não está aberta. */
  situacaoPrazo: SituacaoPrazo.nullable(),
  criadoEm: DataHoraISO,
});
export type ContaPagar = z.infer<typeof ContaPagar>;

export const ContaPagarEntrada = z.object({
  credor: TextoObrigatorio(2, 'Informe o credor'),
  fornecedorId: Id.nullable().optional(),
  descricao: TextoObrigatorio(2, 'Informe a descrição'),
  vencimento: DataISO,
  valorCentavos: CentavosPositivo,
  formaPagamento: FormaPagamentoConta,
});
export type ContaPagarEntrada = z.input<typeof ContaPagarEntrada>;

// ---------- Contas a receber ----------

export const ContaReceber = z.object({
  id: z.number().int(),
  pagador: z.string(),
  origemTipo: OrigemContaReceber,
  origemId: z.number().int().nullable(),
  origemDescricao: z.string(),
  convenioId: z.number().int().nullable(),
  descricao: z.string(),
  vencimento: DataISO,
  valorCentavos: z.number().int(),
  status: StatusContaReceber,
  recebidaEm: DataHoraISO.nullable(),
  estornoDeId: z.number().int().nullable(),
  automatica: z.boolean(),
  situacaoPrazo: SituacaoPrazo.nullable(),
  /** Quantidade de vendas na fatura (só para FATURA_CONVENIO). */
  quantidadeVendasFatura: z.number().int().nullable(),
  criadoEm: DataHoraISO,
});
export type ContaReceber = z.infer<typeof ContaReceber>;

export const ContaReceberEntrada = z.object({
  pagador: TextoObrigatorio(2, 'Informe o pagador'),
  descricao: TextoObrigatorio(2, 'Informe a descrição'),
  vencimento: DataISO,
  valorCentavos: CentavosPositivo,
});
export type ContaReceberEntrada = z.input<typeof ContaReceberEntrada>;

export const ListarContasQuery = z.object({
  status: z.string().optional(),
  inicio: DataISO.optional(),
  fim: DataISO.optional(),
});

export const BaixaEntrada = z.object({
  /** Data do pagamento/recebimento. Padrão: agora. */
  data: DataISO.optional(),
});

export const EstornoEntrada = z.object({
  motivo: TextoObrigatorio(3, 'Informe o motivo do estorno'),
});

// ---------- Indicadores ----------

export const ResumoFinanceiro = z.object({
  /** Soma de todos os movimentos de caixa (RF-FIN-05, RNF-FIN-03). */
  saldoCaixaCentavos: z.number().int(),
  aReceber30DiasCentavos: z.number().int(),
  aPagar30DiasCentavos: z.number().int(),
  /** Contas a pagar abertas e vencidas. */
  emAtrasoCentavos: z.number().int(),
});
export type ResumoFinanceiro = z.infer<typeof ResumoFinanceiro>;

export const AlertasFinanceiro = z.object({
  vencidas: z.object({ pagar: z.array(ContaPagar), receber: z.array(ContaReceber) }),
  vencemEm7Dias: z.object({ pagar: z.array(ContaPagar), receber: z.array(ContaReceber) }),
});
export type AlertasFinanceiro = z.infer<typeof AlertasFinanceiro>;

export const FluxoCaixaQuery = z.object({
  semanas: z.coerce.number().int().min(1).max(26).default(6),
});

export const FluxoCaixa = z.object({
  saldoInicialCentavos: z.number().int(),
  semanas: z.array(
    z.object({
      inicio: DataISO,
      fim: DataISO,
      entradasCentavos: z.number().int(),
      saidasCentavos: z.number().int(),
      saldoProjetadoCentavos: z.number().int(),
    }),
  ),
});
export type FluxoCaixa = z.infer<typeof FluxoCaixa>;

// ---------- Caixa diário ----------

export const TotaisPorForma = z.object(
  Object.fromEntries(FORMAS_PAGAMENTO.map((f) => [f, z.number().int()])) as Record<
    (typeof FORMAS_PAGAMENTO)[number],
    z.ZodNumber
  >,
);
export type TotaisPorForma = z.infer<typeof TotaisPorForma>;

export const CaixaDiario = z.object({
  id: z.number().int(),
  operadorId: z.number().int(),
  operadorNome: z.string(),
  abertoEm: DataHoraISO,
  valorAberturaCentavos: z.number().int(),
  fechadoEm: DataHoraISO.nullable(),
  valorFechamentoCentavos: z.number().int().nullable(),
  /** Total de vendas por forma de pagamento no período do caixa (RF-FIN-08). */
  totaisPorForma: TotaisPorForma,
  totalVendasCentavos: z.number().int(),
  /** Dinheiro esperado na gaveta: abertura + vendas em dinheiro. */
  esperadoEmDinheiroCentavos: z.number().int(),
  /** Fechamento - esperado em dinheiro (null enquanto aberto). */
  diferencaCentavos: z.number().int().nullable(),
  observacao: z.string().nullable(),
});
export type CaixaDiario = z.infer<typeof CaixaDiario>;

export const AbrirCaixaEntrada = z.object({
  valorAberturaCentavos: z.number().int().min(0),
});
export const FecharCaixaEntrada = z.object({
  valorFechamentoCentavos: z.number().int().min(0),
  observacao: z.string().trim().optional(),
});

// ---------- Rotas ----------

export const rotasFinanceiro = {
  /** RF-FIN-01 */
  listarContasPagar: rota({
    metodo: 'GET',
    caminho: '/api/financeiro/contas-pagar',
    query: ListarContasQuery,
    resposta: z.array(ContaPagar),
  }),
  criarContaPagar: rota({
    metodo: 'POST',
    caminho: '/api/financeiro/contas-pagar',
    corpo: ContaPagarEntrada,
    resposta: ContaPagar,
  }),
  /** RF-FIN-05 */
  baixarContaPagar: rota({
    metodo: 'POST',
    caminho: '/api/financeiro/contas-pagar/:id/baixa',
    corpo: BaixaEntrada,
    resposta: ContaPagar,
  }),
  /** RNF-FIN-02 */
  estornarContaPagar: rota({
    metodo: 'POST',
    caminho: '/api/financeiro/contas-pagar/:id/estorno',
    corpo: EstornoEntrada,
    resposta: ContaPagar,
  }),
  /** RF-FIN-03 */
  listarContasReceber: rota({
    metodo: 'GET',
    caminho: '/api/financeiro/contas-receber',
    query: ListarContasQuery,
    resposta: z.array(ContaReceber),
  }),
  criarContaReceber: rota({
    metodo: 'POST',
    caminho: '/api/financeiro/contas-receber',
    corpo: ContaReceberEntrada,
    resposta: ContaReceber,
  }),
  /** RF-FIN-05 */
  baixarContaReceber: rota({
    metodo: 'POST',
    caminho: '/api/financeiro/contas-receber/:id/baixa',
    corpo: BaixaEntrada,
    resposta: ContaReceber,
  }),
  /** RNF-FIN-02 */
  estornarContaReceber: rota({
    metodo: 'POST',
    caminho: '/api/financeiro/contas-receber/:id/estorno',
    corpo: EstornoEntrada,
    resposta: ContaReceber,
  }),
  /** RNF-FIN-03 */
  resumo: rota({ metodo: 'GET', caminho: '/api/financeiro/resumo', resposta: ResumoFinanceiro }),
  /** RF-FIN-06 */
  alertas: rota({ metodo: 'GET', caminho: '/api/financeiro/alertas', resposta: AlertasFinanceiro }),
  /** RF-FIN-07 */
  fluxoCaixa: rota({
    metodo: 'GET',
    caminho: '/api/financeiro/fluxo-caixa',
    query: FluxoCaixaQuery,
    resposta: FluxoCaixa,
  }),
  /** RF-FIN-08 — FINANCEIRO, ATENDENTE e ADMIN */
  abrirCaixa: rota({
    metodo: 'POST',
    caminho: '/api/financeiro/caixa/abrir',
    corpo: AbrirCaixaEntrada,
    resposta: CaixaDiario,
  }),
  fecharCaixa: rota({
    metodo: 'POST',
    caminho: '/api/financeiro/caixa/fechar',
    corpo: FecharCaixaEntrada,
    resposta: CaixaDiario,
  }),
  caixaAtual: rota({
    metodo: 'GET',
    caminho: '/api/financeiro/caixa/atual',
    resposta: CaixaDiario.nullable(),
  }),
  historicoCaixa: rota({
    metodo: 'GET',
    caminho: '/api/financeiro/caixa/historico',
    resposta: z.array(CaixaDiario),
  }),
};
