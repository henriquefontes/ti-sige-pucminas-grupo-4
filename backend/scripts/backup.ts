/**
 * npm run backup — RNF-GER-04 (versão simples).
 * Gera um pg_dump datado do banco em DATABASE_URL, em ./backups/ na raiz do repositório.
 * O agendamento diário e a cópia para fora da loja ficam a cargo de quem administra o servidor.
 * Requer o pg_dump instalado (ou use: docker exec vitalis-postgres pg_dump ...).
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { RAIZ_REPOSITORIO, variavelObrigatoria } from '../src/core/env';

const url = new URL(variavelObrigatoria('DATABASE_URL'));
// O pg_dump não aceita parâmetros específicos do Prisma, como ?schema=public.
url.search = '';

const agora = new Date();
const carimbo = agora.toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const pasta = resolve(RAIZ_REPOSITORIO, 'backups');
mkdirSync(pasta, { recursive: true });
const arquivo = resolve(pasta, `vitalis-${carimbo}.dump`);

const resultado = spawnSync('pg_dump', ['--format=custom', `--file=${arquivo}`, url.toString()], {
  stdio: 'inherit',
});

if (resultado.error) {
  console.error('Não foi possível executar o pg_dump. Ele está instalado e no PATH?');
  console.error(resultado.error.message);
  process.exit(1);
}
if (resultado.status !== 0) process.exit(resultado.status ?? 1);
console.log(`Cópia de segurança gravada em ${arquivo}`);
