# Frontend — Ficha de Treino

## Propósito

Next.js App Router com TanStack Query para estado do servidor, Context API para sessão e `useState`
apenas para UI local. Tailwind usa os tokens HSL do design system.

## Páginas

| Rota | Responsabilidade |
| --- | --- |
| `/` | Landing pública, features e metadata social |
| `/login` | Login Google OAuth |
| `/auth/google/callback` | Callback transitório do OAuth |
| `/treinos` | Dashboard semanal com sete cards e expansão |
| `/treinos/[weekDay]` | Exercícios do dia, progresso e ações sticky |
| `/treinos/[weekDay]/adicionar-exercicio` | Busca, filtros, paginação e adição |
| `/minha-conta` | Perfil e exclusão de conta |

Rotas autenticadas usam `noindex, nofollow`; a origem canônica é `https://fichatreino.vercel.app`.
Dias aceitos são somente `domingo`, `segunda`, `terca`, `quarta`, `quinta`, `sexta` e `sabado`.
Valores inválidos não consultam a API e exibem retorno para `/treinos`.

## Estado e contratos

- TanStack Query mantém treinos, exercícios e mutações; erros oferecem retry manual.
- AuthContext mantém login/logout; `/minha-conta` reutiliza o perfil carregado.
- Schemas Zod próprios validam respostas HTTP na fronteira do cliente.
- A busca confirma nome e filtros somente por botão ou Enter, com AbortSignal e paginação de 20 itens.
- Após adicionar ou remover, os caches relacionados são invalidados e o feedback é acessível.

## Imagens e estrutura

Imagens usam `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{id}/{0|1}.jpg`.
Rotas ficam em `src/app/`; componentes compartilhados em `src/components/`; hooks, schemas e API em
`src/hooks/`, `src/schemas/` e `src/lib/`.

## Verificação

```bash
npm test
npm run lint
npm run format:check
npm run build
```

Para interface, executar também a checklist de UI/UX/acessibilidade abaixo e consultar o catálogo
detalhado em [`testing.md`](testing.md).

### Checklist de UI/UX/Acessibilidade

- Navegação por teclado, foco visível e `aria-label` em controles de ícone.
- Contraste somente com tokens HSL; estados hover, focus, active, disabled e error.
- Responsividade mobile-first, rolagem sem quebra e safe area nas barras fixas.
- Loading, empty state, erro e retry em consultas e mutações.
- Atualizações assíncronas sem perda de foco nem ações concorrentes indevidas.

## Constraints

- Não usar tipo `any`, export default ou rotas API do Next.js.
- Componentes em `src/components/` usam PascalCase; botões de produção usam o `Button` compartilhado.
- JWT permanece em localStorage; erros client-facing são genéricos e não expõem secrets ou stack traces.
- Toda alteração de frontend atualiza esta documentação quando seus fatos ficam obsoletos.

## Referências

- `frontend/testing.md` contém configuração, convenções e catálogo de testes.
- `design-system/design-system.md` resume tokens e componentes visuais.
- `specification.md` define requisitos funcionais e regras de negócio.
