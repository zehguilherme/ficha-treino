# Frontend — Ficha de Treino

## Propósito

Next.js App Router com TanStack Query (estado do servidor), Context API (sessão do usuário), `useState` apenas para UI local. Tailwind + ShadCN HSL tokens.

## Páginas

| Rota                    | Componente           | Descrição                                |
| ----------------------- | -------------------- | ---------------------------------------- |
| `/`                     | `HomePage`           | Landing page pública com hero + features |
| `/login`                | `LoginPage`          | Login com Google OAuth                   |
| `/auth/google/callback` | `GoogleCallbackPage` | Callback do OAuth Google                 |
| `/treinos`              | `DashboardPage`      | Grid semanal com 7 cards totalmente clicáveis, status e expansão de exercícios |
| `/treinos/[weekDay]`    | `WorkoutDayPage`     | Exercícios do dia + ações sticky + search |
| `/treinos/[weekDay]/adicionar-exercicio` | `AddExercisePage` | Catálogo paginado para adicionar exercícios |
| `/minha-conta`              | `AccountPage`           | Dados do perfil + excluir conta + retry em falha de carregamento |

Todas as rotas usam o metadata do Next.js com o padrão `<contexto> — Ficha de Treino`; a landing
mantém `Ficha de Treino — Seu treino organizado`. Cada página deve declarar o contexto no seu
`layout.tsx` ou `generateMetadata`, preferindo a composição pelo template do layout raiz. Em
segmentos aninhados onde o template não é herdado, usar `title.absolute` com o título final completo,
sem duplicar o sufixo. Toda nova rota deve incluir um teste de metadata. A rota dinâmica de treino
deriva o contexto do dia na URL (ou `Treino não encontrado` para parâmetros inválidos), sem consulta
adicional à API.
Home, login, dashboard, treinos, conta e 404 usam o rodapé compartilhado com links iconográficos
acessíveis para portfólio, GitHub, LinkedIn e e-mail, além do aviso “Todos os direitos reservados ©
ano atual” e do crédito “Feito por José Guilherme”; o callback do Google permanece sem rodapé por ser transitório.
A origem canônica é `https://fichatreino.vercel.app`; `sitemap.xml` lista apenas a home pública e
`robots.txt` bloqueia as áreas autenticadas. Login, callback, dashboard, conta e treinos usam
`noindex, nofollow`. A home publica metadados Open Graph (`website`, locale `pt_BR`, título,
descrição e URL canônica) e Twitter Card `summary_large_image`; `opengraph-image.tsx` gera o card
social PNG em 1200×630 com texto alternativo descritivo.

## Validação

Schemas Zod próprios do frontend validam respostas na fronteira HTTP. O Swagger documenta o
contrato público; schemas equivalentes no backend permanecem independentes.

## Imagens

CDN jsDelivr:

```
https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{id}/0.jpg
https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{id}/1.jpg
```

## Estado

- **TanStack Query**: cache de exercícios pesquisados, treinos e mutações de adicionar, marcar, limpar e remover exercícios; retry manual para consultas com erro. O dashboard recebe o resumo de cada treino com nome e status `done` de todos os exercícios e permite expandir listas longas sem abrir o dia. Durante a adição ou remoção, o estado visual de loading e `aria-busy` é individual do exercício confirmado, enquanto os demais botões permanecem desabilitados para evitar ações concorrentes. Toda ação assíncrona iniciada por botão deve usar o loading interno do componente `Button`, com texto contextual e `aria-busy`/`disabled` derivados do estado pendente.
- **Context API**: sessão do usuário (login/logout); a página `/minha-conta` reutiliza o perfil carregado (`name`, `email`) e exibe iniciais como avatar. Falhas ao carregar o perfil exibem modal de erro, estado contextual e botão `Tentar novamente` usando o refetch da consulta.
- A página `/minha-conta` usa cabeçalho próprio com link reutilizável de voltar para `/treinos`, título “Minha Conta” e menu de iniciais contendo somente “Sair”, sem o logo/menu de navegação do cabeçalho global; a ação de exclusão fica alinhada à direita no desktop e ocupa toda a largura no mobile.
- **`useState`**: input e texto pesquisado, filtros aplicados e provisórios, painel dedicado de filtros, carrossel e estados transitórios de retry

