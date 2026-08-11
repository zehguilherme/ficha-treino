---
name: component-naming-pascalcase
description: |
  Use when creating or renaming React components in frontend/src/components/.
  Ensures PascalCase naming convention.
  Trigger: "componente", "criar componente", "renomear arquivo componente".
---

## Regras

- Arquivos em `src/components/` → PascalCase (ex: `Button.tsx`)
- Exceção: arquivos em `src/app/` (rotas Next.js)
- Validar com `npm run test:component-names`
