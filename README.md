# Vitalis — Sistema de Gestão Farmacêutica Integrado

Sistema web para drogaria com quatro módulos integrados: **registro de vendas**, **atendimento ao cliente**, **estoque com controle** (incluindo controlados e SNGPC) e **financeiro**. Trabalho do grupo 4 de TI — PUC Minas.

A interface segue o projeto visual de referência (em [`docs/design/`](docs/design/)) e os requisitos estão em [`docs/requisitos.md`](docs/requisitos.md).

## Tecnologias

TypeScript em todo o projeto, num monorepo com npm workspaces:

| Pasta       | Conteúdo                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `shared/`   | Contratos HTTP (Zod), enums, eventos e utilitários (dinheiro em centavos, CPF, datas) usados pelo backend e pelo frontend |
| `backend/`  | Node.js 20, Express 5, Prisma 6 e PostgreSQL 16; autenticação com bcrypt e JWT                                            |
| `frontend/` | React 18, Vite e React Router                                                                                             |

Testes com Vitest (Supertest no backend, Testing Library no frontend), ESLint, Prettier e GitHub Actions.

## Como rodar

Pré-requisitos: Node.js 20 ou superior e Docker.

```bash
cp .env.example .env        # ajuste se precisar; o .env nunca vai para o Git
docker compose up -d        # PostgreSQL 16 local com os bancos vitalis e vitalis_teste
npm install
npm run db:reset            # cria as tabelas no banco local e insere os dados de exemplo
npm run dev                 # API em http://localhost:3333 e telas em http://localhost:5173
```

### Usuários de demonstração

Todos com a senha **`vitalis123`**:

| Login          | Nome                     | Perfil                |
| -------------- | ------------------------ | --------------------- |
| `admin`        | Administrador do Sistema | ADMIN (acesso a tudo) |
| `farmaceutico` | Marina Souza             | FARMACEUTICO          |
| `atendente`    | Caio Ribeiro             | ATENDENTE             |
| `financeiro`   | Ana Lima                 | FINANCEIRO            |

## Scripts

| Comando                     | O que faz                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run dev`               | Sobe a API e o frontend em modo de desenvolvimento                                                        |
| `npm test`                  | Testes de `shared`, backend e frontend                                                                    |
| `npm run typecheck`         | Verificação de tipos de todo o projeto                                                                    |
| `npm run lint`              | ESLint                                                                                                    |
| `npm run build`             | Verifica o backend e gera o frontend em `frontend/dist`                                                   |
| `npm start`                 | Sobe a API (com `NODE_ENV=production`, serve também o `frontend/dist`)                                    |
| `npm run db:reset`          | **Apaga** o banco de `DATABASE_URL`, aplica as migrações e roda o seed. Só aceita banco local ou de teste |
| `npm run db:migrate:deploy` | Aplica as migrações pendentes sem apagar dados (servidor do grupo)                                        |
| `npm run db:seed`           | Insere os dados de exemplo se o banco não tiver usuários                                                  |
| `npm run backup`            | Gera um `pg_dump` datado em `backups/` (RNF-GER-04, versão simples; requer `pg_dump` no PATH)             |

## Banco de dados

| Variável             | Uso                                                                 |
| -------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`       | Banco usado pela aplicação: o local (Docker) ou o servidor do grupo |
| `DATABASE_URL_TESTE` | Banco exclusivo dos testes, recriado a cada `npm test`              |
| `JWT_SEGREDO`        | Chave de assinatura dos tokens                                      |

> **Testes e `db:reset` apagam todos os dados.** Os scripts recusam rodar se a URL não apontar para `localhost` ou para um banco cujo nome termine em `_teste`. Nunca aponte os testes para o servidor do grupo.

Servidor do grupo (feito pelo responsável pela integração, com a URL só no `.env` local):

```bash
npm run db:migrate:deploy
npm run db:seed
```

## Estrutura

```
shared/src/contratos/     rotas de cada módulo: caminho, método, entrada e saída (Zod)
backend/prisma/           schema completo, migração inicial e seed
backend/src/core/         base: banco, auth, eventos, ganchos, auditoria, validação, erros
backend/src/modules/      um módulo por pasta (carregado automaticamente)
frontend/src/core/        base: API, login, layout, componentes do design system
frontend/src/modules/     um módulo por pasta (registrado automaticamente no menu)
docs/                     requisitos, referência visual e NF-e de exemplo
```

Enquanto um módulo não existe, a tela correspondente mostra "Módulo em desenvolvimento".
