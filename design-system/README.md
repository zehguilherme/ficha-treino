# Ficha Treino

<h1 align="center">
  Ficha Treino
</h1>

<div align="center">
  <a href="README-en.md">English</a>
  ·
  <a href="README.md">Português</a>
</div>

## 💬 Product Overview / Product Context

Aplicação web para gerenciamento de treinos de academia. O sistema permite que usuários autenticados via Google organizem seus treinos semanais, pesquisem exercícios em português brasileiro e marquem seus exercícios concluídos — tudo sem depender de API externa.

**Primary surfaces:** Landing → Login → Dashboard (week grid) → Workout Day (exercise list with image carousel) → Minha Conta (profile + danger zone). Built with ShadCN HSL tokens, Tailwind CSS, and Inter typeface.

## 💬 Descrição

Aplicação web para gerenciamento de treinos de academia. O sistema permite que usuários autenticados via Google organizem seus treinos semanais, pesquisem exercícios em português brasileiro e marquem seus exercícios concluídos — tudo sem depender de API externa.

## 🚀 Tecnologias

### Compartilhadas

- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática para JavaScript
- [Zod](https://zod.dev/) - Validação de dados compartilhada entre frontend e backend
- [Jest](https://jestjs.io/) - Testes unitários e de integração
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) - Qualidade e formatação de código

### Front-end

- [Next.js](https://nextjs.org/) (App Router) - Framework React com SSG para landing page e CSR para área autenticada
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS para estilização
- [ShadCN](https://ui.shadcn.com/) - Componentes de interface
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) - Google Sign-In

### Back-end

- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) - Servidor REST
- [PostgreSQL](https://www.postgresql.org/) + [pg](https://node-postgres.com/) - Banco de dados com SQL puro
- [Docker](https://www.docker.com/) + Docker Compose - Containerização do banco
- [google-auth-library](https://www.npmjs.com/package/google-auth-library) - Validação do ID Token Google
- [JWT](https://jwt.io/) - Autenticação stateless (24h, sem refresh token)

## 🏗️ Arquitetura

```
Landing page (SSG) → /login (estático) → Dashboard (CSR)
```

| Página | Renderização | Pública? |
|---|---|---|
| Landing page / apresentação | **SSG** (estática, gerada no build) | Sim |
| Login | **Estática** (sem dados dinâmicos) | Sim |
| Dashboard / treinos | **CSR** (após autenticação) | Não |

O JWT é armazenado no `localStorage` do navegador. O frontend envia o token no header `Authorization` para consumir a API REST do Express. A busca de exercícios é feita exclusivamente no banco da aplicação.

## 🚀 Começando

Primeiro de tudo você precisa ter [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/) e [Docker](https://www.docker.com/) instalados em sua máquina.

Então você pode clonar o repositório.

```bash
git clone https://github.com/zehguilherme/ficha-treino
```

### Subindo o banco

```bash
docker compose up -d
```

### Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🤔 Como contribuir

1. Faça um fork do projeto;
2. Crie uma branch com a sua feature: `git checkout -b minha-nova-feature`;
3. Faça commit das suas alterações: `git commit -m 'feat: Adição de uma nova feature'`;
4. Faça push para o branch: `git push origin minha-nova-feature`;
5. Crie uma nova Pull Request;
6. Depois que o merge de sua Pull Request for concluída, você pode excluir sua branch.

## 📄 Licença

Este projeto está sob a licença MIT.

---

Feito com 💟 por José Guilherme Paro Monteiro Tomaine 👋 [Fale comigo!](https://www.linkedin.com/in/jos%C3%A9-guilherme-paro-monteiro-tomaine/)

---

## 📦 Design System Package

> Complete Open Design design system extracted from the Ficha Treino workout app.
> Source project ID: `8d530195-e3fe-468b-b445-6592f2e546eb`

## Product Overview

A reusable design system package extracted from the Ficha Treino gym workout tracking web application. Contains ShadCN-based HSL token variables, Inter typography scale, component patterns (buttons, cards, headers, modals, tags), inline SVG icon library, and full-page source examples. Designed for reuse in fitness/wellness web apps or any project needing a minimal, neutral, utilitarian ShadCN-based design language with Brazilian Portuguese voice.

**Surface:** Token CSS (`colors_and_type.css`) → Component previews (`preview/`) → Applied UI kit (`ui_kits/app/`) → Build assets (`build/`) → Source examples (`source_examples/`).

### Package Structure

| Path | Description |
|------|-------------|
| `DESIGN.md` | Full design system documentation |
| `SKILL.md` | Claude Design skill for matching UI |
| `colors_and_type.css` | HSL token variables + Inter type scale |
| `context/provenance.md` | Source extraction notes |
| `build/brand-assets/` | Standalone SVG icon files |
| `source_examples/` | Component snapshots from source screens |
| `preview/` | 10 token and component preview cards |
| `ui_kits/app/` | Applied component kit |

## Preview Manifest

| Preview card | Purpose |
|---|---|
| `preview/colors.html` | Full HSL palette swatches |
| `preview/colors-primary.html` | Primary HSL palette with semantic overlays |
| `preview/typography.html` | Type scale demo (all sizes) |
| `preview/typography-specimens.html` | Inter type specimens from hero to tags |
| `preview/spacing.html` | Spacing scale, radii, shadows |
| `preview/spacing-tokens.html` | Spacing tokens with elevation |
| `preview/components.html` | Button, tag, card, input gallery |
| `preview/components-buttons.html` | All button variants |
| `preview/brand-assets.html` | Logo mark, wordmark, icon library |
| `preview/ui-surfaces.html` | Links to all 6 live source screens |

## Package Reuse Guide

**source/context references:** 6 original screens (landing, login, dashboard, workout-day, minha-conta, 404). Source project ID: 8d530195-e3fe-468b-b445-6592f2e546eb. Extraction decisions in context/provenance.md.

**package contents by category:**
- **Token CSS:** colors_and_type.css
- **Docs:** SKILL.md, DESIGN.md
- **preview cards:** preview/*.html (10 cards)
- **preserved assets:** build/brand-assets/*.svg (logo, icons)
- **build artifacts:** build/ directory with standalone SVGs
- **ui_kits/app:** header, day-card, exercise-card, modal

**Reuse workflow:**
1. Import `colors_and_type.css` HSL tokens into project
2. Read `SKILL.md` for quick-start guidance and `DESIGN.md` for full spec
3. Inspect `preview/*.html` cards to verify palette, type, spacing, components
4. Copy component HTML + inline `<style>` from `ui_kits/app/`
5. Use `.btn-solid`, `.btn-outline`, `.btn-destructive`, `.btn-ghost` classes
6. Use `.card-hover` for clickable card patterns
7. Use `.day-card` + subclasses for dashboard grid items
8. For dark mode: add `.dark` on `<html>` element
9. Use preserved build assets from `build/brand-assets/`
10. Run `design-system-package-audit` before finalizing

**Review workflow:**
1. Open `preview/colors-primary.html` to verify palette
2. Open `preview/typography-specimens.html` to verify type scale
3. Open `preview/components.html` to verify button/card variants
4. Compare source HTML against DESIGN.md for fidelity
5. Verify dark mode by checking `colors_and_type.css` contains `.dark` / `@media (prefers-color-scheme: dark)` block
6. Run audit command before approving