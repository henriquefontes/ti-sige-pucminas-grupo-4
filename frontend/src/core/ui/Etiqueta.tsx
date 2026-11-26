import type { ReactNode } from 'react';

export type SituacaoEtiqueta = 'ok' | 'atencao' | 'critico' | 'neutro';

interface Props {
  situacao?: SituacaoEtiqueta;
  children: ReactNode;
}

/** Etiqueta de situação: ok (verde), atencao (âmbar), critico (vermelho), neutro (cinza). */
export function Etiqueta({ situacao = 'neutro', children }: Props) {
  return <span className={`etiqueta etiqueta--${situacao}`}>{children}</span>;
}
