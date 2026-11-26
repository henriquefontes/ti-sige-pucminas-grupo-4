import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Perfil } from '@vitalis/shared';
import { ModuloEmDesenvolvimento } from '../ModuloEmDesenvolvimento';
import { perfilPode } from '../modulo';
import { Carregando } from '../ui';
import { useAuth } from './ContextoAuth';

interface Props {
  children: ReactNode;
  /** Perfis permitidos. Omitido = qualquer usuário logado. */
  perfis?: Perfil[];
}

/** Exige login (e, opcionalmente, um dos perfis). */
export function RotaProtegida({ children, perfis }: Props) {
  const { usuario, verificando } = useAuth();
  const local = useLocation();

  if (verificando) return <Carregando texto="Conferindo sessão…" />;
  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  if (perfis && !perfilPode(usuario.perfil, perfis)) {
    return (
      <ModuloEmDesenvolvimento
        titulo="Acesso não permitido"
        texto="Seu perfil não tem permissão para acessar esta tela."
      />
    );
  }
  return <>{children}</>;
}
