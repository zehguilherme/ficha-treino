---
name: documentation-sync
description: |
  Use after any code, schema, API, infrastructure, frontend UI, or design-system change
  in this project, before completing work. Reviews the relevant living documentation and
  updates only facts made outdated by the change; excludes historical plans and handoffs.
---

## Workflow

1. Identify the files changed by the current task and read the relevant code before editing documentation. Preserve unrelated working-tree changes; do not treat every existing diff as part of the task.
2. Compare the implementation with only the applicable living sources:
   - Backend routes or contracts: Swagger/OpenAPI, `backend/backend.md`, `specification.md`, and `frontend/frontend.md` when the client contract changes. Use `swagger-workflow` for endpoint changes.
   - Database, seed, or infrastructure: `specification.md`, `backend/backend.md`, and `README.md` only when its setup or architecture information changes.
   - Frontend behavior: `frontend/frontend.md` (routes, structure, state, and test catalog).
   - Visual tokens, reusable UI components, or interaction patterns: `design-system/design-system.md`.
   - Feature scope, status, or milestone: `feature_list.json` and `progress.md`.
   - Project-wide facts: `README.md` and `AGENTS.md` only when they become inaccurate.
3. Edit only documents with facts made stale by the current task. Do not add status-history entries for refactors without a user-visible or tracked-feature change.
4. Do not automatically update `docs/superpowers/` or `session-handoff.md`; they are historical context. Do not create missing documentation merely because a planned item mentions it.
5. Before completion, review the documentation diff against the code and validate modified JSON files. If no living document is affected, report that the review required no documentation edit.
