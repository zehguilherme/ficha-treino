---
name: ficha-treino-design-system
description: Ficha de Treino gym workout tracking app design system. ShadCN HSL tokens, Inter type, minimal neutral palette.
user-invocable: true
---

# Ficha de Treino Design System — Skill

Reusable Claude Design skill for generating UI that matches the Ficha de Treino workout web app.

## What is inside

- ShadCN-based HSL token set (8 semantic colors) with dark theme
- Inter typography scale (400–800, 0.6875rem–5rem)
- 10+ button variants (solid, outline, destructive, ghost, Google)
- 6 card types (day, exercise, settings, auth, feature, 404)
- Image carousel (ShadCN scroll-snap pattern)
- Search input, custom checkbox, modal overlay, dropdown menu
- Tags, muscle labels, empty states, profile rows
- Sticky header (3 variants), week grid layout
- Lucide-style inline SVG icons
- Hero section with brightness filter + gradient overlay
- Danger zone with destructive color treatment

## Source context

Extracted from 6 HTML screens of the Ficha de Treino workout app (landing, login, dashboard, workout-day, minha-conta, 404). Built with Tailwind CDN + ShadCN tokens + Inter. Brazilian Portuguese throughout.

**Key extraction details:** Hero uses `filter: brightness(0.35)` + gradient overlay. 404 uses semi-transparent "0" character. Day grid uses `repeat(auto-fill, minmax(14rem, 1fr))`. Google button uses 4-color branded SVG.

## When to use

- Generating new screens or components for a fitness/gym workout tracking app
- Any project needing a minimal, neutral, utilitarian design language
- Projects using ShadCN-style HSL tokens with a single typeface approach
- Adding dark mode to an existing project (tokens included)
- Building workout exercise forms with carousel, tags, and action toggles

## How to use

1. Read `DESIGN.md` for full reference including dark theme and implementation notes
2. Copy `colors_and_type.css` tokens into your first `<style>` block
3. Import Inter from Google Fonts (`weights 400,500,600,700,800`)
4. Use `data-od-id="kebab-case-id"` on interactive elements
5. Reference component patterns from `ui_kits/app/`
6. Apply `.dark` class on `<html>` or use `prefers-color-scheme: dark` for dark mode
7. For Google buttons, use the 4-color branded SVG (not `currentColor`)
8. For hero images, always apply `filter: brightness(0.35)` + gradient overlay
9. Run `design-system-package-audit` on completion

### Reuse workflow

| Step | What to do |
|------|------------|
| 1 | Import `colors_and_type.css` via `<link>` or paste into first `<style>` |
| 2 | Wrap content in `.container-dashboard` / `.container-account` etc. |
| 3 | Use `.btn-solid`, `.btn-outline`, `.btn-destructive` for button variants |
| 4 | Use `.card-hover` for clickable cards, `.tag` for chips |
| 5 | Use `.day-card` + `.day-card-*` subclasses for dashboard grid items |
| 6 | Copy component HTML + inline `<style>` from `ui_kits/app/` |

## design-system highlights grounded in source evidence

- **Palette:** Neutral grays + near-black foreground, red reserved for destructive only. Source evidence: `:root` HSL block in landing.html:11–28
- **Type:** Inter across all weights; display headings use tight -0.03em tracking. Source evidence: landing.html:33 font-family, landing.html:160–166 hero-headline
- **Cards:** White on light gray canvas, 1px border, subtle hover shadow. Source evidence: landing.html:225–234 feature-card, dashboard.html day-card
- **Voice:** Brazilian Portuguese, direct, fitness-themed. Source evidence: `lang="pt-BR"` in all 6 screens
- **Anti-patterns:** No gradients, no emoji icons (except native muscle label emoji), no warm beige backgrounds. Source evidence: confirmed across all 6 screens
