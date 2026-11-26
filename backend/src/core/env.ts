import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Raiz do repositório (onde fica o .env). */
export const RAIZ_REPOSITORIO = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const arquivoEnv = resolve(RAIZ_REPOSITORIO, '.env');
if (existsSync(arquivoEnv)) config({ path: arquivoEnv, quiet: true });

export function variavelObrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida. Copie .env.example para .env.`);
  }
  return valor;
}
