# Requisitos do Vitalis

Requisitos funcionais (RF) e não funcionais (RNF) do Sistema de Gestão Farmacêutica Integrado, por tópico. A coluna "Parte" indica o integrante responsável.

Prioridade: E = essencial, I = importante, D = desejável.

## Registro de vendas

| ID         | Descrição                                                                                                                                                                                                                 | Prior. | Parte           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------- |
| RF-VEN-01  | Permitir buscar produtos por nome, princípio ativo ou código de barras.                                                                                                                                                   | E      | 1, 2            |
| RF-VEN-02  | Registrar os itens da venda pela leitura do código de barras ou pela digitação do código, com quantidade, preço unitário e subtotal.                                                                                      | E      | 1, 2            |
| RF-VEN-03  | Sugerir automaticamente o lote de validade mais próxima (FEFO) e impedir a venda de lote vencido.                                                                                                                         | E      | 1, 2            |
| RF-VEN-04  | Exigir os dados da receita (número, prescritor, CRM/UF, data, nome, idade e sexo do paciente) quando a venda incluir antimicrobiano ou medicamento controlado, sem permitir finalizar a venda enquanto faltar algum dado. | E      | 1, 2            |
| RF-VEN-05  | Bloquear a venda de antimicrobiano quando a receita tiver mais de 10 dias de emissão.                                                                                                                                     | E      | 1, 2            |
| RF-VEN-06  | Registrar a forma de pagamento: dinheiro, cartão, Pix ou convênio.                                                                                                                                                        | E      | 1, 2            |
| RF-VEN-07  | Ao finalizar a venda, baixar do estoque a quantidade vendida no lote correspondente.                                                                                                                                      | E      | 1               |
| RF-VEN-08  | Emitir o documento fiscal eletrônico da venda.                                                                                                                                                                            | E      | 1, 2 (simulado) |
| RF-VEN-09  | Permitir cancelar uma venda ou um item, devolvendo a quantidade ao lote de origem e registrando o motivo e o responsável.                                                                                                 | I      | 1, 2            |
| RF-VEN-10  | Registrar o operador responsável por cada venda.                                                                                                                                                                          | I      | 1               |
| RNF-VEN-01 | A finalização da venda, incluindo a baixa no estoque, deve ser concluída em até 3 segundos.                                                                                                                               | I      | 1               |
| RNF-VEN-02 | O sistema deve funcionar com leitores de código de barras comuns, que se comportam como teclado.                                                                                                                          | E      | 2               |
| RNF-VEN-03 | Se a conexão com a internet cair, o caixa deve continuar registrando vendas e enviar os dados assim que a conexão voltar.                                                                                                 | I      | fora do escopo  |

## Atendimento ao cliente

| ID         | Descrição                                                                                                                             | Prior. | Parte           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------- |
| RF-ATD-01  | Cadastrar clientes com nome, CPF e telefone, registrando o consentimento para o uso dos dados.                                        | E      | 3, 4            |
| RF-ATD-02  | Identificar o cliente na venda pelo CPF ou pelo nome.                                                                                 | E      | 3, 2            |
| RF-ATD-03  | Consultar o histórico de compras do cliente.                                                                                          | I      | 3, 4            |
| RF-ATD-04  | Cadastrar convênios com suas regras de desconto e a forma de cobrança da empresa conveniada.                                          | E      | 3, 4            |
| RF-ATD-05  | Aplicar automaticamente o desconto do convênio quando o cliente identificado for conveniado, mostrando o valor do desconto e o total. | E      | 3, 2            |
| RF-ATD-06  | Consultar a disponibilidade de um produto em estoque e sugerir outros produtos com o mesmo princípio ativo.                           | I      | 3, 4            |
| RF-ATD-07  | Registrar as dispensações do Farmácia Popular, exigindo o CPF do cliente e os dados da receita.                                       | I      | 3, 4 (simulado) |
| RF-ATD-08  | Atender aos pedidos do cliente de acesso, correção ou exclusão dos seus dados pessoais.                                               | E      | 3, 4            |
| RNF-ATD-01 | O CPF deve aparecer mascarado nas telas (por exemplo, ***.412.886-**), exibindo o número completo só para perfis autorizados.         | E      | 3               |
| RNF-ATD-02 | A busca de um cliente pelo CPF ou pelo nome deve retornar o resultado em até 2 segundos.                                              | I      | 3               |

## Estoque com controle

