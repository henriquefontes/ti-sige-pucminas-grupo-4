import type { Request, RequestHandler } from 'express';
import type { Perfil } from '@vitalis/shared';
import { prisma } from '../db';
import { ErroNaoAutenticado, ErroProibido } from '../erros';
import { lerToken } from './token';
import type { UsuarioAutenticado } from './tipos';

/**
 * Exige um token válido (`Authorization: Bearer <token>`) de um usuário ativo.
 * Todas as rotas dos módulos passam por aqui automaticamente (ver app.ts).
 */
export const autenticar: RequestHandler = async (req, _res, next) => {
  const cabecalho = req.headers.authorization ?? '';
  const [tipo, token] = cabecalho.split(' ');
  if (tipo !== 'Bearer' || !token) throw new ErroNaoAutenticado();
  const usuario = lerToken(token);
  if (!usuario) throw new ErroNaoAutenticado('Sessão expirada. Faça login novamente.');
  const ativo = await prisma.usuario.findFirst({
    where: { id: usuario.id, ativo: true },
    select: { id: true },
  });
  if (!ativo) throw new ErroNaoAutenticado('Usuário inativo ou inexistente');
  req.usuario = usuario;
  next();
};

/**
 * Restringe a rota a perfis (RNF-GER-01). O perfil ADMIN sempre tem acesso.
 *
 * @example registrarRota(router, rotasVendas.cancelar, exigirPerfil('FARMACEUTICO'), handler)
 */
export function exigirPerfil(...perfis: Perfil[]): RequestHandler {
  return (req, _res, next) => {
    const usuario = req.usuario;
    if (!usuario) throw new ErroNaoAutenticado();
    if (usuario.perfil !== 'ADMIN' && !perfis.includes(usuario.perfil)) throw new ErroProibido();
    next();
  };
}

/** Usuário autenticado da requisição (lança 401 se ausente). */
export function usuarioDe(req: Request): UsuarioAutenticado {
  if (!req.usuario) throw new ErroNaoAutenticado();
  return req.usuario;
}
