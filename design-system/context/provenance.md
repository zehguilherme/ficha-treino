# Provenance

## Source

- **Source project id:** `8d530195-e3fe-468b-b445-6592f2e546eb`
- **Source project name:** Ficha de Treino
- **Design system id:** `user:ficha-de-treino-design-system-2`
- **New project id:** `9095a111-bf36-4f04-8594-fee174f631a4`

## Extraction method

The design system was extracted from HTML source files of the original project. Each screen was analyzed for tokens, typography, component patterns, layout rules, and interaction behavior.

## Files analyzed

| File | Key findings |
|------|-------------|
| `landing.html` | Hero section, feature cards, header with logo, CTA button, Inter 800 weight |
| `login.html` | Centered auth card, Google login button, logo mark, HSL token variation (white bg `0 0% 100%`) |
| `dashboard.html` | Week grid layout, day cards, sticky header with avatar dropdown, page title pattern |
| `workout-day.html` | Exercise cards with carousel, search input with results, checkbox, instructions toggle, remove button, empty state |
| `minha-conta.html` | Settings sections, profile rows, modal overlay, danger zone, destructive button variants |
| `404.html` | Centered card, 404 code display, playful fitness copy, home navigation button |
| `design-system.md` | Pre-existing extracted tokens, component tables, spacing, icon inventory |

## Assets

| File | Type | Source |
|------|------|--------|
| `assets/hero-gym.jpg` | Hero background image | Original project, gym photography |
| `image.png` | Reference image | Original project |

## Decisions

- **Single typeface:** Inter is used for all weights across the product (body + display). This is appropriate for a utilitarian fitness app.
- **No warm tones:** The palette is purely neutral (gray + near-black + white) with red reserved for destructive actions.
- **ShadCN HSL pattern:** Tokens follow the ShadCN convention for compatibility with Tailwind and component libraries.
- **Brazilian Portuguese:** All UI copy, voice, and documentation are in pt-BR.
- **data-od-id convention:** Interactive elements use `data-od-id` for testability and inspection.
