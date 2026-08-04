# Frontend Login Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install the frontend test infrastructure (Jest 30 + `@swc/jest` + Testing Library) and cover the Google login flow with unit, component, and callback-page integration tests, documented in `frontend/frontend.md` in the style of `backend/backend.md`.

**Architecture:** Mirror the backend test stack (Jest 30 + `@swc/jest` + `esbuild-register` config loader) with jsdom environment and `@testing-library/react`. Tests live alongside modules (`src/**/*.test.{ts,tsx}`). Mocks follow backend conventions: `jest.mock` + `jest.requireMock`, `globalThis.fetch` override, `jest.clearAllMocks()` in `beforeEach`.

**Tech Stack:** Jest 30, `@swc/jest`, `@swc/core`, `@types/jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `esbuild-register`.

**No commits** — user commits manually.

---

### Task 1: Install dependencies and add test scripts

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install deps** (workdir `frontend/`)

```bash
npm install -D jest@^30.4.2 @swc/jest@^0.2.39 @swc/core@^1.15.47 @types/jest@^30.0.0 jest-environment-jsdom@^30 esbuild-register@^3.6.0 @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14
```

- [ ] **Step 2: Update scripts** in `frontend/package.json` (keep `test:component-names`):

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
```

- [ ] **Step 3: Verify** — `npx jest --version` → 30.x

### Task 2: Create Jest config + setup

**Files:**
- Create: `frontend/jest.config.ts`
- Create: `frontend/jest.setup.ts`

- [ ] **Step 1: `jest.config.ts`**

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
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
};

export default config;
```

- [ ] **Step 2: `jest.setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 3: Verify** — `npx jest --passWithNoTests` passes

### Task 3: Unit tests — `src/lib/auth.test.ts`

**Files:**
- Create: `frontend/src/lib/auth.test.ts`

- [ ] **Step 1: Create the test** (full code in plan doc below)

- [ ] **Step 2: Run** — `npx jest src/lib/auth.test.ts` → 4 pass

### Task 4: `useGoogleLogin` hook tests (+ export `buildAuthUrl`)

**Files:**
- Modify: `frontend/src/hooks/useGoogleLogin.ts:9`
- Create: `frontend/src/hooks/useGoogleLogin.test.ts`

- [ ] **Step 1: Write test** (references `buildAuthUrl` not yet exported)
- [ ] **Step 2: Run** → FAIL: `buildAuthUrl` not exported
- [ ] **Step 3: Export the function**
- [ ] **Step 4: Run** → 3 pass

### Task 5: Component tests — `LoginForm.test.tsx`

**Files:**
- Create: `frontend/src/components/auth/LoginForm.test.tsx`

- [ ] **Step 1: Write test** (mocked hook; idle/loading/error states)
- [ ] **Step 2: Run** → 4 pass

### Task 6: Integration tests — callback page

**Files:**
- Create: `frontend/src/app/auth/google/callback/page.test.tsx`

- [ ] **Step 1: Write test** (mocks: `next/navigation`, `@/lib/auth`, `globalThis.fetch`)
- [ ] **Step 2: Run** → 6 pass

### Task 7: Document tests in `frontend/frontend.md`

**Files:**
- Modify: `frontend/frontend.md:91-131`

Replace the `## Testes` section with the mirror of `backend/backend.md` style: stack, commands, config, conventions, catalog tables. Full content in plan doc below.

### Task 8: Final verification (no commits)

- [ ] **Step 1:** `npm test` → 17 tests pass
- [ ] **Step 2:** `npm run lint` and `npm run format`
- [ ] **Step 3:** `npm run test:component-names` → passes
