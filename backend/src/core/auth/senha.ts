import bcrypt from 'bcryptjs';

const CUSTO = 10;

/** Gera o hash bcrypt da senha (RNF-GER-01). */
export function gerarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, CUSTO);
}

export function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
