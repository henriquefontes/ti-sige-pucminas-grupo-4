import { z } from 'zod';
import {
  ClasseProduto,
  FormaPagamento,
  Sexo,
  StatusVenda,
  TipoControle,
  TipoReceita,
} from '../enums';
import { DataHoraISO, DataISO, Id, rota, TextoObrigatorio } from './comum';

// ---------- Produtos para venda ----------

export const LoteVenda = z.object({
  id: z.number().int(),
  numero: z.string(),
  validade: DataISO,
  quantidade: z.number().int(),
  /** Lote vencido: aparece bloqueado na tela (RF-VEN-03). */
  vencido: z.boolean(),
});
export type LoteVenda = z.infer<typeof LoteVenda>;

export const ProdutoVenda = z.object({
  id: z.number().int(),
  nome: z.string(),
  principioAtivo: z.string(),
  codigoBarras: z.string(),
  classe: ClasseProduto,
  tipoControle: TipoControle,
  listaPortaria344: z.string().nullable(),
  precoVendaCentavos: z.number().int(),
  /** Soma dos lotes não vencidos com saldo. */
  saldoTotal: z.number().int(),
  /** Lote sugerido por FEFO, ignorando vencidos e zerados (RF-VEN-03). */
  loteSugerido: LoteVenda.nullable(),
  /** Todos os lotes com saldo, ordenados por validade (inclui vencidos, marcados). */
  lotes: z.array(LoteVenda),
});
export type ProdutoVenda = z.infer<typeof ProdutoVenda>;

export const BuscaProdutosVendaQuery = z.object({
  busca: z.string().trim().optional(),
});

// ---------- Prévia e finalização ----------

export const ItemVendaEntrada = z.object({
  produtoId: Id,
  /** Lote escolhido. Se omitido, usa o lote sugerido (FEFO). */
  loteId: Id.optional(),
  quantidade: z.number().int().positive('Quantidade deve ser maior que zero'),
});
export type ItemVendaEntrada = z.infer<typeof ItemVendaEntrada>;

export const ReceitaEntrada = z.object({
  tipo: TipoReceita,
  numero: TextoObrigatorio(1, 'Informe o número da receita'),
  prescritorNome: TextoObrigatorio(1, 'Informe o prescritor'),
  crm: TextoObrigatorio(1, 'Informe o CRM'),
  uf: z
    .string()
    .trim()
    .length(2, 'UF deve ter 2 letras')
    .transform((v) => v.toUpperCase()),
  dataEmissao: DataISO,
  pacienteNome: TextoObrigatorio(1, 'Informe o nome do paciente'),
  pacienteIdade: z.number().int().min(0).max(130),
  pacienteSexo: Sexo,
});
export type ReceitaEntrada = z.infer<typeof ReceitaEntrada>;

export const PreviaVendaEntrada = z.object({
  itens: z.array(ItemVendaEntrada).min(1, 'Inclua ao menos um item'),
  clienteId: Id.nullable().optional(),
});
export type PreviaVendaEntrada = z.infer<typeof PreviaVendaEntrada>;

export const ItemPrevia = z.object({
  produtoId: z.number().int(),
  produtoNome: z.string(),
  loteId: z.number().int(),
  loteNumero: z.string(),
  validade: DataISO,
  quantidade: z.number().int(),
  precoUnitarioCentavos: z.number().int(),
  subtotalCentavos: z.number().int(),
  tipoControle: TipoControle,
});
export type ItemPrevia = z.infer<typeof ItemPrevia>;

export const DescontoAplicado = z.object({
  convenioId: z.number().int().nullable(),
  descricao: z.string().nullable(),
});

export const PreviaVendaResposta = z.object({
  itens: z.array(ItemPrevia),
  subtotalCentavos: z.number().int(),
  descontoCentavos: z.number().int(),
  totalCentavos: z.number().int(),
  desconto: DescontoAplicado,
  /** Verdadeiro se algum item for antimicrobiano ou controlado (RF-VEN-04). */
  exigeReceita: z.boolean(),
  /** Tipos de receita exigidos pelos itens. */
  tiposReceita: z.array(TipoReceita),
});
export type PreviaVendaResposta = z.infer<typeof PreviaVendaResposta>;

export const FinalizarVendaEntrada = PreviaVendaEntrada.extend({
  formaPagamento: FormaPagamento,
  receitas: z.array(ReceitaEntrada).default([]),
});
export type FinalizarVendaEntrada = z.input<typeof FinalizarVendaEntrada>;

// ---------- Consulta ----------

export const VendaResumo = z.object({
  id: z.number().int(),
  numero: z.number().int(),
  criadoEm: DataHoraISO,
  status: StatusVenda,
  operadorNome: z.string(),
  clienteNome: z.string().nullable(),
  formaPagamento: FormaPagamento,
  totalCentavos: z.number().int(),
  quantidadeItens: z.number().int(),
});
export type VendaResumo = z.infer<typeof VendaResumo>;

