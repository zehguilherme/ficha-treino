# Progresso — Ficha de Treino

## Feature atual

**Usuário: backend routes + frontend pages**

Tudo relacionado ao usuário: autenticação, gerenciamento de treinos, busca e marcação de exercícios, conta, e as páginas do frontend.

## Próximos passos

### Backend (rotas de usuário)

1. Nenhuma pendência de backend na feature atual

### Frontend (páginas de usuário)

3. ui-011: Favicon
4. ui-012: Page transitions (Motion)

### Demais

7. infra-002: Mover design-system/ para docs/
8. tool-003: Pular deploy Vercel backend-only
9. tool-004: README.md + README-en.md

## Histórico

| Data       | Feature                                                             | Status     |
| ---------- | ------------------------------------------------------------------- | ---------- |
| 2026-07-20 | Harness modular                                                     | Criado     |
| 2026-07-20 | Next.js scaffolding                                                 | Concluído  |
| 2026-07-20 | Harness files review                                                | Atualizado |
| 2026-07-21 | tool-001 — PascalCase componentes                                   | Concluído  |
| 2026-07-21 | api-001b — Scaffold Express                                         | Concluído  |
| 2026-07-21 | api-001 — Docker Compose + PostgreSQL                               | Concluído  |
| 2026-07-29 | infra-001 — Database schema                                         | Concluído  |
| 2026-07-29 | ui-000 — Landing page                                               | Concluído  |
| 2026-07-29 | Verificação código vs docs                                          | Atualizado |
| 2026-07-30 | api-002 — Seed de exercícios                                        | Concluído  |
| 2026-07-30 | CORS + validação DATABASE_URL                                       | Concluído  |
| 2026-07-30 | Docs sync após api-002                                              | Atualizado |
| 2026-07-30 | Foco: backend rotas de usuário + frontend páginas                   | Iniciado   |
| 2026-07-31 | api-003 — Google OAuth → JWT                                        | Concluído  |
| 2026-08-02 | ui-001 — Login Google OAuth                                         | Concluído  |
| 2026-08-06 | Interceptor axios de auth (frontend)                                | Concluído  |
| 2026-08-07 | ui-009 — Página 404                                                 | Concluído  |
| 2026-08-10 | Confirm modals custom no design-system (substituem dialogs nativos) | Concluído  |
| 2026-08-10 | README.md stub inicial                                              | Adicionado |

2026-08-12 — ui-002 + ui-010 — Dashboard semanal e Header compartilhado implementados; 7 suítes/24 testes, typecheck, build e PascalCase verificados; lint sem erros (warning preexistente em api.ts).

2026-08-13 — ui-002 + ui-010 — Sessão centralizada em AuthContext, Header migrado para DropdownMenu shadcn/Radix e contratos HTTP validados por schemas Zod independentes no frontend/backend; 9 suítes/30 testes frontend e 6 suítes/31 testes backend, lint, format, typecheck, builds, PascalCase e Swagger verificados.

2026-08-14 — Documentação sincronizada com o backend atual: autenticação, seed, criação dos 7 treinos e `GET /api/workouts` implementados; rota por dia e demais operações ainda pendentes. Enum oficial usa `TERCA`; treinos vazios são válidos.

Estado do banco verificado em 2026-08-14: container PostgreSQL saudável e schema atualizado; 2 migrations aplicadas.

2026-08-14 — Documentação sincronizada com o fluxo OAuth2 atual, URLs CDN, modelo `exercise_id` (`VARCHAR(100)`), estrutura do projeto e estado atual da implementação.

2026-08-14 — api-005 — `GET /api/workouts/:weekDay` implementado com `TERCA` oficial, resposta completa dos exercícios, ordenação alfabética, filtro de ownership e documentação Swagger.

2026-08-15 — api-006 + busca inicial do ui-004 — `GET /api/exercises` implementado com paginação, total filtrado, busca accent-insensitive via PostgreSQL `unaccent`, contrato Zod, Swagger e cliente frontend com debounce de 1000 ms, paginação manual, campo sticky e carrossel de imagens; adição de exercícios continua dependente de api-005.

2026-08-18 — api-005 — `POST /api/workouts/:weekDay/exercises` implementado com validação Zod, ownership por usuário, respostas 400/401/404/409, criação com `done=false`, testes e documentação Swagger.

Estado atual em 2026-08-20: `api-005` está concluída; `api-008` (exclusão de conta) continua pendente. A busca, adição, marcação e limpeza de exercícios estão implementadas no backend e integradas à página de treino no frontend.

2026-08-20 — api-007 — `PATCH /api/workout-exercises/:id` alterna `done` com autenticação e ownership; `POST /api/workouts/:weekDay/clear` desmarca todas as associações do treino, com testes, Swagger e documentação atualizados.

