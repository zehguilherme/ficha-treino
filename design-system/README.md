## 📦 Design System Package

> Complete Open Design design system extracted from the Ficha de Treino workout app.
> Source project ID: `8d530195-e3fe-468b-b445-6592f2e546eb`

## Product Overview

A reusable design system package extracted from the Ficha de Treino gym workout tracking web application. Contains ShadCN-based HSL token variables, Inter typography scale, component patterns (buttons, cards, headers, modals, tags), inline SVG icon library, and full-page source examples. Designed for reuse in fitness/wellness web apps or any project needing a minimal, neutral, utilitarian ShadCN-based design language with Brazilian Portuguese voice.

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