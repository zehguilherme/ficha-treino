# Session Handoff

## Última sessão

2026-07-29: Verificação do estado do código vs documentação — infra-001 e ui-000 marcados como concluídos.

## O que foi feito

- Verificado estado real do código (backend + frontend) vs docs
- `feature_list.json`: infra-001 corrigido de `not_started` → `passing`; ui-000 corrigido de `passes: false` → `passes: true`
- `progress.md`: feature ativa atualizada para api-002; histórico atualizado
- `session-handoff.md`: atualizado para refletir novo estado

## Feature ativa

`api-002` — Seed de exercícios

## Próximo passo

Criar `backend/src/seed.ts` — script que baixa `exercises-ptbr-full-translation.json` do GitHub e faz upsert dos exercícios usando Prisma Client, com `exercise_id` como PK.

## Branch

`develop`
