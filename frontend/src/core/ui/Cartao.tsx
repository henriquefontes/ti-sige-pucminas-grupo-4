import type { HTMLAttributes, ReactNode } from 'react';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  titulo?: ReactNode;
  /** Conteúdo à direita do título. */
  extra?: ReactNode;
  /** Aplica o espaçamento interno padrão (20px). */
  comPadding?: boolean;
}

/** Superfície branca com borda e cantos arredondados. */
export function Cartao({
  titulo,
  extra,
  comPadding = false,
  className = '',
  children,
  ...resto
}: Props) {
  return (
    <div className={`cartao ${className}`} {...resto}>
      {titulo && (
        <div className="cartao__titulo">
          <span>{titulo}</span>
          {extra}
        </div>
      )}
      {comPadding ? <div className="cartao--padding">{children}</div> : children}
    </div>
  );
}
