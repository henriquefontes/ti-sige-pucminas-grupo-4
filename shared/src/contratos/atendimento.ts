import { z } from 'zod';
import { cnpjValido, cpfValido, somenteDigitos } from '../cpf';
import {
  ClasseProduto,
  FormaPagamento,
  StatusSolicitacaoTitular,
  StatusVenda,
  TipoSolicitacaoTitular,
} from '../enums';
import { DataHoraISO, DataISO, Id, rota, TextoObrigatorio } from './comum';

// ---------- Clientes ----------

export const CpfEntrada = z
  .string()
  .trim()
  .refine(cpfValido, 'CPF inválido')
  .transform(somenteDigitos);

export const TelefoneEntrada = z
  .string()
  .trim()
  .transform(somenteDigitos)
  .refine((v) => v.length === 0 || (v.length >= 10 && v.length <= 11), 'Telefone inválido');

export const ConvenioResumo = z.object({
  id: z.number().int(),
  nome: z.string(),
  percentualDescontoBp: z.number().int(),
  ativo: z.boolean(),
});
export type ConvenioResumo = z.infer<typeof ConvenioResumo>;

export const ClienteResumo = z.object({
  id: z.number().int(),
  nome: z.string(),
  /** CPF já mascarado conforme o perfil de quem consulta (RNF-ATD-01). */
  cpf: z.string(),
  telefone: z.string().nullable(),
  convenio: ConvenioResumo.nullable(),
  matriculaConvenio: z.string().nullable(),
  anonimizado: z.boolean(),
});
export type ClienteResumo = z.infer<typeof ClienteResumo>;

export const ClienteDetalhe = ClienteResumo.extend({
  consentimentoEm: DataHoraISO,
  criadoEm: DataHoraISO,
});
export type ClienteDetalhe = z.infer<typeof ClienteDetalhe>;

export const ClienteEntrada = z.object({
  nome: TextoObrigatorio(3, 'Informe o nome completo'),
  cpf: CpfEntrada,
  telefone: TelefoneEntrada.optional(),
  /** Consentimento para uso dos dados (RF-ATD-01, LGPD). Obrigatório. */
  consentimento: z.literal(true, {
    errorMap: () => ({ message: 'É obrigatório registrar o consentimento do cliente' }),
  }),
  convenioId: Id.nullable().optional(),
  matriculaConvenio: z.string().trim().nullable().optional(),
});
export type ClienteEntrada = z.input<typeof ClienteEntrada>;

export const ClienteAtualizacao = z.object({
  nome: TextoObrigatorio(3).optional(),
  telefone: TelefoneEntrada.nullable().optional(),
  convenioId: Id.nullable().optional(),
  matriculaConvenio: z.string().trim().nullable().optional(),
});
export type ClienteAtualizacao = z.input<typeof ClienteAtualizacao>;

export const BuscaClientesQuery = z.object({
  /** Nome (parcial, sem diferenciar maiúsculas) ou CPF (com ou sem máscara). */
  busca: z.string().trim().optional(),
});

export const HistoricoCliente = z.object({
  clienteId: z.number().int(),
  vendas: z.array(
    z.object({
      id: z.number().int(),
      numero: z.number().int(),
      criadoEm: DataHoraISO,
      status: StatusVenda,
      formaPagamento: FormaPagamento,
      totalCentavos: z.number().int(),
      itens: z.array(
        z.object({
          produtoNome: z.string(),
          quantidade: z.number().int(),
          subtotalCentavos: z.number().int(),
          cancelado: z.boolean(),
        }),
      ),
    }),
  ),
});
export type HistoricoCliente = z.infer<typeof HistoricoCliente>;

// ---------- Convênios ----------

export const Convenio = z.object({
  id: z.number().int(),
  nome: z.string(),
  cnpj: z.string(),
  /** Percentual em pontos-base: 1000 = 10%. */
  percentualDescontoBp: z.number().int(),
  /** Dia do mês em que a fatura é fechada. */
  diaFechamento: z.number().int(),
  /** Dias após o fechamento para a empresa pagar. */
  diasParaPagamento: z.number().int(),
  ativo: z.boolean(),
});
export type Convenio = z.infer<typeof Convenio>;

