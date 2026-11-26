import { Cartao } from './ui';

interface Props {
  titulo?: string;
  texto?: string;
}

/** Exibida quando um item do menu ainda não tem módulo mesclado. */
export function ModuloEmDesenvolvimento({
  titulo = 'Módulo em desenvolvimento',
  texto = 'Esta tela ainda não foi integrada ao sistema. Ela aparecerá aqui assim que o módulo correspondente for mesclado.',
}: Props) {
  return (
    <Cartao>
      <div className="estado-vazio" role="status">
        <span className="estado-vazio__titulo">{titulo}</span>
        <span className="estado-vazio__texto">{texto}</span>
      </div>
    </Cartao>
  );
}
