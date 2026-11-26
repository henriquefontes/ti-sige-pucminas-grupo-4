/**
 * Datas: gravadas em UTC e exibidas no fuso America/Sao_Paulo.
 * Campos só de data (validade, vencimento) usam o formato AAAA-MM-DD e, no banco, @db.Date.
 */

export const FUSO_LOJA = 'America/Sao_Paulo';

const partesData = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO_LOJA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Data (AAAA-MM-DD) do instante informado no fuso da loja. */
export function dataNoFusoLoja(instante: Date = new Date()): string {
  return partesData.format(instante);
}

/** Hoje (AAAA-MM-DD) no fuso da loja. */
export function hojeNaLoja(): string {
  return dataNoFusoLoja(new Date());
}

/** Converte um Date vindo de um campo @db.Date (meia-noite UTC) para AAAA-MM-DD. */
export function dataParaISO(data: Date): string {
  return data.toISOString().slice(0, 10);
}

/** Converte AAAA-MM-DD para Date à meia-noite UTC (formato usado em campos @db.Date). */
export function isoParaData(dataISO: string): Date {
  return new Date(`${dataISO}T00:00:00.000Z`);
}

/** Soma dias a uma data AAAA-MM-DD. */
export function somarDias(dataISO: string, dias: number): string {
  const d = isoParaData(dataISO);
  d.setUTCDate(d.getUTCDate() + dias);
  return dataParaISO(d);
}

/** Diferença em dias inteiros (fim - inicio) entre duas datas AAAA-MM-DD. */
export function diasEntre(inicioISO: string, fimISO: string): number {
  return Math.round(
    (isoParaData(fimISO).getTime() - isoParaData(inicioISO).getTime()) / 86_400_000,
  );
}

/**
 * Intervalo UTC [inicio, fim) que corresponde a um dia inteiro no fuso da loja.
 * Útil para filtrar registros de data e hora "do dia".
 */
export function intervaloDoDiaNaLoja(dataISO: string): { inicio: Date; fim: Date } {
  const deslocamento = deslocamentoFusoLojaMinutos(isoParaData(dataISO));
  const inicio = new Date(isoParaData(dataISO).getTime() - deslocamento * 60_000);
  const fim = new Date(inicio.getTime() + 86_400_000);
  return { inicio, fim };
}

/** Deslocamento do fuso da loja em minutos em relação ao UTC (ex.: -180). */
function deslocamentoFusoLojaMinutos(instante: Date): number {
  const texto = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_LOJA,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(instante)
    .find((p) => p.type === 'timeZoneName')?.value;
  const m = texto?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  const minutos = Number(m[2]) * 60 + Number(m[3] ?? 0);
  return m[1] === '-' ? -minutos : minutos;
}
