import type { ReactNode } from 'react';
import type { Perfil } from '@vitalis/shared';

/** Uma tela registrada por um módulo. */
export interface RotaModulo {
  /** Caminho absoluto, ex.: '/vendas' ou '/vendas/historico'. */
  caminho: string;
  elemento: ReactNode;
  /** Perfis que podem ver a tela e o item do menu. ADMIN sempre pode. */
  perfis: Perfil[];
  /** Título no cabeçalho (padrão: rótulo do item do menu). */
  titulo?: string;
}

/**
 * O que cada `frontend/src/modules/<nome>/modulo.tsx` exporta por padrão.
 *
 * @example
 * export default {
 *   rotas: [{ caminho: '/vendas', elemento: <TelaVendas />, perfis: ['ATENDENTE', 'FARMACEUTICO'] }],
 *   pendencias: async () => ({ '/controlados': 2 }),
 * } satisfies ModuloFrontend;
 */
export interface ModuloFrontend {
  rotas: RotaModulo[];
  /** Números vermelhos no menu, por caminho. Chamado ao entrar e a cada minuto. */
  pendencias?: () => Promise<Record<string, number>>;
}

export function perfilPode(perfil: Perfil, permitidos: Perfil[]): boolean {
  return perfil === 'ADMIN' || permitidos.includes(perfil);
}
