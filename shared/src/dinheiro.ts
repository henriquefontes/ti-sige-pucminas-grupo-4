/**
 * Valores em dinheiro são sempre inteiros em centavos (RNF-FIN-01).
 * A conversão para reais só acontece na exibição.
 */

const formatadorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Converte reais (ex.: 12.5 ou "12,50") para centavos inteiros, arredondando corretamente. */
export function reaisParaCentavos(valor: number | string): number {
  if (typeof valor === 'number') {
    if (!Number.isFinite(valor)) throw new Error('Valor em reais inválido');
    return Math.round(valor * 100);
  }
  const texto = valor.trim().replace(/[R$\s]/g, '');
  if (!texto) throw new Error('Valor em reais inválido');
  // Aceita "1.234,56", "1234,56" e "1234.56".
  const normalizado = texto.includes(',') ? texto.replace(/\./g, '').replace(',', '.') : texto;
  const numero = Number(normalizado);
  if (!Number.isFinite(numero)) throw new Error('Valor em reais inválido');
  return Math.round(numero * 100);
}

/** Converte centavos para reais (número). Use apenas para exibição ou integrações. */
export function centavosParaReais(centavos: number): number {
  return centavos / 100;
}

/** Formata centavos em moeda brasileira: 123456 -> "R$ 1.234,56". */
export function formatarBRL(centavos: number): string {
  return formatadorBRL.format(centavos / 100).replace(/\s/g, ' ');
}

/** Soma valores em centavos garantindo que todos são inteiros. */
export function somarCentavos(valores: number[]): number {
  return valores.reduce((total, v) => {
    if (!Number.isInteger(v)) throw new Error(`Valor em centavos não inteiro: ${v}`);
    return total + v;
  }, 0);
}

/**
 * Aplica um percentual em pontos-base (1% = 100 bp) sobre um valor em centavos,
 * arredondando para o centavo mais próximo.
 */
export function aplicarPercentualBp(centavos: number, pontosBase: number): number {
  return Math.round((centavos * pontosBase) / 10000);
}
