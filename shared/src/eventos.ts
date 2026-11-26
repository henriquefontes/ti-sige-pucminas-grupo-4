/**
 * Eventos síncronos trocados entre módulos.
 * Quem emite chama `eventos.emitir(nome, dados, tx)` dentro da transação;
 * os ouvintes recebem o mesmo `tx`. Se um ouvinte falhar, a transação inteira é desfeita.
 */
export interface MapaEventos {
  /** Emitido por vendas. Ouvintes: estoque (RF-EST-07) e financeiro (RF-FIN-04 e caixa). */
  'venda.finalizada': { vendaId: number };
  /**
   * Emitido por vendas no cancelamento da venda inteira ou de itens.
   * `itensCanceladosIds` lista os itens cancelados nesta operação.
   * Ouvintes: estoque (devolução no livro) e financeiro (estorno).
   */
  'venda.cancelada': { vendaId: number; itensCanceladosIds: number[]; vendaInteira: boolean };
  /** Emitido por estoque após importar a NF-e. Ouvinte: financeiro (RF-FIN-02). */
  'nota.entrada.registrada': { notaId: number };
}

export type NomeEvento = keyof MapaEventos;

export const NOMES_EVENTOS: NomeEvento[] = [
  'venda.finalizada',
  'venda.cancelada',
  'nota.entrada.registrada',
];
