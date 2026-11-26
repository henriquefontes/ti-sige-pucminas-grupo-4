import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  aberto: boolean;
  titulo: ReactNode;
  aoFechar: () => void;
  children: ReactNode;
  /** Botões do rodapé. */
  rodape?: ReactNode;
  largo?: boolean;
}

/** Janela modal. Fecha com Esc, pelo × ou clicando fora. */
export function Modal({ aberto, titulo, aoFechar, children, rodape, largo = false }: Props) {
  const idTitulo = useId();
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef(aoFechar);
  fechar.current = aoFechar;

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar.current();
    };
    document.addEventListener('keydown', tecla);
    const primeiro = caixa.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not(.modal__fechar)',
    );
    (primeiro ?? caixa.current)?.focus();
    return () => {
      document.removeEventListener('keydown', tecla);
      anterior?.focus?.();
    };
  }, [aberto]);

  if (!aberto) return null;
  return createPortal(
    <div
      className="modal-fundo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
    >
      <div
        ref={caixa}
        className={`modal ${largo ? 'modal--largo' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
      >
        <div className="modal__cabecalho">
          <h2 id={idTitulo} className="modal__titulo">
            {titulo}
          </h2>
          <button type="button" className="modal__fechar" aria-label="Fechar" onClick={aoFechar}>
            ×
          </button>
        </div>
        <div className="modal__corpo">{children}</div>
        {rodape && <div className="modal__rodape">{rodape}</div>}
      </div>
    </div>,
    document.body,
  );
}