2026-08-20 — ui-005 + ui-006 — página de treino integra marcação via PATCH e limpeza via POST com AlertDialog acessível, loading, tratamento de erros, atualização do cache e refetch dos resumos; testes frontend, lint, format e typecheck verificados.

2026-08-20 — api-005 — `DELETE /api/workouts/:weekDay/exercises/:exerciseId` remove a associação do exercício ao treino autenticado com filtro de ownership, respostas 200/401/404, testes de sucesso e falhas de autorização, annotation Swagger e spec regenerada.

2026-08-20 — ui-003 + issue #157 — página de treino integra remoção de exercícios com confirmação acessível, Escape, loading, erro genérico, atualização do contador e invalidação dos caches; testes frontend, lint, format, PascalCase e typecheck verificados.

2026-08-21 — refinamentos de UX no frontend — nomes completos de exercícios no dashboard e na página de treino, setas do carrossel sempre visíveis, imagens acima da dobra com carregamento eager e limpeza do treino desabilitada quando não há exercícios concluídos.

2026-08-21 — correções de autenticação e callback — callback OAuth protegido contra processamento duplicado e estados de sessão/carregamento ajustados para evitar telas incorretas durante a hidratação.

2026-08-24 — loading e recuperação padronizados — estados de carregamento migrados para o componente `Loading`, botões passaram a expor estado busy/disabled consistente e foram adicionados retries para dashboard, treino e busca de exercícios, com testes para sucesso e falha do retry.

Estado atual em 2026-09-03: as features implementadas permanecem concluídas; `ui-011` e `ui-012` continuam pendentes. O frontend inclui loading acessível, retry explícito para consultas, carregamento otimizado de imagens, preservação de nomes longos e card de exercício compartilhado entre treino e busca. A busca backend agora aceita filtros por listas fixas, enquanto a UI dos filtros permanece na issue #174.

2026-09-01 — api-008 — `DELETE /api/account` implementado com autenticação JWT, exclusão do usuário via cascata de banco, respostas 200/401/404, testes de rota e documentação Swagger sincronizada.

2026-09-01 — ui-007 + ui-008 — página `/account` e modal de confirmação implementados com perfil, iniciais como avatar, exclusão autenticada, loading, erro genérico, Escape, acessibilidade e redirecionamento para `/login`.

2026-08-24 — issue #149 — a busca e adição de exercícios foram movidas para um modal shadcn, com foco inicial na busca, Escape/fechamento acessíveis e retorno do foco ao botão disparador.

2026-08-26 — issue #197 — o card de exercício foi compartilhado entre a página de treino e a modal de adição, mantendo carrossel, metadados, músculos e instruções expansíveis; as ações ficaram contextuais (`Feito`/`Remover` no treino e `Adicionar` na busca), com `Instruções` antes da ação principal em telas menores. Testes do card, modal e página, lint, typecheck, build e PascalCase verificados.

2026-08-27 — issue #174 — modal de adição passou a consumir os filtros fixos de exercícios com selects Radix/shadcn, labels PT-BR, limpeza acessível, combinação com nome, reinício da paginação e testes frontend.

2026-08-27 — refinamento de UX da issue #174 — busca mantida visível, filtros agrupados em seção recolhível inicialmente fechada, filtros ativos exibidos como chips removíveis e rolagem restrita à lista de resultados; `ExerciseCard` preservado.

2026-08-27 — refinamento visual dos selects — placeholder dos filtros usa `muted-foreground` e valores selecionados usam `foreground` no componente base `Select`, com cobertura de teste compartilhada.

2026-08-27 — controle de filtros avançados — botão expansível recebeu o mesmo tratamento visual do `SelectTrigger`, mantendo a semântica de expansão e sem label externo.

2026-08-27 — padronização de textos de formulário — inputs comuns passaram a usar `foreground` também no placeholder; somente placeholders de `Select` permanecem diferenciados com `muted-foreground`.

2026-08-27 — ajuste final de contraste dos formulários — inputs comuns e estados sem seleção usam `muted-foreground`; somente valores selecionados nos `Select` usam `foreground`.

2026-08-27 — padronização tipográfica dos formulários — `Input`, `SelectTrigger` e o controle `Filtros avançados` usam família sans-serif, `text-sm`, peso normal e espaçamento normal.

2026-08-27 — espaço de resultados na modal — filtros recolhem automaticamente após a consulta terminar, mantendo chips e contagem de filtros ativos visíveis para recuperar a área de rolagem dos exercícios.

2026-08-27 — feedback do recolhimento de filtros — aviso acessível informa que os filtros foram fechados para ampliar a área dos resultados e some ao reabrir a seção ou resetar a modal.

2026-08-27 — limpeza independente da busca — o X do campo textual limpa somente a busca e preserva os filtros selecionados; o reset completo permanece restrito ao fechamento da modal e à conclusão da adição.

