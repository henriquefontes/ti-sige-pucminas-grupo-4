import { describe, expect, it } from 'vitest';
import {
  aplicarPercentualBp,
  cnpjValido,
  cpfValido,
  diasEntre,
  formatarBRL,
  intervaloDoDiaNaLoja,
  mascararCpfParcial,
  montarCaminho,
  reaisParaCentavos,
  somarCentavos,
  somarDias,
} from '../src';

describe('dinheiro', () => {
  it('converte reais em centavos sem erro de ponto flutuante', () => {
    expect(reaisParaCentavos(0.1 + 0.2)).toBe(30);
    expect(reaisParaCentavos('1.234,56')).toBe(123456);
    expect(reaisParaCentavos('19.90')).toBe(1990);
  });

  it('formata em BRL', () => {
    expect(formatarBRL(123456)).toBe('R$ 1.234,56');
  });

  it('soma apenas inteiros', () => {
    expect(somarCentavos([10, 20, 30])).toBe(60);
    expect(() => somarCentavos([1.5])).toThrow();
  });

  it('aplica percentual em pontos-base arredondando', () => {
    expect(aplicarPercentualBp(4023, 1000)).toBe(402);
    expect(aplicarPercentualBp(4025, 1000)).toBe(403);
  });
});

describe('cpf e cnpj', () => {
  it('valida CPF', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('52998224724')).toBe(false);
    expect(cpfValido('111.111.111-11')).toBe(false);
  });

  it('mascara CPF parcialmente', () => {
    expect(mascararCpfParcial('15341288670')).toBe('***.412.886-**');
  });

  it('valida CNPJ', () => {
    expect(cnpjValido('12.345.678/0001-95')).toBe(true);
    expect(cnpjValido('12.345.678/0001-94')).toBe(false);
  });
});

describe('datas', () => {
  it('soma e compara dias', () => {
    expect(somarDias('2026-02-27', 2)).toBe('2026-03-01');
    expect(diasEntre('2026-01-01', '2026-03-01')).toBe(59);
  });

  it('calcula o intervalo UTC do dia em São Paulo', () => {
    const { inicio, fim } = intervaloDoDiaNaLoja('2026-09-28');
    expect(inicio.toISOString()).toBe('2026-09-28T03:00:00.000Z');
    expect(fim.toISOString()).toBe('2026-09-29T03:00:00.000Z');
  });
});

describe('contratos', () => {
  it('monta caminhos com parâmetros', () => {
    expect(montarCaminho('/api/vendas/:id/itens/:itemId/cancelar', { id: 4, itemId: 9 })).toBe(
      '/api/vendas/4/itens/9/cancelar',
    );
    expect(() => montarCaminho('/api/vendas/:id')).toThrow();
  });
});
