# Ficha Treino — App UI Kit

Applied component kit extracted from the live Ficha Treino workout app. Documents applied kit structure, component files, usage workflow, design notes, and source basis.

## Structure (component files)

| File | Description | Source basis |
|------|-------------|-------------|
| `index.html` | Navigation hub linking all component files | All screens |
| `header.html` | Sticky header in 3 variants | dashboard, workout-day, landing |
| `day-card.html` | Week grid card with exercise previews | dashboard |
| `exercise-card.html` | Full card with carousel, muscle labels, checkbox + remove | workout-day |
| `modal.html` | Confirmation modal + danger zone settings | minha-conta |

## Usage workflow

1. Open `index.html` for the component overview
2. Click into each component file for isolated variants
3. The source project screens are at the project root
4. Design tokens are in `../../colors_and_type.css`

## Design notes

- All components use the ShadCN HSL token set from `colors_and_type.css`
- Buttons follow: all caps 0.8125rem / 500 / 0.02em tracking
- Cards: 1px border, `--card` bg, `calc(var(--radius) + 0.125rem)` radius
- The toggle icon on instructions chevron rotates 180° on expand
- Data attributes (`data-od-id`) mark interactive elements for testing

## Source basis

Extracted from 6 live screens: landing, login, dashboard, workout-day, minha-conta, 404. Cross-reference component patterns against originals to verify fidelity.

## Reuse guide

### By file

| File | Best for | Includes |
|------|----------|----------|
| `header.html` | Adding sticky nav with back button + avatar | 3 layout variants (auth, landing, 404) |
| `day-card.html` | Dashboard week grid items | Exercise count badge, hover state |
| `exercise-card.html` | Workout day exercise lists | Carousel, tags, muscle labels, actions |
| `modal.html` | Confirmation dialogs | Overlay, destructive flow, close handlers |

### Workflow

1. Open `index.html` for the component overview
2. Copy the relevant component's HTML + inline `<style>` block
3. Import `colors_and_type.css` for HSL variables (`../../colors_and_type.css` from this directory)
4. Import Inter from Google Fonts
5. Add `.card-hover` wrapper class for clickable card patterns
6. Use `.btn-solid` / `.btn-outline` / `.btn-destructive` for button variants
7. Wire up `data-od-id` attributes for interactive elements
8. No JS framework required — all components use vanilla HTML/CSS