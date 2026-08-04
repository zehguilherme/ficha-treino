# Plano de Implementação — Issue #35: Backend Google OAuth → JWT

**Data:** 2026-07-31
**Feature:** `api-003` — Autenticação Google OAuth → JWT (backend)
**Issue:** https://github.com/zehguilherme/ficha-treino/issues/35
**Branch:** `develop`
**Modo de execução:** subagent-driven (TDD)

## Contexto

O frontend já recebe o ID Token do Google (issue #68, UI). Este plano implementa o
backend que valida esse token, cria/atualiza o usuário, gera o JWT (24h) e expõe
`GET /api/auth/me`. Os 7 treinos semanais do usuário são criados no primeiro login.

Stack relevante: Express 5 + Prisma 7 (adapter-pg), Zod 4, Jest 30 (@swc/jest),
ESM NodeNext (imports com `.js`). Módulo atualizado: `backend/`.

## Critérios de aceite (issue #35)

- `POST /api/auth/google` recebe `{ token }` (ID Token do Google), valida via
  `google-auth-library`, retorna `200 { token, name, email }`.
- Primeiro login: cria usuário + 7 treinos (um por dia da semana) em `$transaction`.
- Login recorrente: atualiza nome/email.
- JWT: 24h, assinado com `JWT_SECRET`, claims `user_id` e `google_id`.
- `GET /api/auth/me` com JWT válido retorna dados do usuário; token inválido/ausente → 401.

---

## Task 1 — Instalar dependências e regenerar Prisma Client

**Tipo:** setup

- `npm install google-auth-library jsonwebtoken`
- `npm install -D @types/jsonwebtoken supertest @types/supertest`
- `npx prisma generate` (client gerado em `src/generated/prisma`, gitignored)
- Verificar: `npm test` (testes atuais continuam passando)
- Commit: `chore(backend): add google-auth-library, jsonwebtoken and supertest deps`

## Task 2 — Env vars

**Tipo:** setup

- `backend/.env`: `GOOGLE_CLIENT_ID` + `JWT_SECRET` (já preenchidos pelo usuário)
- `backend/.env.example`: ambas chaves documentadas (já editado)
- Verificar se `frontend/.env` também tem `GOOGLE_CLIENT_ID` (deve ser o MESMO valor)
- Commit: `chore(backend): document GOOGLE_CLIENT_ID and JWT_SECRET env vars`

> Nota: `backend/.env` é gitignored — o commit cobre apenas `.env.example`.
> `.env` não entra em controle de versão.

## Task 3 — Extrair app Express para `src/app.ts`

**Tipo:** refactor

Motivo: o supertest precisa de uma instância do app sem subir o servidor.

- Criar `backend/src/app.ts` com a configuração do Express (middlewares + rotas) exportada como `export const app`.
- `backend/src/server.ts` fica só com `app.listen(PORT)`.
- Atualizar glob do swagger em `backend/src/swagger.ts`: `apis` passa de
  `['./src/server.ts', './src/routes/*.ts']` para `['./src/app.ts', './src/routes/*.ts']`.
- Criar `backend/src/app.test.ts` com supertest:
  - `GET /api/health` → 200 `{ status: 'ok' }`
  - Rota desconhecida → 404
- Verificar: `npm test` + `npm run dev` (health + `/api/docs` ok)
- Commit: `refactor(backend): extract express app to src/app.ts for testability`

## Task 4 — JWT middleware (TDD)

**Tipo:** feature

Arquivos:
- `backend/src/middleware/auth.ts`: `signJwt`, `verifyJwt`, `requireAuth`
- `backend/src/middleware/auth.test.ts`

Detalhes:
- `signJwt({ user_id, google_id })` → token com claims `user_id`/`google_id`,
  `expiresIn: '24h'`, segredo `process.env.JWT_SECRET`.
- `verifyJwt(token)` → payload tipado; lança/retorna erro em token inválido.
- `requireAuth` → middleware que lê `Authorization: Bearer <token>`, verifica e
  injeta `req.user`; 401 se ausente/inválido.
- `JwtPayload`/`JwtClaims` tipado (snake_case). Sem `any`.

Testes:
- sign → verify round-trip (claims preservadas)
- token inválido → rejeita
- token ausente → 401
- token com expiração vencida → 401 (usar `expiresIn` curto ou `clockTolerance`)

- Commit: `feat(backend): add JWT sign/verify helpers and auth middleware`

> ESLint do backend trata `no-unsafe-*` como error — o decode do JWT precisa de
> cast explícito e tipado (`as JwtClaims`), nunca `as any`.

## Task 5 — Rotas de autenticação (TDD)

**Tipo:** feature

Arquivos:
- `backend/src/validators/auth.ts` + `auth.validator.test.ts` (opcional)
- `backend/src/routes/auth.ts` + `auth.test.ts`

Rotas:
- `POST /api/auth/google` (body `{ token: string }`, Zod):
  - `verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID })`
  - Primeiro login (sem `User` com `googleId`): cria usuário + 7 `Workout` (um por
    `WeekDay`) em `$transaction` (ver `WeekDay` no schema).
  - Login recorrente: `update` nome/email.
  - Resposta: `200 { token, name, email }`
  - Token ausente/inválido → 400/401.
- `GET /api/auth/me` (rota protegida por `requireAuth`):
  - Resposta: `200 { name, email, google_id }`
  - Sem token → 401.

Testes (mockar `prisma` e `OAuth2Client`):
- POST: primeiro login cria usuário + 7 treinos
- POST: login recorrente atualiza nome/email
- POST: token inválido → 401
- GET /me: com JWT → 200 dados; sem token → 401

Swagger: annotation `@openapi` JSDoc nas duas rotas (verificar padrão em rotas
existentes + `src/swagger.ts`).

- Commit: `feat(backend): add Google OAuth and /me endpoints`

## Task 6 — Validação final, tracking e fechamento

**Tipo:** verificação

- `npm run dev` → conferir `/api/docs` (Swagger valida as 2 rotas novas)
- `npm run lint && npm run format && npx tsc --noEmit`
- Rodar skill `type-safety-staged` (checks tipagem nos arquivos staged)
- `feature_list.json`: `api-003` → `completed` (mantendo texto da evidência);
  `api-004` permanece `not_started`
- `progress.md`: adicionar linha ao histórico:
  `2026-07-31 | api-003 — Google OAuth → JWT | Concluído | Issues #35 | Login via Google funcional no backend, JWT 24h, /me autenticado`
- Commits: `docs: mark api-003 (Google OAuth → JWT) as completed`
- **Fechar a issue #35** (com autorização explícita do usuário)

---

## Regras de execução

- Toda alteração passa por `npm run lint && npm run format` no `backend/`.
- Sem `export default`; funções sempre arrow functions.
- Sem `any` — tipos explícitos em todo lugar.
- Commits em inglês, Conventional Commits, escopos `backend`/`docs`.
- **Nenhum commit sem autorização explícita do usuário.**
- Não tocar nos arquivos do frontend (changes da issue #68 já em working tree).
