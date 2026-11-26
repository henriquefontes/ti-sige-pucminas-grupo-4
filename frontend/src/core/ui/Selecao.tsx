import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';

export interface OpcaoSelecao {
  valor: string;
  rotulo: string;
  desabilitada?: boolean;
}

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  rotulo?: ReactNode;
  opcoes: OpcaoSelecao[];
  /** Texto da opção vazia (ex.: "Selecione"). Omita para não ter opção vazia. */
  vazio?: string;
  erro?: string | null;
}

export function Selecao({ rotulo, opcoes, vazio, erro, className = '', id, ...resto }: Props) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  return (
    <div className={`campo ${className}`}>
      {rotulo && <label htmlFor={idCampo}>{rotulo}</label>}
      <select
        id={idCampo}
        className="campo__controle"
        aria-invalid={erro ? true : undefined}
        {...resto}
      >
        {vazio !== undefined && <option value="">{vazio}</option>}
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor} disabled={o.desabilitada}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {erro && <span className="campo__erro">{erro}</span>}
    </div>
  );
}
