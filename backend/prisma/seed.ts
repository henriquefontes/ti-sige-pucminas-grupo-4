/**
 * Dados de exemplo (todos fictícios).
 * - npm run db:seed  → insere os dados no banco de DATABASE_URL, se ele estiver vazio.
 * - npm run db:reset → recria o banco local e chama semear().
 * - Testes podem chamar semear(prisma) depois de limpar o banco.
 */
import '../src/core/env';
import {
  PrismaClient,
  type ClasseProduto,
  type FormaPagamentoConta,
  type Perfil,
  type TipoControle,
} from '@prisma/client';
import { pathToFileURL } from 'node:url';
import { CHAVES_CONFIGURACAO, hojeNaLoja, isoParaData, somarDias } from '@vitalis/shared';
import { gerarHashSenha } from '../src/core/auth/senha';

/** Senha de todos os usuários de demonstração (documentada no README). */
export const SENHA_DEMONSTRACAO = 'vitalis123';

export const USUARIOS_DEMONSTRACAO: { nome: string; login: string; perfil: Perfil }[] = [
  { nome: 'Administrador do Sistema', login: 'admin', perfil: 'ADMIN' },
  { nome: 'Marina Souza', login: 'farmaceutico', perfil: 'FARMACEUTICO' },
  { nome: 'Caio Ribeiro', login: 'atendente', perfil: 'ATENDENTE' },
  { nome: 'Ana Lima', login: 'financeiro', perfil: 'FINANCEIRO' },
];

export const FORNECEDORES = [
  { nome: 'Distribuidora Vale Verde Ltda', cnpj: '12345678000195' },
  { nome: 'Medfarma Distribuidora S.A.', cnpj: '23456789000195' },
  { nome: 'Panaceia Distribuidora Ltda', cnpj: '34567890000130' },
];

/** [número do lote, dias até a validade (negativo = vencido), quantidade, custo unitário em centavos] */
type LoteSeed = [string, number, number, number];

interface ProdutoSeed {
  nome: string;
  principioAtivo: string;
  codigoBarras: string;
  classe: ClasseProduto;
  tipoControle?: TipoControle;
  listaPortaria344?: string;
  precoVendaCentavos: number;
  estoqueMinimo: number;
  lotes: LoteSeed[];
}

const ean = (n: number) => `78910000000${String(n).padStart(2, '0')}`;

