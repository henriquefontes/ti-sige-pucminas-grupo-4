import { useMemo, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ProvedorAuth, RotaProtegida, TelaLogin } from '../core/auth';
import { Layout } from '../core/layout';
import type { GrupoMenuLateral } from '../core/layout';
import { ModuloEmDesenvolvimento } from '../core/ModuloEmDesenvolvimento';
import { ProvedorAvisos } from '../core/ui';
import { localizarNoMenu, MENU } from './menu';
import { MODULOS, perfisDoItem, ROTAS, type RotaResolvida } from './rotas';

const FONTES_PENDENCIAS = MODULOS.flatMap((m) => (m.pendencias ? [m.pendencias] : []));

function Estrutura({ rota, children }: { rota?: RotaResolvida; children: ReactNode }) {
  const { pathname } = useLocation();
  const grupos: GrupoMenuLateral[] = useMemo(
    () =>
      MENU.map((g) => ({
        rotulo: g.rotulo,
        itens: g.itens.map((i) => ({
          rotulo: i.rotulo,
          caminho: i.caminho,
          emBreve: i.emBreve,
          perfis: perfisDoItem(i.caminho, i.perfisPadrao, ROTAS),
        })),
      })),
    [],
  );
  const noMenu = localizarNoMenu(pathname);
  const titulo = rota?.titulo ?? noMenu?.item.rotulo ?? 'Página não encontrada';
  return (
    <Layout
      grupos={grupos}
      trilha={noMenu?.grupo.rotulo}
      titulo={titulo}
      fontesPendencias={FONTES_PENDENCIAS}
    >
      {children}
    </Layout>
  );
}

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProvedorAvisos>
        <ProvedorAuth>
          <Routes>
            <Route path="/login" element={<TelaLogin />} />
            <Route
              path="/"
              element={
                <RotaProtegida>
                  <Estrutura>
                    <ModuloEmDesenvolvimento
                      titulo="Painel em breve"
                      texto="O painel com os indicadores da loja está fora do escopo desta etapa. Use o menu ao lado para acessar os módulos."
                    />
                  </Estrutura>
                </RotaProtegida>
              }
            />
            {ROTAS.map((rota) => (
              <Route
                key={rota.caminho}
                path={rota.caminho}
                element={
                  <RotaProtegida>
                    <Estrutura rota={rota}>
                      <RotaProtegida perfis={rota.perfis}>{rota.elemento}</RotaProtegida>
                    </Estrutura>
                  </RotaProtegida>
                }
              />
            ))}
            <Route
              path="*"
              element={
                <RotaProtegida>
                  <Estrutura>
                    <ModuloEmDesenvolvimento
                      titulo="Página não encontrada"
                      texto="O endereço acessado não existe. Use o menu ao lado."
                    />
                  </Estrutura>
                </RotaProtegida>
              }
            />
          </Routes>
        </ProvedorAuth>
      </ProvedorAvisos>
    </BrowserRouter>
  );
}
