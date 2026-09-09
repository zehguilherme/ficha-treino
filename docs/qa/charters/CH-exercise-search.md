# CH-exercise-search: validar pesquisa do Combobox

```yaml
charter:
  id: CH-exercise-search
  mission: "Encontrar falhas funcionais, visuais e de teclado na pesquisa de exercícios"
  mode: charter-with-tour
  persona:
    name: Usuário de teclado
    device: laptop
    network: wifi-fast
    locale: pt-BR
  journey: J-exercise-search
  scenarios: [EXE-exercise-search]
  tour: happy-path
  time_box_minutes: 30
  guidance:
    must_try:
      - "Pesquisar com um caractere e com uma consulta longa"
      - "Pressionar Enter e confirmar resultados e valor preservado"
      - "Selecionar sugestão e confirmar que não houve adição automática"
      - "Verificar popup abaixo do campo, sobre filtros, em desktop e mobile"
    must_avoid:
      - "Alterar dados do treino"
```
