/**
 * Módulo fictício usado só nos testes da base para provar o carregamento automático.
 * Serve também de exemplo da estrutura esperada de um módulo real.
 */
import { Router } from 'express';
import { z } from 'zod';
import { rota } from '@vitalis/shared';
import { exigirPerfil, registrarRota, usuarioDe, type ModuloBackend } from '../../../../src/core';

const rotasExemplo = {
  ola: rota({
    metodo: 'GET',
    caminho: '/api/exemplo/ola',
    query: z.object({ nome: z.string().min(2) }),
    resposta: z.object({ mensagem: z.string() }),
  }),
  restrita: rota({
    metodo: 'POST',
    caminho: '/api/exemplo/restrita/:id',
    corpo: z.object({ valorCentavos: z.number().int() }),
    resposta: z.object({ id: z.number(), valorCentavos: z.number() }),
  }),
};

const router = Router();

registrarRota(router, rotasExemplo.ola, (req, res) => {
  const { nome } = req.query as { nome: string };
  res.json({ mensagem: `Olá, ${nome}! Você é ${usuarioDe(req).perfil}.` });
});

registrarRota(router, rotasExemplo.restrita, exigirPerfil('FARMACEUTICO'), (req, res) => {
  res.json({ id: Number(req.params.id), valorCentavos: req.body.valorCentavos });
});

export default {
  nome: 'exemplo',
  router,
  registrar(ctx) {
    // O ouvinte grava usando a transação de quem emitiu o evento.
    ctx.ouvir('venda.finalizada', async ({ vendaId }, tx) => {
      await tx.configuracao.create({ data: { chave: `exemplo-venda-${vendaId}`, valor: 'ok' } });
    });
    ctx.registrarGancho('mascararCpf', (cpf, usuario) =>
      usuario.perfil === 'FARMACEUTICO' ? cpf : 'mascarado',
    );
  },
} satisfies ModuloBackend;
