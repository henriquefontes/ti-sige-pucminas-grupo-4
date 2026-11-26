import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { carregarModulos } from '../src/core/carregarModulos';
import { emTransacao } from '../src/core/db';
import { eventos } from '../src/core/eventos';
import { ganchos } from '../src/core/ganchos';
import { bancoDeTeste, criarAppDeTeste, loginComo } from './helpers';

const PASTA_FIXTURES = resolve(__dirname, 'fixtures/modulos');
const pastaVazia = mkdtempSync(join(tmpdir(), 'vitalis-modulos-'));
afterAll(() => rmSync(pastaVazia, { recursive: true, force: true }));

describe('carregamento automático de módulos', () => {
  it('não quebra quando não há módulos', async () => {
    expect(await carregarModulos(pastaVazia)).toEqual([]);
    const app = await criarAppDeTeste({ pastaModulos: pastaVazia });
    expect((await request(app).get('/api/saude')).status).toBe(200);
  });

  it('monta as rotas do módulo em /api/<nome> exigindo login', async () => {
    const app = await criarAppDeTeste({ pastaModulos: PASTA_FIXTURES });
    expect((await request(app).get('/api/exemplo/ola?nome=Ana')).status).toBe(401);

    const { autorizacao } = await loginComo('ATENDENTE');
    const res = await request(app)
      .get('/api/exemplo/ola?nome=Ana')
      .set('Authorization', autorizacao);
    expect(res.status).toBe(200);
    expect(res.body.mensagem).toBe('Olá, Ana! Você é ATENDENTE.');
  });

  it('valida query e corpo com o contrato', async () => {
    const app = await criarAppDeTeste({ pastaModulos: PASTA_FIXTURES });
    const { autorizacao } = await loginComo('FARMACEUTICO');
    const q = await request(app).get('/api/exemplo/ola?nome=A').set('Authorization', autorizacao);
    expect(q.status).toBe(400);
    const c = await request(app)
      .post('/api/exemplo/restrita/7')
      .set('Authorization', autorizacao)
      .send({ valorCentavos: 10.5 });
    expect(c.status).toBe(400);
    expect(c.body.erro.detalhes[0].campo).toBe('valorCentavos');
  });

  it('aplica exigirPerfil, com ADMIN sempre liberado', async () => {
    const app = await criarAppDeTeste({ pastaModulos: PASTA_FIXTURES });
    const enviar = async (perfil: 'ATENDENTE' | 'FARMACEUTICO' | 'ADMIN') => {
      const { autorizacao } = await loginComo(perfil);
      return request(app)
        .post('/api/exemplo/restrita/7')
        .set('Authorization', autorizacao)
        .send({ valorCentavos: 100 });
    };
    expect((await enviar('ATENDENTE')).status).toBe(403);
    expect((await enviar('FARMACEUTICO')).body).toEqual({ id: 7, valorCentavos: 100 });
    expect((await enviar('ADMIN')).status).toBe(200);
  });

  it('registra ouvintes de eventos e ganchos do módulo', async () => {
    await carregarModulos(PASTA_FIXTURES);
    await emTransacao((tx) => eventos.emitir('venda.finalizada', { vendaId: 42 }, tx));
    const gravado = await bancoDeTeste().configuracao.findUnique({
      where: { chave: 'exemplo-venda-42' },
    });
    expect(gravado?.valor).toBe('ok');
    expect(ganchos.mascararCpf('15341288670', { id: 1, perfil: 'FARMACEUTICO' })).toBe(
      '15341288670',
    );
    expect(ganchos.mascararCpf('15341288670', { id: 1, perfil: 'ATENDENTE' })).toBe('mascarado');
  });
});
