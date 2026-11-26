import type { Perfil } from '@vitalis/shared';

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  login: string;
  perfil: Perfil;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware `autenticar`. */
      usuario?: UsuarioAutenticado;
    }
  }
}
