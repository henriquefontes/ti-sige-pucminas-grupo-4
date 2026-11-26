import { Router } from 'express';
import { LoginEntrada, type LoginResposta, type UsuarioPublico } from '@vitalis/shared';
import { registrarAuditoria } from '../auditoria';
import { prisma } from '../db';
import { ErroNaoAutenticado } from '../erros';
import { validar } from '../validar';
import { autenticar, usuarioDe } from './middleware';
import { conferirSenha } from './senha';
import { gerarToken } from './token';

export function rotasAuth(): Router {
  const router = Router();

  router.post('/login', validar({ corpo: LoginEntrada }), async (req, res) => {
    const { login, senha } = req.body as LoginEntrada;
    const usuario = await prisma.usuario.findUnique({ where: { login } });
    const senhaConfere = usuario ? await conferirSenha(senha, usuario.senhaHash) : false;
    if (!usuario || !usuario.ativo || !senhaConfere) {
      throw new ErroNaoAutenticado('Login ou senha incorretos');
    }
    const publico: UsuarioPublico = {
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login,
      perfil: usuario.perfil,
    };
    await registrarAuditoria({
      usuarioId: usuario.id,
      acao: 'auth.login',
      entidade: 'Usuario',
      entidadeId: usuario.id,
    });
    const resposta: LoginResposta = { token: gerarToken(publico), usuario: publico };
    res.json(resposta);
  });

  router.get('/eu', autenticar, async (req, res) => {
    const { id, nome, login, perfil } = usuarioDe(req);
    const resposta: UsuarioPublico = { id, nome, login, perfil };
    res.json(resposta);
  });

  return router;
}
