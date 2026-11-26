import {
  montarCaminho,
  type CorpoDe,
  type DefinicaoRota,
  type ParametrosDe,
  type QueryDe,
  type RespostaDe,
  type RespostaErro,
} from '@vitalis/shared';

/*
 * Cliente HTTP da aplicação: envia o token, padroniza erros e usa os contratos de shared/.
 *
 *   import { chamar } from '../../core/api';
 *   import { rotasVendas } from '@vitalis/shared';
 *   const produtos = await chamar(rotasVendas.buscarProdutos, { query: { busca: 'dipirona' } });
 *   const venda = await chamar(rotasVendas.obter, { params: { id: 12 } });
 */

const CHAVE_TOKEN = 'vitalis.token';

/** Erro devolvido pela API no formato `{ erro: { codigo, mensagem, detalhes } }`. */
export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    mensagem: string,
    public readonly detalhes?: unknown,
  ) {
    super(mensagem);
    this.name = 'ErroApi';
  }
}

export function lerToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function gravarToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    // Navegação privada sem storage: a sessão dura só enquanto a página estiver aberta.
  }
}

let aoNaoAutenticado: (() => void) | null = null;
/** Chamado pelo contexto de autenticação para deslogar quando a API responder 401. */
export function definirAoNaoAutenticado(fn: (() => void) | null): void {
  aoNaoAutenticado = fn;
}

export interface OpcoesRequisicao {
  query?: Record<string, unknown>;
  corpo?: unknown;
  /** Envia multipart/form-data com o arquivo no campo informado. */
  arquivo?: { campo: string; arquivo: Blob; nome?: string };
  /** Resposta em texto (ex.: XML) em vez de JSON. */
  texto?: boolean;
  sinal?: AbortSignal;
}

function montarQuery(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(query)) {
    if (valor === undefined || valor === null || valor === '') continue;
    params.set(chave, String(valor));
  }
  const texto = params.toString();
  return texto ? `?${texto}` : '';
}

/** Requisição genérica para a API. Prefira `chamar()` com um contrato. */
export async function requisitar<T>(
  metodo: string,
  caminho: string,
  opcoes: OpcoesRequisicao = {},
): Promise<T> {
  const cabecalhos: Record<string, string> = { Accept: 'application/json' };
  const token = lerToken();
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let corpo: BodyInit | undefined;
  if (opcoes.arquivo) {
    const form = new FormData();
    form.append(opcoes.arquivo.campo, opcoes.arquivo.arquivo, opcoes.arquivo.nome);
    corpo = form;
  } else if (opcoes.corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json';
    corpo = JSON.stringify(opcoes.corpo);
  }

  let resposta: Response;
  try {
    resposta = await fetch(caminho + montarQuery(opcoes.query), {
      method: metodo,
      headers: cabecalhos,
      body: corpo,
      signal: opcoes.sinal,
    });
  } catch (erro) {
    if ((erro as Error).name === 'AbortError') throw erro;
    throw new ErroApi(0, 'SEM_CONEXAO', 'Não foi possível conectar ao servidor');
  }

  if (!resposta.ok) {
    let dados: Partial<RespostaErro> = {};
    try {
      dados = await resposta.json();
    } catch {
      // resposta sem corpo JSON
    }
    if (resposta.status === 401 && token) aoNaoAutenticado?.();
    throw new ErroApi(
      resposta.status,
      dados.erro?.codigo ?? 'ERRO_HTTP',
      dados.erro?.mensagem ?? `Erro ${resposta.status}`,
      dados.erro?.detalhes,
    );
  }

  if (resposta.status === 204) return undefined as T;
  if (opcoes.texto) return (await resposta.text()) as T;
  return (await resposta.json()) as T;
}

type OpcoesChamada<D> = {
  params?: ParametrosDe<D>;
  query?: QueryDe<D>;
  corpo?: CorpoDe<D>;
  /** Para rotas com `arquivo` no contrato (upload). */
  arquivo?: Blob;
  nomeArquivo?: string;
  sinal?: AbortSignal;
};

/** Chama uma rota declarada em `shared/src/contratos`, com tipos de entrada e saída. */
export function chamar<D extends DefinicaoRota>(
  def: D,
  opcoes: OpcoesChamada<D> = {},
): Promise<RespostaDe<D>> {
  const caminho = montarCaminho(
    def.caminho,
    (opcoes.params ?? {}) as Record<string, string | number>,
  );
  return requisitar<RespostaDe<D>>(def.metodo, caminho, {
    query: opcoes.query as Record<string, unknown> | undefined,
    corpo: opcoes.corpo,
    arquivo:
      def.arquivo && opcoes.arquivo
        ? { campo: def.arquivo, arquivo: opcoes.arquivo, nome: opcoes.nomeArquivo }
        : undefined,
    texto: Boolean(def.tipoResposta && def.tipoResposta !== 'application/json'),
    sinal: opcoes.sinal,
  });
}

/** Mensagem amigável para exibir em avisos. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroApi) return erro.message;
  if (erro instanceof Error) return erro.message;
  return 'Erro inesperado';
}
