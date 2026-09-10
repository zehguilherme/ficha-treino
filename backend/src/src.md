# Backend src

## Propósito

Este módulo contém a aplicação Express, middleware, rotas, validação, Prisma e o seed do backend.
É responsável pelos contratos HTTP autenticados e públicos descritos em `backend/backend.md`.

## Arquivos-chave

- `server.ts`: inicialização do servidor HTTP.
- `app.ts`: composição do Express, middleware, health check e Swagger.
- `routes/`: autenticação, treinos, exercícios e conta.
- `middleware/auth.ts`: validação do JWT e ownership.
- `validators/`: schemas Zod das entradas HTTP.
- `seed.ts`: carga idempotente do catálogo de exercícios.
- `swagger.ts`: especificação OpenAPI servida em `/api/docs`.

## Superfícies

- `GET /api/health` é público.
- `/api/auth/*` implementa login Google, sessão e perfil.
- `/api/workouts/*` lista e altera treinos por dia.
- `/api/exercises` pesquisa o catálogo autenticado.
- `/api/workout-exercises/*` alterna conclusão.
- `/api/account` remove a conta autenticada.

## Verificação

Execute `init.sh` na raiz para subir PostgreSQL, aplicar migrations, executar seed e verificar health.
Para alterações locais, use `npm test`, `npm run lint` e `npm run format:check` em `backend/`.
Endpoints novos ou alterados também devem ser conferidos em `/api/docs`.

## Limites

- Não adicionar rotas de API ao Next.js.
- Toda entrada externa passa por validação e autenticação quando exigida.
- Respostas ao cliente não expõem secrets, variáveis de ambiente ou stack traces.
- Alterações de rota mantêm annotation `@openapi` e testes de ownership.

## Fluxo de alteração

1. Ler `backend/backend.md` e a especificação Swagger aplicável.
2. Alterar o handler, schema e teste no mesmo módulo quando o contrato mudar.
3. Executar a suíte focada antes da suíte completa.
4. Atualizar evidência em `feature_list.json` somente com resultado observado.

## Dependências

Prisma é o único acesso ao banco; `express`, `zod` e o middleware JWT compõem a borda HTTP.
Rotas compartilham o app, mas cada operação valida o dia e o ownership do usuário autenticado.

## Referências

- `backend/backend.md` é o guia operacional detalhado do backend.
- `backend/prisma/schema.prisma` é a fonte do modelo persistido.
- `backend/src/swagger.ts` é a fonte da documentação OpenAPI publicada.
- `specification.md` contém os requisitos e regras de negócio compartilhados.
