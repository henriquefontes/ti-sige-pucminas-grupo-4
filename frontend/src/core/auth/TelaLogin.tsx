import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { rotasAuth } from '@vitalis/shared';
import { chamar, mensagemDeErro } from '../api';
import { Botao, CampoTexto, Cartao } from '../ui';
import { useAuth } from './ContextoAuth';

/** Tela de login (não existe no Claude Design; segue o mesmo padrão visual). */
export function TelaLogin() {
  const { usuario, entrar } = useAuth();
  const local = useLocation();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [loja, setLoja] = useState({ nomeSistema: 'Vitalis', nomeLoja: '' });

  useEffect(() => {
    chamar(rotasAuth.configuracaoLoja)
      .then(setLoja)
      .catch(() => undefined);
  }, []);

  if (usuario) {
    const destino = (local.state as { de?: string } | null)?.de ?? '/';
    return <Navigate to={destino} replace />;
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(login.trim(), senha);
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login">
      <Cartao className="login__cartao">
        <div className="marca" style={{ padding: 0 }}>
          <div className="marca__logo" aria-hidden="true" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="marca__nome">{loja.nomeSistema}</span>
            <span className="marca__sub">
              Gestão farmacêutica{loja.nomeLoja ? ` · ${loja.nomeLoja}` : ''}
            </span>
          </div>
        </div>
        <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--texto-xl)', fontWeight: 600 }}>Entrar</h1>
          {erro && (
            <div className="login__erro" role="alert">
              {erro}
            </div>
          )}
          <CampoTexto
            rotulo="Login"
            name="login"
            autoComplete="username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            autoFocus
          />
          <CampoTexto
            rotulo="Senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <Botao type="submit" variante="primario" bloco carregando={enviando}>
            Entrar
          </Botao>
        </form>
      </Cartao>
    </main>
  );
}
