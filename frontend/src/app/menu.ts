import type { Perfil } from '@vitalis/shared';

export interface ItemMenu {
  rotulo: string;
  caminho: string;
  /** Visível, porém desabilitado (fora do escopo desta etapa). */
  emBreve?: boolean;
  /**
   * Perfis que veem o item enquanto o módulo não estiver mesclado.
   * Quando o módulo registra a rota, valem os perfis declarados por ele.
   */
  perfisPadrao: Perfil[];
}

export interface GrupoMenu {
  rotulo: string;
  itens: ItemMenu[];
}

const TODOS: Perfil[] = ['ADMIN', 'FARMACEUTICO', 'ATENDENTE', 'FINANCEIRO'];

/** Menu fixo do sistema. Os módulos não alteram este arquivo. */
export const MENU: GrupoMenu[] = [
  {
    rotulo: 'Visão geral',
    itens: [{ rotulo: 'Painel', caminho: '/', emBreve: true, perfisPadrao: TODOS }],
  },
  {
    rotulo: 'Comercial',
    itens: [
      { rotulo: 'Vendas', caminho: '/vendas', perfisPadrao: ['ATENDENTE', 'FARMACEUTICO'] },
      { rotulo: 'Clientes', caminho: '/clientes', perfisPadrao: ['ATENDENTE', 'FARMACEUTICO'] },
      {
        rotulo: 'Convênios',
        caminho: '/convenios',
        perfisPadrao: ['ATENDENTE', 'FARMACEUTICO', 'FINANCEIRO'],
      },
      {
        rotulo: 'Disponibilidade',
        caminho: '/disponibilidade',
        perfisPadrao: ['ATENDENTE', 'FARMACEUTICO'],
      },
      {
        rotulo: 'Farmácia Popular',
        caminho: '/farmacia-popular',
        perfisPadrao: ['ATENDENTE', 'FARMACEUTICO'],
      },
    ],
  },
  {
    rotulo: 'Estoque',
    itens: [
      {
        rotulo: 'Produtos e lotes',
        caminho: '/estoque',
        perfisPadrao: ['FARMACEUTICO', 'ATENDENTE'],
      },
      { rotulo: 'Controlados (SNGPC)', caminho: '/controlados', perfisPadrao: ['FARMACEUTICO'] },
      { rotulo: 'Inventário', caminho: '/inventario', perfisPadrao: ['FARMACEUTICO'] },
      { rotulo: 'Reposição', caminho: '/reposicao', emBreve: true, perfisPadrao: TODOS },
    ],
  },
  {
    rotulo: 'Financeiro',
    itens: [
      { rotulo: 'Contas e fluxo de caixa', caminho: '/financeiro', perfisPadrao: ['FINANCEIRO'] },
      { rotulo: 'Caixa diário', caminho: '/caixa', perfisPadrao: ['FINANCEIRO', 'ATENDENTE'] },
    ],
  },
  {
    rotulo: 'Gestão',
    itens: [{ rotulo: 'Relatórios', caminho: '/relatorios', emBreve: true, perfisPadrao: TODOS }],
  },
];

/** Grupo e item do menu correspondentes a um caminho (inclui subrotas, ex.: /vendas/historico). */
export function localizarNoMenu(caminho: string): { grupo: GrupoMenu; item: ItemMenu } | null {
  let melhor: { grupo: GrupoMenu; item: ItemMenu } | null = null;
  for (const grupo of MENU) {
    for (const item of grupo.itens) {
      const casa =
        item.caminho === '/'
          ? caminho === '/'
          : caminho === item.caminho || caminho.startsWith(`${item.caminho}/`);
      if (casa && (!melhor || item.caminho.length > melhor.item.caminho.length)) {
        melhor = { grupo, item };
      }
    }
  }
  return melhor;
}
