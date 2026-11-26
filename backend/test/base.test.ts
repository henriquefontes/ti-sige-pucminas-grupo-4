import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { SENHA_DEMONSTRACAO } from '../prisma/seed';
import { bancoDeTeste, carregarSeed, criarAppDeTeste, loginComo } from './helpers';

describe('base da API', () => {
  it('responde à verificação de saúde', async () => {
    const app = await criarAppDeTeste();
    const res = await request(app).get('/api/saude');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('devolve 404 padronizado para rota inexistente', async () => {
    const app = await criarAppDeTeste();
    const res = await request(app).get('/api/nao-existe');
    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('ROTA_NAO_ENCONTRADA');
  });

  it('devolve o nome da loja da configuração', async () => {
    await carregarSeed();
    const app = await criarAppDeTeste();
    const res = await request(app).get('/api/configuracao/loja');
    expect(res.body).toEqual({ nomeSistema: 'Vitalis', nomeLoja: 'Loja Savassi' });
  });
});

describe('autenticação (RNF-GER-01)', () => {
  it('faz login com os usuários de demonstração e registra auditoria', async () => {
    await carregarSeed();
    const app = await criarAppDeTeste();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: 'farmaceutico', senha: SENHA_DEMONSTRACAO });
    expect(res.status).toBe(200);
    expect(res.body.usuario).toMatchObject({ login: 'farmaceutico', perfil: 'FARMACEUTICO' });
    expect(res.body.usuario.senhaHash).toBeUndefined();

    const eu = await request(app)
      .get('/api/auth/eu')
      .set('Authorization', `Bearer ${res.body.token}`);
    expect(eu.body.nome).toBe('Marina Souza');

    const auditoria = await bancoDeTeste().auditoria.findFirst({ where: { acao: 'auth.login' } });
    expect(auditoria?.usuarioId).toBe(res.body.usuario.id);
  });

  it('recusa senha errada', async () => {
    await carregarSeed();
    const app = await criarAppDeTeste();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: 'admin', senha: 'errada' });
    expect(res.status).toBe(401);
    expect(res.body.erro.mensagem).toBe('Login ou senha incorretos');
  });

  it('valida a entrada do login com o contrato', async () => {
    const app = await criarAppDeTeste();
    const res = await request(app).post('/api/auth/login').send({ login: '' });
    expect(res.status).toBe(400);
    expect(res.body.erro.codigo).toBe('VALIDACAO');
  });

  it('recusa token inválido e usuário inativo', async () => {
    const app = await criarAppDeTeste();
    expect((await request(app).get('/api/auth/eu').set('Authorization', 'Bearer xyz')).status).toBe(
      401,
    );

    const { usuario, autorizacao } = await loginComo('ATENDENTE');
    await bancoDeTeste().usuario.update({ where: { id: usuario.id }, data: { ativo: false } });
    expect((await request(app).get('/api/auth/eu').set('Authorization', autorizacao)).status).toBe(
      401,
    );
  });
});
