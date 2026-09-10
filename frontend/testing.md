# Referência de testes do frontend

## Stack e comandos

Jest 30, `@swc/jest`, Testing Library e jsdom. O typecheck ocorre no `next build`.

```bash
npm test
npm run test:watch
npm run test:coverage
npm run test:component-names
```

## Configuração e convenções

`jest.config.ts` usa transformação SWC para TS/TSX, alias `@/`, `jest.setup.ts`, ambiente jsdom e
`src/**/*.test.{ts,tsx}`. Testes ficam junto ao módulo, usam `describe`/`test` em inglês e JSDoc
de cenário, setup/mock e `Assert:`. Módulos e API usam `jest.mock` e `jest.clearAllMocks()`; hooks
que navegam recebem `navigate` injetável porque `window.location` não é spy-able no jsdom.

## Catálogo

- `src/lib/auth.test.ts`: armazenamento, leitura e limpeza do token.
- `src/hooks/useGoogleLogin.test.ts`: URL OAuth, state anti-CSRF, configuração ausente e redirect.
- `src/components/auth/LoginForm.test.tsx`: render, início, loading e erro do login.
- `src/app/auth/google/callback/page.test.tsx`: troca de código, state inválido, recusa e falhas.
- `src/app/treinos/DashboardClient.test.tsx`: hidratação, cards, expansão, nomes longos e retry.
- `src/app/treinos/[weekDay]/page.test.tsx`: carregamento, busca, marcar, limpar, remover e erro.
- `src/app/treinos/[weekDay]/layout.test.ts`: metadata para dia válido e inválido.
- `src/app/sitemap.test.ts` e `src/app/robots.test.ts`: URLs públicas e regras de rastreamento.
- `src/app/layout.test.ts`: origem canônica e metadata Open Graph/Twitter.
- `src/app/opengraph-image.test.tsx`: dimensões, tipo, alt e conteúdo do card social.
- `src/components/ui/Loading.test.tsx`: mensagem, `aria-live` e status acessível.
- `src/components/ui/IconLink.test.tsx`: texto acessível, ícone e destino.
- `src/components/layout/UserInitialsButton.test.tsx`: iniciais, nome e tokens visuais.
- `src/components/layout/UserMenu.test.tsx`: variantes, logout, teclado e foco.
- `src/components/workout/ClearWorkoutDialog.test.tsx`: confirmação, cancelamento, Escape e loading.
- `src/components/exercise/ExerciseCard.test.tsx`: metadados, ações, instruções e acessibilidade.
- `src/components/exercise/ExerciseTag.test.tsx`: rótulo/valor e omissão de vazios.
- `src/app/treinos/[weekDay]/adicionar-exercicio/page.test.tsx`: busca, filtros, retorno, loading e responsividade.
- `src/components/ui/Combobox.test.tsx`: debounce, seleção, altura, erros, limpeza e IDs duplicados.
- `src/app/treinos/[weekDay]/adicionar-exercicio/layout.test.ts`: metadata e política noindex.
- `src/lib/api.test.ts`: interceptor de JWT e limpeza da sessão em 401.