export const PRODUTOS: ProdutoSeed[] = [
  {
    nome: 'Dipirona 500mg · 10 comp.',
    principioAtivo: 'Dipirona sódica',
    codigoBarras: ean(1),
    classe: 'GENERICO',
    precoVendaCentavos: 690,
    estoqueMinimo: 60,
    lotes: [['DP2291', 540, 184, 210]],
  },
  {
    nome: 'Novalgina 1g · 10 comp.',
    principioAtivo: 'Dipirona sódica',
    codigoBarras: ean(2),
    classe: 'REFERENCIA',
    precoVendaCentavos: 1890,
    estoqueMinimo: 20,
    lotes: [['NV1120', 400, 35, 920]],
  },
  {
    nome: 'Paracetamol 750mg · 20 comp.',
    principioAtivo: 'Paracetamol',
    codigoBarras: ean(3),
    classe: 'GENERICO',
    precoVendaCentavos: 890,
    estoqueMinimo: 40,
    lotes: [
      ['PC5510', 300, 80, 290],
      ['PC5402', 45, 20, 280],
    ],
  },
  {
    nome: 'Tylenol 750mg · 20 comp.',
    principioAtivo: 'Paracetamol',
    codigoBarras: ean(4),
    classe: 'REFERENCIA',
    precoVendaCentavos: 2450,
    estoqueMinimo: 15,
    lotes: [['TY3301', 420, 22, 1300]],
  },
  {
    nome: 'Ibuprofeno 400mg · 10 comp.',
    principioAtivo: 'Ibuprofeno',
    codigoBarras: ean(5),
    classe: 'REFERENCIA',
    precoVendaCentavos: 1590,
    estoqueMinimo: 30,
    lotes: [['IB4402', 38, 58, 640]],
  },
  {
    nome: 'Losartana 50mg · 30 comp.',
    principioAtivo: 'Losartana potássica',
    codigoBarras: ean(6),
    classe: 'GENERICO',
    precoVendaCentavos: 1840,
    estoqueMinimo: 40,
    lotes: [['LS1043', 280, 12, 700]],
  },
  {
    nome: 'Metformina 850mg · 30 comp.',
    principioAtivo: 'Cloridrato de metformina',
    codigoBarras: ean(7),
    classe: 'GENERICO',
    precoVendaCentavos: 1290,
    estoqueMinimo: 50,
    lotes: [['MT6620', 450, 22, 480]],
  },
  {
    nome: 'Glifage XR 500mg · 30 comp.',
    principioAtivo: 'Cloridrato de metformina',
    codigoBarras: ean(8),
    classe: 'REFERENCIA',
    precoVendaCentavos: 2890,
    estoqueMinimo: 10,
    lotes: [['GF2210', 380, 18, 1600]],
  },
  {
    nome: 'Omeprazol 20mg · 28 cáps.',
    principioAtivo: 'Omeprazol',
    codigoBarras: ean(9),
    classe: 'GENERICO',
    precoVendaCentavos: 2210,
    estoqueMinimo: 40,
    lotes: [['OM7719', 600, 96, 820]],
  },
  {
    nome: 'Sinvastatina 20mg · 30 comp.',
    principioAtivo: 'Sinvastatina',
    codigoBarras: ean(10),
    classe: 'GENERICO',
    precoVendaCentavos: 1590,
    estoqueMinimo: 30,
    lotes: [
      ['SV8801', 330, 45, 560],
      ['SV8712', -12, 6, 540],
    ],
  },
  {
    nome: 'Enalapril 10mg · 30 comp.',
    principioAtivo: 'Maleato de enalapril',
    codigoBarras: ean(11),
    classe: 'GENERICO',
    precoVendaCentavos: 990,
    estoqueMinimo: 30,
    lotes: [['EN4410', 500, 52, 330]],
  },
  {
    nome: 'Hidroclorotiazida 25mg · 30 comp.',
    principioAtivo: 'Hidroclorotiazida',
    codigoBarras: ean(12),
    classe: 'GENERICO',
    precoVendaCentavos: 690,
    estoqueMinimo: 30,
    lotes: [['HC1209', 260, 40, 210]],
  },
  {
    nome: 'Atenolol 50mg · 30 comp.',
    principioAtivo: 'Atenolol',
    codigoBarras: ean(13),
    classe: 'GENERICO',
    precoVendaCentavos: 890,
    estoqueMinimo: 20,
    lotes: [['AT7701', 210, 27, 300]],
  },
  {
    nome: 'Loratadina 10mg · 12 comp.',
    principioAtivo: 'Loratadina',
    codigoBarras: ean(14),
    classe: 'SIMILAR',
    precoVendaCentavos: 1190,
    estoqueMinimo: 20,
    lotes: [['LR3302', 52, 30, 420]],
  },
  {
    nome: 'Dexclorfeniramina 2mg · 20 comp.',
    principioAtivo: 'Maleato de dexclorfeniramina',
    codigoBarras: ean(15),
    classe: 'SIMILAR',
    precoVendaCentavos: 990,
    estoqueMinimo: 15,
    lotes: [['DX5501', 310, 24, 350]],
  },
  {
    nome: 'Nimesulida 100mg · 12 comp.',
    principioAtivo: 'Nimesulida',
    codigoBarras: ean(16),
    classe: 'SIMILAR',
    precoVendaCentavos: 890,
    estoqueMinimo: 20,
    lotes: [['NM6610', 190, 33, 300]],
  },
  {
    nome: 'Buscopan Composto · 20 comp.',
    principioAtivo: 'Butilbrometo de escopolamina + dipirona',
    codigoBarras: ean(17),
    classe: 'REFERENCIA',
    precoVendaCentavos: 2790,
    estoqueMinimo: 15,
    lotes: [['BC9901', 360, 19, 1500]],
  },
  {
    nome: 'Dorflex · 10 comp.',
    principioAtivo: 'Dipirona + orfenadrina + cafeína',
    codigoBarras: ean(18),
    classe: 'REFERENCIA',
    precoVendaCentavos: 1090,
    estoqueMinimo: 30,
    lotes: [['DF4420', 410, 64, 560]],
  },
  {
    nome: 'Neosaldina · 20 drágeas',
    principioAtivo: 'Dipirona + isometepteno + cafeína',
    codigoBarras: ean(19),
    classe: 'REFERENCIA',
    precoVendaCentavos: 2190,
    estoqueMinimo: 15,
    lotes: [['NS2203', 280, 8, 1150]],
  },
  {
    nome: 'Soro fisiológico 0,9% · 500ml',
    principioAtivo: 'Cloreto de sódio',
    codigoBarras: ean(20),
    classe: 'OUTRO',
    precoVendaCentavos: 790,
    estoqueMinimo: 20,
    lotes: [['SF7720', 700, 30, 290]],
  },
  {
    nome: 'Protetor solar FPS 50 · 200ml',
    principioAtivo: 'Dermocosmético',
    codigoBarras: ean(21),
    classe: 'OUTRO',
    precoVendaCentavos: 6490,
    estoqueMinimo: 10,
    lotes: [['PS5520', 360, 31, 3100]],
  },
  {
    nome: 'Fralda infantil G · 36 un.',
    principioAtivo: 'Higiene infantil',
    codigoBarras: ean(22),
    classe: 'OUTRO',
    precoVendaCentavos: 5990,
    estoqueMinimo: 10,
    lotes: [['FR8830', 900, 8, 3850]],
  },
  {
    nome: 'Vitamina C 1g · 10 comp. efervescentes',
    principioAtivo: 'Ácido ascórbico',
    codigoBarras: ean(23),
    classe: 'SIMILAR',
    precoVendaCentavos: 1490,
    estoqueMinimo: 20,
    lotes: [['VC1101', 25, 26, 620]],
  },
  // Antimicrobianos
  {
    nome: 'Amoxicilina 500mg · 21 cáps.',
    principioAtivo: 'Amoxicilina',
    codigoBarras: ean(24),
    classe: 'GENERICO',
    tipoControle: 'ANTIMICROBIANO',
    precoVendaCentavos: 3250,
    estoqueMinimo: 30,
    lotes: [
      ['AX8812', 50, 42, 1290],
      ['AX9020', 420, 30, 1310],
    ],
  },
  {
    nome: 'Azitromicina 500mg · 3 comp.',
    principioAtivo: 'Azitromicina',
    codigoBarras: ean(25),
    classe: 'GENERICO',
    tipoControle: 'ANTIMICROBIANO',
    precoVendaCentavos: 2780,
    estoqueMinimo: 20,
    lotes: [['AZ3390', 40, 18, 1100]],
  },
  {
    nome: 'Cefalexina 500mg · 8 cáps.',
    principioAtivo: 'Cefalexina',
    codigoBarras: ean(26),
    classe: 'GENERICO',
    tipoControle: 'ANTIMICROBIANO',
    precoVendaCentavos: 2290,
    estoqueMinimo: 15,
    lotes: [['CF1180', 380, 25, 900]],
  },
  {
    nome: 'Ciprofloxacino 500mg · 14 comp.',
    principioAtivo: 'Cloridrato de ciprofloxacino',
    codigoBarras: ean(27),
    classe: 'GENERICO',
    tipoControle: 'ANTIMICROBIANO',
    precoVendaCentavos: 3490,
    estoqueMinimo: 10,
    lotes: [['CP6605', 300, 16, 1400]],
  },
  // Controlados (Portaria 344/98)
  {
    nome: 'Clonazepam 2mg · 30 comp.',
    principioAtivo: 'Clonazepam',
    codigoBarras: ean(28),
    classe: 'GENERICO',
    tipoControle: 'CONTROLADO',
    listaPortaria344: 'B1',
    precoVendaCentavos: 1420,
    estoqueMinimo: 15,
    lotes: [['CZ0471', 200, 26, 520]],
  },
  {
    nome: 'Sertralina 50mg · 30 comp.',
    principioAtivo: 'Cloridrato de sertralina',
    codigoBarras: ean(29),
    classe: 'GENERICO',
    tipoControle: 'CONTROLADO',
    listaPortaria344: 'C1',
    precoVendaCentavos: 3290,
    estoqueMinimo: 20,
    lotes: [
      ['SE1180', 240, 34, 1250],
      ['SE1022', 30, 6, 1200],
    ],
  },
  {
    nome: 'Fluoxetina 20mg · 30 cáps.',
    principioAtivo: 'Cloridrato de fluoxetina',
    codigoBarras: ean(30),
    classe: 'GENERICO',
    tipoControle: 'CONTROLADO',
    listaPortaria344: 'C1',
    precoVendaCentavos: 1890,
    estoqueMinimo: 15,
    lotes: [['FX4410', 330, 20, 700]],
  },
];

