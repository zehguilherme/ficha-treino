# Backend — Ficha de Treino

## Propósito

API REST em Express com TypeScript, PostgreSQL com Prisma ORM (`@prisma/client`), validação Zod. Responsável por autenticação Google OAuth, CRUD de treinos, busca de exercícios e gerenciamento de conta.

## Entry point

`src/server.ts` — inicializa Express, middlewares, rotas, conexão DB.

## Rotas esperadas

| Método | Rota                                           | Auth | Descrição                                                                            |
| ------ | ---------------------------------------------- | ---- | ------------------------------------------------------------------------------------ |
| POST   | `/api/auth/google`                             | Não  | Login com `code` OAuth2 ou `token` do Google; no 1º login cria os 7 treinos semanais |
| GET    | `/api/auth/me`                                 | Sim  | Retorna usuário atual                                                                |
| GET    | `/api/workouts`                                | Sim  | Lista treinos do usuário                                                             |
| GET    | `/api/workouts/:weekDay`                       | Sim  | Exercícios de um dia                                                                 |
| POST   | `/api/workouts/:weekDay/exercises`             | Sim  | Adiciona exercício                                                                   |
| DELETE | `/api/workouts/:weekDay/exercises/:exerciseId` | Sim  | Remove exercício                                                                     |
| PATCH  | `/api/workout-exercises/:id`                   | Sim  | Marca/desmarca como concluído                                                        |
| POST   | `/api/workouts/:weekDay/clear`                 | Sim  | Limpa marcações do treino                                                            |
| GET    | `/api/exercises?q=`                            | Sim  | Busca exercícios (debounce)                                                          |
| DELETE | `/api/account`                                 | Sim  | Exclui conta + cascade                                                               |
| GET    | `/api/health`                                  | Não  | Health check                                                                         |

## Banco de dados

Schema (4 tabelas): `Users`, `Workouts`, `Exercises`, `Workout_Exercises` — ver `specification.md` para colunas.

**Prisma 7** com driver adapter `@prisma/adapter-pg` (`src/db.ts`) e `prisma.config.ts`. O generator `prisma-client` gera o client em `src/generated/prisma/` (importado como `../generated/prisma/client.js`). Configuração de conexão vem do adapter — o datasource no `schema.prisma` não tem `url`.

Gerenciado via Prisma Migrate:

- `npm run setup` (`prisma db push`) — sincroniza schema em desenvolvimento
- `prisma migrate dev --name <nome>` — cria migrations em desenvolvimento
- `prisma migrate deploy` — aplica migrations em produção/CI
- `prisma generate` — gera o Prisma Client (executado automaticamente no `prebuild`)
- `npm run studio` — Prisma Studio

Seed (`npm run seed` → `src/seed.ts`): baixa `exercises-ptbr-full-translation.json` de `raw.githubusercontent.com/joao-gugel/exercicios-bd-ptbr/main/exercises/`, faz upsert em lotes de 50 via `$transaction`, e remove exercícios que saíram do dataset (somente os sem `workout_exercises` associados).

## Estrutura de diretórios (atual)

```
src/
  server.ts          # só sobe o listener (porta 3001)
  app.ts             # app Express: cors, json, swagger, /api/health, rotas
  db.ts              # PrismaClient + adapter PrismaPg
  seed.ts
  swagger.ts         # spec OpenAPI (swagger-jsdoc)
  schema.sql         # snapshot do schema (4 tabelas + enum)
  generated/prisma/  # Prisma Client gerado (não editar)
  routes/
    auth.ts
    workouts.ts      # planejado
    exercises.ts     # planejado
    account.ts       # planejado
  middleware/
    auth.ts          # requireAuth, signJwt, verifyJwt
  validators/
    auth.ts          # schemas Zod
  *.test.ts          # testes junto ao módulo (app, seed, middleware/auth, routes/auth)
```

Implementado hoje: `app.ts`, `server.ts`, `db.ts`, `seed.ts`, `swagger.ts`, `routes/auth.ts`, `middleware/auth.ts`, `validators/auth.ts`. Rotas de workouts/exercises/account ainda **planejadas**.

## Verificação

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

### Convenções

- **Arquivos:** `src/**/*.test.ts` junto ao módulo testado
- **Estrutura:** `describe('ModuleName')` → `test('action when condition')`
- **Idioma:** Inglês
- **Mocking:** factories exportadas ou locais (ex.: `mockPrismaClient()` em `seed.test.ts`)
- **Mocks globais:** `globalThis.fetch` sobrescrito por teste, `jest.clearAllMocks()` em `beforeEach`

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
| GET /api/auth/me returns user data with valid JWT                               | int  | 200 + `name`/`email`/`google_id`      |
| GET /api/auth/me returns 401 without token                                      | int  | 401                                   |

#### `src/seed.test.ts`

Testes unitários para a função `seed` (fetch HTTP + upsert em lote + remoção de órfãos).

| Teste                                          | Tipo | Cenário                          | Assert principal                    |
| ---------------------------------------------- | ---- | -------------------------------- | ----------------------------------- |
| inserts all exercises when DB is empty         | unit | API retorna 3, DB vazio          | upsert chamado 3x                   |
| updates existing and inserts new exercises     | unit | API retorna 1 e 2, DB já tem 1   | upsert chamado 2x com where correto |
| removes exercises no longer in dataset         | unit | API retorna só 1, DB tem 1, 2, 3 | deleteMany chamado com `['2', '3']` |
| rejects when fetch fails                       | unit | Fetch retorna 500                | seed rejeita com mensagem de erro   |
| processes in multiple batches above BATCH_SIZE | unit | 51 exercícios (BATCH_SIZE=50)    | $transaction chamado 2x             |

## Constraints

- **Nunca** usar tipo `any` — toda variável, parâmetro e retorno de função deve ter tipo explícito — usar skill `type-safety-staged`
- Prisma ORM — usar `@prisma/client` para todas as queries
- Zod schemas compartilhados com frontend via `shared/`
- JWT gerado e validado no backend, sem refresh
- Rotas de gerenciamento exigem autenticação (exceto `/api/auth/google` e `/api/health`)
- **Nunca** expor nomes de variáveis de ambiente, secrets, tokens, connection strings ou stack traces em respostas HTTP ou `console.*` em código client-facing. Erros devem ser genéricos no cliente e detalhados apenas no server-side (logs do servidor)