export const ItemVendaDetalhe = z.object({
  id: z.number().int(),
  produtoId: z.number().int(),
  produtoNome: z.string(),
  loteId: z.number().int(),
  loteNumero: z.string(),
  validade: DataISO,
  quantidade: z.number().int(),
  precoUnitarioCentavos: z.number().int(),
  subtotalCentavos: z.number().int(),
  cancelado: z.boolean(),
  motivoCancelamento: z.string().nullable(),
});
export type ItemVendaDetalhe = z.infer<typeof ItemVendaDetalhe>;

export const ReceitaDetalhe = ReceitaEntrada.extend({ id: z.number().int() });
export type ReceitaDetalhe = z.infer<typeof ReceitaDetalhe>;

export const VendaDetalhe = VendaResumo.extend({
  subtotalCentavos: z.number().int(),
  descontoCentavos: z.number().int(),
  convenioId: z.number().int().nullable(),
  chaveDocumentoFiscal: z.string().nullable(),
  canceladaEm: DataHoraISO.nullable(),
  motivoCancelamento: z.string().nullable(),
  canceladaPorNome: z.string().nullable(),
  cliente: z
    .object({ id: z.number().int(), nome: z.string(), cpfMascarado: z.string() })
    .nullable(),
  itens: z.array(ItemVendaDetalhe),
  receitas: z.array(ReceitaDetalhe),
});
export type VendaDetalhe = z.infer<typeof VendaDetalhe>;

export const ListarVendasQuery = z.object({
  /** Dia (AAAA-MM-DD, fuso America/Sao_Paulo). Padrão: hoje. */
  data: DataISO.optional(),
});

export const CancelamentoEntrada = z.object({
  motivo: TextoObrigatorio(3, 'Informe o motivo do cancelamento'),
});
export type CancelamentoEntrada = z.infer<typeof CancelamentoEntrada>;

export const DocumentoFiscalSimulado = z.object({
  simulado: z.literal(true),
  chave: z.string(),
  numero: z.number().int(),
  serie: z.string(),
  emitidoEm: DataHoraISO,
  nomeLoja: z.string(),
  operadorNome: z.string(),
  consumidorCpfMascarado: z.string().nullable(),
  itens: z.array(
    z.object({
      descricao: z.string(),
      quantidade: z.number().int(),
      precoUnitarioCentavos: z.number().int(),
      subtotalCentavos: z.number().int(),
      cancelado: z.boolean(),
    }),
  ),
  subtotalCentavos: z.number().int(),
  descontoCentavos: z.number().int(),
  totalCentavos: z.number().int(),
  formaPagamento: FormaPagamento,
  status: StatusVenda,
});
export type DocumentoFiscalSimulado = z.infer<typeof DocumentoFiscalSimulado>;

// ---------- Rotas ----------

export const rotasVendas = {
  /** RF-VEN-01, RF-VEN-03 */
  buscarProdutos: rota({
    metodo: 'GET',
    caminho: '/api/vendas/produtos',
    query: BuscaProdutosVendaQuery,
    resposta: z.array(ProdutoVenda),
  }),
  /** RF-VEN-02, RNF-VEN-02 */
  produtoPorCodigo: rota({
    metodo: 'GET',
    caminho: '/api/vendas/produtos/codigo/:codigoBarras',
    resposta: ProdutoVenda,
  }),
  /** RF-VEN-04, RF-ATD-05 (consome o gancho descontoVenda) */
  previa: rota({
    metodo: 'POST',
    caminho: '/api/vendas/previa',
    corpo: PreviaVendaEntrada,
    resposta: PreviaVendaResposta,
  }),
  /** RF-VEN-02 a 07, RF-VEN-08 (simulado), RF-VEN-10, RNF-EST-03 */
  finalizar: rota({
    metodo: 'POST',
    caminho: '/api/vendas',
    corpo: FinalizarVendaEntrada,
    resposta: VendaDetalhe,
  }),
  listar: rota({
    metodo: 'GET',
    caminho: '/api/vendas',
    query: ListarVendasQuery,
    resposta: z.array(VendaResumo),
  }),
  obter: rota({ metodo: 'GET', caminho: '/api/vendas/:id', resposta: VendaDetalhe }),
  /** RF-VEN-09 — somente FARMACEUTICO e ADMIN */
  cancelar: rota({
    metodo: 'POST',
    caminho: '/api/vendas/:id/cancelar',
    corpo: CancelamentoEntrada,
    resposta: VendaDetalhe,
  }),
  /** RF-VEN-09 — somente FARMACEUTICO e ADMIN */
  cancelarItem: rota({
    metodo: 'POST',
    caminho: '/api/vendas/:id/itens/:itemId/cancelar',
    corpo: CancelamentoEntrada,
    resposta: VendaDetalhe,
  }),
  /** RF-VEN-08 (simulado) */
  documentoFiscal: rota({
    metodo: 'GET',
    caminho: '/api/vendas/:id/documento-fiscal',
    resposta: DocumentoFiscalSimulado,
  }),
};