export const CONVENIOS = [
  {
    nome: 'Convênio Saúde Mais',
    cnpj: '45678901000175',
    percentualDescontoBp: 1000,
    diaFechamento: 25,
    diasParaPagamento: 10,
  },
  {
    nome: 'Convênio Servidores BH',
    cnpj: '56789012000100',
    percentualDescontoBp: 500,
    diaFechamento: 20,
    diasParaPagamento: 15,
  },
];

/** [nome, cpf, telefone, índice do convênio ou null, matrícula] */
export const CLIENTES: [string, string, string, number | null, string | null][] = [
  ['João Pereira', '15341288670', '31988887701', 0, 'SM-00123'],
  ['Maria Aparecida Santos', '52998224725', '31988887702', null, null],
  ['Carlos Eduardo Lima', '28473519060', '31988887703', 1, 'SBH-4410'],
  ['Fernanda Oliveira', '36190827403', '31988887704', null, null],
  ['Paulo Henrique Costa', '40712659307', '31988887705', 0, 'SM-00456'],
  ['Luciana Ferreira', '51827364955', '31988887706', null, null],
  ['Roberto Almeida', '62938475047', '31988887707', 1, 'SBH-5521'],
  ['Juliana Martins', '73049586184', '31988887708', null, null],
  ['Ricardo Gomes', '84150697230', '31988887709', null, null],
  ['Beatriz Rocha', '95261708303', '31988887710', 0, 'SM-00789'],
];

