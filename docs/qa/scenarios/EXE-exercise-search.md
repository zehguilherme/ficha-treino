---
id: EXE-exercise-search
area: EXE
title: Pesquisar exercícios no Combobox
persona: Usuário de teclado
journey: J-exercise-search
expected: Enter ou seleção de sugestão exibem resultados completos, preservam o valor no campo e não adicionam automaticamente
entry_points: http://localhost:3000/treinos/<dia>/adicionar-exercicio
qa_status: blocked-verify
bug_ids:
fix_status:
retest_status:
fix_commits:
evidence:
last_report: ../reports/2026-09-09-combobox-search.md
overlaps:
---

Cobertura inclui consultas de um caractere, consultas longas, teclado, seleção, limpeza, estados vazio/erro e sobreposição visual.
