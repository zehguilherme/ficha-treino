---
name: documentation-sync
description: |
  Use after any code, schema, API, infrastructure, frontend UI, or design-system change
  in this project, before completing work. Review the relevant living documentation for
  architecture, database, features, progress, and session continuity; update only facts
  made outdated by the change. Do not use for historical plans in `docs/superpowers/`.
---

## Workflow

1. Identify the files changed by the current task and read the relevant code before editing documentation. Preserve unrelated working-tree changes; do not treat every existing diff as part of the task.
2. Compare the implementation with only the applicable living sources:
   - Backend routes or contracts: Swagger/OpenAPI, `backend/backend.md`, `specification.md`, and `frontend/frontend.md` when the client contract changes. Use `swagger-workflow` for endpoint changes.
   - Database, seed, or infrastructure: `database.excalidraw`, `specification.md`, `backend/backend.md`, and `README.md` when the data model, tables, relationships, constraints, seed, setup, or architecture changes. Review `database.excalidraw` as structured JSON and update it only when the diagram is stale.
   - Frontend behavior: `frontend/frontend.md` (routes, structure, state, and test catalog). For every visual or functional frontend change, update the affected final HTML pages in `design-system/pages/*.html` so their structure, states, interactions, copy, tokens, and relevant accessibility behavior stay aligned with the implemented pages. Update previews, source examples, or UI kits only when they directly represent the changed behavior.
   - Design-system specification: `design-system/DESIGN.md` when tokens, typography, palette, spacing, layout, responsiveness, components, interactions, accessibility, or visual voice rules change. Treat it as the detailed specification and update only affected sections.
   - Design-system summary: `design-system/design-system.md` when project-specific tokens, reusable UI components, or interaction patterns change. Keep it as the operational summary and avoid duplicating the full specification.
   - Design-system package: `design-system/README.md` when package structure, manifests, previews, assets, source screens, or reuse/review workflows change. Do not update it for application-only changes that do not affect the package.
   - Applied UI kit: `design-system/ui_kits/app/README.md` when UI kit components or their files, actions, variants, usage patterns, or source basis change.
   - Feature scope, status, or milestone: `feature_list.json` and `progress.md`. Update `feature_list.json` when a tracked feature's behavior, verification, evidence, scope, or status changes. Update `progress.md` when the current state, next steps, or meaningful history changes; do not add artificial history for routine refactors.
   - Session continuity: `session-handoff.md` when the current state, completed work, next steps, relevant files, verification results, branch, or continuation instructions change. Preserve its existing format and treat it as the operational handoff, not immutable history.
   - Project-wide facts: `README.md` and `AGENTS.md` only when they become inaccurate.
3. Edit only documents with facts made stale by the current task. Do not add status-history entries for refactors without a user-visible or tracked-feature change.
4. Keep `docs/superpowers/` excluded as historical documentation. Do not create missing documentation merely because a planned item mentions it.
5. Before completion, review the documentation diff against the code and validate every modified JSON file, including `database.excalidraw` when changed. If no living document is affected, report that the review required no documentation edit.
