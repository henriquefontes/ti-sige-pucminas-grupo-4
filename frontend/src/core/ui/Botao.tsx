import type { ButtonHTMLAttributes } from 'react';

export type VarianteBotao = 'primario' | 'escuro' | 'secundario' | 'fantasma' | 'perigo';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  tamanho?: 'pequeno' | 'normal' | 'grande';
  bloco?: boolean;
  carregando?: boolean;
}

/** Botão do design system. `primario` (verde) para a ação principal da tela. */
export function Botao({
  variante = 'secundario',
  tamanho = 'normal',
  bloco = false,
  carregando = false,
  className = '',
  type = 'button',
  disabled,
  children,
  ...resto
}: Props) {
  const classes = [
    'botao',
    `botao--${variante}`,
    tamanho !== 'normal' ? `botao--${tamanho}` : '',
    bloco ? 'botao--bloco' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {carregando ? 'Aguarde…' : children}
    </button>
  );
}
