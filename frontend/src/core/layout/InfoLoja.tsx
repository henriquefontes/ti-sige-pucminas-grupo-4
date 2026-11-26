import { useEffect, useState, type CSSProperties } from 'react';
import { rotasEstoque, type StatusSngpc } from '@vitalis/shared';
import { chamar } from '../api';
import { formatarDataCabecalho } from '../formatos';

const COR_SITUACAO: Record<StatusSngpc['situacao'], string> = {
  EM_DIA: 'var(--cor-ok-ponto)',
  PENDENTE: 'var(--cor-atencao-ponto)',
  INCONSISTENTE: 'var(--cor-critico-ponto)',
};

/**
 * Data, nome da loja e situação do SNGPC (à direita do cabeçalho).
 * Chama GET /api/estoque/sngpc/status; mostra "—" se o módulo de estoque não existir.
 */
export function InfoLoja({ nomeLoja }: { nomeLoja: string }) {
  const [sngpc, setSngpc] = useState<StatusSngpc | null>(null);

  useEffect(() => {
    let ativo = true;
    const atualizar = () =>
      chamar(rotasEstoque.statusSngpc)
        .then((s) => ativo && setSngpc(s))
        .catch(() => ativo && setSngpc(null));
    atualizar();
    const intervalo = setInterval(atualizar, 60_000);
    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, []);

  return (
    <div className="info-loja">
      <span>{formatarDataCabecalho()}</span>
      {nomeLoja && (
        <>
          <span className="info-loja__ponto" aria-hidden="true" />
          <span>{nomeLoja}</span>
        </>
      )}
      <span
        className="info-loja__sngpc"
        style={
          sngpc
            ? ({ '--cor-ponto-sngpc': COR_SITUACAO[sngpc.situacao] } as CSSProperties)
            : undefined
        }
        title="Situação do SNGPC"
      >
        {sngpc ? sngpc.rotulo : 'SNGPC —'}
      </span>
    </div>
  );
}
