import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import type { RespostaErro } from '@vitalis/shared';

/** Erro de aplicação com status HTTP e código legível. */
export class ErroAplicacao extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    mensagem: string,
    public readonly detalhes?: unknown,
  ) {
    super(mensagem);
    this.name = 'ErroAplicacao';
  }
}

/** 400 — entrada inválida. */
export class ErroValidacao extends ErroAplicacao {
  constructor(mensagem = 'Dados inválidos', detalhes?: unknown) {
    super(400, 'VALIDACAO', mensagem, detalhes);
  }
}

/** 401 — sem login ou token inválido. */
export class ErroNaoAutenticado extends ErroAplicacao {
  constructor(mensagem = 'Faça login para continuar') {
    super(401, 'NAO_AUTENTICADO', mensagem);
  }
}

/** 403 — perfil sem permissão. */
export class ErroProibido extends ErroAplicacao {
  constructor(mensagem = 'Seu perfil não tem permissão para esta operação') {
    super(403, 'PROIBIDO', mensagem);
  }
}

/** 404 — registro não encontrado. */
export class ErroNaoEncontrado extends ErroAplicacao {
  constructor(mensagem = 'Registro não encontrado') {
    super(404, 'NAO_ENCONTRADO', mensagem);
  }
}

/** 409 — conflito (ex.: registro duplicado). */
export class ErroConflito extends ErroAplicacao {
  constructor(mensagem: string, detalhes?: unknown) {
    super(409, 'CONFLITO', mensagem, detalhes);
  }
}

/** 422 — regra de negócio violada (ex.: lote vencido, saldo insuficiente). */
export class ErroRegraNegocio extends ErroAplicacao {
  constructor(mensagem: string, detalhes?: unknown) {
    super(422, 'REGRA_NEGOCIO', mensagem, detalhes);
  }
}

function corpoErro(codigo: string, mensagem: string, detalhes?: unknown): RespostaErro {
  return { erro: { codigo, mensagem, ...(detalhes === undefined ? {} : { detalhes }) } };
}

/** Converte erros Zod em lista simples de campos e mensagens. */
export function detalhesZod(erro: ZodError) {
  return erro.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message }));
}

export const rotaNaoEncontrada: RequestHandler = (req, res) => {
  res
    .status(404)
    .json(corpoErro('ROTA_NAO_ENCONTRADA', `Rota não encontrada: ${req.method} ${req.path}`));
};

/** Middleware final de erros: padroniza a resposta `{ erro: { codigo, mensagem, detalhes } }`. */
export const tratarErros: ErrorRequestHandler = (erro, _req, res, _next) => {
  if (erro instanceof ErroAplicacao) {
    res.status(erro.status).json(corpoErro(erro.codigo, erro.message, erro.detalhes));
    return;
  }
  if (erro instanceof ZodError) {
    const detalhes = detalhesZod(erro);
    res
      .status(400)
      .json(corpoErro('VALIDACAO', detalhes[0]?.mensagem ?? 'Dados inválidos', detalhes));
    return;
  }
  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    if (erro.code === 'P2002') {
      res
        .status(409)
        .json(corpoErro('CONFLITO', 'Já existe um registro com estes dados', erro.meta));
      return;
    }
    if (erro.code === 'P2025') {
      res.status(404).json(corpoErro('NAO_ENCONTRADO', 'Registro não encontrado'));
      return;
    }
  }
  if (erro instanceof MulterError) {
    res.status(400).json(corpoErro('UPLOAD', `Falha no envio do arquivo: ${erro.message}`));
    return;
  }
  if (erro?.type === 'entity.parse.failed') {
    res.status(400).json(corpoErro('JSON_INVALIDO', 'Corpo da requisição não é um JSON válido'));
    return;
  }
  // Violação da restrição CHECK (quantidade >= 0) do lote: saldo acabou.
  if (String(erro?.message ?? '').includes('lote_quantidade_nao_negativa')) {
    res
      .status(422)
      .json(
        corpoErro('REGRA_NEGOCIO', 'Saldo insuficiente no lote. Atualize a tela e tente de novo.'),
      );
    return;
  }
  console.error(erro);
  res.status(500).json(corpoErro('ERRO_INTERNO', 'Erro interno no servidor'));
};
