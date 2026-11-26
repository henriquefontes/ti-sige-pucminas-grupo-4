import { recriarEsquema } from '../scripts/recriarEsquema';

/** Recria o banco de teste uma vez, no início da execução dos testes. */
export default async function setup() {
  const url = process.env.DATABASE_URL_TESTE;
  if (!url) {
    throw new Error('Defina DATABASE_URL_TESTE no .env (veja .env.example) para rodar os testes.');
  }
  await recriarEsquema(url, 'Testes');
}
