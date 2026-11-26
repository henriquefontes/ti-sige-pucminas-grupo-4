import jwt from 'jsonwebtoken';
import { Perfil } from '@vitalis/shared';
import { variavelObrigatoria } from '../env';
import type { UsuarioAutenticado } from './tipos';

const VALIDADE = '12h';

function segredo(): string {
  return variavelObrigatoria('JWT_SEGREDO');
}

export function gerarToken(usuario: UsuarioAutenticado): string {
  return jwt.sign({ nome: usuario.nome, login: usuario.login, perfil: usuario.perfil }, segredo(), {
    subject: String(usuario.id),
    expiresIn: VALIDADE,
  });
}

/** Devolve o usuário do token ou null se for inválido/expirado. */
export function lerToken(token: string): UsuarioAutenticado | null {
  try {
    const dados = jwt.verify(token, segredo());
    if (typeof dados === 'string') return null;
    const perfil = Perfil.safeParse(dados.perfil);
    if (!perfil.success || !dados.sub) return null;
    return {
      id: Number(dados.sub),
      nome: String(dados.nome),
      login: String(dados.login),
      perfil: perfil.data,
    };
  } catch {
    return null;
  }
}
