# Frontend — Ficha Treino

## Propósito

Next.js App Router com TanStack Query (estado do servidor), Context API (sessão do usuário), `useState` apenas para UI local. Tailwind + ShadCN HSL tokens.

## Páginas

| Rota                 | Componente       | Descrição                          |
| -------------------- | ---------------- | ---------------------------------- |
| `/`                  | `HomePage`       | Landing page pública com hero + features |
| `/login`             | `LoginPage`      | Login com Google OAuth             |
| `/dashboard`         | `DashboardPage`  | Grid semanal com 7 cards de treino |
| `/workout/[weekDay]` | `WorkoutDayPage` | Exercícios do dia + search         |
| `/account`           | `AccountPage`    | Dados do perfil + excluir conta    |

## Shared

Schemas Zod compartilhados com backend via `shared/` (validação front/back idêntica).

## Imagens

CDN jsDelivr:

```
https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{id}/0.jpg
https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{id}/1.jpg
```

## Estado

- **TanStack Query**: cache de exercícios, treinos, mutações (marcar done, adicionar/remover)
- **Context API**: sessão do usuário (login/logout)
- **`useState`**: input search, modal, carrossel

## Estrutura (planejada)

```
src/
  app/
    login/page.tsx
    dashboard/page.tsx
    workout/[weekDay]/page.tsx
    account/page.tsx
  components/
    ui/       (ShadCN)
    layout/
    workout/
    exercise/
  hooks/
  contexts/
  providers/
  lib/
    api.ts    (axios/fetch wrapper)
```

## Verificação

```bash
npm run dev
# abrir http://localhost:3000
```

## Constraints

- Sem rotas de API do Next.js — tudo via Express separado
- JWT armazenado em localStorage
- Sem API externa de exercícios — tudo via backend local
