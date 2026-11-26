import type { ReactNode } from 'react';
import type { Perfil } from '@vitalis/shared';
import type { ModuloFrontend } from '../core/modulo';
import { ModuloEmDesenvolvimento } from '../core/ModuloEmDesenvolvimento';
import { MENU, type GrupoMenu } from './menu';

/*
 * Registro automático das telas: cada frontend/src/modules/<nome>/modulo.tsx é importado aqui.
 * Um módulo ausente não quebra a compilação: o item do menu mostra "Módulo em desenvolvimento".
 */
const arquivos = import.meta.glob<{ default: ModuloFrontend }>('../modules/*/modulo.tsx', {
  eager: true,
});

export const MODULOS: ModuloFrontend[] = Object.values(arquivos)
  .map((m) => m.default)
  .filter((m): m is ModuloFrontend => Boolean(m && Array.isArray(m.rotas)));

export interface RotaResolvida {
  caminho: string;
  elemento: ReactNode;
  perfis: Perfil[];
  titulo?: string;
  /** Falso quando nenhum módulo registrou o caminho (mostra "em desenvolvimento"). */
  registrada: boolean;
}

/** Junta as rotas dos módulos com os itens do menu ainda sem módulo. */
export function resolverRotas(
  modulos: ModuloFrontend[],
  menu: GrupoMenu[] = MENU,
): RotaResolvida[] {
  const rotas: RotaResolvida[] = [];
  const vistos = new Set<string>();
  for (const modulo of modulos) {
    for (const r of modulo.rotas) {
      if (vistos.has(r.caminho)) {
        console.warn(`Rota ${r.caminho} registrada por mais de um módulo; mantida a primeira.`);
        continue;
      }
      vistos.add(r.caminho);
      rotas.push({ ...r, registrada: true });
    }
  }
  for (const grupo of menu) {
    for (const item of grupo.itens) {
      if (vistos.has(item.caminho) || item.caminho === '/') continue;
      vistos.add(item.caminho);
      rotas.push({
        caminho: item.caminho,
        elemento: item.emBreve ? (
          <ModuloEmDesenvolvimento
            titulo="Em breve"
            texto="Esta funcionalidade está fora do escopo desta etapa do projeto."
          />
        ) : (
          <ModuloEmDesenvolvimento />
        ),
        perfis: item.perfisPadrao,
        registrada: false,
      });
    }
  }
  return rotas;
}

/** Perfis que podem ver um item do menu: os da rota do módulo ou os padrões do menu. */
export function perfisDoItem(caminho: string, padrao: Perfil[], rotas: RotaResolvida[]): Perfil[] {
  return rotas.find((r) => r.caminho === caminho && r.registrada)?.perfis ?? padrao;
}

export const ROTAS = resolverRotas(MODULOS);
