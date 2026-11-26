# Arquivos de exemplo

Todos os dados são **fictícios** e não têm validade fiscal.

## NF-e (`nfe/`)

Três notas de entrada de fornecedores do seed, para testar a importação (RF-EST-01) e a geração das contas a pagar (RF-FIN-02).

| Arquivo | Fornecedor | Itens (lote) | Duplicatas | Total |
|---|---|---|---|---|
| `nfe-01-vale-verde.xml` | Distribuidora Vale Verde Ltda | Amoxicilina (AX9310), Losartana (LS1201), Clonazepam (CZ0533) | 2 | R$ 911,00 |
| `nfe-02-medfarma.xml` | Medfarma Distribuidora S.A. | Sertralina (SE1305), Metformina (MT6801), Azitromicina (AZ3501), Dipirona (DP2405) | 1 | R$ 1.262,00 |
| `nfe-03-panaceia.xml` | Panaceia Distribuidora Ltda | Fluoxetina (FX4522), Cefalexina (CF1290), Omeprazol (OM7840), Neosaldina (NS2310) | 2 | R$ 1.076,00 |

Onde estão os dados que o sistema lê:

- `nfeProc/NFe/infNFe/@Id` e `protNFe/infProt/chNFe`: chave de acesso (44 dígitos). Uma nota com a mesma chave deve ser recusada.
- `infNFe/ide`: `nNF` (número), `serie`, `dhEmi` (emissão).
- `infNFe/emit`: `CNPJ` e `xNome` do fornecedor.
- `infNFe/det/prod`: `cEAN` (código de barras do produto no seed), `xProd`, `qCom`, `vUnCom` e o grupo `rastro` com `nLote`, `qLote`, `dFab`, `dVal`.
- `infNFe/cobr/dup`: `nDup`, `dVenc`, `vDup` (uma conta a pagar por duplicata).

Os produtos são identificados pelo `cEAN`, que corresponde ao `codigoBarras` do seed (`78910000000NN`). Nas três notas há antimicrobianos e controlados, que devem gerar movimentos de ENTRADA no livro do SNGPC.

Para ler com o `fast-xml-parser`, declare `det` e `dup` como listas (`isArray`), porque uma nota pode ter um único item ou uma única duplicata.
