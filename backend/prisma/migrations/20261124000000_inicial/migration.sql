-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'FARMACEUTICO', 'ATENDENTE', 'FINANCEIRO');

-- CreateEnum
CREATE TYPE "ClasseProduto" AS ENUM ('GENERICO', 'REFERENCIA', 'SIMILAR', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoControle" AS ENUM ('NENHUM', 'ANTIMICROBIANO', 'CONTROLADO');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX', 'CONVENIO');

-- CreateEnum
CREATE TYPE "FormaPagamentoConta" AS ENUM ('BOLETO', 'TRANSFERENCIA', 'PIX', 'DINHEIRO', 'CARTAO', 'DEBITO_AUTOMATICO');

-- CreateEnum
CREATE TYPE "StatusVenda" AS ENUM ('FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoReceita" AS ENUM ('ANTIMICROBIANO', 'CONTROLE_ESPECIAL');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('F', 'M');

-- CreateEnum
CREATE TYPE "TipoSolicitacaoTitular" AS ENUM ('ACESSO', 'CORRECAO', 'EXCLUSAO');

-- CreateEnum
CREATE TYPE "StatusSolicitacaoTitular" AS ENUM ('PENDENTE', 'ATENDIDA');

-- CreateEnum
CREATE TYPE "MotivoPerda" AS ENUM ('VENCIMENTO', 'AVARIA', 'FURTO');

-- CreateEnum
CREATE TYPE "StatusInventario" AS ENUM ('ABERTO', 'FECHADO');

-- CreateEnum
CREATE TYPE "TipoMovimentoControlado" AS ENUM ('ENTRADA', 'SAIDA', 'PERDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "StatusMovimentoControlado" AS ENUM ('OK', 'INCONSISTENTE', 'TRANSMITIDO');

-- CreateEnum
CREATE TYPE "OrigemMovimentoControlado" AS ENUM ('NOTA_ENTRADA', 'VENDA', 'CANCELAMENTO_VENDA', 'PERDA', 'INVENTARIO', 'CORRECAO');

-- CreateEnum
CREATE TYPE "StatusTransmissao" AS ENUM ('ACEITA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "OrigemContaPagar" AS ENUM ('MANUAL', 'NOTA_ENTRADA');

-- CreateEnum
CREATE TYPE "StatusContaPagar" AS ENUM ('ABERTA', 'PAGA', 'ESTORNADA');

-- CreateEnum
CREATE TYPE "OrigemContaReceber" AS ENUM ('MANUAL', 'VENDA_CARTAO', 'FATURA_CONVENIO');

-- CreateEnum
CREATE TYPE "StatusContaReceber" AS ENUM ('ABERTA', 'RECEBIDA', 'ESTORNADA');

-- CreateEnum
CREATE TYPE "TipoMovimentoCaixa" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "OrigemMovimentoCaixa" AS ENUM ('VENDA', 'CANCELAMENTO_VENDA', 'CONTA_PAGAR', 'CONTA_RECEBER', 'ESTORNO_CONTA_PAGAR', 'ESTORNO_CONTA_RECEBER', 'MANUAL');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "dados" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("chave")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "principioAtivo" TEXT NOT NULL,
    "codigoBarras" TEXT NOT NULL,
    "classe" "ClasseProduto" NOT NULL,
    "tipoControle" "TipoControle" NOT NULL DEFAULT 'NENHUM',
    "listaPortaria344" TEXT,
    "precoVendaCentavos" INTEGER NOT NULL,
    "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "validade" DATE NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "custoUnitarioCentavos" INTEGER NOT NULL,
    "notaEntradaId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaEntrada" (
    "id" SERIAL NOT NULL,
    "fornecedorId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "emissao" TIMESTAMP(3) NOT NULL,
    "valorTotalCentavos" INTEGER NOT NULL,
    "xmlOriginal" TEXT NOT NULL,
    "usuarioId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemNotaEntrada" (
    "id" SERIAL NOT NULL,
    "notaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "loteId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "custoUnitarioCentavos" INTEGER NOT NULL,

    CONSTRAINT "ItemNotaEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuplicataNota" (
    "id" SERIAL NOT NULL,
    "notaId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "vencimento" DATE NOT NULL,
    "valorCentavos" INTEGER NOT NULL,

    CONSTRAINT "DuplicataNota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perda" (
    "id" SERIAL NOT NULL,
    "loteId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "motivo" "MotivoPerda" NOT NULL,
    "observacao" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Perda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventario" (
    "id" SERIAL NOT NULL,
    "status" "StatusInventario" NOT NULL DEFAULT 'ABERTO',
    "observacao" TEXT,
    "abertoPorId" INTEGER NOT NULL,
    "abertoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechadoPorId" INTEGER,
    "fechadoEm" TIMESTAMP(3),

    CONSTRAINT "Inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemInventario" (
    "id" SERIAL NOT NULL,
    "inventarioId" INTEGER NOT NULL,
    "loteId" INTEGER NOT NULL,
    "quantidadeSistema" INTEGER NOT NULL,
    "quantidadeContada" INTEGER,

    CONSTRAINT "ItemInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentoControlado" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "loteId" INTEGER,
    "loteNumero" TEXT NOT NULL,
    "tipo" "TipoMovimentoControlado" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origemTipo" "OrigemMovimentoControlado" NOT NULL,
    "origemId" INTEGER,
    "receitaId" INTEGER,
    "status" "StatusMovimentoControlado" NOT NULL DEFAULT 'OK',
    "inconsistencias" JSONB,
    "corrigeMovimentoId" INTEGER,
    "transmissaoId" INTEGER,
    "observacao" TEXT,
    "usuarioId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentoControlado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransmissaoSngpc" (
    "id" SERIAL NOT NULL,
    "periodoInicio" DATE NOT NULL,
    "periodoFim" DATE NOT NULL,
    "arquivoXml" TEXT NOT NULL,
    "protocolo" TEXT,
    "status" "StatusTransmissao" NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransmissaoSngpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convenio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "percentualDescontoBp" INTEGER NOT NULL,
    "diaFechamento" INTEGER NOT NULL,
    "diasParaPagamento" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Convenio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT,
    "consentimentoEm" TIMESTAMP(3) NOT NULL,
    "convenioId" INTEGER,
    "matriculaConvenio" TEXT,
    "anonimizado" BOOLEAN NOT NULL DEFAULT false,
    "anonimizadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoTitular" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "tipo" "TipoSolicitacaoTitular" NOT NULL,
    "status" "StatusSolicitacaoTitular" NOT NULL DEFAULT 'PENDENTE',
    "detalhes" JSONB,
    "resposta" JSONB,
    "usuarioId" INTEGER NOT NULL,
    "atendidaPorId" INTEGER,
    "atendidaEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitacaoTitular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispensacaoFarmaciaPopular" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "vendaId" INTEGER,
    "numeroReceita" TEXT NOT NULL,
    "dataReceita" DATE NOT NULL,
    "crmPrescritor" TEXT NOT NULL,
    "ufCrm" TEXT NOT NULL,
    "itens" JSONB NOT NULL,
    "autorizacao" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DispensacaoFarmaciaPopular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" SERIAL NOT NULL,
    "numero" SERIAL NOT NULL,
    "operadorId" INTEGER NOT NULL,
    "clienteId" INTEGER,
    "convenioId" INTEGER,
    "status" "StatusVenda" NOT NULL DEFAULT 'FINALIZADA',
    "subtotalCentavos" INTEGER NOT NULL,
    "descontoCentavos" INTEGER NOT NULL DEFAULT 0,
    "totalCentavos" INTEGER NOT NULL,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "chaveDocumentoFiscal" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceladaEm" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "canceladaPorId" INTEGER,

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemVenda" (
    "id" SERIAL NOT NULL,
    "vendaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "loteId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitarioCentavos" INTEGER NOT NULL,
    "subtotalCentavos" INTEGER NOT NULL,
    "cancelado" BOOLEAN NOT NULL DEFAULT false,
    "motivoCancelamento" TEXT,
    "canceladoEm" TIMESTAMP(3),
    "canceladoPorId" INTEGER,

    CONSTRAINT "ItemVenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receita" (
    "id" SERIAL NOT NULL,
    "vendaId" INTEGER NOT NULL,
    "tipo" "TipoReceita" NOT NULL,
    "numero" TEXT NOT NULL,
    "prescritorNome" TEXT NOT NULL,
    "crm" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "dataEmissao" DATE NOT NULL,
    "pacienteNome" TEXT NOT NULL,
    "pacienteIdade" INTEGER,
    "pacienteSexo" "Sexo",
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaPagar" (
    "id" SERIAL NOT NULL,
    "credor" TEXT NOT NULL,
    "fornecedorId" INTEGER,
    "origemTipo" "OrigemContaPagar" NOT NULL DEFAULT 'MANUAL',
    "origemId" INTEGER,
    "duplicataId" INTEGER,
    "descricao" TEXT NOT NULL,
    "vencimento" DATE NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "formaPagamento" "FormaPagamentoConta",
    "status" "StatusContaPagar" NOT NULL DEFAULT 'ABERTA',
    "pagaEm" TIMESTAMP(3),
    "estornoDeId" INTEGER,
    "motivoEstorno" TEXT,
    "criadoPorId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaPagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaReceber" (
    "id" SERIAL NOT NULL,
    "pagador" TEXT NOT NULL,
    "origemTipo" "OrigemContaReceber" NOT NULL DEFAULT 'MANUAL',
    "origemId" INTEGER,
    "convenioId" INTEGER,
    "periodoInicio" DATE,
    "periodoFim" DATE,
    "descricao" TEXT NOT NULL,
    "vencimento" DATE NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "status" "StatusContaReceber" NOT NULL DEFAULT 'ABERTA',
    "recebidaEm" TIMESTAMP(3),
    "estornoDeId" INTEGER,
    "motivoEstorno" TEXT,
    "criadoPorId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaReceber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemFaturaConvenio" (
    "id" SERIAL NOT NULL,
    "contaReceberId" INTEGER NOT NULL,
    "vendaId" INTEGER NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "estornadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemFaturaConvenio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaixaDiario" (
    "id" SERIAL NOT NULL,
    "operadorId" INTEGER NOT NULL,
    "abertoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorAberturaCentavos" INTEGER NOT NULL,
    "fechadoEm" TIMESTAMP(3),
    "totaisPorForma" JSONB,
    "valorFechamentoCentavos" INTEGER,
    "observacao" TEXT,

    CONSTRAINT "CaixaDiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentoCaixa" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMovimentoCaixa" NOT NULL,
    "origemTipo" "OrigemMovimentoCaixa" NOT NULL,
    "origemId" INTEGER,
    "valorCentavos" INTEGER NOT NULL,
    "formaPagamento" "FormaPagamento",
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT NOT NULL,
    "caixaId" INTEGER,
    "estornoDeId" INTEGER,
    "usuarioId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentoCaixa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_login_key" ON "Usuario"("login");

-- CreateIndex
CREATE INDEX "Auditoria_entidade_entidadeId_idx" ON "Auditoria"("entidade", "entidadeId");

-- CreateIndex
CREATE INDEX "Auditoria_criadoEm_idx" ON "Auditoria"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_cnpj_key" ON "Fornecedor"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_codigoBarras_key" ON "Produto"("codigoBarras");

-- CreateIndex
CREATE INDEX "Produto_nome_idx" ON "Produto"("nome");

-- CreateIndex
CREATE INDEX "Produto_principioAtivo_idx" ON "Produto"("principioAtivo");

-- CreateIndex
CREATE INDEX "Lote_produtoId_validade_idx" ON "Lote"("produtoId", "validade");

-- CreateIndex
CREATE UNIQUE INDEX "Lote_produtoId_numero_key" ON "Lote"("produtoId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "NotaEntrada_chave_key" ON "NotaEntrada"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "ItemInventario_inventarioId_loteId_key" ON "ItemInventario"("inventarioId", "loteId");

-- CreateIndex
CREATE INDEX "MovimentoControlado_data_status_idx" ON "MovimentoControlado"("data", "status");

-- CreateIndex
CREATE INDEX "MovimentoControlado_produtoId_idx" ON "MovimentoControlado"("produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "Convenio_cnpj_key" ON "Convenio"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");

-- CreateIndex
CREATE INDEX "Cliente_nome_idx" ON "Cliente"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Venda_numero_key" ON "Venda"("numero");

-- CreateIndex
CREATE INDEX "Venda_criadoEm_idx" ON "Venda"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "ContaPagar_duplicataId_key" ON "ContaPagar"("duplicataId");

-- CreateIndex
CREATE INDEX "ContaPagar_vencimento_status_idx" ON "ContaPagar"("vencimento", "status");

-- CreateIndex
CREATE INDEX "ContaReceber_vencimento_status_idx" ON "ContaReceber"("vencimento", "status");

-- CreateIndex
CREATE INDEX "MovimentoCaixa_data_idx" ON "MovimentoCaixa"("data");

-- CreateIndex
CREATE INDEX "MovimentoCaixa_origemTipo_origemId_idx" ON "MovimentoCaixa"("origemTipo", "origemId");

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_notaEntradaId_fkey" FOREIGN KEY ("notaEntradaId") REFERENCES "NotaEntrada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaEntrada" ADD CONSTRAINT "NotaEntrada_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaEntrada" ADD CONSTRAINT "NotaEntrada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemNotaEntrada" ADD CONSTRAINT "ItemNotaEntrada_notaId_fkey" FOREIGN KEY ("notaId") REFERENCES "NotaEntrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemNotaEntrada" ADD CONSTRAINT "ItemNotaEntrada_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemNotaEntrada" ADD CONSTRAINT "ItemNotaEntrada_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuplicataNota" ADD CONSTRAINT "DuplicataNota_notaId_fkey" FOREIGN KEY ("notaId") REFERENCES "NotaEntrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perda" ADD CONSTRAINT "Perda_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perda" ADD CONSTRAINT "Perda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_abertoPorId_fkey" FOREIGN KEY ("abertoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_fechadoPorId_fkey" FOREIGN KEY ("fechadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemInventario" ADD CONSTRAINT "ItemInventario_inventarioId_fkey" FOREIGN KEY ("inventarioId") REFERENCES "Inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemInventario" ADD CONSTRAINT "ItemInventario_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoControlado" ADD CONSTRAINT "MovimentoControlado_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoControlado" ADD CONSTRAINT "MovimentoControlado_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoControlado" ADD CONSTRAINT "MovimentoControlado_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "Receita"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoControlado" ADD CONSTRAINT "MovimentoControlado_corrigeMovimentoId_fkey" FOREIGN KEY ("corrigeMovimentoId") REFERENCES "MovimentoControlado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoControlado" ADD CONSTRAINT "MovimentoControlado_transmissaoId_fkey" FOREIGN KEY ("transmissaoId") REFERENCES "TransmissaoSngpc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoControlado" ADD CONSTRAINT "MovimentoControlado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransmissaoSngpc" ADD CONSTRAINT "TransmissaoSngpc_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoTitular" ADD CONSTRAINT "SolicitacaoTitular_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoTitular" ADD CONSTRAINT "SolicitacaoTitular_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoTitular" ADD CONSTRAINT "SolicitacaoTitular_atendidaPorId_fkey" FOREIGN KEY ("atendidaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispensacaoFarmaciaPopular" ADD CONSTRAINT "DispensacaoFarmaciaPopular_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispensacaoFarmaciaPopular" ADD CONSTRAINT "DispensacaoFarmaciaPopular_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispensacaoFarmaciaPopular" ADD CONSTRAINT "DispensacaoFarmaciaPopular_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_canceladaPorId_fkey" FOREIGN KEY ("canceladaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_canceladoPorId_fkey" FOREIGN KEY ("canceladoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receita" ADD CONSTRAINT "Receita_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_duplicataId_fkey" FOREIGN KEY ("duplicataId") REFERENCES "DuplicataNota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_estornoDeId_fkey" FOREIGN KEY ("estornoDeId") REFERENCES "ContaPagar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_estornoDeId_fkey" FOREIGN KEY ("estornoDeId") REFERENCES "ContaReceber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemFaturaConvenio" ADD CONSTRAINT "ItemFaturaConvenio_contaReceberId_fkey" FOREIGN KEY ("contaReceberId") REFERENCES "ContaReceber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemFaturaConvenio" ADD CONSTRAINT "ItemFaturaConvenio_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaixaDiario" ADD CONSTRAINT "CaixaDiario_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoCaixa" ADD CONSTRAINT "MovimentoCaixa_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "CaixaDiario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoCaixa" ADD CONSTRAINT "MovimentoCaixa_estornoDeId_fkey" FOREIGN KEY ("estornoDeId") REFERENCES "MovimentoCaixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoCaixa" ADD CONSTRAINT "MovimentoCaixa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Ajuste manual (RNF-EST-03): o banco nunca aceita saldo negativo em lote,
-- mesmo com duas vendas simultâneas.
ALTER TABLE "Lote" ADD CONSTRAINT "lote_quantidade_nao_negativa" CHECK ("quantidade" >= 0);
