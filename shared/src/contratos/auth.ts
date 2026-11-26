import { z } from 'zod';
import { Perfil } from '../enums';
import { Ok, rota } from './comum';

export const UsuarioPublico = z.object({
  id: z.number().int(),
  nome: z.string(),
  login: z.string(),
  perfil: Perfil,
});
export type UsuarioPublico = z.infer<typeof UsuarioPublico>;

export const LoginEntrada = z.object({
  login: z.string().trim().min(1, 'Informe o login'),
  senha: z.string().min(1, 'Informe a senha'),
});
export type LoginEntrada = z.infer<typeof LoginEntrada>;

export const LoginResposta = z.object({
  token: z.string(),
  usuario: UsuarioPublico,
});
export type LoginResposta = z.infer<typeof LoginResposta>;

export const ConfiguracaoLoja = z.object({
  nomeSistema: z.string(),
  nomeLoja: z.string(),
});
export type ConfiguracaoLoja = z.infer<typeof ConfiguracaoLoja>;

/** Rotas da base (autenticação e configuração pública). */
export const rotasAuth = {
  login: rota({
    metodo: 'POST',
    caminho: '/api/auth/login',
    corpo: LoginEntrada,
    resposta: LoginResposta,
  }),
  eu: rota({ metodo: 'GET', caminho: '/api/auth/eu', resposta: UsuarioPublico }),
  configuracaoLoja: rota({
    metodo: 'GET',
    caminho: '/api/configuracao/loja',
    resposta: ConfiguracaoLoja,
  }),
  saude: rota({ metodo: 'GET', caminho: '/api/saude', resposta: Ok }),
};
