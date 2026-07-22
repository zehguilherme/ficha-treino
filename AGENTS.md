# AGENTS.md — Ficha de Treino

## Stack

- Frontend: Next.js App Router, TanStack Query + Context API (client global state), `useState` só para UI local
- Backend: Express + raw SQL (`pg`), sem ORM
- DB: PostgreSQL via Docker Compose, seed único do dataset `exercises-ptbr-full-translation.json`
- Validação: Zod (compartilhado front/back)
- Auth: Google OAuth 2.0 → JWT (24h, sem refresh, localStorage)
- UI: Tailwind + ShadCN HSL tokens (`design-system/colors_and_type.css`)
- Testes: Jest (planejado)

## Módulos

| Módulo        | Path             | Doc                              | Verify        |
| ------------- | ---------------- | -------------------------------- | ------------- |
| backend       | `backend/`       | `backend/backend.md`             | `init.sh`     |
| frontend      | `frontend/`      | `frontend/frontend.md`           | `init.sh`     |
| design-system | `design-system/` | `design-system/design-system.md` | previews HTML |

## Estado atual

- `frontend/` inicializado com Next.js 16 (App Router, Tailwind, TypeScript, ESLint) — página inicial "Ficha de Treino"
- `backend/` inicializado com Express + TypeScript, Docker Compose + PostgreSQL, health check
- `specification.md` = RF, RNF, modelo conceitual, regras de negócio
- `design-system/` = tokens ShadCN, componentes HTML/CSS, previews (`preview/`)
- `docs/superpowers/specs/` = ADRs de arquitetura
- `.github/dependabot.yml` configurado para npm
- Swagger/OpenAPI já configurado (`src/swagger.ts`, `/api/docs`)

## Feature ativa

Feature atual: `infra-001` (Database schema) — ver `feature_list.json` e `progress.md`

## Workflow

- Branch ativa: `develop` → PR merge para `master`
- Backend é Express separado — **não** usar rotas de API do Next.js
- Imagens: CDN jsDelivr (`https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{id}/0.jpg`)
- PT-BR em toda UI e dados de exercícios
- Antes de editar um módulo, ler seu arquivo `<module>.md`
- **Sempre** verificar a documentação Swagger atual (servida em `/api/docs`, spec em `src/swagger.ts` + annotations JSDoc nas rotas) antes de modificar ou adicionar endpoints — usar skill `swagger-workflow`
- Todo endpoint novo/modificado deve ter sua annotation `@openapi` JSDoc — validar com `npm run dev` + acesso a `/api/docs`
- Feature concluída → marcar em `feature_list.json` e `progress.md`
- Funções JavaScript/TypeScript devem ser arrow functions (`const fn = () => {}`), exceto construtores de classe e `function*` generators
- **Nunca** usar `export default`. Sempre usar `export` nomeado. Exceção: arquivos de rota do Next.js em `src/app/**/{page,layout,loading,error,not-found,template,default}.{ts,tsx}`
- Componentes de interface em `src/components/` devem usar PascalCase (primeira letra maiúscula). Exceção: arquivos em `src/app/` (rotas Next.js). Validar com `npm run test:component-names` — usar skill `component-naming-pascalcase`.
- **Nunca** usar tipo `any` — toda variável, parâmetro e retorno de função deve ter tipo explícito. Se o tipo necessário não existir, criar `type` ou `interface` próprio. Validar com `npm run lint && npm run format:check` em cada módulo antes de concluir — usar skill `type-safety-no-any`.
- Após qualquer modificação no frontend ou backend, executar `npm run lint` e `npm run format` no diretório do módulo modificado antes de concluir
- Toda alteração no frontend (interface, funcionalidade, bug fix) deve passar pela checklist de UI/UX/acessibilidade em `frontend/frontend.md` — usar skill `ui-accessibility-check`
