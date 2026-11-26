import type { MapaEventos, NomeEvento } from '@vitalis/shared';
import type { Tx } from './db';

export type OuvinteEvento<N extends NomeEvento> = (
  dados: MapaEventos[N],
  tx: Tx,
) => Promise<void> | void;

/**
 * Barramento de eventos SÍNCRONO (RNF-EST-03, RNF-FIN-03).
 *
 * - Quem emite chama `await eventos.emitir(nome, dados, tx)` DENTRO da transação Prisma.
 * - Os ouvintes rodam em sequência e recebem o mesmo `tx`.
 * - Se um ouvinte lançar erro, o erro sobe para quem emitiu e a transação inteira é desfeita.
 * - Evento sem ouvintes é simplesmente ignorado (o módulo ouvinte pode não ter sido mesclado).
 */
class BarramentoEventos {
  private ouvintes = new Map<NomeEvento, { modulo: string; fn: OuvinteEvento<NomeEvento> }[]>();

  /** Assina um evento. Chame dentro de `registrar(ctx)` do módulo. */
  ouvir<N extends NomeEvento>(nome: N, fn: OuvinteEvento<N>, modulo = 'desconhecido'): void {
    const lista = this.ouvintes.get(nome) ?? [];
    lista.push({ modulo, fn: fn as OuvinteEvento<NomeEvento> });
    this.ouvintes.set(nome, lista);
  }

  /** Emite um evento e aguarda todos os ouvintes, na mesma transação. */
  async emitir<N extends NomeEvento>(nome: N, dados: MapaEventos[N], tx: Tx): Promise<void> {
    if (!tx) throw new Error(`eventos.emitir('${nome}') precisa receber a transação (tx)`);
    for (const { fn } of this.ouvintes.get(nome) ?? []) {
      await fn(dados, tx);
    }
  }

  /** Módulos que ouvem cada evento (para diagnóstico). */
  listar(): Record<string, string[]> {
    return Object.fromEntries([...this.ouvintes].map(([n, l]) => [n, l.map((o) => o.modulo)]));
  }

  /** Remove todos os ouvintes (usado ao recarregar módulos e nos testes). */
  limpar(): void {
    this.ouvintes.clear();
  }
}

export const eventos = new BarramentoEventos();
export type Eventos = BarramentoEventos;