2026-08-27 — painel dedicado de filtros — filtros passaram a ser editados em um painel interno com rolagem própria, estado provisório, confirmação/cancelamento, foco no primeiro select e faixa horizontal de chips ativos; busca e resultados ficam separados da edição dos filtros.

2026-08-28 — distinção visual do painel de filtros — a área expandida recebeu superfície clara `muted/50`, borda e espaçamento próprios, mantendo os selects em `card` e o rodapé dentro da mesma região.

2026-08-28 — ações responsivas dos filtros — em telas menores, `Limpar filtros`, `Cancelar` e `Aplicar filtros` passaram a ocupar 100% da largura e ficar empilhados, preservando a ação primária por último.

2026-08-28 — busca com filtros abertos — o debounce da busca textual foi reduzido para 400 ms e a modal passou a informar espera, carregamento e conclusão enquanto o painel de filtros oculta temporariamente os resultados.

2026-08-28 — pesquisa manual na modal — busca por nome e filtros só consultam a API após `Pesquisar exercícios` ou `Enter`; a ação confirma texto e filtros juntos, reinicia a paginação e fecha o painel.

2026-08-28 — ações de busca e filtros — `Cancelar` foi removido; `Limpar busca e filtros` reseta texto, selects e chips, retorna ao estado inicial sem resultados e fecha o painel, enquanto recolher filtros preserva os valores editados.

2026-08-28 — estado da limpeza — `Limpar busca e filtros` fica desabilitado quando não há filtros ativos nem exercícios nos resultados.

2026-08-28 — refinamento das ações e chips — as ações foram posicionadas após o painel e seus selects, com ordem responsiva preservada; chips passaram a refletir imediatamente os valores provisórios selecionados, sem iniciar consulta.

2026-08-28 — remoção manual de filtros — remover uma pílula altera apenas os filtros provisórios; a busca permanece inalterada até uma nova confirmação pelo botão ou `Enter`, inclusive ao remover o último filtro.

2026-08-28 — reset ao fechar a modal — fechar e reabrir a modal limpa a solicitação do catálogo, garantindo início sem pesquisa, filtros, chips ou resultados.
2026-08-31 — issue #220 — o cabeçalho fixo da página de treino passou a exibir progresso textual e barra Shadcn com percentual, pluralização, estado de sucesso ao concluir todos os exercícios e estado vazio sem barra; testes e protótipo estático sincronizados.
2026-08-31 — ajuste responsivo da issue #220 — o rótulo visual do progresso usa `concluído/total` até 640px, evitando quebra de linha e estouro da altura fixa do cabeçalho; acima desse breakpoint, a descrição completa fica visível e permanece acessível em todos os tamanhos.

2026-09-01 — refinamento do card de exercícios — o `ExerciseCard` compartilhado passou a exibir nível, tipo de força e mecânica em faixa responsiva, mantendo instruções expansíveis e cobrindo valores opcionais ausentes; a busca reutiliza automaticamente o novo resumo.

2026-09-01 — ajuste responsivo dos metadados — os três detalhes agora usam flex-wrap em todas as larguras, mantendo cada item unido e transferindo-o para a linha seguinte apenas quando necessário.

2026-09-01 — identificação das pílulas — categoria e equipamento agora exibem seus próprios rótulos dentro das pílulas, mantendo os valores fáceis de interpretar durante a filtragem.

2026-09-01 — alinhamento dos metadados — os valores de nível, força e mecânica agora começam sob o texto dos respectivos rótulos, compensando o espaço ocupado pelos ícones.

2026-09-01 — acessibilidade do card — o botão de instruções agora declara `type="button"` e referencia seu painel com `aria-controls`, que permanece identificável mesmo quando recolhido.

2026-09-01 — issue #177 — `GET /api/workouts` passou a retornar cada exercício do resumo com `name` e `done`; o dashboard exibe o status concluído, lista até oito itens e permite revelar o restante por botão acessível, com testes de teclado e documentação Swagger sincronizada.

2026-09-01 — refinamento da issue #177 — o link voltou a envolver visualmente o conteúdo do card e se estende por toda a superfície interna com margem negativa; o nome do dia permanece sem sublinhado e o botão de expansão usa o tratamento textual sublinhado do link anterior.

2026-09-01 — ajuste de área clicável da issue #177 — o link ocupa toda a largura e altura do card nos estados com e sem botão de expansão, usando espaçamento inferior condicional para não reservar área extra em cards sem botão.

2026-09-01 — correção de altura da área clicável da issue #177 — cards em uma mesma linha agora usam coluna flexível e o link `flex-1`, cobrindo também a altura esticada pelo grid quando não há botão de expansão.

2026-09-03 — issue #193 — metadata Open Graph e Twitter Card adicionados à home; card social PNG 1200×630 gerado pela convenção `opengraph-image.tsx`, com testes de contrato e conteúdo.
