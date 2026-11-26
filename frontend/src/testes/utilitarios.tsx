/**
 * Utilitários para testes de telas dos módulos:
 *
 *   import { renderizarComUsuario, simularApi } from '../../testes/utilitarios';
 *   simularApi({ 'GET /api/vendas/produtos': [] });
 *   renderizarComUsuario(<TelaVendas />, { perfil: 'ATENDENTE' });
 */
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { Perfil, UsuarioPublico } from '@vitalis/shared';
import { gravarToken } from '../core/api';
import { ProvedorAuth, RotaProtegida } from '../core/auth';
import { ProvedorAvisos } from '../core/ui';

type Resposta = unknown | ((corpo: unknown, url: URL) => unknown);

/**
 * Substitui o fetch global. As chaves são "MÉTODO /caminho" (sem query).
 * Use `{ status, corpo }` via `respostaErro()` para simular erros.
 */
export function simularApi(rotas: Record<string, Resposta>) {
  const chamadas: { metodo: string; url: URL; corpo: unknown }[] = [];
  const mock = vi.fn(async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(entrada), 'http://localhost');
    const metodo = (init?.method ?? 'GET').toUpperCase();
    const corpo = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body;
    chamadas.push({ metodo, url, corpo });
    const chave = `${metodo} ${url.pathname}`;
    if (!(chave in rotas)) {
      return new Response(
        JSON.stringify({ erro: { codigo: 'ROTA_NAO_ENCONTRADA', mensagem: chave } }),
        {
          status: 404,
        },
      );
    }
    const valor = rotas[chave];
    const dados =
      typeof valor === 'function' ? (valor as (c: unknown, u: URL) => unknown)(corpo, url) : valor;
    if (dados instanceof RespostaErroSimulada) {
      return new Response(
        JSON.stringify({ erro: { codigo: dados.codigo, mensagem: dados.mensagem } }),
        {
          status: dados.status,
        },
      );
    }
    return new Response(JSON.stringify(dados ?? null), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', mock);
  return { mock, chamadas };
}

export class RespostaErroSimulada {
  constructor(
    public status: number,
    public mensagem: string,
    public codigo = 'ERRO',
  ) {}
}

export function respostaErro(status: number, mensagem: string, codigo?: string) {
  return new RespostaErroSimulada(status, mensagem, codigo);
}

/**
 * Renderiza uma tela com roteador, avisos e um usuário logado (GET /api/auth/eu simulado).
 * A tela só aparece depois que o usuário é carregado, como na aplicação: use `findBy...`.
 */
export function renderizarComUsuario(
  tela: ReactElement,
  { perfil = 'ADMIN' as Perfil, rota = '/', api = {} as Record<string, Resposta> } = {},
) {
  const usuario: UsuarioPublico = { id: 1, nome: 'Usuária de Teste', login: 'teste', perfil };
  gravarToken('token-de-teste');
  const simulacao = simularApi({ 'GET /api/auth/eu': usuario, ...api });
  const resultado = render(
    <MemoryRouter
      initialEntries={[rota]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ProvedorAvisos>
        <ProvedorAuth>
          <RotaProtegida>{tela}</RotaProtegida>
        </ProvedorAuth>
      </ProvedorAvisos>
    </MemoryRouter>,
  );
  return { ...resultado, ...simulacao, usuario };
}
