import { FUSO_LOJA, formatarBRL, formatarCnpj, formatarCpf } from '@vitalis/shared';

/** Centavos -> "R$ 1.234,56". */
export function formatarMoeda(centavos: number): string {
  return formatarBRL(centavos);
}

/** "2026-09-28" -> "28/09/2026". Aceita também data e hora ISO (usa o fuso da loja). */
export function formatarData(valor: string | null | undefined): string {
  if (!valor) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [a, m, d] = valor.split('-');
    return `${d}/${m}/${a}`;
  }
  return new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO_LOJA }).format(new Date(valor));
}

/** "2026-09-28" -> "09/2026" (validade de lote). */
export function formatarMesAno(valor: string | null | undefined): string {
  if (!valor) return '—';
  const [a, m] = valor.slice(0, 10).split('-');
  return `${m}/${a}`;
}

/** Data e hora ISO (UTC) -> "28/09/2026 14:12" no fuso da loja. */
export function formatarDataHora(valor: string | null | undefined): string {
  if (!valor) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_LOJA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date(valor))
    .replace(',', '');
}

/** Data e hora ISO -> "14:12" no fuso da loja. */
export function formatarHora(valor: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_LOJA,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(valor));
}

/** Data do cabeçalho, como no design: "Seg, 28 set 2026". */
export function formatarDataCabecalho(data: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_LOJA,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).formatToParts(data);
  const parte = (tipo: string) => partes.find((p) => p.type === tipo)?.value.replace('.', '') ?? '';
  const semana = parte('weekday');
  return `${semana.charAt(0).toUpperCase()}${semana.slice(1)}, ${parte('day')} ${parte('month')} ${parte('year')}`;
}

/** Quantidade com separador de milhar. */
export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor);
}

/** Pontos-base -> "10%" ou "2,5%". */
export function formatarPercentualBp(pontosBase: number): string {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(pontosBase / 100)}%`;
}

export { formatarCpf, formatarCnpj };
