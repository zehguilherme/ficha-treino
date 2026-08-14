# Progresso — Ficha de Treino

## Feature atual

**Usuário: backend routes + frontend pages**

Tudo relacionado ao usuário: autenticação, gerenciamento de treinos, busca e marcação de exercícios, conta, e as páginas do frontend.

## Próximos passos

### Backend (rotas de usuário)

1. api-005: concluir `GET /api/workouts/:weekDay` e operações de adição/remoção
2. api-006: Busca de exercícios
3. api-007: Marcar/desmarcar exercícios
4. api-008: Excluir conta

### Frontend (páginas de usuário)

7. ui-001: Tela de login
8. ui-002: Dashboard
9. ui-003: Workout day
10. ui-004: Search UI
11. ui-005: Checkbox + carrossel
12. ui-006: Limpar treino
13. ui-007: Minha conta
14. ui-008: Modal exclusão
15. ui-009: Página 404
16. ui-010: Header logo link
17. ui-011: Favicon
18. ui-012: Page transitions (Motion)

### Demais

19. infra-002: Mover design-system/ para docs/
20. tool-003: Pular deploy Vercel backend-only
21. tool-004: README.md + README-en.md

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

2026-08-14 — Documentação sincronizada com o backend atual: autenticação, seed, criação dos 7 treinos e `GET /api/workouts` implementados; rota por dia e demais operações ainda pendentes. Enum oficial usa `TERÇA`; treinos vazios são válidos.

Estado do banco verificado em 2026-08-14: container PostgreSQL saudável e schema atualizado; 2 migrations aplicadas.
