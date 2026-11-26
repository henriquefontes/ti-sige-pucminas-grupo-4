import { z } from 'zod';
import {
  ClasseProduto,
  ListaPortaria344,
  MotivoPerda,
  OrigemMovimentoControlado,
  Sexo,
  SituacaoLote,
  StatusInventario,
  StatusMovimentoControlado,
  StatusTransmissao,
  TipoControle,
  TipoMovimentoControlado,
  TipoReceita,
} from '../enums';
import { DataHoraISO, DataISO, Id, rota, TextoObrigatorio } from './comum';

// ---------- Produtos e lotes ----------

export const LoteEstoque = z.object({
  id: z.number().int(),
  numero: z.string(),
  validade: DataISO,
  quantidade: z.number().int(),
  custoUnitarioCentavos: z.number().int(),
  /** OK, VENCENDO (até o limite da configuração, padrão 60 dias) ou VENCIDO. */
  situacao: SituacaoLote,
  diasParaVencer: z.number().int(),
});
export type LoteEstoque = z.infer<typeof LoteEstoque>;

export const ProdutoEstoque = z.object({
  id: z.number().int(),
  nome: z.string(),
  principioAtivo: z.string(),
  codigoBarras: z.string(),
  classe: ClasseProduto,
  tipoControle: TipoControle,
  listaPortaria344: z.string().nullable(),
  precoVendaCentavos: z.number().int(),
  estoqueMinimo: z.number().int(),
  saldoTotal: z.number().int(),
  abaixoMinimo: z.boolean(),
  lotes: z.array(LoteEstoque),
});
export type ProdutoEstoque = z.infer<typeof ProdutoEstoque>;

export const FILTROS_PRODUTO_ESTOQUE = ['vencendo', 'abaixo-minimo', 'controlados'] as const;
export const ListarProdutosEstoqueQuery = z.object({
  filtro: z.enum(FILTROS_PRODUTO_ESTOQUE).optional(),
  busca: z.string().trim().optional(),
});

/** RF-EST-03: classificação (classe, controle e lista da Portaria 344) e estoque mínimo. */
export const ProdutoAtualizacao = z
  .object({
    classe: ClasseProduto.optional(),
    tipoControle: TipoControle.optional(),
    listaPortaria344: ListaPortaria344.nullable().optional(),
    estoqueMinimo: z.number().int().min(0).optional(),
    precoVendaCentavos: z.number().int().positive().optional(),
  })
  .refine(
    (v) => v.tipoControle !== 'CONTROLADO' || v.listaPortaria344 !== null,
    'Produto controlado precisa da lista da Portaria 344',
  );
export type ProdutoAtualizacao = z.input<typeof ProdutoAtualizacao>;

// ---------- Entrada por NF-e ----------

export const NotaEntrada = z.object({
  id: z.number().int(),
  numero: z.string(),
  serie: z.string(),
  chave: z.string(),
  emissao: DataHoraISO,
  fornecedor: z.object({ id: z.number().int(), nome: z.string(), cnpj: z.string() }),
  valorTotalCentavos: z.number().int(),
  itens: z.array(
    z.object({
      produtoId: z.number().int(),
      produtoNome: z.string(),
      loteId: z.number().int(),
      loteNumero: z.string(),
      validade: DataISO,
      quantidade: z.number().int(),
      custoUnitarioCentavos: z.number().int(),
    }),
  ),
  duplicatas: z.array(
    z.object({ numero: z.string(), vencimento: DataISO, valorCentavos: z.number().int() }),
  ),
  criadoEm: DataHoraISO,
});
export type NotaEntrada = z.infer<typeof NotaEntrada>;

// ---------- Alertas ----------

export const AlertaLote = z.object({
  loteId: z.number().int(),
  produtoId: z.number().int(),
  produtoNome: z.string(),
  numero: z.string(),
  validade: DataISO,
  quantidade: z.number().int(),
  diasParaVencer: z.number().int(),
});