As rotas de treino usam somente slugs ASCII em minúsculas (`domingo`, `segunda`, `terca`, `quarta`, `quinta`, `sexta`, `sabado`); valores em maiúsculas ou fora dessa lista exibem o estado de treino inválido sem consultar a API. O frontend converte os slugs para os enums internos em maiúsculas antes das chamadas ao backend. A página dedicada de adição em `/treinos/[weekDay]/adicionar-exercicio` consulta `GET /api/exercises` somente após o botão `Pesquisar exercícios` ou `Enter` no campo, usando o cliente HTTP local com AbortSignal para cancelar consultas obsoletas. A faixa compacta de busca, abertura de filtros e chips permanece sticky abaixo do cabeçalho em qualquer largura, enquanto o painel expandido usa a rolagem natural da página. O wrapper dos controles usa `display: contents` para que a faixa sticky permaneça ativa durante a rolagem dos resultados; suas superfícies e a barra fixa de ações usam fundos opacos, sem efeito de vidro translúcido. Quando os filtros avançados estão abertos, os botões de ação ficam em uma barra fixa inferior responsiva; ao fechá-los, retornam à barra compacta. Texto e filtros editados não consultam a API automaticamente; a ação explícita normaliza o nome, confirma os filtros e inicia uma única consulta combinada. A página oferece um painel dedicado com os sete selects de categoria, equipamento, nível, força, mecânica e músculos primário/secundário, chips removíveis, paginação de 20 itens, instruções e estados de loading/erro. Após adicionar, os caches do treino/dashboard são invalidados, uma confirmação é exibida e o usuário retorna ao treino do dia. Parâmetros de dia inválidos exibem um estado contextual com retorno para `/treinos`, sem consultar a API de treinos.

Na busca de exercícios, o placeholder informa que a consulta é feita somente pelo nome do exercício. Com o painel fechado, `Limpar busca e filtros` fica à esquerda e `Pesquisar exercícios` à direita na faixa compacta; em telas menores, ambos ocupam toda a largura e ficam empilhados. Com o painel aberto, as mesmas ações passam para uma barra fixa inferior com safe area, empilhada no mobile e horizontal no desktop; o fundo da barra ocupa a viewport, mas seus controles ficam em um contêiner centralizado com a mesma largura máxima de `80rem` dos headers; os resultados recebem `pb-32` no mobile e `pb-24` a partir de `sm` para que o último card não fique encoberto. Os chips refletem imediatamente os valores selecionados nos filtros editáveis e cada um pode ser removido de forma independente, sem consulta automática; a nova combinação só é enviada após pesquisar, reposicionando a página no topo. A faixa de chips mantém largura mínima zero, limite de largura e contenção de overscroll horizontal para não expandir a página em telas estreitas. O botão de limpeza fica desabilitado quando não há filtros nem exercícios nos resultados. Quando expandido, o painel de filtros usa uma superfície clara `muted/50` com borda e espaçamento próprio; os selects permanecem em `card`. A pesquisa fecha o painel após confirmar texto e retorna o foco ao controle de filtros, enquanto uma pesquisa por texto desfoca o campo também no envio com `Enter`, permitindo visualizar os resultados no mobile sem o teclado virtual aberto.

O cabeçalho fixo da página de treino exibe o dia da semana e o progresso dos exercícios com o componente Shadcn `Progress`: texto explícito de exercícios concluídos, percentual e barra semântica; o dia não é repetido no conteúdo principal. A barra usa `success` quando todos estão concluídos e é omitida quando o treino está vazio. Em telas de até 640px, o rótulo visual usa o formato compacto `concluído/total` para caber na altura fixa do cabeçalho; acima desse breakpoint, o texto completo fica visível, e o nome completo permanece na semântica do indicador em todos os tamanhos.