export const ConvenioEntrada = z.object({
  nome: TextoObrigatorio(2),
  cnpj: z.string().trim().refine(cnpjValido, 'CNPJ inválido').transform(somenteDigitos),
  percentualDescontoBp: z.number().int().min(0).max(10000),
  diaFechamento: z.number().int().min(1).max(28),
  diasParaPagamento: z.number().int().min(0).max(120),
  ativo: z.boolean().default(true),
});
export type ConvenioEntrada = z.input<typeof ConvenioEntrada>;

export const ConvenioAtualizacao = ConvenioEntrada.partial();
export type ConvenioAtualizacao = z.input<typeof ConvenioAtualizacao>;

// ---------- Disponibilidade ----------

export const DisponibilidadeQuery = z.object({
  busca: TextoObrigatorio(1, 'Informe o produto'),
});

export const ItemDisponibilidade = z.object({
  produto: z.object({
    id: z.number().int(),
    nome: z.string(),
    principioAtivo: z.string(),
    classe: ClasseProduto,
    precoVendaCentavos: z.number().int(),
  }),
  saldoTotal: z.number().int(),
  lotes: z.array(z.object({ numero: z.string(), validade: DataISO, quantidade: z.number().int() })),
  /** Produtos com o mesmo princípio ativo e saldo (RF-ATD-06). */
  alternativas: z.array(
    z.object({
      id: z.number().int(),
      nome: z.string(),
      classe: ClasseProduto,
      precoVendaCentavos: z.number().int(),
      saldoTotal: z.number().int(),
    }),
  ),
});
export type ItemDisponibilidade = z.infer<typeof ItemDisponibilidade>;

// ---------- Farmácia Popular (simulado) ----------

export const DispensacaoEntrada = z.object({
  clienteId: Id,
  numeroReceita: TextoObrigatorio(1, 'Informe o número da receita'),
  dataReceita: DataISO,
  crmPrescritor: TextoObrigatorio(1, 'Informe o CRM do prescritor'),
  ufCrm: z
    .string()
    .trim()
    .length(2)
    .transform((v) => v.toUpperCase()),
  itens: z
    .array(z.object({ produtoId: Id, quantidade: z.number().int().positive() }))
    .min(1, 'Inclua ao menos um item'),
  vendaId: Id.nullable().optional(),
});
export type DispensacaoEntrada = z.input<typeof DispensacaoEntrada>;

export const Dispensacao = z.object({
  id: z.number().int(),
  cliente: z.object({ id: z.number().int(), nome: z.string(), cpf: z.string() }),
  vendaId: z.number().int().nullable(),
  numeroReceita: z.string(),
  dataReceita: DataISO,
  crmPrescritor: z.string(),
  ufCrm: z.string(),
  /** Número de autorização simulado (RF-ATD-07). */
  autorizacao: z.string(),
  itens: z.array(
    z.object({
      produtoId: z.number().int(),
      produtoNome: z.string(),
      quantidade: z.number().int(),
    }),
  ),
  usuarioNome: z.string(),
  criadoEm: DataHoraISO,
});
export type Dispensacao = z.infer<typeof Dispensacao>;

// ---------- LGPD ----------

export const SolicitacaoTitularEntrada = z.object({
  tipo: TipoSolicitacaoTitular,
  /** Para CORRECAO: campos a corrigir (nome, telefone). Para os demais: observações. */
  detalhes: z
    .object({
      nome: z.string().trim().min(3).optional(),
      telefone: TelefoneEntrada.optional(),
      observacao: z.string().trim().optional(),
    })
    .default({}),
});
export type SolicitacaoTitularEntrada = z.input<typeof SolicitacaoTitularEntrada>;

export const SolicitacaoTitular = z.object({
  id: z.number().int(),
  clienteId: z.number().int(),
  clienteNome: z.string(),
  tipo: TipoSolicitacaoTitular,
  status: StatusSolicitacaoTitular,
  detalhes: z.record(z.unknown()).nullable(),
  criadoEm: DataHoraISO,
  atendidaEm: DataHoraISO.nullable(),
  usuarioNome: z.string(),
});
export type SolicitacaoTitular = z.infer<typeof SolicitacaoTitular>;