export const AlertasEstoque = z.object({
  /** Lotes com saldo que vencem em até 60 dias (RF-EST-04). */
  lotesVencendo: z.array(AlertaLote),
  /** Lotes com saldo já vencidos. */
  lotesVencidos: z.array(AlertaLote),
  /** Produtos com saldo abaixo do mínimo (RF-EST-04). */
  abaixoMinimo: z.array(
    z.object({
      produtoId: z.number().int(),
      produtoNome: z.string(),
      saldoTotal: z.number().int(),
      estoqueMinimo: z.number().int(),
    }),
  ),
});
export type AlertasEstoque = z.infer<typeof AlertasEstoque>;

// ---------- Perdas ----------

export const PerdaEntrada = z.object({
  loteId: Id,
  quantidade: z.number().int().positive(),
  motivo: MotivoPerda,
  observacao: z.string().trim().optional(),
});
export type PerdaEntrada = z.input<typeof PerdaEntrada>;

export const Perda = z.object({
  id: z.number().int(),
  loteId: z.number().int(),
  loteNumero: z.string(),
  produtoId: z.number().int(),
  produtoNome: z.string(),
  quantidade: z.number().int(),
  motivo: MotivoPerda,
  observacao: z.string().nullable(),
  usuarioNome: z.string(),
  criadoEm: DataHoraISO,
});
export type Perda = z.infer<typeof Perda>;

// ---------- Inventário ----------

export const InventarioResumo = z.object({
  id: z.number().int(),
  status: StatusInventario,
  abertoEm: DataHoraISO,
  abertoPorNome: z.string(),
  fechadoEm: DataHoraISO.nullable(),
  fechadoPorNome: z.string().nullable(),
  observacao: z.string().nullable(),
});
export type InventarioResumo = z.infer<typeof InventarioResumo>;

export const InventarioDetalhe = InventarioResumo.extend({
  itens: z.array(
    z.object({
      id: z.number().int(),
      loteId: z.number().int(),
      loteNumero: z.string(),
      validade: DataISO,
      produtoId: z.number().int(),
      produtoNome: z.string(),
      quantidadeSistema: z.number().int(),
      quantidadeContada: z.number().int().nullable(),
      /** contada - sistema, ou null se ainda não contado. */
      diferenca: z.number().int().nullable(),
    }),
  ),
});
export type InventarioDetalhe = z.infer<typeof InventarioDetalhe>;

export const AbrirInventarioEntrada = z.object({ observacao: z.string().trim().optional() });

export const ContagensEntrada = z.object({
  contagens: z.array(z.object({ loteId: Id, quantidadeContada: z.number().int().min(0) })).min(1),
});
export type ContagensEntrada = z.input<typeof ContagensEntrada>;

// ---------- Controlados (SNGPC) ----------

export const ReceitaMovimento = z.object({
  id: z.number().int(),
  tipo: TipoReceita,
  numero: z.string(),
  prescritorNome: z.string(),
  crm: z.string(),
  uf: z.string(),
  dataEmissao: DataISO,
  pacienteNome: z.string(),
  pacienteIdade: z.number().int().nullable(),
  pacienteSexo: Sexo.nullable(),
});

export const MovimentoControlado = z.object({
  id: z.number().int(),
  data: DataHoraISO,
  tipo: TipoMovimentoControlado,
  produtoId: z.number().int(),
  produtoNome: z.string(),
  tipoControle: TipoControle,
  listaPortaria344: z.string().nullable(),
  loteId: z.number().int().nullable(),
  loteNumero: z.string(),
  quantidade: z.number().int(),
  origemTipo: OrigemMovimentoControlado,
  origemId: z.number().int().nullable(),
  /** Texto curto da origem para a tela (ex.: "NF-e 118.301", "Venda 42"). */
  origemDescricao: z.string(),
  receita: ReceitaMovimento.nullable(),
  status: StatusMovimentoControlado,
  /** Motivos de inconsistência (RF-EST-08). */
  inconsistencias: z.array(z.string()),
  /** Movimento que este corrige (RNF-EST-02). */
  corrigeMovimentoId: z.number().int().nullable(),
  /** Movimento que corrigiu este, se houver. */
  corrigidoPorId: z.number().int().nullable(),
  transmissaoId: z.number().int().nullable(),
  observacao: z.string().nullable(),
});
export type MovimentoControlado = z.infer<typeof MovimentoControlado>;