Na página de treino, as ações `Adicionar exercício` e `Limpar treino` ficam em uma barra sticky opaca e compacta imediatamente abaixo do cabeçalho, com sombra sutil; os botões ficam centralizados verticalmente e mantêm os mesmos estados, foco e comportamento responsivo durante a rolagem.

## Estrutura atual

```
src/
  app/
    globals.css           (HSL tokens + Tailwind v4)
    layout.tsx            (root layout: Inter font, lang pt-BR)
    sitemap.ts            (sitemap da página pública)
    robots.ts             (regras de rastreamento)
    minha-conta/layout.tsx
    auth/google/callback/layout.tsx
    icon.svg              (favicon da aplicação)
    apple-icon.svg        (ícone para atalhos Apple)
    page.tsx              (HomePage — landing)
    login/page.tsx
    treinos/page.tsx
    treinos/[weekDay]/page.tsx
    treinos/[weekDay]/layout.tsx (metadata dinâmico por dia)
    treinos/[weekDay]/adicionar-exercicio/layout.tsx (metadata final da página)
    minha-conta/page.tsx
  components/
    ui/                   (ShadCN)
      Button.tsx
      Tooltip.tsx
      IconLink.tsx
      Loading.tsx
      AlertDialog.tsx
      ErrorAlertDialog.tsx
      Carousel.tsx
      Checkbox.tsx
      DropdownMenu.tsx
      Select.tsx
      FeatureCard.tsx
      ArrowRightIcon.tsx
      ChartIcon.tsx
      ClockIcon.tsx
      DocumentIcon.tsx
      DumbbellIcon.tsx
      Progress.tsx
    layout/
      Header.tsx
      UserInitialsButton.tsx
      UserMenu.tsx
      Footer.tsx
    auth/
      LoginForm.tsx
      LoginGate.tsx
    workout/
      AddExercisePage.tsx
      ClearWorkoutDialog.tsx
      RemoveWorkoutExerciseDialog.tsx
    account/
      AccountDeleteDialog.tsx
    exercise/
      ExerciseImageCarousel.tsx
      ExerciseTag.tsx
      ExerciseCard.tsx
  hooks/                  (autenticação Google)
  contexts/               (AuthContext)
  providers/              (QueryProvider)
  lib/
    api.ts                 (axios instance + interceptors + chamadas tipadas)
    auth.ts, dashboard.ts, exerciseImage.ts, utils.ts
  schemas/
    api.ts                 (contratos Zod das respostas HTTP)
```

### Combobox de busca

A busca de exercícios usa o componente genérico `Combobox`: ele encapsula seleção única, debounce de 300 ms, carregamento assíncrono de até cinco sugestões, estados de loading/empty/erro, teclado, portal diretamente abaixo do campo e botão acessível para limpar. Cada item pode fornecer uma chave estável por `itemToKey`; sem ela, o componente usa uma chave composta pelo rótulo e índice. O popup limita sua altura ao menor valor entre 20rem e o espaço disponível no viewport, mantendo rolagem quando o teclado virtual reduz a área visível. O estado vazio só é exibido após uma consulta não vazia; focar um campo sem pesquisar não abre resultados. Ao limpar busca e filtros, o foco retorna ao campo de busca. A página fornece apenas o carregador e a ação de busca completa; selecionar uma sugestão por clique ou teclado mantém o rótulo completo no campo e confirma a busca, mantendo a inclusão explícita pelos cards.

## Verificação

```bash
npm run lint && npm run format:check
npm run dev
# abrir http://localhost:3000
```

### Checklist de UI/UX/Acessibilidade

Toda alteração de interface, funcionalidade ou correção de bug deve passar pela verificação abaixo antes de considerar concluída — usar skill `ui-accessibility-check`:

- Navegação por teclado (Tab, Enter, Escape) — fluxo lógico e sem travamentos
- Contraste de cores respeitando os tokens HSL do `design-system/` — nunca cores hardcoded
- Foco visível (`--ring`) em todos os elementos interativos
- `aria-label` em botões de ícone (ex: `"Fechar"`, `"Remover exercício"`)
- Estados: hover, focus, active, disabled, error — todos mapeados
- Responsividade: containers com max-width, grid colapsa para 1 coluna em <640px
- Rolagem do carrossel com scroll-snap e sem quebra visual
- Loading, empty state e erro em mutações (TanStack Query)
- Atualizações dinâmicas (check/uncheck, add/remove) sem perda de foco do teclado

## Testes

Stack: **Jest 30 + `@swc/jest`** + **Testing Library** — mesma base do backend (transformação rápida sem typecheck; typecheck separado via `next build`).

```bash
npm test                # Todos os testes
npm run test:watch      # Modo watch
npm run test:coverage   # Com cobertura
npm run test:component-names  # Validação de nomenclatura PascalCase
```

### Configuração (`jest.config.ts`)

Transform SWC para TSX (React automatic runtime), ambiente jsdom, alias `@/`, setup com jest-dom:

```ts
/** @jest-config-loader esbuild-register */

import type { Config } from 'jest';

const config: Config = {
  transform: {
    '^.+\\.tsx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
};

export default config;
```

### Convenções

- **Arquivos:** `src/**/*.test.{ts,tsx}` junto ao módulo testado
- **Estrutura:** `describe('ModuleName')` → `test('action when condition')`
- **Idioma:** Inglês
- **JSDoc:** Todo `test` deve ter um comentário JSDoc acima com a estrutura 3-partes:
  1. Descrição do cenário
  2. Detalhes do mock/setup
  3. `Assert:` o que é verificado

  Exemplo:

  ```ts
  /**
   * Happy path: valid token reaches the handler.
   * Assert: 200 and body echoes req.user.
   */
  test('populates req.user and calls next with valid token', async () => { ... });
  ```

- **Mocking:** `jest.mock` para módulos (ex.: `next/navigation`, hooks); mocks referenciados em factories devem ser avaliados lazy (closures) para evitar TDZ do hoisting do `jest.mock`
- **Mocks de API:** módulo `@/lib/api` mockado via `jest.mock`, `jest.clearAllMocks()` em `beforeEach`
- **Navegação:** `window.location` é non-configurable no jsdom (não é spy-able) — hooks que navegam recebem um `navigate` injetável (ex.: `useGoogleLogin(navigate)`) para o teste capturar a URL alvo

### Catálogo

#### `src/lib/auth.test.ts`

Testes unitários dos helpers de sessão (`setSession`/`getSession`/`clearSession` com `localStorage`).

| Teste                                           | Tipo | Cenário                         | Assert principal              |
| ----------------------------------------------- | ---- | ------------------------------- | ----------------------------- |
| setSession stores the token in localStorage     | unit | chama `setSession('jwt-token')` | `localStorage` contém o token |
| getSession returns null when no token is stored | unit | localStorage vazio              | retorna `null`                |
| getSession returns the stored token             | unit | token armazenado                | retorna o token               |
| clearSession removes the stored token           | unit | chama `clearSession()`          | `getSession()` retorna `null` |

#### `src/hooks/useGoogleLogin.test.ts`

Testes unitários do hook de login Google (URL OAuth + state anti-CSRF + redirect).

| Teste                                                     | Tipo | Cenário                                      | Assert principal                                                                                    |
| --------------------------------------------------------- | ---- | -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| builds the Google OAuth URL with all required params      | unit | `buildAuthUrl(clientId, redirectUri, state)` | params `client_id`, `redirect_uri`, `response_type=code`, `scope`, `prompt=select_account`, `state` |
| returns error when the Google client id is not configured | unit | sem `NEXT_PUBLIC_GOOGLE_CLIENT_ID`           | `status === 'error'` + mensagem PT-BR, sem state                                                    |
| stores the OAuth state and redirects to Google            | unit | clientId configurado                         | `navigate` recebe URL do Google; `sessionStorage` guarda o mesmo `state` da URL                     |