/**
 * Insere os dados de exemplo. Não faz nada se já houver usuários,
 * para nunca duplicar dados no servidor do grupo.
 */
export async function semear(prisma: PrismaClient): Promise<{ inserido: boolean }> {
  if ((await prisma.usuario.count()) > 0) {
    console.log('O banco já tem usuários; seed ignorado.');
    return { inserido: false };
  }

  const hoje = hojeNaLoja();
  const dia = (deslocamento: number) => isoParaData(somarDias(hoje, deslocamento));
  const senhaHash = await gerarHashSenha(SENHA_DEMONSTRACAO);

  await prisma.$transaction(
    async (tx) => {
      // Usuários
      const usuarios = [];
      for (const u of USUARIOS_DEMONSTRACAO) {
        usuarios.push(await tx.usuario.create({ data: { ...u, senhaHash } }));
      }
      const admin = usuarios[0];
      const financeiro = usuarios[3];

      // Configuração da loja (mesmo nome do projeto no Claude Design)
      const configuracoes: Record<string, string> = {
        [CHAVES_CONFIGURACAO.nomeSistema]: 'Vitalis',
        [CHAVES_CONFIGURACAO.nomeLoja]: 'Loja Savassi',
        [CHAVES_CONFIGURACAO.prazoCartaoDebitoDias]: '1',
        [CHAVES_CONFIGURACAO.prazoCartaoCreditoDias]: '30',
        [CHAVES_CONFIGURACAO.diasAlertaValidade]: '60',
        [CHAVES_CONFIGURACAO.diasAlertaContas]: '7',
      };
      await tx.configuracao.createMany({
        data: Object.entries(configuracoes).map(([chave, valor]) => ({ chave, valor })),
      });

      // Fornecedores
      const fornecedores = [];
      for (const f of FORNECEDORES) fornecedores.push(await tx.fornecedor.create({ data: f }));

      // Produtos e lotes
      for (const p of PRODUTOS) {
        const { lotes, ...dados } = p;
        await tx.produto.create({
          data: {
            ...dados,
            tipoControle: dados.tipoControle ?? 'NENHUM',
            listaPortaria344: dados.listaPortaria344 ?? null,
            lotes: {
              create: lotes.map(([numero, dias, quantidade, custoUnitarioCentavos]) => ({
                numero,
                validade: dia(dias),
                quantidade,
                custoUnitarioCentavos,
              })),
            },
          },
        });
      }

      // Convênios e clientes
      const convenios = [];
      for (const c of CONVENIOS) convenios.push(await tx.convenio.create({ data: c }));
      for (const [nome, cpf, telefone, convenio, matricula] of CLIENTES) {
        await tx.cliente.create({
          data: {
            nome,
            cpf,
            telefone,
            consentimentoEm: new Date(),
            convenioId: convenio === null ? null : convenios[convenio].id,
            matriculaConvenio: matricula,
          },
        });
      }

      // Financeiro: saldo inicial de caixa (o saldo é sempre a soma dos movimentos)
      await tx.movimentoCaixa.create({
        data: {
          tipo: 'ENTRADA',
          origemTipo: 'MANUAL',
          valorCentavos: 1_841_260,
          data: dia(-30),
          descricao: 'Saldo inicial (implantação do sistema)',
          usuarioId: admin.id,
        },
      });

      const contasPagar: {
        credor: string;
        fornecedor?: number;
        descricao: string;
        dias: number;
        valor: number;
        forma: FormaPagamentoConta;
        paga?: boolean;
      }[] = [
        {
          credor: 'Imobiliária Central',
          descricao: 'Aluguel · Loja Savassi',
          dias: 7,
          valor: 650_000,
          forma: 'TRANSFERENCIA',
        },
        {
          credor: 'Companhia de Energia',
          descricao: 'Conta de energia do mês',
          dias: -5,
          valor: 91_244,
          forma: 'DEBITO_AUTOMATICO',
        },
        {
          credor: 'Conecta Telecom',
          descricao: 'Internet e telefone',
          dias: 3,
          valor: 18_990,
          forma: 'BOLETO',
        },
        {
          credor: FORNECEDORES[0].nome,
          fornecedor: 0,
          descricao: 'Compra avulsa de reposição',
          dias: -2,
          valor: 279_000,
          forma: 'BOLETO',
        },
        {
          credor: 'Escritório Contábil Exato',
          descricao: 'Honorários contábeis',
          dias: 20,
          valor: 120_000,
          forma: 'PIX',
        },
        {
          credor: 'Rede de Pagamentos',
          descricao: 'Taxa da maquininha',
          dias: -15,
          valor: 68_430,
          forma: 'DEBITO_AUTOMATICO',
          paga: true,
        },
      ];
      for (const c of contasPagar) {
        const conta = await tx.contaPagar.create({
          data: {
            credor: c.credor,
            fornecedorId: c.fornecedor === undefined ? null : fornecedores[c.fornecedor].id,
            descricao: c.descricao,
            vencimento: dia(c.dias),
            valorCentavos: c.valor,
            formaPagamento: c.forma,
            status: c.paga ? 'PAGA' : 'ABERTA',
            pagaEm: c.paga ? dia(c.dias) : null,
            criadoPorId: financeiro.id,
          },
        });
        if (c.paga) {
          await tx.movimentoCaixa.create({
            data: {
              tipo: 'SAIDA',
              origemTipo: 'CONTA_PAGAR',
              origemId: conta.id,
              valorCentavos: c.valor,
              data: dia(c.dias),
              descricao: `Pagamento: ${c.descricao}`,
              usuarioId: financeiro.id,
            },
          });
        }
      }

      const contasReceber = [
        {
          pagador: 'Farmácia Popular (Ministério da Saúde)',
          descricao: 'Repasse do mês anterior',
          dias: 12,
          valor: 338_020,
        },
        {
          pagador: 'Adquirente de cartões',
          descricao: 'Vendas no crédito (período anterior)',
          dias: 4,
          valor: 1_284_050,
        },
        {
          pagador: CONVENIOS[1].nome,
          descricao: 'Fatura anterior à implantação',
          dias: -6,
          valor: 198_000,
          convenio: 1,
        },
        {
          pagador: 'Adquirente de cartões',
          descricao: 'Vendas no débito (período anterior)',
          dias: -3,
          valor: 410_270,
          recebida: true,
        },
      ];
      for (const c of contasReceber) {
        const conta = await tx.contaReceber.create({
          data: {
            pagador: c.pagador,
            descricao: c.descricao,
            convenioId: c.convenio === undefined ? null : convenios[c.convenio].id,
            vencimento: dia(c.dias),
            valorCentavos: c.valor,
            status: c.recebida ? 'RECEBIDA' : 'ABERTA',
            recebidaEm: c.recebida ? dia(c.dias) : null,
            criadoPorId: financeiro.id,
          },
        });
        if (c.recebida) {
          await tx.movimentoCaixa.create({
            data: {
              tipo: 'ENTRADA',
              origemTipo: 'CONTA_RECEBER',
              origemId: conta.id,
              valorCentavos: c.valor,
              data: dia(c.dias),
              descricao: `Recebimento: ${c.descricao}`,
              usuarioId: financeiro.id,
            },
          });
        }
      }
    },
    { timeout: 60_000 },
  );

  return { inserido: true };
}

// Execução direta: npm run db:seed
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prisma = new PrismaClient();
  semear(prisma)
    .then(({ inserido }) => {
      if (inserido) console.log('Dados de exemplo inseridos.');
    })
    .catch((erro) => {
      console.error(erro);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
