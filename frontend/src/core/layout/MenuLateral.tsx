import { NavLink } from 'react-router-dom';
import { ROTULOS_PERFIL, type Perfil, type UsuarioPublico } from '@vitalis/shared';
import { perfilPode } from '../modulo';

export interface ItemMenuLateral {
  rotulo: string;
  caminho: string;
  emBreve?: boolean;
  perfis: Perfil[];
}

export interface GrupoMenuLateral {
  rotulo: string;
  itens: ItemMenuLateral[];
}

interface Props {
  grupos: GrupoMenuLateral[];
  usuario: UsuarioPublico;
  pendencias: Record<string, number>;
  nomeSistema: string;
  aoSair: () => void;
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return (
    (partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')
  ).toUpperCase();
}

/** Menu lateral fixo, agrupado por área, com contadores de pendências. */
export function MenuLateral({ grupos, usuario, pendencias, nomeSistema, aoSair }: Props) {
  const visiveis = grupos
    .map((g) => ({ ...g, itens: g.itens.filter((i) => perfilPode(usuario.perfil, i.perfis)) }))
    .filter((g) => g.itens.length > 0);

  return (
    <aside className="lateral">
      <div className="marca">
        <div className="marca__logo" aria-hidden="true" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="marca__nome">{nomeSistema}</span>
          <span className="marca__sub">Gestão farmacêutica</span>
        </div>
      </div>

      <nav className="menu" aria-label="Menu principal">
        {visiveis.map((grupo) => (
          <div key={grupo.rotulo} className="menu__grupo">
            <span className="menu__titulo">{grupo.rotulo}</span>
            {grupo.itens.map((item) => {
              if (item.emBreve) {
                return (
                  <span
                    key={item.caminho}
                    className="menu__item menu__item--desabilitado"
                    aria-disabled="true"
                  >
                    <span>{item.rotulo}</span>
                    <span className="menu__em-breve">Em breve</span>
                  </span>
                );
              }
              const contador = pendencias[item.caminho] ?? 0;
              return (
                <NavLink
                  key={item.caminho}
                  to={item.caminho}
                  end={item.caminho === '/'}
                  className={({ isActive }) => `menu__item ${isActive ? 'menu__item--ativo' : ''}`}
                >
                  <span>{item.rotulo}</span>
                  {contador > 0 && (
                    <span className="menu__contador" aria-label={`${contador} pendências`}>
                      {contador}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="usuario-lateral">
        <div className="usuario-lateral__avatar" aria-hidden="true">
          {iniciais(usuario.nome)}
        </div>
        <div className="usuario-lateral__dados">
          <span className="usuario-lateral__nome">{usuario.nome}</span>
          <span className="usuario-lateral__perfil">{ROTULOS_PERFIL[usuario.perfil]}</span>
        </div>
        <button type="button" className="usuario-lateral__sair" onClick={aoSair}>
          Sair
        </button>
      </div>
    </aside>
  );
}