#### `src/components/auth/LoginForm.test.tsx`

Testes de componente do formulário de login (hook mockado).

| Teste                                    | Tipo      | Cenário          | Assert principal                                 |
| ---------------------------------------- | --------- | ---------------- | ------------------------------------------------ |
| renders the Google login button          | component | status `idle`    | botão "Entrar com Google" presente               |
| starts the Google login flow on click    | component | clique no botão  | `startLogin` chamado 1x                          |
| shows loading state while logging in     | component | status `loading` | botão desabilitado + `aria-busy` + "Entrando..." |
| shows the error message when login fails | component | status `error`   | mensagem em `role="alert"`                       |

#### `src/app/auth/google/callback/page.test.tsx`

Testes de integração da callback page (`@/lib/api` e `next/navigation` mockados).

| Teste                                                        | Tipo        | Cenário                                                      | Assert principal                                                                      |
| ------------------------------------------------------------ | ----------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| exchanges the code and redirects to the workouts page on success | integration | `code`+`state` válidos, API retorna token                    | `exchangeGoogleCode` chamado com o `code`, `setSession(token)`, redirect `/treinos` |
| shows an error when the OAuth state does not match           | integration | `state` divergente                                           | alerta de falha, `sessionStorage` limpo, sem chamada à API                            |
| shows an error when code or state is missing                 | integration | URL sem `code`/`state`                                       | alerta de falha                                                                       |
| redirects to login when the user denies access               | integration | `error=access_denied`                                        | redirect `/login`, sem chamada à API                                                  |
| shows an error when the backend rejects the code             | integration | `exchangeGoogleCode` rejeita com AxiosError (com `response`) | alerta "Não foi possível autenticar"                                                  |
| shows a connection error when the API call fails             | integration | `exchangeGoogleCode` rejeita com `Error` (rede)              | alerta "Não foi possível conectar ao servidor"                                        |

#### `src/app/treinos/DashboardClient.test.tsx`

Testes do dashboard para hidratação da autenticação, carregamento dos treinos, cards totalmente clicáveis, status/expansão de exercícios, nomes longos e retry com sucesso ou falha.

#### `src/app/treinos/[weekDay]/page.test.tsx`

Testes da página de treino para carregamento, retry do treino e da busca, adição, marcação, limpeza, remoção, estados de erro e carregamento das imagens.

- renderiza exercícios e contador `done/total`;
- envia o ID da associação ao alternar o checkbox;
- adiciona exercícios pela busca, mostra loading apenas no exercício confirmado e atualiza o treino;
- confirma a limpeza, mostra estado pendente e atualiza os dados.
- tenta novamente após falha do treino ou da busca e restaura o erro quando o retry falha;
- remove exercícios, mostra loading apenas no exercício confirmado, trata falhas de remoção e prioriza a primeira imagem acima da dobra.
- exibe estado contextual e link para o dashboard quando o parâmetro do dia é inválido, sem chamar a API de treinos.

#### `src/app/treinos/[weekDay]/layout.test.ts`

Testa o metadata da rota dinâmica para dia válido e parâmetro inválido.

#### `src/app/sitemap.test.ts` e `src/app/robots.test.ts`

Testam a lista de URLs públicas, as regras para áreas privadas e a referência ao sitemap.

#### `src/app/layout.test.ts`

Testa a origem canônica de produção e os metadados Open Graph/Twitter definidos no metadata raiz.

#### `src/app/opengraph-image.test.tsx`

Testa as dimensões, o tipo, o texto alternativo e o conteúdo da imagem social gerada para a home.

#### `src/components/ui/Loading.test.tsx`

Testa o componente de loading reutilizável, incluindo mensagem em português, `aria-live` e status acessível.

#### `src/components/ui/IconLink.test.tsx`

Testa o link reutilizável com ícone, texto acessível e destino de navegação.

#### `src/components/layout/UserInitialsButton.test.tsx`

Testa as iniciais, o nome acessível e os tokens visuais do botão reutilizável do usuário.

