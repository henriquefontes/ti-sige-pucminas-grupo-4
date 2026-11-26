import type { ReactNode } from 'react';

interface Props {
  /** Grupo do menu, acima do título (ex.: "Estoque"). */
  trilha?: ReactNode;
  titulo: ReactNode;
  /** Conteúdo à direita (botões ou informações). */
  acoes?: ReactNode;
}

/** Cabeçalho de página: trilha pequena, título grande e ações à direita. */
export function CabecalhoPagina({ trilha, titulo, acoes }: Props) {
  return (
    <header className="cabecalho-pagina">
      <div className="cabecalho-pagina__titulos">
        {trilha && <span className="cabecalho-pagina__trilha">{trilha}</span>}
        <h1 className="cabecalho-pagina__titulo">{titulo}</h1>
      </div>
      {acoes && <div className="cabecalho-pagina__acoes">{acoes}</div>}
    </header>
  );
}
