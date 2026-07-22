---
name: type-safety-no-any
description: |
  Use when writing or reviewing TypeScript code in frontend or backend.
  Ensures no `any` type is used — every variable, parameter,
  and return type must be explicit.
  Trigger: "any", "tipo", "tipagem", "typescript", "type annotation".
---

## Regras

- Proibir `any` em variáveis, parâmetros e retornos
- Criar `type` ou `interface` próprio se necessário
- Verificar com `npm run lint && npm run format:check`
