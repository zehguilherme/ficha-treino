---
id: UI-pwa-install-position
area: UI
title: Usar controles com a pílula de instalação visível
persona: Usuário mobile
journey: J-pwa-install-position
expected: "Em viewport mobile e desktop, nenhum controle importante fica totalmente coberto pela pílula de instalação"
entry_points: http://localhost:3000/; http://localhost:3000/treinos/<dia>; http://localhost:3000/treinos/<dia>/adicionar-exercicio; http://localhost:3000/minha-conta
qa_status: pass
bug_ids:
fix_status:
retest_status:
fix_commits:
evidence: ../reports/2026-09-30-pwa-install-position.md
last_report: ../reports/2026-09-30-pwa-install-position.md
overlaps:
---

Cobertura: rotas públicas e autenticadas, sete dias de treino e sete rotas de busca, topo e fim da rolagem, filtros abertos, diálogos, footer e viewport mobile/desktop.
