---
name: ui-accessibility-check
description: |
  Use after ANY frontend interface change (components, pages,
  features, bug fixes). Runs the accessibility/UX checklist
  before marking work complete.
  Trigger: "componente", "interface", "UI", "página", "layout",
  any frontend visual change.
---

## Checklist

- Navegação por teclado (Tab, Enter, Escape) — fluxo lógico e sem travamentos
- Contraste de cores respeitando os tokens HSL do `design-system/` — nunca cores hardcoded
- Foco visível (`--ring`) em todos os elementos interativos
- `aria-label` em botões de ícone (ex: `"Fechar"`, `"Remover exercício"`)
- Estados: hover, focus, active, disabled, error — todos mapeados
- Responsividade: containers com max-width, grid colapsa para 1 coluna em <640px
- Rolagem do carrossel com scroll-snap e sem quebra visual
- Loading, empty state e erro em mutações (TanStack Query)
- Atualizações dinâmicas (check/uncheck, add/remove) sem perda de foco do teclado
