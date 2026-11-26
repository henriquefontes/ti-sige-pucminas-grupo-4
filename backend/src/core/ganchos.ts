import { MASCARA_CPF_TOTAL, type Perfil } from '@vitalis/shared';
import type { ClienteBanco } from './db';

/*
 * Ganchos: pontos de extensão que DEVOLVEM um valor.
 * Um módulo registra a implementação; quem chama recebe o padrão se ninguém registrou.
 */

export interface ContextoDesconto {
  clienteId: number | null;
  subtotalCentavos: number;
  itens: { produtoId: number; quantidade: number; subtotalCentavos: number }[];
  /** Cliente de banco (a transação da venda, quando houver). */
  db: ClienteBanco;
}

export interface ResultadoDesconto {
  descontoCentavos: number;
  convenioId: number | null;
  descricao: string | null;
}

export interface UsuarioMascara {
  id: number;
  perfil: Perfil;
}

export interface MapaGanchos {
  /** Chamado por vendas na prévia e na finalização. Registrado por atendimento (RF-ATD-05). */
  descontoVenda: (ctx: ContextoDesconto) => Promise<ResultadoDesconto>;
  /** Chamado por qualquer módulo que devolva CPF. Registrado por atendimento (RNF-ATD-01). */
  mascararCpf: (cpf: string, usuario: UsuarioMascara) => string;
}

export type NomeGancho = keyof MapaGanchos;

const PADROES: MapaGanchos = {
  descontoVenda: async () => ({ descontoCentavos: 0, convenioId: null, descricao: null }),
  mascararCpf: () => MASCARA_CPF_TOTAL,
};

class RegistroGanchos {
  private implementacoes: Partial<MapaGanchos> = {};
  private donos: Partial<Record<NomeGancho, string>> = {};

  /** Registra a implementação de um gancho. Só um módulo pode registrar cada gancho. */
  registrar<N extends NomeGancho>(nome: N, fn: MapaGanchos[N], modulo = 'desconhecido'): void {
    if (this.implementacoes[nome]) {
      throw new Error(`Gancho ${nome} já registrado pelo módulo ${this.donos[nome]}`);
    }
    this.implementacoes[nome] = fn;
    this.donos[nome] = modulo;
  }

  /** Desconto da venda; padrão: desconto zero. */
  descontoVenda(ctx: ContextoDesconto): Promise<ResultadoDesconto> {
    return (this.implementacoes.descontoVenda ?? PADROES.descontoVenda)(ctx);
  }

  /** CPF mascarado para o usuário; padrão: máscara total `***.***.***-**`. */
  mascararCpf(cpf: string, usuario: UsuarioMascara): string {
    return (this.implementacoes.mascararCpf ?? PADROES.mascararCpf)(cpf, usuario);
  }

  registrado(nome: NomeGancho): boolean {
    return Boolean(this.implementacoes[nome]);
  }

  limpar(): void {
    this.implementacoes = {};
    this.donos = {};
  }
}

export const ganchos = new RegistroGanchos();
export type Ganchos = RegistroGanchos;
