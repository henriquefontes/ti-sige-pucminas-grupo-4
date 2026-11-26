import multer from 'multer';

/**
 * Upload em memória (o conteúdo fica em `req.file.buffer`).
 * Limite de 5 MB, suficiente para XML de NF-e.
 *
 * @example router.post('/entradas-nfe', uploadArquivo('arquivo'), handler)
 */
export function uploadArquivo(campo: string, limiteBytes = 5 * 1024 * 1024) {
  return multer({ storage: multer.memoryStorage(), limits: { fileSize: limiteBytes } }).single(
    campo,
  );
}