#### `src/components/layout/UserMenu.test.tsx`

Testa as variantes do menu autenticado, a ação de logout e a navegação por teclado com restauração de foco.

#### `src/components/workout/ClearWorkoutDialog.test.tsx`

Testes do diálogo de confirmação de limpeza, incluindo confirmação, cancelamento, Escape e estado pendente.

#### `src/components/exercise/ExerciseCard.test.tsx`

Testa o card compartilhado de exercícios, incluindo metadados, ações, expansão das instruções e explicação acessível dos níveis.

#### `src/components/exercise/ExerciseTag.test.tsx`

Testa a pílula reutilizável de rótulo/valor e a omissão de valores vazios.

#### `src/app/treinos/[weekDay]/adicionar-exercicio/page.test.tsx`

Testa a página dedicada, o retorno acessível ao treino do dia, a navegação automática após adicionar um exercício, o loading interno das ações assíncronas, a explicação do filtro de nível e o comportamento responsivo do shell de busca, filtros e ações.

#### `src/components/ui/Combobox.test.tsx`

Testa o debounce do carregador assíncrono, seleção com rótulo completo por clique e por `Enter`, submissão da busca, limite responsivo de altura do popup, erros, limpeza, Escape e chaves únicas para rótulos duplicados.

#### `src/app/treinos/[weekDay]/adicionar-exercicio/layout.test.ts`

Testa o título final da página de adição, a política `noindex, nofollow` e a compatibilidade com o template global da aba.

#### `src/lib/api.test.ts`

Testes dos interceptors da instância axios (injeção do JWT e limpeza de sessão no 401).

| Teste                                                        | Tipo | Cenário                                | Assert principal                              |
| ------------------------------------------------------------ | ---- | -------------------------------------- | --------------------------------------------- |
| attaches Authorization header when a session token exists    | unit | `setSession(TOKEN)` + adapter mock 200 | request carrega `Authorization: Bearer TOKEN` |
| does not attach Authorization header without a session token | unit | sem token + adapter mock 200           | sem header `Authorization`                    |
| clears the session when the API responds 401                 | unit | token armazenado + adapter mock 401    | request rejeita e `localStorage` limpo        |

## Constraints

- **Nunca** usar tipo `any` — toda variável, parâmetro e retorno de função deve ter tipo explícito — usar skill `type-safety-staged`
- Sem rotas de API do Next.js — tudo via Express separado
- JWT armazenado em localStorage; interceptor da instância axios injeta `Authorization: Bearer <token>` em toda request e, em 401, limpa a sessão e redireciona para `/login`
- Sem API externa de exercícios — tudo via backend local
- SVGs na UI devem ser componentes React em arquivos separados (ex: `ArrowLeftIcon.tsx`), nunca inline no JSX. Se um SVG já existe inline, extrair para componente.
- Componentes em `src/components/` devem usar PascalCase (ex: `Button.tsx`, `FeatureCard.tsx`). Arquivos em `src/app/` são exceção (rotas Next.js) — usar skill `component-naming-pascalcase`.
- No código de produção do frontend, botões devem renderizar `Button` de `src/components/ui/Button.tsx`; links com estilo de botão devem usar `<Button asChild>` envolvendo `next/link`. Links de texto simples usam `next/link` diretamente. Fixtures de teste podem usar elementos nativos quando isso for necessário para isolar o comportamento testado.
- O `Button` compartilhado garante 40px de altura para ações primárias (`default`), secundárias (`outline`) e terciárias (`ghost`); `sm` (32px), `lg` (44px), `icon`, CTA e login são exceções semânticas. Os CTAs da home e do login usam `h-auto` local para preservar seus paddings específicos; novos botões comuns devem escolher apenas a variante/tamanho e não definir altura local. Alterações nessa regra devem atualizar `Button.test.tsx`.
- **Nunca** expor nomes de variáveis de ambiente, secrets, tokens ou stack traces em mensagens ao usuário, `console.*` ou respostas HTTP. Erros devem ser genéricos no cliente.
