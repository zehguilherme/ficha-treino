# Progresso — Ficha de Treino

## Feature atual

**Usuário: backend routes + frontend pages**

Tudo relacionado ao usuário: autenticação, gerenciamento de treinos, busca e marcação de exercícios, conta, e as páginas do frontend.

## Próximos passos

### Backend (rotas de usuário)

1. api-008: Excluir conta

### Frontend (páginas de usuário)

3. ui-007: Minha conta
4. ui-008: Modal exclusão
5. ui-011: Favicon
6. ui-012: Page transitions (Motion)

### Demais

7. infra-002: Mover design-system/ para docs/
8. tool-003: Pular deploy Vercel backend-only
9. tool-004: README.md + README-en.md

## Histórico

| Data       | Feature                                                             | Status     |
| ---------- | ------------------------------------------------------------------- | ---------- |
| 2026-07-20 | Harness modular                                                     | Criado     |
| 2026-07-20 | Next.js scaffolding                                                 | Concluído  |
| 2026-07-20 | Harness files review                                                | Atualizado |
| 2026-07-21 | tool-001 — PascalCase componentes                                   | Concluído  |
| 2026-07-21 | api-001b — Scaffold Express                                         | Concluído  |
| 2026-07-21 | api-001 — Docker Compose + PostgreSQL                               | Concluído  |
| 2026-07-29 | infra-001 — Database schema                                         | Concluído  |
| 2026-07-29 | ui-000 — Landing page                                               | Concluído  |
| 2026-07-29 | Verificação código vs docs                                          | Atualizado |
| 2026-07-30 | api-002 — Seed de exercícios                                        | Concluído  |
| 2026-07-30 | CORS + validação DATABASE_URL                                       | Concluído  |
| 2026-07-30 | Docs sync após api-002                                              | Atualizado |
| 2026-07-30 | Foco: backend rotas de usuário + frontend páginas                   | Iniciado   |
| 2026-07-31 | api-003 — Google OAuth → JWT                                        | Concluído  |
| 2026-08-02 | ui-001 — Login Google OAuth                                         | Concluído  |
| 2026-08-06 | Interceptor axios de auth (frontend)                                | Concluído  |
| 2026-08-07 | ui-009 — Página 404                                                 | Concluído  |
| 2026-08-10 | Confirm modals custom no design-system (substituem dialogs nativos) | Concluído  |
| 2026-08-10 | README.md stub inicial                                              | Adicionado |

2026-08-12 — ui-002 + ui-010 — Dashboard semanal e Header compartilhado implementados; 7 suítes/24 testes, typecheck, build e PascalCase verificados; lint sem erros (warning preexistente em api.ts).

2026-08-13 — ui-002 + ui-010 — Sessão centralizada em AuthContext, Header migrado para DropdownMenu shadcn/Radix e contratos HTTP validados por schemas Zod independentes no frontend/backend; 9 suítes/30 testes frontend e 6 suítes/31 testes backend, lint, format, typecheck, builds, PascalCase e Swagger verificados.

2026-08-14 — Documentação sincronizada com o backend atual: autenticação, seed, criação dos 7 treinos e `GET /api/workouts` implementados; rota por dia e demais operações ainda pendentes. Enum oficial usa `TERCA`; treinos vazios são válidos.

Estado do banco verificado em 2026-08-14: container PostgreSQL saudável e schema atualizado; 2 migrations aplicadas.

2026-08-14 — Documentação sincronizada com o fluxo OAuth2 atual, URLs CDN, modelo `exercise_id` (`VARCHAR(100)`), estrutura do projeto e estado atual da implementação.

2026-08-14 — api-005 — `GET /api/workouts/:weekDay` implementado com `TERCA` oficial, resposta completa dos exercícios, ordenação alfabética, filtro de ownership e documentação Swagger.

2026-08-15 — api-006 + busca inicial do ui-004 — `GET /api/exercises` implementado com paginação, total filtrado, busca accent-insensitive via PostgreSQL `unaccent`, contrato Zod, Swagger e cliente frontend com debounce de 1000 ms, paginação manual, campo sticky e carrossel de imagens; adição de exercícios continua dependente de api-005.

2026-08-18 — api-005 — `POST /api/workouts/:weekDay/exercises` implementado com validação Zod, ownership por usuário, respostas 400/401/404/409, criação com `done=false`, testes e documentação Swagger.

Estado atual em 2026-08-20: `api-005` está concluída; `api-008` (exclusão de conta) continua pendente. A busca, adição, marcação e limpeza de exercícios estão implementadas no backend e integradas à página de treino no frontend.

2026-08-20 — api-007 — `PATCH /api/workout-exercises/:id` alterna `done` com autenticação e ownership; `POST /api/workouts/:weekDay/clear` desmarca todas as associações do treino, com testes, Swagger e documentação atualizados.

2026-08-20 — ui-005 + ui-006 — página de treino integra marcação via PATCH e limpeza via POST com AlertDialog acessível, loading, tratamento de erros, atualização do cache e refetch dos resumos; testes frontend, lint, format e typecheck verificados.

2026-08-20 — api-005 — `DELETE /api/workouts/:weekDay/exercises/:exerciseId` remove a associação do exercício ao treino autenticado com filtro de ownership, respostas 200/401/404, testes de sucesso e falhas de autorização, annotation Swagger e spec regenerada.

2026-08-20 — ui-003 + issue #157 — página de treino integra remoção de exercícios com confirmação acessível, Escape, loading, erro genérico, atualização do contador e invalidação dos caches; testes frontend, lint, format, PascalCase e typecheck verificados.

2026-08-21 — refinamentos de UX no frontend — nomes completos de exercícios no dashboard e na página de treino, setas do carrossel sempre visíveis, imagens acima da dobra com carregamento eager e limpeza do treino desabilitada quando não há exercícios concluídos.

2026-08-21 — correções de autenticação e callback — callback OAuth protegido contra processamento duplicado e estados de sessão/carregamento ajustados para evitar telas incorretas durante a hidratação.

2026-08-24 — loading e recuperação padronizados — estados de carregamento migrados para o componente `Loading`, botões passaram a expor estado busy/disabled consistente e foram adicionados retries para dashboard, treino e busca de exercícios, com testes para sucesso e falha do retry.

Estado atual em 2026-08-26: as features implementadas permanecem concluídas; `api-008`, `ui-007`, `ui-008`, `ui-011` e `ui-012` continuam pendentes. O frontend inclui loading acessível, retry explícito para consultas, carregamento otimizado de imagens, preservação de nomes longos e card de exercício compartilhado entre treino e busca.

2026-08-24 — issue #149 — a busca e adição de exercícios foram movidas para um modal shadcn, com foco inicial na busca, Escape/fechamento acessíveis e retorno do foco ao botão disparador.

2026-08-26 — issue #197 — o card de exercício foi compartilhado entre a página de treino e a modal de adição, mantendo carrossel, metadados, músculos e instruções expansíveis; as ações ficaram contextuais (`Feito`/`Remover` no treino e `Adicionar` na busca), com `Instruções` antes da ação principal em telas menores. Testes do card, modal e página, lint, typecheck, build e PascalCase verificados.
