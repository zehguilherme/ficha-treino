# Backend — Ficha de Treino

## Propósito

API REST em Express com TypeScript, PostgreSQL raw SQL (`pg`), validação Zod. Responsável por autenticação Google OAuth, CRUD de treinos, busca de exercícios e gerenciamento de conta.

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

Seed: script que baixa `exercises-ptbr-full-translation.json` e faz upsert dos exercícios.

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
docker compose up -d
npx tsx src/seed.ts
curl http://localhost:3001/api/health
```

## Constraints

- **Nunca** usar tipo `any` — toda variável, parâmetro e retorno de função deve ter tipo explícito
- Sem ORM — raw SQL com `pg` apenas
- Zod schemas compartilhados com frontend via `shared/`
- JWT gerado e validado no backend, sem refresh
- Rotas de gerenciamento exigem autenticação (exceto `/api/auth/google` e `/api/health`)