export const ListarSolicitacoesQuery = z.object({
  status: StatusSolicitacaoTitular.optional(),
  clienteId: Id.optional(),
});

export const AtenderSolicitacaoEntrada = z.object({
  observacao: z.string().trim().optional(),
});

export const AtenderSolicitacaoResposta = z.object({
  solicitacao: SolicitacaoTitular,
  /** ACESSO: dados do cliente e histórico em JSON. CORRECAO/EXCLUSAO: cliente após a operação. */
  resultado: z.unknown(),
});
export type AtenderSolicitacaoResposta = z.infer<typeof AtenderSolicitacaoResposta>;

// ---------- Rotas ----------

export const rotasAtendimento = {
  /** RF-ATD-02, RNF-ATD-02 */
  listarClientes: rota({
    metodo: 'GET',
    caminho: '/api/atendimento/clientes',
    query: BuscaClientesQuery,
    resposta: z.array(ClienteResumo),
  }),
  /** RF-ATD-01 */
  criarCliente: rota({
    metodo: 'POST',
    caminho: '/api/atendimento/clientes',
    corpo: ClienteEntrada,
    resposta: ClienteDetalhe,
  }),
  obterCliente: rota({
    metodo: 'GET',
    caminho: '/api/atendimento/clientes/:id',
    resposta: ClienteDetalhe,
  }),
  atualizarCliente: rota({
    metodo: 'PUT',
    caminho: '/api/atendimento/clientes/:id',
    corpo: ClienteAtualizacao,
    resposta: ClienteDetalhe,
  }),
  /** RF-ATD-03 */
  historicoCliente: rota({
    metodo: 'GET',
    caminho: '/api/atendimento/clientes/:id/historico',
    resposta: HistoricoCliente,
  }),
  /** RF-ATD-04 */
  listarConvenios: rota({
    metodo: 'GET',
    caminho: '/api/atendimento/convenios',
    resposta: z.array(Convenio),
  }),
  criarConvenio: rota({
    metodo: 'POST',
    caminho: '/api/atendimento/convenios',
    corpo: ConvenioEntrada,
    resposta: Convenio,
  }),
  atualizarConvenio: rota({
    metodo: 'PUT',
    caminho: '/api/atendimento/convenios/:id',
    corpo: ConvenioAtualizacao,
    resposta: Convenio,
  }),
  /** RF-ATD-06 */
  disponibilidade: rota({
    metodo: 'GET',
    caminho: '/api/atendimento/disponibilidade',
    query: DisponibilidadeQuery,
    resposta: z.array(ItemDisponibilidade),
  }),
  /** RF-ATD-07 (simulado) */
  listarDispensacoes: rota({
    metodo: 'GET',
    caminho: '/api/atendimento/farmacia-popular/dispensacoes',
    resposta: z.array(Dispensacao),
  }),
  criarDispensacao: rota({
    metodo: 'POST',
    caminho: '/api/atendimento/farmacia-popular/dispensacoes',
    corpo: DispensacaoEntrada,
    resposta: Dispensacao,
  }),
  /** RF-ATD-08, RNF-GER-02 */
  criarSolicitacaoLgpd: rota({
    metodo: 'POST',
    caminho: '/api/atendimento/clientes/:id/solicitacoes-lgpd',
    corpo: SolicitacaoTitularEntrada,
    resposta: SolicitacaoTitular,
  }),
  listarSolicitacoesLgpd: rota({
    metodo: 'GET',
    caminho: '/api/atendimento/solicitacoes-lgpd',
    query: ListarSolicitacoesQuery,
    resposta: z.array(SolicitacaoTitular),
  }),
  atenderSolicitacaoLgpd: rota({
    metodo: 'POST',
    caminho: '/api/atendimento/solicitacoes-lgpd/:id/atender',
    corpo: AtenderSolicitacaoEntrada,
    resposta: AtenderSolicitacaoResposta,
  }),
};