export const ListarMovimentosQuery = z.object({
  inicio: DataISO.optional(),
  fim: DataISO.optional(),
  status: StatusMovimentoControlado.optional(),
});

export const PeriodoEntrada = z
  .object({ inicio: DataISO, fim: DataISO })
  .refine((v) => v.inicio <= v.fim, 'O início deve ser anterior ou igual ao fim');
export type PeriodoEntrada = z.infer<typeof PeriodoEntrada>;

/**
 * Correção de movimento (RNF-EST-02): cria um novo movimento que aponta para o original.
 * Os campos omitidos são copiados do original.
 */
export const CorrecaoMovimentoEntrada = z.object({
  justificativa: TextoObrigatorio(3, 'Informe a justificativa'),
  loteId: Id.optional(),
  quantidade: z.number().int().positive().optional(),
  receita: z
    .object({
      numero: z.string().trim().min(1).optional(),
      prescritorNome: z.string().trim().min(1).optional(),
      crm: z.string().trim().min(1).optional(),
      uf: z.string().trim().length(2).optional(),
      dataEmissao: DataISO.optional(),
      pacienteNome: z.string().trim().min(1).optional(),
      pacienteIdade: z.number().int().min(0).max(130).optional(),
      pacienteSexo: Sexo.optional(),
    })
    .optional(),
});
export type CorrecaoMovimentoEntrada = z.input<typeof CorrecaoMovimentoEntrada>;

export const ResultadoValidacao = z.object({
  total: z.number().int(),
  inconsistentes: z.number().int(),
  movimentos: z.array(MovimentoControlado),
});
export type ResultadoValidacao = z.infer<typeof ResultadoValidacao>;

export const TransmissaoSngpc = z.object({
  id: z.number().int(),
  periodoInicio: DataISO,
  periodoFim: DataISO,
  /** Protocolo de recebimento simulado (RF-EST-09). */
  protocolo: z.string().nullable(),
  status: StatusTransmissao,
  totalMovimentos: z.number().int(),
  usuarioNome: z.string(),
  criadoEm: DataHoraISO,
});
export type TransmissaoSngpc = z.infer<typeof TransmissaoSngpc>;

export const SITUACOES_SNGPC = ['EM_DIA', 'PENDENTE', 'INCONSISTENTE'] as const;
export const StatusSngpc = z.object({
  situacao: z.enum(SITUACOES_SNGPC),
  /** Texto curto para o cabeçalho, ex.: "SNGPC em dia". */
  rotulo: z.string(),
  inconsistencias: z.number().int(),
  pendentesEnvio: z.number().int(),
  ultimaTransmissao: z
    .object({ protocolo: z.string().nullable(), criadoEm: DataHoraISO, periodoFim: DataISO })
    .nullable(),
});
export type StatusSngpc = z.infer<typeof StatusSngpc>;

// ---------- Rotas ----------

