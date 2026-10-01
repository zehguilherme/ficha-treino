# Backend — Ficha de Treino

## Propósito

API REST em Express com TypeScript, PostgreSQL com Prisma ORM (`@prisma/client`), validação Zod. Responsável por autenticação Google OAuth, CRUD de treinos, busca de exercícios e gerenciamento de conta.

## Entry point

`src/server.ts` — inicializa Express, middlewares, rotas, conexão DB.

## Rotas esperadas

| Método | Rota                                                  | Auth | Descrição                                                                                                           |
| ------ | ----------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/google`                                    | Não  | Login com `code` OAuth2 ou `token` do Google; no 1º login cria os 7 treinos semanais                                |
| GET    | `/api/auth/me`                                        | Sim  | Retorna usuário atual                                                                                               |
| GET    | `/api/workouts`                                       | Sim  | Lista os 7 treinos do usuário com contagem e exercícios (`name` + `done`) em ordem alfabética sem diferenciar caixa |
| GET    | `/api/workouts/:weekDay`                              | Sim  | Exercícios do dia em ordem alfabética sem diferenciar caixa                                                         |
| POST   | `/api/workouts/:weekDay/exercises`                    | Sim  | Adiciona exercício                                                                                                  |
| DELETE | `/api/workouts/:weekDay/exercises/:exerciseId`        | Sim  | Remove exercício                                                                                                    |
| PATCH  | `/api/workout-exercises/:id`                          | Sim  | Marca/desmarca como concluído                                                                                       |
| POST   | `/api/workouts/:weekDay/clear`                        | Sim  | Limpa marcações do treino                                                                                           |
| GET    | `/api/exercises?q=&limit=20&offset=0&category=forca`  | Sim  | Busca somente exercícios do catálogo                                                                                |
| POST   | `/api/workouts/:weekDay/custom-exercises`             | Sim  | Cria exercício personalizado privado e o associa ao treino                                                          |
| PATCH  | `/api/workouts/:weekDay/custom-exercises/:exerciseId` | Sim  | Edita personalizado vinculado ao treino                                                                             |
| DELETE | `/api/workouts/:weekDay/custom-exercises/:exerciseId` | Sim  | Exclui personalizado e sua associação                                                                               |
| DELETE | `/api/account`                                        | Sim  | Exclui conta + cascade                                                                                              |
| GET    | `/api/health`                                         | Não  | Health check                                                                                                        |

## Banco de dados

Schema (4 tabelas): `Users`, `Workouts`, `Exercises`, `Workout_Exercises`; personalizados usam `customWorkoutId` e só existem no treino vinculado.

**Prisma 7** com driver adapter `@prisma/adapter-pg` (`src/db.ts`) e `prisma.config.ts`. O generator `prisma-client` gera o client em `src/generated/prisma/` (importado como `../generated/prisma/client.js`). Configuração de conexão vem do adapter — o datasource no `schema.prisma` não tem `url`.

Gerenciado via Prisma Migrate:

- `npm run setup` (`prisma db push`) — sincroniza schema em desenvolvimento
- `prisma migrate dev --name <nome>` — cria migrations em desenvolvimento
- `prisma migrate deploy` — aplica migrations em produção/CI
- `prisma generate` — gera o Prisma Client (executado automaticamente no `prebuild`)
- `npm run studio` — Prisma Studio

**Ambientes:** dev usa PostgreSQL local via Docker (`docker compose up -d`, credenciais `POSTGRES_*` no `.env`). Produção usa **Neon** (projeto `ficha-treino`, branch `production`, db `neondb`). A Vercel publica a API a partir de `master`; as variáveis de sistema estão habilitadas.

**Deploy de migrations:** `backend/vercel.json` instala dependências com `npm ci --include=dev --legacy-peer-deps` e executa Swagger → build da API → `npm run migrate:deploy`, interrompendo o deploy se qualquer etapa falhar. O script `scripts/deploy-migrations.mjs` executa a CLI Prisma instalada somente com `VERCEL_ENV=production`. Usa `DATABASE_URL_UNPOOLED` como `DATABASE_URL` apenas no subprocesso de migration; a conexão do runtime permanece intacta. A conexão direta está configurada como variável sensível exclusivamente em Production na Vercel. Preview e execução local ignoram essa etapa; conexão ausente, inválida ou pooled bloqueia o deploy de produção.

Para alterações publicáveis, criar `prisma migrate dev --name <nome>`, revisar o SQL e versionar schema e migration juntos. `db push` é somente para protótipos locais: não cria migrations publicáveis. `migrate deploy` aplica migrations pendentes e não altera o banco quando não há pendências. Não executar seed automaticamente no deploy.

Migrations precisam ser compatíveis com a API ainda em execução; remoções e renomeações incompatíveis exigem publicação em etapas. Uma falha posterior não desfaz migrations já aplicadas. Promoções de builds preview sem reconstrução não executam a etapa de produção: publicar por build de produção.

Verificação em 2026-10-01: as seis migrations versionadas já estão aplicadas no Neon production. Na branch `verify-deploy-migrations-20261001`, uma execução sem pendências preservou as associações existentes. Em schema isolado dessa mesma branch, a última migration foi aplicada sobre as cinco anteriores com um personalizado compartilhado por dois treinos: ambos os vínculos e estados `done` foram preservados, cada cópia recebeu seu treino de origem, e a segunda execução não teve pendências. A branch de validação foi excluída com autorização; o deploy da nova configuração ainda não foi publicado.

Seed (`npm run seed` → `src/seed.ts`): baixa `exercises-ptbr-full-translation.json` de `raw.githubusercontent.com/joao-gugel/exercicios-bd-ptbr/main/exercises/`, faz upsert em lotes de 50 via `$transaction`, e remove exercícios que saíram do dataset (somente os sem `workout_exercises` associados).

## Estrutura de diretórios (atual)

Nota ESM/NodeNext: os arquivos fonte continuam sendo `.ts`, mas imports relativos no backend usam sufixo `.js` porque o Node executa o JavaScript emitido no build. Não trocar esses imports para `.ts`.

```
src/
  server.ts          # só sobe o listener (porta 3001)
  app.ts             # app Express: cors, json, swagger, /api/health, rotas
  db.ts              # PrismaClient + adapter PrismaPg
  lib/
    http.ts          # instância axios compartilhada (chamadas HTTP externas)
  seed.ts
  swagger.ts         # spec OpenAPI (swagger-jsdoc)
  schema.sql         # snapshot do schema (4 tabelas + enum)
  generated/prisma/  # Prisma Client gerado (não editar)
  routes/
    customExercises.ts
    auth.ts
    workouts.ts      # GET, POST, DELETE e clear implementados
    workoutExercises.ts # PATCH de conclusão implementado
    exercises.ts     # GET /api/exercises implementado
    account.ts       # DELETE /api/account
  middleware/
    auth.ts          # requireAuth, signJwt, verifyJwt
  validators/
    auth.ts          # schemas Zod de entrada
    exercises.ts     # schemas Zod de query e resposta da busca
    workouts.ts      # schemas Zod de parâmetros e payloads de treinos
    responses.ts     # schemas Zod de resposta
    responses.test.ts
  *.test.ts          # testes junto ao módulo (app, seed, middleware/auth, routes/auth, routes/exercises e routes/workouts)
