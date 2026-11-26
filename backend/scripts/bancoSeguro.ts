/**
 * Proteção contra apagar o banco errado.
 * Testes e db:reset APAGAM TODOS OS DADOS: só podem rodar contra um banco local
 * (localhost/127.0.0.1/::1) ou contra um banco cujo nome termine em "_teste".
 */

const HOSTS_LOCAIS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function descreverUrl(url: string): { host: string; banco: string } {
  const u = new URL(url);
  return { host: u.hostname, banco: decodeURIComponent(u.pathname.replace(/^\//, '')) };
}

export function urlEhSegura(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const { host, banco } = descreverUrl(url);
    return HOSTS_LOCAIS.has(host) || banco.endsWith('_teste');
  } catch {
    return false;
  }
}

/** Lança erro (e não deixa continuar) se a URL não for local nem de teste. */
export function garantirBancoSeguro(url: string | undefined, contexto: string): string {
  if (!url) throw new Error(`${contexto}: URL do banco não definida.`);
  if (!urlEhSegura(url)) {
    const { host, banco } = descreverUrl(url);
    throw new Error(
      `${contexto} RECUSADO: o banco "${banco}" em "${host}" não é local nem termina em "_teste". ` +
        'Este comando apaga todos os dados e nunca deve rodar contra o servidor do grupo.',
    );
  }
  return url;
}