export const rotasEstoque = {
  /** RF-EST-02, RF-EST-03 */
  listarProdutos: rota({
    metodo: 'GET',
    caminho: '/api/estoque/produtos',
    query: ListarProdutosEstoqueQuery,
    resposta: z.array(ProdutoEstoque),
  }),
  obterProduto: rota({
    metodo: 'GET',
    caminho: '/api/estoque/produtos/:id',
    resposta: ProdutoEstoque,
  }),
  atualizarProduto: rota({
    metodo: 'PUT',
    caminho: '/api/estoque/produtos/:id',
    corpo: ProdutoAtualizacao,
    resposta: ProdutoEstoque,
  }),
  /** RF-EST-01 — multipart/form-data com o XML no campo "arquivo". */
  registrarEntradaNfe: rota({
    metodo: 'POST',
    caminho: '/api/estoque/entradas-nfe',
    arquivo: 'arquivo',
    resposta: NotaEntrada,
  }),
  listarEntradasNfe: rota({
    metodo: 'GET',
    caminho: '/api/estoque/entradas-nfe',
    resposta: z.array(NotaEntrada),
  }),
  /** RF-EST-04 */
  alertas: rota({ metodo: 'GET', caminho: '/api/estoque/alertas', resposta: AlertasEstoque }),
  /** RF-EST-05 — somente FARMACEUTICO e ADMIN */
  listarPerdas: rota({ metodo: 'GET', caminho: '/api/estoque/perdas', resposta: z.array(Perda) }),
  registrarPerda: rota({
    metodo: 'POST',
    caminho: '/api/estoque/perdas',
    corpo: PerdaEntrada,
    resposta: Perda,
  }),
  /** RF-EST-06 — somente FARMACEUTICO e ADMIN */
  listarInventarios: rota({
    metodo: 'GET',
    caminho: '/api/estoque/inventarios',
    resposta: z.array(InventarioResumo),
  }),
  abrirInventario: rota({
    metodo: 'POST',
    caminho: '/api/estoque/inventarios',
    corpo: AbrirInventarioEntrada,
    resposta: InventarioDetalhe,
  }),
  obterInventario: rota({
    metodo: 'GET',
    caminho: '/api/estoque/inventarios/:id',
    resposta: InventarioDetalhe,
  }),
  registrarContagens: rota({
    metodo: 'PUT',
    caminho: '/api/estoque/inventarios/:id/contagens',
    corpo: ContagensEntrada,
    resposta: InventarioDetalhe,
  }),
  fecharInventario: rota({
    metodo: 'POST',
    caminho: '/api/estoque/inventarios/:id/fechar',
    resposta: InventarioDetalhe,
  }),
  /** RF-EST-07, RNF-EST-02 */
  listarMovimentos: rota({
    metodo: 'GET',
    caminho: '/api/estoque/controlados/movimentos',
    query: ListarMovimentosQuery,
    resposta: z.array(MovimentoControlado),
  }),
  corrigirMovimento: rota({
    metodo: 'POST',
    caminho: '/api/estoque/controlados/movimentos/:id/correcao',
    corpo: CorrecaoMovimentoEntrada,
    resposta: MovimentoControlado,
  }),
  /** RF-EST-08 */
  validarControlados: rota({
    metodo: 'POST',
    caminho: '/api/estoque/controlados/validar',
    corpo: PeriodoEntrada,
    resposta: ResultadoValidacao,
  }),
  /** RF-EST-09 (simulado), RNF-EST-01 */
  transmitir: rota({
    metodo: 'POST',
    caminho: '/api/estoque/controlados/transmissoes',
    corpo: PeriodoEntrada,
    resposta: TransmissaoSngpc,
  }),
  listarTransmissoes: rota({
    metodo: 'GET',
    caminho: '/api/estoque/controlados/transmissoes',
    resposta: z.array(TransmissaoSngpc),
  }),
  arquivoTransmissao: rota({
    metodo: 'GET',
    caminho: '/api/estoque/controlados/transmissoes/:id/arquivo',
    resposta: z.string(),
    tipoResposta: 'application/xml',
  }),
  /** Usado pelo cabeçalho do sistema. */
  statusSngpc: rota({ metodo: 'GET', caminho: '/api/estoque/sngpc/status', resposta: StatusSngpc }),
};
