import { describe, expect, it } from 'vitest';
import { garantirBancoSeguro, urlEhSegura } from '../scripts/bancoSeguro';

describe('proteção do banco (testes e db:reset)', () => {
  it('aceita banco local ou de teste', () => {
    expect(urlEhSegura('postgresql://vitalis:vitalis@localhost:5432/vitalis')).toBe(true);
    expect(urlEhSegura('postgresql://u:p@127.0.0.1/qualquer')).toBe(true);
    expect(urlEhSegura('postgresql://u:p@servidor.grupo.edu.br:5432/vitalis_teste')).toBe(true);
  });

  it('recusa o servidor do grupo e URLs inválidas', () => {
    expect(urlEhSegura('postgresql://u:p@servidor.grupo.edu.br:5432/vitalis')).toBe(false);
    expect(urlEhSegura('postgresql://u:p@db.exemplo.com/vitalis_teste_backup')).toBe(false);
    expect(urlEhSegura(undefined)).toBe(false);
    expect(urlEhSegura('nao-e-url')).toBe(false);
    expect(() => garantirBancoSeguro('postgresql://u:p@remoto/vitalis', 'db:reset')).toThrow(
      /RECUSADO/,
    );
  });
});
