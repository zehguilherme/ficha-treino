---
name: swagger-workflow
description: |
  Use when modifying or adding API endpoints in the backend.
  Ensures Swagger/OpenAPI documentation is checked before changes
  and every endpoint has @openapi JSDoc annotation.
  Trigger: "adicionar endpoint", "modificar rota", "criar rota",
  "documentação API", "swagger", "openapi", any backend route change.
---

## Workflow

1. Ler `src/swagger.ts` para entender a spec atual
2. Verificar endpoints existentes em `src/routes/`
3. Criar/modificar rota com annotation `@openapi` JSDoc
4. Validar com `npm run dev` + acesso a `/api/docs`
