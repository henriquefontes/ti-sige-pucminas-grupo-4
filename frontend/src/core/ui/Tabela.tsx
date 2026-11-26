import { useMemo, useState, type ReactNode } from 'react';

export interface ColunaTabela<T> {
  /** Identificador da coluna. */
  chave: string;
  titulo: ReactNode;
  /** Conteúdo da célula. Padrão: `linha[chave]`. */
  render?: (linha: T) => ReactNode;
  /** Valor usado para ordenar. Informe para tornar a coluna ordenável. */
  valorOrdenacao?: (linha: T) => string | number | null | undefined;
  alinhar?: 'esquerda' | 'direita' | 'centro';
  largura?: string;
}

interface Props<T> {
  colunas: ColunaTabela<T>[];
  linhas: T[];
  chaveLinha: (linha: T) => string | number;
  /** Mensagem quando não há linhas. */
  vazio?: ReactNode;
  ordenacaoInicial?: { chave: string; direcao: 'asc' | 'desc' };
  /** Rótulo acessível da tabela. */
  legenda?: string;
  aoClicarLinha?: (linha: T) => void;
}

const classeAlinhamento = { esquerda: '', direita: 'alinhar-direita', centro: 'alinhar-centro' };

function comparar(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'pt-BR', { numeric: true, sensitivity: 'base' });
}

/** Tabela com ordenação por coluna e estado vazio. */
export function Tabela<T>({
  colunas,
  linhas,
  chaveLinha,
  vazio = 'Nenhum registro encontrado.',
  ordenacaoInicial,
  legenda,
  aoClicarLinha,
}: Props<T>) {
  const [ordem, setOrdem] = useState(ordenacaoInicial ?? null);

  const ordenadas = useMemo(() => {
    if (!ordem) return linhas;
    const coluna = colunas.find((c) => c.chave === ordem.chave);
    if (!coluna?.valorOrdenacao) return linhas;
    const fator = ordem.direcao === 'asc' ? 1 : -1;
    return [...linhas].sort(
      (a, b) => fator * comparar(coluna.valorOrdenacao!(a), coluna.valorOrdenacao!(b)),
    );
  }, [linhas, colunas, ordem]);

  const alternar = (chave: string) =>
    setOrdem((atual) =>
      atual?.chave === chave
        ? { chave, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' }
        : { chave, direcao: 'asc' },
    );

  return (
    <div className="tabela-rolagem">
      <table className="tabela" aria-label={legenda}>
        <thead>
          <tr>
            {colunas.map((c) => {
              const ativa = ordem?.chave === c.chave;
              const ariaSort = ativa
                ? ordem!.direcao === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined;
              return (
                <th
                  key={c.chave}
                  scope="col"
                  className={classeAlinhamento[c.alinhar ?? 'esquerda']}
                  style={c.largura ? { width: c.largura } : undefined}
                  aria-sort={ariaSort}
                >
                  {c.valorOrdenacao ? (
                    <button
                      type="button"
                      className="tabela__ordenar"
                      onClick={() => alternar(c.chave)}
                    >
                      {c.titulo}
                      <span aria-hidden="true">
                        {ativa ? (ordem!.direcao === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  ) : (
                    c.titulo
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ordenadas.length === 0 ? (
            <tr>
              <td className="tabela__vazio" colSpan={colunas.length}>
                {vazio}
              </td>
            </tr>
          ) : (
            ordenadas.map((linha) => (
              <tr
                key={chaveLinha(linha)}
                onClick={aoClicarLinha ? () => aoClicarLinha(linha) : undefined}
                style={aoClicarLinha ? { cursor: 'pointer' } : undefined}
              >
                {colunas.map((c) => (
                  <td key={c.chave} className={classeAlinhamento[c.alinhar ?? 'esquerda']}>
                    {c.render
                      ? c.render(linha)
                      : String((linha as Record<string, unknown>)[c.chave] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