```

As rotas existentes de autenticação, treinos, busca, conclusão, remoção, conta e `routes/customExercises.ts` (`POST`, `PATCH` e `DELETE` vinculados ao treino) estão implementadas e documentadas no Swagger. Exercícios personalizados exigem nome de 2–255 caracteres e músculo principal válido, entram no treino em transação e só podem ser editados ou excluídos no treino de origem. A busca e a adição genérica aceitam somente itens de catálogo; o seed atualiza apenas itens com `isCustom=false`.

Todo usuário autenticado possui sete treinos criados no primeiro login, um para cada valor do enum `WeekDay`: `DOMINGO`, `SEGUNDA`, `TERCA`, `QUARTA`, `QUINTA`, `SEXTA` e `SABADO`. Um treino pode conter zero ou mais exercícios.

Os endpoints de treino ordenam exercícios em português sem diferenciar maiúsculas e minúsculas; quando os nomes só diferem pela caixa, a grafia com maiúscula vem primeiro. Acentos continuam sendo considerados na ordenação.

A busca de exercícios usa a extensão PostgreSQL `unaccent` para que consultas com e sem acentos produzam os mesmos resultados. Além de `q`, aceita filtros opcionais com valores fixos do dataset em `category`, `equipment`, `level`, `force`, `mechanic`, `primaryMuscle` e `secondaryMuscle`; filtros vazios são ignorados e valores repetidos no mesmo filtro usam OR. A rota retorna no máximo 100 itens por página, ordenados por nome e ID, e `total` representa o total filtrado antes da paginação. Valores fora das listas permitidas retornam 400.

Estado verificado em 2026-09-03: a migration da extensão `unaccent` foi adicionada após as migrations versionadas existentes. O container PostgreSQL deve aplicar as 4 migrations antes da validação manual da busca. As rotas de marcação, limpeza, remoção e exclusão de conta possuem testes e annotations Swagger; a exclusão de conta remove o usuário e depende das FKs em cascata para treinos e associações.

## Verificação

`npm run lint` executa `eslint .` no módulo inteiro, incluindo `api/`, `scripts/` e configurações da raiz. O projeto padrão de tipagem inclui arquivos de configuração e scripts externos a `src/`. `npm run format` e `npm run format:check` executam Prettier na raiz do módulo para todos os formatos suportados, incluindo JSON e Markdown. Dependências, builds, cobertura, caches e arquivos gerados ficam excluídos pelas configurações: Prisma Client em `src/generated/`, Swagger em `public/swagger.json` e `package-lock.json` não são formatados manualmente. Credenciais e logs locais também são ignorados pelo Prettier.

```bash
npm run lint && npm run format:check
docker compose up -d
npx tsx src/seed.ts
curl http://localhost:3001/api/health
```

## Documentação da API (Swagger)

A API utiliza **Swagger/OpenAPI 3.0** para documentação dos endpoints — usar skill `swagger-workflow`.

- **Geração da spec:** `swagger-jsdoc` — lê annotations `@openapi` nos comentários JSDoc de cada rota
- **UI interativa:** `swagger-ui-express` — servida em `/api/docs`
- **Arquivo de configuração:** `src/swagger.ts` — define info, servers, securitySchemes, etc.

### Regras para agentes de IA

- **Sempre** verificar a documentação Swagger atual (via `src/swagger.ts` e annotations nas rotas) antes de modificar ou adicionar um endpoint
- Todo endpoint novo ou modificado **deve** ter sua annotation `@openapi` correspondente
- A rota `/api/docs` deve estar acessível e refletir o estado atual de todos os endpoints documentados

## Testes

Stack: **Jest 30 + `@swc/jest`** — transformação rápida sem typecheck (typecheck separado via `tsc --noEmit`).

```bash
npm test                # Todos os testes
npm run test:watch      # Modo watch
npm run test:coverage   # Com cobertura
```

`npm test` também executa os testes nativos Node de `scripts/deploy-migrations.test.mjs`: produção com conexão direta, propagação de falha, bloqueio de configuração inválida e ausência de migrations em preview/desenvolvimento/local. Os testes usam uma CLI simulada e não acessam o banco.

### Convenções

- **Arquivos:** `src/**/*.test.ts` junto ao módulo testado
- **Estrutura:** `describe('ModuleName')` → `test('action when condition')`
- **Idioma:** Inglês
- **Mocking:** factories exportadas ou locais (ex.: `mockPrismaClient()` em `seed.test.ts`)
- **Mocks de HTTP:** wrapper `lib/http.ts` mockado via `jest.mock` (mantém `axios.isAxiosError` real), `jest.clearAllMocks()` em `beforeEach`

### Catálogo

#### `src/app.test.ts`

Testes de integração do app Express (supertest).

| Teste                                                         | Cenário          | Assert principal            |
| ------------------------------------------------------------- | ---------------- | --------------------------- |
| GET /api/health returns 200 with status ok when DB is up      | DB responde      | 200 + `{ status: 'ok' }`    |
| GET /api/health returns 503 with status error when DB is down | Query falha      | 503 + `{ status: 'error' }` |
| returns 404 for unknown routes                                | Rota inexistente | 404                         |

#### `src/middleware/auth.test.ts`

Testes unitários para `signJwt`/`verifyJwt`/`requireAuth` (jsonwebtoken).

| Teste                                                   | Tipo | Assert principal                         |
| ------------------------------------------------------- | ---- | ---------------------------------------- |
| sign then verify preserves user_id and google_id claims | unit | Claims preservados no roundtrip          |
| verify throws on invalid token                          | unit | `verifyJwt` lança                        |
| verify throws on expired token                          | unit | Token com `exp` passado lança            |
| returns 401 when Authorization header is missing        | unit | `requireAuth` → 401 sem token            |
| returns 401 when token is invalid                       | unit | Token inválido → 401                     |
| returns 401 when token is expired                       | unit | Token expirado → 401                     |
| populates req.user and calls next with valid token      | unit | `req.user` preenchido + `next()` chamado |

#### `src/routes/auth.test.ts`

Testes de integração das rotas de auth (supertest + mocks de `./db.js` e `google-auth-library`).

| Teste                                                                           | Tipo | Assert principal                      |
| ------------------------------------------------------------------------------- | ---- | ------------------------------------- |
| POST /api/auth/google creates user and 7 workouts on first login                | int  | `$transaction` cria user + 7 workouts |
| POST /api/auth/google updates existing user without creating workouts           | int  | `update` sem novos workouts           |
| POST /api/auth/google returns 401 when ID token is invalid                      | int  | 401                                   |
| POST /api/auth/google returns 400 when token is missing or empty                | int  | 400                                   |
| POST /api/auth/google with code creates user and 7 workouts on first login      | int  | Fluxo `code` cria user + 7 workouts   |
| POST /api/auth/google with code updates existing user without creating workouts | int  | Fluxo `code` atualiza sem duplicar    |
| POST /api/auth/google returns 401 when code exchange fails                      | int  | 401                                   |
| POST /api/auth/google returns 401 when code exchange yields no ID token         | int  | 401                                   |
| POST /api/auth/google returns 400 when both token and code are missing          | int  | 400                                   |
| GET /api/auth/me returns user data with valid JWT                               | int  | 200 + `name`/`email`                  |
| GET /api/auth/me returns 401 without token                                      | int  | 401                                   |

#### `src/seed.test.ts`

Testes unitários para a função `seed` (download HTTP via `http.get` + upsert em lote + remoção de órfãos).

| Teste                                          | Tipo | Cenário                          | Assert principal                    |
| ---------------------------------------------- | ---- | -------------------------------- | ----------------------------------- |
| inserts all exercises when DB is empty         | unit | API retorna 3, DB vazio          | upsert chamado 3x                   |
| updates existing and inserts new exercises     | unit | API retorna 1 e 2, DB já tem 1   | upsert chamado 2x com where correto |
| removes exercises no longer in dataset         | unit | API retorna só 1, DB tem 1, 2, 3 | deleteMany chamado com `['2', '3']` |
| rejects when the dataset download fails        | unit | HTTP 500                         | seed rejeita com mensagem de erro   |
| processes in multiple batches above BATCH_SIZE | unit | 51 exercícios (BATCH_SIZE=50)    | $transaction chamado 2x             |

#### `src/routes/workouts.test.ts`

Testes de integração das rotas de treinos, adição, marcação e limpeza, com autenticação e ownership.

- `GET /api/workouts` lista os sete treinos do usuário;
- `GET /api/workouts` e `GET /api/workouts/:weekDay` retornam exercícios em ordem alfabética sem diferenciar caixa, com maiúsculas primeiro nos empates;
- `POST /api/workouts/:weekDay/exercises` valida exercício, duplicidade e ownership;
- `DELETE /api/workouts/:weekDay/exercises/:exerciseId` remove associação existente e rejeita associações ausentes ou de outro usuário;
- `PATCH /api/workout-exercises/:id` alterna `done` e rejeita associações de outro usuário;
- `POST /api/workouts/:weekDay/clear` desmarca todas as associações do treino.

## Constraints

- **Nunca** usar tipo `any` — toda variável, parâmetro e retorno de função deve ter tipo explícito — usar skill `type-safety-staged`
- Prisma ORM — usar `@prisma/client` para todas as queries
- Schemas Zod próprios do backend; contratos HTTP equivalentes no frontend são independentes
- JWT gerado e validado no backend, sem refresh
- Rotas de gerenciamento exigem autenticação (exceto `/api/auth/google` e `/api/health`)
- **Nunca** expor nomes de variáveis de ambiente, secrets, tokens, connection strings ou stack traces em respostas HTTP ou `console.*` em código client-facing. Erros devem ser genéricos no cliente e detalhados apenas no server-side (logs do servidor)
