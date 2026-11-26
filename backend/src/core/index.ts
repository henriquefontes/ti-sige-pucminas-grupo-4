/**
 * Ponto único de importação da base para os módulos:
 * import { prisma, eventos, registrarRota, exigirPerfil, ... } from '../../core';
 */
export * from './db';
export * from './erros';
export * from './validar';
export * from './upload';
export * from './eventos';
export * from './ganchos';
export * from './auditoria';
export * from './configuracao';
export * from './auth';
export type { ModuloBackend, ContextoModulo } from './carregarModulos';
