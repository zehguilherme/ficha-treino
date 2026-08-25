# Frontend — Ficha de Treino

## Propósito

Next.js App Router com TanStack Query (estado do servidor), Context API (sessão do usuário), `useState` apenas para UI local. Tailwind + ShadCN HSL tokens.

## Páginas

| Rota                    | Componente           | Descrição                                |
| ----------------------- | -------------------- | ---------------------------------------- |
| `/`                     | `HomePage`           | Landing page pública com hero + features |
| `/login`                | `LoginPage`          | Login com Google OAuth                   |
| `/auth/google/callback` | `GoogleCallbackPage` | Callback do OAuth Google                 |
| `/dashboard`            | `DashboardPage`      | Grid semanal com 7 cards de treino       |
| `/workout/[weekDay]`    | `WorkoutDayPage`     | Exercícios do dia + search               |
| `/account`              | `AccountPage` (planejada) | Dados do perfil + excluir conta       |

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

- **TanStack Query**: cache de exercícios pesquisados, treinos e mutações de adicionar, marcar, limpar e remover exercícios; retry manual para consultas com erro
- **Context API**: sessão do usuário (login/logout)
- **`useState`**: input search, debounce, modal, carrossel e estados transitórios de retry

A página de treino abre um modal shadcn para consultar `GET /api/exercises` após 1000 ms sem digitação, usando o cliente HTTP local com AbortSignal para cancelar consultas obsoletas. Os resultados são carregados em páginas de 20 itens e o botão `Carregar mais exercícios` busca as páginas seguintes até exibir todo o resultado. As rotas `POST /api/workouts/:weekDay/exercises`, `PATCH /api/workout-exercises/:id`, `POST /api/workouts/:weekDay/clear` e `DELETE /api/workouts/:weekDay/exercises/:exerciseId` estão integradas à página, com atualização dos caches do treino/dashboard, estados de loading, erros genéricos e confirmações acessíveis.

## Estrutura atual

```
src/
  app/
    globals.css           (HSL tokens + Tailwind v4)
    layout.tsx            (root layout: Inter font, lang pt-BR)
    page.tsx              (HomePage — landing)
    login/page.tsx
    dashboard/page.tsx
    workout/[weekDay]/page.tsx
    account/page.tsx       (planejada)
  components/
    ui/                   (ShadCN)
      Button.tsx
      Loading.tsx
      AlertDialog.tsx
      ErrorAlertDialog.tsx
      Carousel.tsx
      Checkbox.tsx
      DropdownMenu.tsx
      FeatureCard.tsx
      ArrowRightIcon.tsx
      ChartIcon.tsx
      ClockIcon.tsx
      DocumentIcon.tsx
      DumbbellIcon.tsx
    layout/
      Header.tsx
      Footer.tsx
    auth/
      LoginForm.tsx
      LoginGate.tsx
    workout/
      AddExerciseDialog.tsx
      ClearWorkoutDialog.tsx
      RemoveWorkoutExerciseDialog.tsx
    exercise/
      ExerciseImageCarousel.tsx
  hooks/                  (autenticação Google)
  contexts/               (AuthContext)
  providers/              (QueryProvider)
  lib/
    api.ts                 (axios instance + interceptors + chamadas tipadas)
    auth.ts, dashboard.ts, exerciseImage.ts, utils.ts
  schemas/
    api.ts                 (contratos Zod das respostas HTTP)
```

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
| exchanges the code and redirects to the dashboard on success | integration | `code`+`state` válidos, API retorna token                    | `exchangeGoogleCode` chamado com o `code`, `setSession(token)`, redirect `/dashboard` |
| shows an error when the OAuth state does not match           | integration | `state` divergente                                           | alerta de falha, `sessionStorage` limpo, sem chamada à API                            |
| shows an error when code or state is missing                 | integration | URL sem `code`/`state`                                       | alerta de falha                                                                       |
| redirects to login when the user denies access               | integration | `error=access_denied`                                        | redirect `/login`, sem chamada à API                                                  |
| shows an error when the backend rejects the code             | integration | `exchangeGoogleCode` rejeita com AxiosError (com `response`) | alerta "Não foi possível autenticar"                                                  |
| shows a connection error when the API call fails             | integration | `exchangeGoogleCode` rejeita com `Error` (rede)              | alerta "Não foi possível conectar ao servidor"                                        |

#### `src/app/dashboard/DashboardClient.test.tsx`

Testes do dashboard para hidratação da autenticação, carregamento dos treinos, preview de nomes longos e retry com sucesso ou falha.

#### `src/app/workout/[weekDay]/page.test.tsx`

Testes da página de treino para carregamento, retry do treino e da busca, adição, marcação, limpeza, remoção, estados de erro e carregamento das imagens.

- renderiza exercícios e contador `done/total`;
- envia o ID da associação ao alternar o checkbox;
- adiciona exercícios pela busca e atualiza o treino;
- confirma a limpeza, mostra estado pendente e atualiza os dados.
- tenta novamente após falha do treino ou da busca e restaura o erro quando o retry falha;
- remove exercícios, trata falhas de remoção e prioriza a primeira imagem acima da dobra.

#### `src/components/ui/Loading.test.tsx`

Testa o componente de loading reutilizável, incluindo mensagem em português, `aria-live` e status acessível.

#### `src/components/workout/ClearWorkoutDialog.test.tsx`

Testes do diálogo de confirmação de limpeza, incluindo confirmação, cancelamento, Escape e estado pendente.

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
- Botões e links devem usar componentes ShadCN — renderizar `Button` de `src/components/ui/Button.tsx` para botões e `<Button asChild>` envolvendo `next/link` para links com estilo de botão. **Nunca** usar `<button>` ou `<a>` cru no JSX. Links de texto simples usam `next/link` diretamente.
- **Nunca** expor nomes de variáveis de ambiente, secrets, tokens ou stack traces em mensagens ao usuário, `console.*` ou respostas HTTP. Erros devem ser genéricos no cliente.
