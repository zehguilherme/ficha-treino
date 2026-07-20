# AGENTS.md — Ficha Treino

## Stack

- Frontend: Next.js App Router, TanStack Query + Context API (client global state), `useState` só para UI local
- Backend: Express + raw SQL (`pg`), sem ORM
- DB: PostgreSQL via Docker Compose, seed único do dataset `exercises-ptbr-full-translation.json`
- Validação: Zod (compartilhado front/back)
- Auth: Google OAuth 2.0 → JWT (24h, sem refresh, localStorage)
- UI: Tailwind + ShadCN HSL tokens (`design-system/colors_and_type.css`)
- Testes: Jest (planejado)

## Estado atual

- `backend/` e `frontend/` estão vazios — implementação não começou
- `specification.md` = RF, RNF, modelo conceitual, regras de negócio
- `design-system/` = tokens ShadCN, componentes HTML/CSS, previews (`preview/`)
- `docs/superpowers/specs/` = ADRs de arquitetura (ex: TanStack Query mapping, optimistic updates)
- Nenhum `.env`, `package.json`, `docker-compose.yml` ou `tsconfig.json` existe ainda

## Workflow

- Branch ativa: `develop` → PR merge para `master`
- Backend é Express separado — **não** usar rotas de API do Next.js
- Imagens: CDN jsDelivr (`https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{id}/0.jpg`)
- PT-BR em toda UI e dados de exercícios
