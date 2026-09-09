```mermaid
flowchart TD
  A[Entrada: página de adicionar exercício] --> B[Digita consulta curta ou longa]
  B --> C{Sugestões aparecem?}
  C -->|sim| D[Seleciona sugestão ou pressiona Enter]
  C -->|vazio/erro| E[Estado vazio ou erro legível]
  D --> F[Resultados completos exibidos e consulta preservada]
  F --> G[True end: usuário encontra o card sem inclusão automática]
  B -.-> H[Abandona e limpa o campo]
```

```yaml
journey:
  id: J-exercise-search
  name: Pesquisar exercício
  value_statement: "Encontrar um exercício no catálogo e visualizar seu card sem adicioná-lo por engano"
  personas: [Usuário de teclado, Usuário mobile]
  entry_points:
    - url: http://localhost:3000/treinos/<dia>/adicionar-exercicio
      origin: in-app-nav
  goal:
    observable: "Resultados completos aparecem e o nome pesquisado permanece no Combobox"
    side_effects: []
  true_end_state: "O card do exercício está visível e nenhuma mutação de adição ocorreu"
  exit:
    natural: "Usuário pode adicionar pelo botão do card ou iniciar nova busca"
  abandonment:
    - at_step: 2
      how: "Usuário clica em Limpar busca"
      resume: "Campo vazio e pronto para nova pesquisa"
  crosses: [frontend, GET /api/exercises]
```
