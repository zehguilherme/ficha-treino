# Session Handoff

Last Updated: 2026-09-30

## Última sessão

2026-09-30: issue #343 — ordenação dos exercícios nos endpoints de treino agora ignora diferenças de caixa e prioriza maiúsculas em empates. Backend verificado: 9 suítes/74 testes, typecheck, lint e Prettier nos arquivos alterados; `format:check` global continua apontando dez arquivos preexistentes não relacionados. `/api/docs/swagger-ui-init.js` serviu a spec atualizada.

2026-09-30: pílula “Instalar app” suprimida em `/auth/google/callback` via pathname; validação real confirmou ausência no callback e presença em `/treinos/terca`. Frontend verificado: 44 suítes (205 passaram, 10 ignorados), lint, typecheck, format:check e nomes PascalCase.

2026-09-30: issue #347 — pílula “Instalar app” reposicionada; faixa condicional na busca impede colisão com ações e filtros, com área de rolagem ampliada. Verificados: 44 suítes (204 passaram, 10 ignorados), lint, typecheck, format:check e nomes PascalCase; navegação real desktop e geometria mobile a 390px sem sobreposição; diálogo permanece acima da pílula.

2026-09-21: issue #319 refinada; exercícios personalizados são exclusivos do treino de origem, com menu contextual de editar/excluir, CTA no estado vazio da busca e migration de separação por treino. Permanecem `ui-011`, `ui-012` e `tool-003`.

2026-09-29: `CustomExerciseMenu` extraído da página de treino no padrão `UserMenu`, mantendo botão, callbacks, foco acessível e aparência; frontend verificado com 44 suítes, lint, TypeScript, Prettier e nomes PascalCase.

2026-09-30: falhas na criação de exercício personalizado passaram a usar somente a `ErrorAlertDialog`; teste de regressão incluído e frontend verificado com 44 suítes, lint, TypeScript e Prettier.

2026-09-30: `CustomExerciseDialog` passou a validar nome e músculo após blur, tratar abertura do Select sem falso erro e expor mensagens associadas por ARIA; 7 testes do componente e as 44 suítes do frontend (202 testes passaram, 10 ignorados), lint, TypeScript, Prettier e nomes PascalCase verificados.

2026-09-30: `Input` e `SelectTrigger` passaram a exibir mensagens recebidas por `error`, incluindo estilo e associação ARIA; `CustomExerciseDialog` continua definindo as mensagens e o momento de exibição. Frontend verificado com 44 suítes (204 testes passaram, 10 ignorados), lint, TypeScript, Prettier nos arquivos alterados e nomes PascalCase. `format:check` global aponta 21 arquivos não relacionados com CRLF preexistente no checkout.

2026-09-30: Socket configurado em `socket.yml` para manter habilitados os alertas de PR, relatórios de projeto e check runs; `Socket Security: Project Report` removido da proteção de `master`, pois não se aplica a checks de PR.

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
- `frontend/src/components/workout/CustomExerciseDialog.tsx`: criação e edição de personalizados
- `frontend/src/components/workout/CustomExerciseMenu.tsx`: gatilho e opções do menu de exercício personalizado
- `backend/src/routes/customExercises.ts`: endpoints privados de criação e edição
- `backend/src/routes/workouts.ts` e `backend/src/routes/workouts.test.ts`: ordenação sem diferenciação de caixa e cobertura da issue #343
- `backend/public/swagger.json`: descrições regeneradas para a ordenação dos endpoints de treino
- `backend/prisma/migrations/20260922020000_custom_exercises_per_workout/migration.sql`: vínculo exclusivo por treino e cópia de associações legadas
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
