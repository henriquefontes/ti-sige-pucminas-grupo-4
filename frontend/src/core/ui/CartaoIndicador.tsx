import type { ReactNode } from 'react';

type Tom = 'normal' | 'ok' | 'atencao' | 'critico';

interface Props {
  rotulo: ReactNode;
  valor: ReactNode;
  nota?: ReactNode;
  /** Cor do valor. */
  tom?: Tom;
  /** Cor da nota. */
  tomNota?: Tom;
}

const classeTom = (tom: Tom) => (tom === 'normal' ? '' : `tom-${tom}`);

/** Indicador (KPI) como no topo do Painel e do Financeiro. */
export function CartaoIndicador({
  rotulo,
  valor,
  nota,
  tom = 'normal',
  tomNota = 'normal',
}: Props) {
  return (
    <div className="cartao indicador">
      <span className="indicador__rotulo">{rotulo}</span>
      <span className={`indicador__valor ${classeTom(tom)}`}>{valor}</span>
      {nota && <span className={`indicador__nota ${classeTom(tomNota)}`}>{nota}</span>}
    </div>
  );
}

/** Grade responsiva para vários indicadores. */
export function GradeIndicadores({ children }: { children: ReactNode }) {
  return <div className="indicadores">{children}</div>;
}
