import type { Request, RequestHandler, Router } from 'express';
import type { z } from 'zod';
import type { DefinicaoRota } from '@vitalis/shared';
import { ErroValidacao, detalhesZod } from './erros';
import { uploadArquivo } from './upload';

interface EsquemasValidacao {
  corpo?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
}

/**
 * Middleware que valida `req.body` e `req.query` com Zod.
 * Em caso de sucesso, substitui os valores pelos dados já convertidos (ex.: números da query).
 */
export function validar(esquemas: EsquemasValidacao): RequestHandler {
  return (req, _res, next) => {
    if (esquemas.corpo) {
      const r = esquemas.corpo.safeParse(req.body ?? {});
      if (!r.success) {
        const detalhes = detalhesZod(r.error);
        throw new ErroValidacao(detalhes[0]?.mensagem ?? 'Dados inválidos', detalhes);
      }
      req.body = r.data;
    }
    if (esquemas.query) {
      const r = esquemas.query.safeParse(req.query ?? {});
      if (!r.success) {
        const detalhes = detalhesZod(r.error);
        throw new ErroValidacao(detalhes[0]?.mensagem ?? 'Parâmetros inválidos', detalhes);
      }
      // No Express 5, req.query é somente leitura: redefinimos a propriedade.
      Object.defineProperty(req, 'query', { value: r.data, writable: true, configurable: true });
    }
    next();
  };
}

/** Lê o corpo já validado com o tipo do esquema. */
export function corpo<S extends z.ZodTypeAny>(req: Request, _esquema: S): z.infer<S> {
  return req.body as z.infer<S>;
}

/** Lê a query já validada com o tipo do esquema. */
export function query<S extends z.ZodTypeAny>(req: Request, _esquema: S): z.infer<S> {
  return req.query as unknown as z.infer<S>;
}

/** Lê um parâmetro numérico de caminho (ex.: `:id`). */
export function idParam(req: Request, nome = 'id'): number {
  const valor = Number(req.params[nome]);
  if (!Number.isInteger(valor) || valor <= 0) throw new ErroValidacao(`Parâmetro ${nome} inválido`);
  return valor;
}

/**
 * Registra no router de um módulo uma rota declarada em `shared/src/contratos`.
 * O caminho é convertido para relativo ao módulo (remove `/api/<modulo>`) e a validação
 * do corpo e da query é aplicada automaticamente.
 *
 * @example
 * registrarRota(router, rotasVendas.previa, async (req, res) => { ... });
 * registrarRota(router, rotasVendas.cancelar, exigirPerfil('FARMACEUTICO'), async (req, res) => { ... });
 */
export function registrarRota(
  router: Router,
  def: DefinicaoRota,
  ...handlers: RequestHandler[]
): void {
  const caminho = caminhoRelativo(def.caminho);
  const validacao = validar({ corpo: def.corpo, query: def.query });
  const metodo = def.metodo.toLowerCase() as 'get' | 'post' | 'put' | 'delete';
  if (def.arquivo) {
    // Rotas com upload: o arquivo chega em req.file (memória). Ver core/upload.ts.
    router[metodo](
      caminho,
      ...handlers.slice(0, -1),
      uploadArquivo(def.arquivo),
      ...handlers.slice(-1),
    );
  } else {
    router[metodo](caminho, validacao, ...handlers);
  }
}

/** '/api/vendas/:id' -> '/:id'; '/api/vendas' -> '/'. */
export function caminhoRelativo(caminhoCompleto: string): string {
  const partes = caminhoCompleto.split('/').filter(Boolean); // ['api', 'vendas', ':id']
  if (partes[0] !== 'api' || partes.length < 2) {
    throw new Error(`Caminho de contrato inválido: ${caminhoCompleto}`);
  }
  return '/' + partes.slice(2).join('/');
}
