import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  rotulo?: ReactNode;
  erro?: string | null;
  ajuda?: ReactNode;
  grande?: boolean;
}

/** Campo de texto com rótulo, ajuda e mensagem de erro. Repassa o ref para o <input>. */
export const CampoTexto = forwardRef<HTMLInputElement, Props>(function CampoTexto(
  { rotulo, erro, ajuda, grande = false, className = '', id, ...resto },
  ref,
) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idErro = `${idCampo}-erro`;
  return (
    <div className={`campo ${className}`}>
      {rotulo && <label htmlFor={idCampo}>{rotulo}</label>}
      <input
        ref={ref}
        id={idCampo}
        className={`campo__controle ${grande ? 'campo__controle--grande' : ''}`}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : undefined}
        {...resto}
      />
      {ajuda && !erro && <span className="campo__ajuda">{ajuda}</span>}
      {erro && (
        <span id={idErro} className="campo__erro">
          {erro}
        </span>
      )}
    </div>
  );
});
