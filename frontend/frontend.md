# Frontend — Ficha de Treino

## Propósito

Next.js App Router com TanStack Query (estado do servidor), Context API (sessão do usuário), `useState` apenas para UI local. Tailwind + ShadCN HSL tokens.

## Páginas

| Rota                 | Componente       | Descrição                          |
| -------------------- | ---------------- | ---------------------------------- |
| `/`                  | `HomePage`       | Landing page pública com hero + features |
| `/login`             | `LoginPage`      | Login com Google OAuth             |
| `/dashboard`         | `DashboardPage`  | Grid semanal com 7 cards de treino |
| `/workout/[weekDay]` | `WorkoutDayPage` | Exercícios do dia + search         |
| `/account`           | `AccountPage`    | Dados do perfil + excluir conta    |

## Shared

Schemas Zod compartilhados com backend via `shared/` (validação front/back idêntica).

## Imagens

CDN jsDelivr:

```
https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{id}/0.jpg
https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{id}/1.jpg
```

## Estado

- **TanStack Query**: cache de exercícios, treinos, mutações (marcar done, adicionar/remover)
- **Context API**: sessão do usuário (login/logout)
- **`useState`**: input search, modal, carrossel

## Estrutura (planejada)

```
src/
  app/
    globals.css           (HSL tokens + Tailwind v4)
    layout.tsx            (root layout: Inter font, lang pt-BR)
    page.tsx              (HomePage — landing)
    login/page.tsx
    dashboard/page.tsx
    workout/[weekDay]/page.tsx
    account/page.tsx
  components/
    ui/                   (ShadCN)
      Button.tsx
      FeatureCard.tsx
      ArrowRightIcon.tsx
      ChartIcon.tsx
      ClockIcon.tsx
      DocumentIcon.tsx
      DumbbellIcon.tsx
    layout/
      Header.tsx
      Footer.tsx
    workout/
    exercise/
  hooks/
  contexts/
  providers/
  lib/
    api.ts    (axios/fetch wrapper)
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

*(a implementar)*

### Stack recomendada

Mesma do backend para consistência: **Jest + `@swc/jest`** + bibliotecas de teste React.

| Pacote | Propósito |
|--------|-----------|
| `jest` | Test runner |
| `@swc/jest` + `@swc/core` | Transpilação TS (mesma stack do backend) |
| `@types/jest` | Tipos TypeScript |
| `jest-environment-jsdom` | Ambiente DOM simulado |
| `@testing-library/react` | Renderização de componentes React em teste |
| `@testing-library/jest-dom` | Matchers customizados (`toBeInTheDocument`, etc.) |
| `@testing-library/user-event` | Simulação de interações do usuário |

Alternativa: **Vitest** é mais rápido com Vite, mas Next.js usa webpack/turbopack então a vantagem é menor. Jest mantém consistência com o backend.

### Configuração mínima (`jest.config.ts`)

```ts
import type { Config } from 'jest';

const config: Config = {
  transform: { '^.+\\.tsx?$': '@swc/jest' },
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['@testing-library/jest-dom'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
};

export default config;
```

### Convenções

- **Arquivos:** `src/**/*.test.{ts,tsx}` junto ao módulo testado
- **Estrutura:** `describe('ComponentName')` → `test('action when condition')`
- **Idioma:** Inglês
- **Mocking:** mocks globais resetados em `beforeEach`

## Constraints

- **Nunca** usar tipo `any` — toda variável, parâmetro e retorno de função deve ter tipo explícito — usar skill `type-safety-staged`
- Sem rotas de API do Next.js — tudo via Express separado
- JWT armazenado em localStorage
- Sem API externa de exercícios — tudo via backend local
- SVGs na UI devem ser componentes React em arquivos separados (ex: `ArrowLeftIcon.tsx`), nunca inline no JSX. Se um SVG já existe inline, extrair para componente.
- Componentes em `src/components/` devem usar PascalCase (ex: `Button.tsx`, `FeatureCard.tsx`). Arquivos em `src/app/` são exceção (rotas Next.js) — usar skill `component-naming-pascalcase`.
