/** Remove tudo o que não for dígito. */
export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** Valida um CPF pelos dígitos verificadores. Aceita com ou sem máscara. */
export function cpfValido(valor: string): boolean {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digitos = cpf.split('').map(Number);
  const calcular = (quantidade: number) => {
    let soma = 0;
    for (let i = 0; i < quantidade; i++) soma += digitos[i] * (quantidade + 1 - i);
    return ((soma * 10) % 11) % 10;
  };
  return calcular(9) === digitos[9] && calcular(10) === digitos[10];
}

/** Formata 11 dígitos como 000.000.000-00. */
export function formatarCpf(valor: string): string {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11) return valor;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

/** Máscara parcial (RNF-ATD-01): 153.412.886-70 -> ***.412.886-** */
export function mascararCpfParcial(valor: string): string {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11) return MASCARA_CPF_TOTAL;
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}

/** Máscara total, usada quando nenhum módulo registrou o gancho mascararCpf. */
export const MASCARA_CPF_TOTAL = '***.***.***-**';

/** Valida um CNPJ pelos dígitos verificadores. */
export function cnpjValido(valor: string): boolean {
  const cnpj = somenteDigitos(valor);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const d = cnpj.split('').map(Number);
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, ...pesos1];
  const dv = (pesos: number[]) => {
    const soma = pesos.reduce((acc, p, i) => acc + d[i] * p, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return dv(pesos1) === d[12] && dv(pesos2) === d[13];
}

/** Formata 14 dígitos como 00.000.000/0000-00. */
export function formatarCnpj(valor: string): string {
  const c = somenteDigitos(valor);
  if (c.length !== 14) return valor;
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
}
