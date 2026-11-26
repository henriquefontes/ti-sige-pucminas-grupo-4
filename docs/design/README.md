# Referência visual

Material de **referência** exportado do projeto de design do Vitalis no Claude Design. Não é código de produção e não é importado pela aplicação.

- `telas/`: capturas das telas desenhadas (Painel, Vendas, Estoque, Controlados/SNGPC, Reposição, Contas a pagar, Contas a receber, Fluxo de caixa, Relatórios).
- `prototipo-vitalis.html`: o protótipo navegável exportado. Serve para consultar medidas, cores e textos; ele depende de um script do editor de design e pode não abrir sozinho no navegador.

## Como o design chegou ao código

- Cores, fontes, espaçamentos, raios e sombras viraram variáveis em `frontend/src/estilos/tokens.css`.
- Os componentes de `frontend/src/core/ui/` reproduzem os blocos do protótipo: cartões, tabela, etiquetas de situação, indicadores, controle segmentado (abas), botões e avisos.
- O menu lateral e o cabeçalho (data, loja e situação do SNGPC) estão em `frontend/src/core/layout/`.

## Telas que não existem no design

Login, Clientes, Convênios, Disponibilidade, Farmácia Popular, Inventário, Caixa diário, o modal de entrada de NF-e e o de cancelamento de venda. Elas seguem o mesmo padrão visual, usando apenas os componentes de `core/ui` e os tokens.

| Tela do design | Caminho no sistema | Parte |
|---|---|---|
| `02-vendas.png` | `/vendas` | Integrante 2 |
| `03-estoque.png` | `/estoque` | Integrante 6 |
| `04-controlados-sngpc.png` | `/controlados` | Integrante 6 |
| `06`, `07` e `08` | `/financeiro` (abas) | Integrante 8 |
| `01-painel.png`, `05-reposicao.png`, `09-relatorios.png` | "Em breve" | fora do escopo |
