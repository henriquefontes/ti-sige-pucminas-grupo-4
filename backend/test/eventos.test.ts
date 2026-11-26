import { beforeEach, describe, expect, it } from 'vitest';
import { emTransacao } from '../src/core/db';
import { eventos } from '../src/core/eventos';
import { ganchos } from '../src/core/ganchos';
import { bancoDeTeste } from './helpers';

describe('barramento de eventos síncrono', () => {
  beforeEach(() => {
    eventos.limpar();
    ganchos.limpar();
  });

  it('ignora evento sem ouvintes', async () => {
    await expect(
      emTransacao((tx) => eventos.emitir('nota.entrada.registrada', { notaId: 1 }, tx)),
    ).resolves.toBeUndefined();
  });

  it('ouvintes usam a mesma transação de quem emitiu', async () => {
    const db = bancoDeTeste();
    eventos.ouvir('venda.finalizada', async ({ vendaId }, tx) => {
      await tx.configuracao.create({ data: { chave: `ouvinte-${vendaId}`, valor: 'ok' } });
    });
    await emTransacao(async (tx) => {
      await tx.configuracao.create({ data: { chave: 'emissor', valor: 'ok' } });
      await eventos.emitir('venda.finalizada', { vendaId: 5 }, tx);
    });
    expect(await db.configuracao.count()).toBe(2);
  });

  it('desfaz a transação inteira se um ouvinte falhar', async () => {
    const db = bancoDeTeste();
    eventos.ouvir('venda.finalizada', async (_dados, tx) => {
      await tx.configuracao.create({ data: { chave: 'primeiro-ouvinte', valor: 'ok' } });
    });
    eventos.ouvir('venda.finalizada', () => {
      throw new Error('falha no financeiro');
    });
    await expect(
      emTransacao(async (tx) => {
        await tx.configuracao.create({ data: { chave: 'emissor', valor: 'ok' } });
        await eventos.emitir('venda.finalizada', { vendaId: 1 }, tx);
      }),
    ).rejects.toThrow('falha no financeiro');
    expect(await db.configuracao.count()).toBe(0);
  });
});

describe('ganchos', () => {
  beforeEach(() => ganchos.limpar());

  it('usam o padrão quando ninguém registrou', async () => {
    const desconto = await ganchos.descontoVenda({
      clienteId: 1,
      subtotalCentavos: 1000,
      itens: [],
      db: bancoDeTeste(),
    });
    expect(desconto).toEqual({ descontoCentavos: 0, convenioId: null, descricao: null });
    expect(ganchos.mascararCpf('15341288670', { id: 1, perfil: 'ADMIN' })).toBe('***.***.***-**');
  });

  it('não aceitam dois registros do mesmo gancho', () => {
    ganchos.registrar('mascararCpf', (cpf) => cpf, 'a');
    expect(() => ganchos.registrar('mascararCpf', (cpf) => cpf, 'b')).toThrow(/já registrado/);
  });
});
