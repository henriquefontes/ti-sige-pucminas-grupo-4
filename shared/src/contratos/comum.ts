import { z } from 'zod';

/*
 * Ferramentas para declarar contratos HTTP.
 * Cada rota tem método, caminho completo, esquemas de entrada (query e corpo) e de saída.
 * O backend valida a entrada com esses esquemas; o frontend usa os tipos inferidos.
 */

export type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface DefinicaoRota<
  M extends Metodo = Metodo,
  C extends string = string,
  Q extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
  B extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
  R extends z.ZodTypeAny = z.ZodTypeAny,
> {
  metodo: M;
  /** Caminho completo, com parâmetros no formato `:nome`. Ex.: `/api/vendas/:id`. */
  caminho: C;
  /** Esquema da query string. */
  query?: Q;
  /** Esquema do corpo JSON. */
  corpo?: B;
  /** Esquema da resposta de sucesso. */
  resposta: R;
  /** Nome do campo de arquivo quando a rota recebe multipart/form-data. */
  arquivo?: string;
  /** Tipo de conteúdo da resposta quando não é JSON (ex.: `application/xml`). */
  tipoResposta?: string;
}

/** Declara uma rota preservando os tipos literais. */
export function rota<
  const M extends Metodo,
  const C extends string,
  R extends z.ZodTypeAny,
  Q extends z.ZodTypeAny | undefined = undefined,
  B extends z.ZodTypeAny | undefined = undefined,
>(def: DefinicaoRota<M, C, Q, B, R>): DefinicaoRota<M, C, Q, B, R> {
  return def;
}

/** Extrai os nomes dos parâmetros de caminho: '/a/:id/b/:itemId' -> 'id' | 'itemId'. */
export type NomesParametros<C extends string> = C extends `${string}:${infer P}/${infer R}`
  ? P | NomesParametros<`/${R}`>
  : C extends `${string}:${infer P}`
    ? P
    : never;

export type ParametrosDe<D> =
  D extends DefinicaoRota<Metodo, infer C> ? Record<NomesParametros<C>, string | number> : never;

export type QueryDe<D> = D extends { query?: infer Q }
  ? Q extends z.ZodTypeAny
    ? z.input<Q>
    : never
  : never;

export type CorpoDe<D> = D extends { corpo?: infer B }
  ? B extends z.ZodTypeAny
    ? z.input<B>
    : never
  : never;

export type RespostaDe<D> = D extends { resposta: infer R }
  ? R extends z.ZodTypeAny
    ? z.infer<R>
    : never
  : never;

/** Substitui os parâmetros `:nome` do caminho. */
export function montarCaminho(
  caminho: string,
  parametros: Record<string, string | number> = {},
): string {
  return caminho.replace(/:([A-Za-z0-9_]+)/g, (_, nome: string) => {
    const valor = parametros[nome];
    if (valor === undefined) throw new Error(`Parâmetro de caminho ausente: ${nome}`);
    return encodeURIComponent(String(valor));
  });
}

// ---------- Esquemas comuns ----------

/** Data sem hora, no formato AAAA-MM-DD (validade, vencimento, data da receita). */
export const DataISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD');
export type DataISO = z.infer<typeof DataISO>;

/** Data e hora em ISO 8601, sempre em UTC na API (ex.: 2026-09-28T17:12:00.000Z). */
export const DataHoraISO = z.string();
export type DataHoraISO = z.infer<typeof DataHoraISO>;

/** Identificador numérico (aceita "12" na query/params). */
export const Id = z.coerce.number().int().positive();

/** Valor em centavos (inteiro, pode ser zero). */
export const Centavos = z.number().int();
/** Valor em centavos estritamente positivo. */
export const CentavosPositivo = z.number().int().positive();

export const Vazio = z.object({}).strict();
export const Ok = z.object({ ok: z.literal(true) });

/** Formato padrão de erro devolvido pela API. */
export const RespostaErro = z.object({
  erro: z.object({
    codigo: z.string(),
    mensagem: z.string(),
    detalhes: z.unknown().optional(),
  }),
});
export type RespostaErro = z.infer<typeof RespostaErro>;

/** Texto obrigatório, sem espaços nas pontas. */
export const TextoObrigatorio = (min = 1, mensagem = 'Campo obrigatório') =>
  z.string().trim().min(min, mensagem);
