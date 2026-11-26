import type { ReactNode } from 'react';

export interface Aba<T extends string = string> {
  id: T;
  rotulo: ReactNode;
  /** Número pequeno ao lado do rótulo (ex.: quantidade de itens). */
  contador?: number;
}

interface Props<T extends string> {
  abas: Aba<T>[];
  ativa: T;
  aoMudar: (id: T) => void;
  rotuloAcessivel?: string;
}

/** Controle segmentado usado no Estoque e no Financeiro. */
export function Abas<T extends string>({
  abas,
  ativa,
  aoMudar,
  rotuloAcessivel = 'Abas',
}: Props<T>) {
  return (
    <div className="abas" role="tablist" aria-label={rotuloAcessivel}>
      {abas.map((aba) => (
        <button
          key={aba.id}
          type="button"
          role="tab"
          aria-selected={aba.id === ativa}
          className="abas__aba"
          onClick={() => aoMudar(aba.id)}
        >
          {aba.rotulo}
          {aba.contador !== undefined && <span className="abas__contador">{aba.contador}</span>}
        </button>
      ))}
    </div>
  );
}
