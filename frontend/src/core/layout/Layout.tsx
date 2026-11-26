import { useEffect, useState, type ReactNode } from 'react';
import { rotasAuth } from '@vitalis/shared';
import { chamar } from '../api';
import { useAuth } from '../auth';
import { CabecalhoPagina } from '../ui';
import { InfoLoja } from './InfoLoja';
import { MenuLateral, type GrupoMenuLateral } from './MenuLateral';

interface Props {
  grupos: GrupoMenuLateral[];
  /** Trilha e título da página atual. */
  trilha?: string;
  titulo: string;
  /** Funções de pendências exportadas pelos módulos. */
  fontesPendencias: (() => Promise<Record<string, number>>)[];
  children: ReactNode;
}

/** Estrutura das telas logadas: menu lateral, cabeçalho e área de conteúdo. */
export function Layout({ grupos, trilha, titulo, fontesPendencias, children }: Props) {
  const { usuario, sair } = useAuth();
  const [loja, setLoja] = useState({ nomeSistema: 'Vitalis', nomeLoja: '' });
  const [pendencias, setPendencias] = useState<Record<string, number>>({});

  useEffect(() => {
    chamar(rotasAuth.configuracaoLoja)
      .then(setLoja)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let ativo = true;
    async function atualizar() {
      const resultados = await Promise.allSettled(fontesPendencias.map((f) => f()));
      const soma: Record<string, number> = {};
      for (const r of resultados) {
        if (r.status !== 'fulfilled') continue;
        for (const [caminho, n] of Object.entries(r.value))
          soma[caminho] = (soma[caminho] ?? 0) + n;
      }
      if (ativo) setPendencias(soma);
    }
    atualizar();
    const intervalo = setInterval(atualizar, 60_000);
    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [fontesPendencias]);

  if (!usuario) return null;

  return (
    <div className="layout">
      <MenuLateral
        grupos={grupos}
        usuario={usuario}
        pendencias={pendencias}
        nomeSistema={loja.nomeSistema}
        aoSair={sair}
      />
      <main className="conteudo">
        <CabecalhoPagina
          trilha={trilha}
          titulo={titulo}
          acoes={<InfoLoja nomeLoja={loja.nomeLoja} />}
        />
        {children}
      </main>
    </div>
  );
}
