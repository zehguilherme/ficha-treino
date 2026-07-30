# Backend — Ficha de Treino

## Propósito

API REST em Express com TypeScript, PostgreSQL com Prisma ORM (`@prisma/client`), validação Zod. Responsável por autenticação Google OAuth, CRUD de treinos, busca de exercícios e gerenciamento de conta.

## Entry point

`src/server.ts` — inicializa Express, middlewares, rotas, conexão DB.

## Rotas esperadas

| Método | Rota                                           | Auth | Descrição                     |
| ------ | ---------------------------------------------- | ---- | ----------------------------- |
| POST   | `/api/auth/google`                             | Não  | Login com Google ID token     |
| GET    | `/api/auth/me`                                 | Sim  | Retorna usuário atual         |
| GET    | `/api/workouts`                                | Sim  | Lista treinos do usuário      |
| GET    | `/api/workouts/:weekDay`                       | Sim  | Exercícios de um dia          |
| POST   | `/api/workouts/:weekDay/exercises`             | Sim  | Adiciona exercício            |
| DELETE | `/api/workouts/:weekDay/exercises/:exerciseId` | Sim  | Remove exercício              |
| PATCH  | `/api/workout-exercises/:id`                   | Sim  | Marca/desmarca como concluído |
| POST   | `/api/workouts/:weekDay/clear`                 | Sim  | Limpa marcações do treino     |
| GET    | `/api/exercises?q=`                            | Sim  | Busca exercícios (debounce)   |
| DELETE | `/api/account`                                 | Sim  | Exclui conta + cascade        |
| GET    | `/api/health`                                  | Não  | Health check                  |

## Banco de dados

Schema (4 tabelas): `Users`, `Workouts`, `Exercises`, `Workout_Exercises` — ver `specification.md` para colunas.

Gerenciado via Prisma Migrate:
- `prisma migrate dev --name <nome>` — cria migrations em desenvolvimento
- `prisma migrate deploy` — aplica migrations em produção/CI
- `prisma generate` — gera o Prisma Client (executado automaticamente no `prebuild`)

Seed: script que baixa `exercises-ptbr-full-translation.json` e faz upsert dos exercícios usando Prisma Client.

## Estrutura de diretórios (planejada)

```
src/
  server.ts
  db.ts
  seed.ts
  routes/
    auth.ts
    workouts.ts
    exercises.ts
    account.ts
  middleware/
    auth.ts
  validators/   (Zod schemas)
```

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

#### `src/seed.test.ts`

Testes unitários para a função `seed` (fetch HTTP + upsert em lote + remoção de órfãos).

| Teste | Tipo | Cenário | Assert principal |
|-------|------|---------|------------------|
| inserts all exercises when DB is empty | unit | API retorna 3, DB vazio | upsert chamado 3x |
| updates existing and inserts new exercises | unit | API retorna 1 e 2, DB já tem 1 | upsert chamado 2x com where correto |
| removes exercises no longer in dataset | unit | API retorna só 1, DB tem 1, 2, 3 | deleteMany chamado com `['2', '3']` |
| rejects when fetch fails | unit | Fetch retorna 500 | seed rejeita com mensagem de erro |
| processes in multiple batches above BATCH_SIZE | unit | 51 exercícios (BATCH_SIZE=50) | $transaction chamado 2x |

## Constraints

- **Nunca** usar tipo `any` — toda variável, parâmetro e retorno de função deve ter tipo explícito — usar skill `type-safety-staged`
- Prisma ORM — usar `@prisma/client` para todas as queries
- Zod schemas compartilhados com frontend via `shared/`
- JWT gerado e validado no backend, sem refresh
- Rotas de gerenciamento exigem autenticação (exceto `/api/auth/google` e `/api/health`)