| ID         | Descrição                                                                                                                                                     | Prior. | Parte            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------- |
| RF-EST-01  | Registrar a entrada de mercadorias a partir do arquivo XML da nota fiscal eletrônica do fornecedor, com lote, validade e quantidade de cada item.             | E      | 5, 6             |
| RF-EST-02  | Manter o saldo de cada produto separado por lote, com a respectiva validade.                                                                                  | E      | 5, 6             |
| RF-EST-03  | Classificar os produtos (genérico, referência, antimicrobiano ou controlado, com a lista da Portaria SVS/MS nº 344/1998).                                     | E      | 5, 6             |
| RF-EST-04  | Alertar sobre lotes que vencem em até 60 dias e produtos abaixo do estoque mínimo.                                                                            | E      | 5, 6             |
| RF-EST-05  | Registrar perdas (vencimento, avaria ou furto) com motivo e responsável, baixando a quantidade do lote.                                                       | I      | 5, 6             |
| RF-EST-06  | Permitir a realização de inventário e o ajuste das diferenças encontradas, com registro do responsável.                                                       | I      | 5, 6             |
| RF-EST-07  | Escriturar automaticamente no livro de movimentações as entradas, saídas e perdas de controlados e antimicrobianos, incluindo as saídas geradas pelas vendas. | E      | 5, 6             |
| RF-EST-08  | Verificar os registros de controlados antes do envio e marcar como inconsistentes os que tiverem dados obrigatórios ausentes ou lote diferente do estoque.    | E      | 5, 6             |
| RF-EST-09  | Gerar o arquivo do período e transmiti-lo ao SNGPC, guardando o número do protocolo de recebimento.                                                           | E      | 5, 6 (simulado)  |
| RNF-EST-01 | O arquivo enviado ao SNGPC deve seguir o padrão de transmissão definido pela Anvisa.                                                                          | E      | 5 (simplificado) |
| RNF-EST-02 | Os registros de movimentação de controlados não podem ser apagados; correções devem ser feitas por um novo registro, mantendo o histórico.                    | E      | 5                |
| RNF-EST-03 | O saldo por lote deve ser atualizado imediatamente após cada venda, entrada ou perda.                                                                         | E      | base, 1, 5       |

## Módulo financeiro

| ID         | Descrição                                                                                                                                     | Prior. | Parte   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| RF-FIN-01  | Registrar contas a pagar com credor, origem, vencimento, valor e forma de pagamento.                                                          | E      | 7, 8    |
| RF-FIN-02  | Gerar automaticamente a conta a pagar ao registrar a entrada de uma nota fiscal de compra, usando os vencimentos informados na nota.          | E      | 7       |
| RF-FIN-03  | Registrar contas a receber com pagador, origem, vencimento e valor.                                                                           | E      | 7, 8    |
| RF-FIN-04  | Gerar automaticamente a conta a receber nas vendas no cartão, conforme o prazo da operadora, e nas vendas por convênio, na fatura do período. | E      | 7       |
| RF-FIN-05  | Registrar a baixa de pagamentos e recebimentos, atualizando o saldo em caixa.                                                                 | E      | 7, 8    |
| RF-FIN-06  | Destacar as contas vencidas e as que vencem nos próximos dias.                                                                                | I      | 7, 8    |
| RF-FIN-07  | Exibir o fluxo de caixa projetado por semana, com as entradas e saídas previstas.                                                             | I      | 7, 8    |
| RF-FIN-08  | Registrar a abertura e o fechamento do caixa diário, com o total por forma de pagamento.                                                      | I      | 7, 8    |
| RNF-FIN-01 | Os valores devem ser armazenados em reais com duas casas decimais, sem erros de arredondamento acumulados.                                    | E      | base, 7 |
| RNF-FIN-02 | Lançamentos gerados automaticamente não podem ser apagados, apenas estornados, mantendo a ligação com a venda ou a nota fiscal de origem.     | E      | 7, 8    |
| RNF-FIN-03 | Os indicadores financeiros do painel devem refletir os lançamentos assim que forem registrados.                                               | I      | 7, 8    |

## Gerais

| ID         | Descrição                                                                                                                                                | Prior. | Parte               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------- |
| RNF-GER-01 | Cada usuário deve acessar o sistema com login e senha próprios, com permissões definidas por perfil (por exemplo, farmacêutico, atendente e financeiro). | E      | base                |
| RNF-GER-02 | O tratamento de dados pessoais deve seguir a LGPD, com acesso restrito e proteção adicional aos dados de saúde.                                          | E      | base, 3             |
| RNF-GER-03 | O sistema deve registrar quem fez cada operação e quando, para fins de auditoria.                                                                        | E      | base, todos         |
| RNF-GER-04 | Deve ser feita cópia de segurança automática dos dados ao menos uma vez por dia, guardada fora da loja.                                                  | E      | base (simplificado) |
| RNF-GER-05 | O sistema deve estar disponível durante todo o horário de funcionamento da drogaria.                                                                     | I      | não verificável     |
| RNF-GER-06 | O sistema deve funcionar em navegador web atual, com interface em português.                                                                             | I      | base                |
| RNF-GER-07 | Um novo atendente deve conseguir registrar uma venda simples após um treinamento de até uma hora.                                                        | D      | não verificável     |

## Itens simulados ou fora do escopo desta etapa

| Item                                          | Tratamento                                                                                                                                          |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-VEN-08 — documento fiscal                  | Simulado: chave fictícia e cupom em tela, sem integração com a SEFAZ                                                                                |
| RF-EST-09 e RNF-EST-01 — transmissão ao SNGPC | Simulado: XML com estrutura simplificada e protocolo fictício, sem envio à Anvisa                                                                   |
| RF-ATD-07 — Farmácia Popular                  | Simulado: autorização fictícia, sem integração com o Ministério da Saúde                                                                            |
| RNF-VEN-03 — venda sem internet               | Fora do escopo                                                                                                                                      |
| RNF-GER-04 — backup                           | Versão simples: script que gera um `pg_dump` com data; o agendamento diário e a cópia para fora da loja ficam a cargo de quem administra o servidor |
| RNF-GER-05 e RNF-GER-07                       | Não verificáveis nesta etapa                                                                                                                        |
| Painel, Reposição e Relatórios                | Fora do escopo; ficam "Em breve" no menu                                                                                                            |
