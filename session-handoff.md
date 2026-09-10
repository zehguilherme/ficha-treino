# Session Handoff

Last Updated: 2026-09-10

## Última sessão

2026-09-10: manifest PWA e banner global cross-browser da issue #289 concluídos; o banner usa `Alert` não modal, trata prompt nativo, iOS/iPadOS, standalone, appinstalled, dispensa por 7 dias, ações empilhadas em telas menores, informações em largura total no mobile, X sobreposto sem reservar largura no mobile, margem extra das ações no desktop e botão X no padrão das modais. Escopo permanece sem service worker, offline ou notificações. Permanecem `ui-011`, `ui-012` e `tool-003`.

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
- Testes: autenticação, dashboard, página de treino, busca, adição, marcação, limpeza, remoção, interceptors e not-found
- `frontend/src/components/ui/Loading.tsx`: estado de carregamento acessível e reutilizável
- `frontend/src/app/treinos/DashboardClient.tsx`: loading separado de autenticação, retry de treinos e preservação de nomes longos
- `frontend/src/app/treinos/[weekDay]/page.tsx`: retry do treino e da busca, loading padronizado, limpeza condicionada a exercícios concluídos e imagens acima da dobra priorizadas
- `frontend/src/components/exercise/ExerciseCard.tsx`: estrutura visual compartilhada do card, carrossel, metadados, músculos, instruções e ações contextuais
- `frontend/src/components/exercise/ExerciseCard.test.tsx`: testes da estrutura, metadados, ações e expansão das instruções
- `frontend/src/components/workout/AddExercisePage.tsx`: busca, filtros, paginação e adição na rota dedicada
- `frontend/src/app/treinos/[weekDay]/adicionar-exercicio/page.test.tsx`: testes da página dedicada, retorno ao treino e estados assíncronos
- `frontend/src/app/treinos/[weekDay]/page.test.tsx`: testes da página de treino usando o card compartilhado e mantendo `Feito`/`Remover`
- `frontend/src/app/manifest.ts` e `frontend/public/icon-*.png`: manifest PWA e ícones instaláveis
- `frontend/src/components/layout/PwaInstallPrompt.tsx`: banner global de instalação e instruções por plataforma
- `frontend/src/app/minha-conta/page.tsx` e `frontend/src/components/account/AccountDeleteDialog.tsx`: perfil, exclusão autenticada e redirecionamento para login
- `feature_list.json`: APIs `api-003` a `api-008` e interfaces `ui-001` a `ui-010` e `ui-013` a `ui-014` concluídas; `tool-004` concluído
- `progress.md`: histórico atualizado até 2026-09-08

## Feature ativa

`backend routes + frontend pages` — rotas de usuário (CRUD treinos, busca exercícios, conta) e páginas correspondentes.

## Bloqueios / Blockers

Nenhum.

## Arquivos relevantes / Files

- `AGENTS.md`, `feature_list.json`, `progress.md` e `init.sh`: harness e estado.
- `backend/src/src.md` e `frontend/src/app/app.md`: docs dos módulos detectados.
- `frontend/frontend.md` e `frontend/testing.md`: guia e referência de testes do frontend.

## Próximos passos / Next

### Backend

1. Nenhuma pendência de backend

### Frontend

1. ui-011: Favicon
2. ui-012: Page transitions (Motion)

### Ferramentas

1. tool-003: Pular deploy Vercel backend-only

## Branch

`develop`
