import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MENU } from '../app/menu';
import { perfisDoItem, resolverRotas } from '../app/rotas';
import { chamar, ErroApi } from '../core/api';
import { formatarData, formatarDataCabecalho, formatarMoeda } from '../core/formatos';
import { MenuLateral } from '../core/layout';
import { Tabela } from '../core/ui';
import { rotasVendas } from '@vitalis/shared';
import { respostaErro, simularApi } from './utilitarios';

describe('registro automático de rotas', () => {
  it('sem módulos, todo item do menu cai em "Módulo em desenvolvimento"', () => {
    const rotas = resolverRotas([]);
    const caminhosMenu = MENU.flatMap((g) => g.itens.map((i) => i.caminho)).filter(
      (c) => c !== '/',
    );
    expect(rotas.map((r) => r.caminho).sort()).toEqual(caminhosMenu.sort());
    expect(rotas.every((r) => !r.registrada)).toBe(true);
  });

  it('usa a rota e os perfis do módulo quando ele existe', () => {
    const rotas = resolverRotas([
      {
        rotas: [
          { caminho: '/vendas', elemento: <p>vendas</p>, perfis: ['ATENDENTE'] },
          { caminho: '/vendas/historico', elemento: <p>histórico</p>, perfis: ['FARMACEUTICO'] },
        ],
      },
    ]);
    const vendas = rotas.find((r) => r.caminho === '/vendas');
    expect(vendas?.registrada).toBe(true);
    expect(rotas.some((r) => r.caminho === '/vendas/historico')).toBe(true);
    expect(perfisDoItem('/vendas', ['FARMACEUTICO'], rotas)).toEqual(['ATENDENTE']);
    expect(perfisDoItem('/clientes', ['FARMACEUTICO'], rotas)).toEqual(['FARMACEUTICO']);
  });
});

describe('menu lateral', () => {
  const grupos = MENU.map((g) => ({
    rotulo: g.rotulo,
    itens: g.itens.map((i) => ({ ...i, perfis: i.perfisPadrao })),
  }));

  it('mostra só os itens do perfil, com "Em breve" desabilitado e pendências', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MenuLateral
          grupos={grupos}
          usuario={{ id: 1, nome: 'Ana Lima', login: 'financeiro', perfil: 'FINANCEIRO' }}
          pendencias={{ '/financeiro': 3 }}
          nomeSistema="Vitalis"
          aoSair={() => undefined}
        />
      </MemoryRouter>,
    );
    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    expect(within(menu).getByRole('link', { name: /Contas e fluxo de caixa/ })).toBeInTheDocument();
    expect(within(menu).queryByRole('link', { name: /Vendas/ })).not.toBeInTheDocument();
    expect(within(menu).getByText('Relatórios').closest('[aria-disabled]')).toBeInTheDocument();
    expect(within(menu).getByLabelText('3 pendências')).toBeInTheDocument();
  });
});

describe('Tabela', () => {
  const linhas = [
    { id: 1, nome: 'Losartana', qtd: 12 },
    { id: 2, nome: 'Dipirona', qtd: 184 },
    { id: 3, nome: 'Amoxicilina', qtd: 42 },
  ];
  const colunas = [
    { chave: 'nome', titulo: 'Produto', valorOrdenacao: (l: (typeof linhas)[0]) => l.nome },
    { chave: 'qtd', titulo: 'Qtd.', valorOrdenacao: (l: (typeof linhas)[0]) => l.qtd },
  ];

  it('ordena ao clicar no título da coluna', async () => {
    render(<Tabela colunas={colunas} linhas={linhas} chaveLinha={(l) => l.id} />);
    await userEvent.click(screen.getByRole('button', { name: /Qtd/ }));
    let celulas = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => r.textContent);
    expect(celulas).toEqual(['Losartana12', 'Amoxicilina42', 'Dipirona184']);
    await userEvent.click(screen.getByRole('button', { name: /Qtd/ }));
    celulas = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => r.textContent);
    expect(celulas[0]).toBe('Dipirona184');
  });

  it('mostra o estado vazio', () => {
    render(<Tabela colunas={colunas} linhas={[]} chaveLinha={(l) => l.id} vazio="Sem produtos" />);
    expect(screen.getByText('Sem produtos')).toBeInTheDocument();
  });
});

describe('cliente da API', () => {
  it('monta caminho e query a partir do contrato', async () => {
    const { chamadas } = simularApi({ 'GET /api/vendas/12': { id: 12 } });
    await chamar(rotasVendas.obter, { params: { id: 12 } });
    simularApi({ 'GET /api/vendas/produtos': [] });
    await chamar(rotasVendas.buscarProdutos, { query: { busca: 'dipirona' } });
    expect(chamadas[0].url.pathname).toBe('/api/vendas/12');
  });

  it('converte erro da API em ErroApi com a mensagem do servidor', async () => {
    simularApi({ 'POST /api/vendas': respostaErro(422, 'Lote vencido', 'REGRA_NEGOCIO') });
    await expect(
      chamar(rotasVendas.finalizar, { corpo: { itens: [], formaPagamento: 'PIX' } }),
    ).rejects.toEqual(new ErroApi(422, 'REGRA_NEGOCIO', 'Lote vencido'));
  });
});

describe('formatos', () => {
  it('formata moeda e datas no padrão brasileiro', () => {
    expect(formatarMoeda(594230)).toBe('R$ 5.942,30');
    expect(formatarData('2026-09-28')).toBe('28/09/2026');
    expect(formatarDataCabecalho(new Date('2026-09-28T15:00:00Z'))).toBe('Seg, 28 set 2026');
  });
});
