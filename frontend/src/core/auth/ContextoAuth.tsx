import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { rotasAuth, type UsuarioPublico } from '@vitalis/shared';
import { chamar, definirAoNaoAutenticado, gravarToken, lerToken } from '../api';

interface ContextoAuthValor {
  usuario: UsuarioPublico | null;
  /** Verdadeiro enquanto confere o token salvo ao abrir a página. */
  verificando: boolean;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => void;
}

const ContextoAuth = createContext<ContextoAuthValor | null>(null);

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioPublico | null>(null);
  const [verificando, setVerificando] = useState(() => Boolean(lerToken()));

  const sair = useCallback(() => {
    gravarToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    definirAoNaoAutenticado(sair);
    return () => definirAoNaoAutenticado(null);
  }, [sair]);

  useEffect(() => {
    if (!lerToken()) return;
    chamar(rotasAuth.eu)
      .then(setUsuario)
      .catch(() => sair())
      .finally(() => setVerificando(false));
  }, [sair]);

  const entrar = useCallback(async (login: string, senha: string) => {
    const resposta = await chamar(rotasAuth.login, { corpo: { login, senha } });
    gravarToken(resposta.token);
    setUsuario(resposta.usuario);
  }, []);

  const valor = useMemo(
    () => ({ usuario, verificando, entrar, sair }),
    [usuario, verificando, entrar, sair],
  );
  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>;
}

export function useAuth(): ContextoAuthValor {
  const valor = useContext(ContextoAuth);
  if (!valor) throw new Error('useAuth precisa estar dentro de <ProvedorAuth>');
  return valor;
}

/** Usuário logado (dentro das telas protegidas, nunca é null). */
export function useUsuario(): UsuarioPublico {
  const { usuario } = useAuth();
  if (!usuario) throw new Error('useUsuario só pode ser usado em telas protegidas');
  return usuario;
}
