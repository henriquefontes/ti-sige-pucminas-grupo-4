## Resumo

<!-- O que este PR entrega, em uma ou duas frases. -->

**Tópico:** <!-- Registro de vendas | Atendimento ao cliente | Estoque com controle | Módulo financeiro -->
**Parte:** <!-- Backend | Frontend -->

## Requisitos atendidos

| Requisito | Onde                    | Observação                         |
| --------- | ----------------------- | ---------------------------------- |
| RF-XXX-NN | `caminho/do/arquivo.ts` | <!-- "simulado", se for o caso --> |

## Como testar

1. `cp .env.example .env && docker compose up -d`
2. `npm install && npm run db:reset && npm test`
3. `npm run dev` e acesse http://localhost:5173 com o usuário …

## Dependências de outros PRs

<!-- Ex.: "a tela de vendas precisa do PR do backend de vendas para buscar produtos". O PR compila sozinho; isto só afeta o funcionamento de ponta a ponta. -->

## Checklist

- [ ] Só criei arquivos novos dentro da pasta do meu módulo (`backend/src/modules/<modulo>/` ou `frontend/src/modules/<modulo>/`).
- [ ] Não alterei arquivos da base, `package.json`, `package-lock.json`, o schema nem as migrações.
- [ ] Não importei código de outro módulo (só de `core/`, `shared/` e dos meus arquivos).
- [ ] Valores em dinheiro em centavos (inteiros).
- [ ] Cada requisito tem um comentário `// RF-XXX-NN` junto do código.
- [ ] Testes cobrindo as regras de negócio; `npm run typecheck`, `npm test`, `npm run lint` e `npm run build` passam.
- [ ] Nenhum `.env` ou segredo no PR.
