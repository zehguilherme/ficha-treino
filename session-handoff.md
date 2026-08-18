# Session Handoff

## Última sessão

2026-08-15: busca de exercícios implementada; `GET /api/workouts`, `GET /api/workouts/:weekDay` e `GET /api/exercises` documentados, `TERCA` é o enum oficial, busca ignora acentos e adição de exercícios depende da API futura de mutações.

## O que foi feito

- `frontend/src/app/login/page.tsx`: página de login com card centralizado
- `frontend/src/components/auth/LoginForm.tsx`: componente com Google Identity Services
- `frontend/src/hooks/useGoogleLogin.ts`: hook com URL OAuth + state anti-CSRF
- `frontend/src/app/auth/google/callback/page.tsx`: callback do Google OAuth
- `frontend/src/lib/auth.ts`: helpers de sessão (setSession/getSession/clearSession)
- `frontend/src/lib/api.ts`: instância axios + interceptors (injeção do JWT, limpeza de sessão no 401)
- `frontend/src/lib/exerciseImage.ts`: helper para URLs de imagens via CDN
- `frontend/src/app/not-found.tsx`: página 404 amigável
- `design-system/pages/{minha-conta,workout-day}.html`: confirm modals custom (substituem dialogs nativos) + close button no modal
- Testes: LoginForm, useGoogleLogin, callback page, auth helpers, api interceptors, not-found
- `feature_list.json`: ui-001, ui-009 `passes: true`; api-003, api-004 e api-006 concluídos; `GET /api/workouts` implementado dentro de api-005; api-007 e api-008 pendentes
- `progress.md`: histórico atualizado até 2026-08-15

## Feature ativa

`backend routes + frontend pages` — rotas de usuário (CRUD treinos, busca exercícios, conta) e páginas correspondentes.

## Próximos passos

### Backend

1. api-005: concluir POST/DELETE de exercícios do treino; `GET /api/workouts/:weekDay` implementado
2. api-007: Marcar/desmarcar exercícios
3. api-008: Excluir conta

### Frontend

5. ui-002: Dashboard
6. ui-003: Workout day
7. ui-004: Search UI — busca da issue 71 implementada com debounce de 1000 ms, paginação manual, campo sticky e carrossel; adição ao treino continua dependente da API futura
8. ui-005: Checkbox + carrossel

## Branch

`develop`
