# Ficha Treino Design System

> Product: Ficha Treino — Gym workout tracking web app
> Framework: ShadCN HSL tokens + Tailwind CSS + Inter
> Language: Brazilian Portuguese
> Source screens: landing, login, dashboard, workout-day, minha-conta, 404

---

## 1. Product Context

Ficha Treino is a workout tracking web app. Users log in via Google, organize exercises by day of the week, search exercises in Brazilian Portuguese, mark sets as done, and view exercise instructions with image carousels. The app is CSR after auth, with a static landing/login and no external API dependency.

**Screens:** Landing → Login → Dashboard (week grid) → Workout Day (exercise list with search) → Minha Conta (profile + danger zone)

---

## 2. Visual Theme & Atmosphere

Minimalist, utilitarian, neutral. No decorative gradients, no emoji as icons, no warm beige/cream canvases. White cards on a light gray canvas (`--background: 210 40% 98%`). The single accent color is the foreground (near-black), used for primary text, solid buttons, and icons. Red (`--destructive`) is reserved for destructive actions only. The logo is a stylized cross/dumbbell icon in a dark rounded square. Imagery is real photography with a dark gradient overlay. The tone is direct, no-nonsense fitness.

**Hero image treatment:** `filter: brightness(0.35)` on the `<img>` element, with a `linear-gradient(180deg, hsl(var(--foreground)/0.7), hsl(var(--foreground)/0.85))` overlay to ensure white text legibility.

---

## 3. Color

### HSL Tokens (ShadCN-based)

```css
:root {
  --background: 210 40% 98%;       /* #f4f5f7 — page background */
  --foreground: 222.2 84% 4.9%;    /* #0a0a0b — primary text, solid buttons */
  --card: 0 0% 100%;               /* #ffffff — cards, header, modals */
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;      /* #f1f5f9 — hover states, tags bg, carousel placeholder */
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;  /* #6b7280 — secondary text, placeholders */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;    /* #ef4444 — delete/remove actions */
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;     /* #e2e8f0 — all borders */
  --ring: 222.2 84% 4.9%;          /* focus rings */
  --radius: 0.5rem;
}
```

### Dark theme

```css
:root.dark,
@media (prefers-color-scheme: dark) {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 47.4% 11.2%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

### Semantic color roles

| Role | Token | Usage |
|------|-------|-------|
| Page bg | `hsl(var(--background))` | #f4f5f7 (light) / near-black (dark) |
| Card bg | `hsl(var(--card))` | White (light) / dark surface (dark) |
| Primary text | `hsl(var(--foreground))` | Near-black (light) / white (dark) |
| Secondary text | `hsl(var(--muted-foreground))` | Gray #6b7280 (light) |
| Borders | `hsl(var(--border))` | All 1px borders |
| Hover bg | `hsl(var(--secondary))` | Button/card hover, tag bg |
| Solid button bg | `hsl(var(--foreground))` | Near-black fill (light) |
| Destructive | `hsl(var(--destructive))` | #ef4444 — delete, remove |
| Destructive border | `hsl(var(--destructive) / 0.3)` | Outline destructive buttons, danger zone |
| Destructive surface | `hsl(var(--destructive) / 0.03)` | Danger zone background |
| Focus ring | `hsl(var(--ring) / 0.1)` | Input focus box-shadow |
| Modal overlay | `hsl(var(--foreground) / 0.5)` | Semi-transparent backdrop |
| Carousel footer | `hsl(var(--foreground) / 0.45)` | With backdrop blur |
| Hero gradient | `linear-gradient(180deg, hsl(var(--foreground) / 0.7), hsl(var(--foreground) / 0.85))` | Hero image overlay |
| 404 zero char | `hsl(var(--muted-foreground) / 0.3)` | The "0" in 404 display |

---

## 4. Typography

### Family
- **Display + Body:** Inter (weights 400, 500, 600, 700, 800)
- **Fallback:** `system-ui, -apple-system, sans-serif`

### Scale

| Role | Size | Weight | Letter-spacing | Used on |
|------|------|--------|----------------|---------|
| Hero headline | `clamp(2.25rem, 5vw, 3.75rem)` | 800 | -0.03em | Landing hero |
| 404 code | 5rem | 800 | -0.04em | `.error-code` |
| Page title | 1.5rem | 600–700 | -0.02em | `.page-title`, `.day-name-large` |
| Section/modal title | 1.125–1.25rem | 700 | -0.02em | Error title, day header h1 |
| Login card title | 1.25rem | 700 | -0.02em | `.login-title` |
| Header title | 1rem | 600 | -0.01em | `.header-title` |
| Section heading | 1rem | 600 | -0.01em | Modal h3, `.feature-title` |
| Card heading | 0.9375rem | 600 | normal | `.exercise-name`, `.settings-header h2` |
| Day name (card) | 0.9375rem | 500 | normal | `.day-name` |
| Body / subtitle | 0.875rem | 400 | normal | `.page-subtitle`, `.profile-value`, `.empty-workout p` |
| Search input | 0.875rem | 400 | normal | `.search-input` |
| Search result | 0.875rem | 500 | normal | `.search-result-name` |
| UI button | 0.8125rem | 500 | 0.02em | `.btn-clear`, `.btn-remove`, `.btn-add`, `.menu-item` |
| Small label | 0.75rem | 400/500 | 0.02em | `.profile-label`, `.exercise-meta`, `.day-badge`, `.instructions-toggle` |
| Tag / badge | 0.6875rem | 500 | 0.06em uppercase | `.tag`, `.carousel-counter`, `.search-results-title` |
| Eyebrow | 0.75rem | 500–600 | 0.08–0.12em uppercase | `.hero-eyebrow` |

### Rules
- Body `line-height: 1.5–1.6`
- Display headings use tighter `line-height: 1.08–1.1`
- All caps with expanded tracking (0.06em–0.08em) for tags, counters, eyebrow text
- Buttons use uppercase with 0.02em letter-spacing

---

## 5. Spacing & Radius

### Spacing scale
- `0.125rem` — muscle label gap, tag vertical padding
- `0.25rem` — menu item padding, carousel footer padding
- `0.375rem` — gap between tag items, button icon gap
- `0.5rem` — avatar/text gap, checkbox gap, modal action gap
- `0.625rem` — search input padding, carousel footer gap
- `0.75rem` — header gap, exercise meta gap, button padding
- `1rem` — grid gap, container padding, card padding (exercise cards)
- `1.25rem` — card padding, settings section padding
- `1.5rem` — header inner padding, container padding, feature gap
- `2rem` — header height, back button size, avatar size
- `2.5rem` — login card padding, logo mark, feature icon
- `3.5rem` — header height
- `4rem` — hero padding
- `5rem` — features section padding

### Border radius
- Small: `0.25rem` — menu items, checkboxes
- Default: `var(--radius)` = `0.5rem` — buttons, inputs, cards, logo mark
- Large: `calc(var(--radius) + 0.125rem)` = 0.625rem — day cards, exercise cards, settings sections, modals, feature cards
- XL: `calc(var(--radius) + 0.25rem)` = 0.75rem — login card, 404 card
- Full: `9999px` — avatars, tags, dots, carousel buttons

### Shadows
- Card hover: `0 1px 3px hsl(var(--foreground) / 0.04)`
- Login card: `0 1px 3px hsl(var(--foreground) / 0.06)`
- Dropdown: `0 4px 12px hsl(var(--foreground) / 0.06)`
- Modal: `0 8px 30px hsl(var(--foreground) / 0.1)`
- Hero CTA hover: `0 4px 20px hsl(var(--foreground) / 0.2)`

---

## 6. Layout & Composition

### Container widths
| Screen | Max-width | Padding |
|--------|-----------|---------|
| Dashboard | 64–80rem | 1.5–2rem 1.5rem |
| Workout day | 48rem | 1.5rem–2rem |
| Minha Conta | 40–48rem | 1.5–2rem |
| Login | 22–24rem (card) | centered |
| Landing features | 64rem | 3rem–5rem |
| 404 card | 26–28rem | centered |

### Z-index layering
| Layer | z-index | Elements |
|-------|---------|----------|
| Sticky header | 50 | `.header` |
| Dropdown menu | 100 | avatar dropdown |
| Carousel buttons | 10 | prev/next overlay |
| Modal overlay | 200 | backdrop + modal box |

### Header (sticky, all auth screens)
- Height: 3.5rem
- Background: `--card`, bottom border `--border`
- Inner max-width: 80rem, padding 0 1.5rem
- z-index: 50
- Left: back button (icon 2rem) + title (flex gap 0.75rem)
- Right: avatar with dropdown menu
- **Workout header counter** (`header-counter`): right side, shows `[done] / [total]` exercises. Styled as pill badge (`--secondary` bg, `--muted-foreground` text, `0.75rem`/500, `9999px` radius, `0.125rem 0.5rem` padding). Updates on checkbox toggle, add/remove exercise, and clear workout.

### Dashboard grid
- `grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr))`
- Gap: 0.75rem
- Day cards: clickable, hover border + shadow

### Exercise list (workout day)
- Stacked flex column, gap 0.75rem
- Each card: carousel (16:9) + info + actions (checkbox, instructions toggle, remove)

### Responsive
- Mobile (<640px): padding reduces to 1rem, grid goes 1 column, carousel goes 4:3
- No horizontal scroll on mobile

---

## 7. Components

### 7.1 Buttons

| Variant | Padding | Border | Background | Text | Hover |
|---------|---------|--------|------------|------|-------|
| Back (icon) | — | 1px `--border` | `--card` | `--foreground` | `--secondary` |
| Destructive (remove) | 0.375rem 0.75rem | none | `--destructive` | white | `--destructive / 0.9` |
| Destructive outline (danger) | 0.375rem 0.75rem | 1px `--destructive / 0.3` | none | `--destructive` | `--destructive / 0.05` |
| Clear | 0.375rem 0.75rem | 1px `--border` | none | `--muted-fg` | `--destructive`, border `--destructive / 0.3` |
| Add (solid) | 0.375rem 0.75rem | none | `--foreground` | `--primary-fg` | opacity 0.85 |
| Cancel (modal) | 0.5rem 1rem | 1px `--border` | `--card` | `--foreground` | `--secondary` |
| Confirm delete | 0.5rem 1rem | none | `--destructive` | white | `--destructive / 0.9` |
| Delete account | 0.5rem 1rem | none | `--destructive` | white | `--destructive / 0.9` |
| Login header | 0.375rem 0.75rem | 1px `--border` | none | `--foreground` | `--secondary` |
| Google (full) | 0.625rem 1rem | 1px `--border` | `--card` | `--foreground` | `--secondary` |
| Hero CTA | 0.75rem 2rem | none | `--primary` | `--primary-fg` | opacity 0.9 |
| Instructions toggle | 0.25rem 0.5rem | 1px `--border` | none | `--muted-fg` | `--secondary` |
| Home (404) | 0.5rem 1.25rem | 1px `--border` | `--card` | `--foreground` | `--secondary` |

All buttons: `font-size: 0.8125rem`, `font-weight: 500`, `letter-spacing: 0.02em`, `text-transform: uppercase`, `border-radius: var(--radius)`, `transition: all 0.15s`.

Back button: 2rem × 2rem icon-only, SVG 1rem.

### 7.2 Cards

| Card type | Padding | Border-radius | Border | Background |
|-----------|---------|---------------|--------|------------|
| Login card | 2rem 2rem | `calc(var(--radius) + 0.25rem)` | 1px `--border` | `--card` |
| Day card (dashboard) | 1rem | `calc(var(--radius) + 0.125rem)` | 1px `--border` | `--card` |
| Exercise card | body: 1rem | `calc(var(--radius) + 0.125rem)` | 1px `--border` | `--card` |
| Settings section | n/a | `calc(var(--radius) + 0.125rem)` | 1px `--border` | `--card` |
| 404 card | n/a | `calc(var(--radius) + 0.25rem)` | 1px `--border` | `--card` |
| Feature card (landing) | 1.5rem | `calc(var(--radius) + 0.125rem)` | 1px `--border` | `--card` |

Card hover: `border-color: hsl(var(--ring) / 0.12)`, `box-shadow: 0 1px 3px hsl(var(--foreground) / 0.06)`.

### 7.3 Image Carousel (ShadCN pattern)
- Wrapper: 16:9 aspect-ratio, `--secondary` bg, `--radius` radius, 1px `--border`, overflow hidden
- Viewport: overflow hidden
- Track: flex, `scroll-snap-type: x mandatory`, smooth scroll, no scrollbar
- Items: `flex: 0 0 100%`, images `object-fit: cover`
- Buttons: 2rem circle, `--card / 0.85` bg, backdrop-blur, opacity 0→1 on hover, disabled hidden
- Footer: absolute bottom/center, `--foreground / 0.45` bg, backdrop-blur, rounded pill
- Dots: 0.5rem circles, `--background / 0.5` → `--background` when active
- Counter: 0.6875rem, letter-spacing 0.06em
- Mobile: 4:3 aspect-ratio

### 7.4 Search Input
- Position: relative wrapper with absolute icon
- Padding: 0.5rem 1rem 0.5rem 2.25rem (icon on left at 0.75rem)
- Border-radius: `--radius`, 1px `--border`
- Focus: border `--ring` without ring shadow (just border-color change)
- Font: 0.875rem, Inter, `--foreground`
- Icon: absolute positioned at left 0.75rem, top 50%, translateY(-50%), width/height 0.875rem, `--muted-foreground`

### 7.5 Custom Checkbox
- 1rem × 1rem, border 1.5px `--border`
- Checked: bg `--foreground`, white SVG checkmark via background-image
- Border-radius: 0.25rem

### 7.6 Modal / Confirm Dialog
- Overlay: fixed inset 0, bg `--foreground / 0.5`, z-index 200, centered flex
- Modal box: `--card`, 1px `--border`, radius `calc(var(--radius) + 0.125rem)`, shadow `0 8px 30px --fg / 0.1`, max-width 24rem, padding 1.5rem
- Icon: 2.5rem circle, `--destructive / 0.1` bg, SVG `--destructive` 1.25rem
- Dismiss: `Escape` key

### 7.7 Tags / Chips
- Padding: 0.125rem 0.5rem
- Border-radius: 9999px
- Font: 0.6875rem, weight 500, uppercase, letter-spacing 0.06em
- Colors: text `--muted-fg`, bg `--secondary`

### 7.8 Day Card (Dashboard)
- Padding: 1rem
- Header: flex row, justify-content space-between
  - Day name: 0.9375rem, weight 500
  - Exercise count badge: 0.75rem, `--muted-foreground`, bg `--secondary`, pill shape
- Exercise list: flex column, 0.25rem gap
  - Each item: 0.8125rem, `--muted-foreground`
- Hover: border-color + shadow transition

### 7.9 Search Results
- Top border separator, 0.75rem top padding
- Result items: flex row, border-bottom separator, 0.625rem padding
- Name: 0.875rem 500
- Category meta: 0.6875rem uppercase, 0.06em, `--muted-fg`

### 7.10 Exercise Card (Workout Day)
- Padding: 1rem
- Header: flex row, justify-content space-between
  - Title: 0.9375rem, weight 600
- Tags row: flex wrap, 0.375rem gap
- Muscle label: 0.75rem, `--muted-foreground`
- Actions row: flex, align-items center, gap 0.75rem, top border separator, 0.5rem top padding
  - Remove: inline-flex, 0.75rem, `--destructive`, no border, gap 0.25rem
  - Instructions toggle: margin-left auto, 0.75rem, `--muted-foreground`
  - Chevron: 0.625rem, rotates 180° on expand

### 7.11 Dropdown Menu
- Absolute below avatar, `right: 0`, top: `calc(100% + 0.375rem)`
- `--card`, 1px `--border`, radius `--radius`, shadow `0 4px 12px --fg / 0.06`
- Items: padding 0.5rem 0.75rem, font 0.8125rem, hover `--muted`
- Danger item: `--destructive` color
- Min-width: 10rem

### 7.12 Profile Row (Minha Conta)
- Flex row, align-items center, gap 0.75rem, padding 0.75rem 0
- Separator between rows: top border
- Avatar icon: 2.25rem circle, `--secondary` bg, centered SVG 1.125rem
- Content: flex 1
- Label: 0.75rem, `--muted-foreground`
- Value: 0.875rem, weight 500

### 7.13 Settings Section Card
- `--card` bg, 1px `--border`, radius `calc(var(--radius) + 0.125rem)`, overflow hidden
- Section header: padding 1rem 1.25rem, border-bottom `--border`
  - Title: 0.9375rem 600
  - Description: 0.8125rem `--muted-foreground`
- Section body: padding 1.25rem
- Danger zone: padding 1.25rem, border-top `--destructive / 0.2`, bg `--destructive / 0.03`
  - Title: 0.8125rem 600, `--destructive`

### 7.14 Danger Zone
- Settings section with `border-color: hsl(var(--destructive) / 0.2)`
- Section header h2 in `--destructive` color
- Background: `hsl(var(--destructive) / 0.03)`

### 7.15 Empty State
- Centered, 3rem 1.5rem padding
- SVG icon 2.5rem, opacity 0.4
- Text 0.875rem, `--muted-fg`

### 7.16 Hero (Landing)
- Full viewport minus header height, centered flex
- Background image `object-fit: cover` with `filter: brightness(0.35)`
- Dark gradient overlay: `linear-gradient(180deg, hsl(var(--foreground)/0.7), hsl(var(--foreground)/0.85))`
- Content: centered, white text, z-index above overlay
- Eyebrow: 0.75rem, weight 600, uppercase, letter-spacing 0.12em, `--muted-foreground`
- Headline: `clamp(2.25rem, 6vw, 4rem)` 800 weight, -0.03em, line-height 1.1, `--background`
- Highlighted text: `<em>` tag without italics, lighter opacity `hsl(var(--primary-foreground)/0.8)`
- Subtitle: `clamp(0.9375rem, 2vw, 1.125rem)`, `--muted-foreground`, max-width 36rem
- CTA: `--primary` bg, `--primary-fg`, 0.875rem, weight 600, letter-spacing 0.03em

### 7.17 404 Page
- Centered card, max-width 28rem
- Status code: 5rem 800 -0.04em, with the "0" character styled at `hsl(var(--muted-foreground) / 0.3)`
- Title: 1.125rem 600 -0.01em
- Description: 0.875rem `--muted-foreground`, line-height 1.6

---

## 8. Motion & Interaction

- **Default transition:** `0.15s ease` (all interactive elements)
- **Hover destructive:** `opacity 0.9`
- **Hover outline/secondary:** bg `--secondary`
- **Focus input:** border `--ring` (no ring shadow, just border-color change)
- **Chevron rotate:** `transform: rotate(180deg)`, `transition: 0.2s` (instructions toggle)
- **Carousel buttons:** `opacity: 0 → 1`, `transition: 0.15s`
- **Hero CTA:** `opacity 0.9` on hover
- **Header:** `position: sticky`, `z-index: 50`
- **Modal overlay:** `z-index: 200`
- **Dropdown:** toggle via class `.open`, click-outside closes

### Reduced Motion
Users who prefer reduced motion should not see jarring animations. All transitions default to short (0.15s). No parallax, no keyframe loops.

---

## 9. Voice & Brand

- **Language:** Brazilian Portuguese (pt-BR)
- **Tone:** Direct, utilitarian, fitness-themed. Short imperative labels.
- **Terminology:** "treino" (workout session), "ficha" (training sheet/split), "músculo primário/secundário" (primary/secondary muscle), "série" (set), "exercício" (exercise), "shape" (physique)
- **UI copy samples:**
  - Hero: "Seu próximo shape **começa aqui**" — aspirational, second-person
  - CTA: "Começar agora" — action-oriented
  - Dashboard header: "Olá, Usuário" — friendly but minimal
  - Action buttons: "Remover", "Adicionar", "Limpar treino", "Feito", "Instruções"
  - Auth: "Entrar com Google", "Faça login para continuar"
  - Profile: "Meus Dados", "Informações da sua conta"
  - Danger: "Excluir Conta" (title), "Zona de Perigo" (section header)
- **404 voice:** Playful but relevant fitness metaphors:
  - "Parece que você tentou acessar um exercício ou página que não existe. Respira, volta e tenta de novo."
  - "Esse exercício não existe na sua ficha"
  - "Parece que você tentou pegar um haltere que não está no rack"
- **Capitalization:** Sentence case in Portuguese (only first word capitalized)
- **Brand name:** "Ficha Treino" (no hyphen, no "de")
- **Icon convention:** Functional icons only, never decorative. Muscle labels may use emoji (💪 for primary) as native inline symbol, not SVG.

---

## 10. Icon System (Lucide-style)

All icons are inline SVGs with `currentColor` stroke, 1rem–1.25rem functional size, except for the logo mark. Google button uses 4-color branded SVG paths (not `currentColor`).

| Icon name | Used on | Visual |
|-----------|---------|--------|
| Logo mark | Header, login, landing, 404 | X cross + 4 dots in dark rounded square |
| Search | Workout day search box | Circle + line (Lucide search) |
| Back chevron | Headers | Chevron-left polyline |
| Chevron down | Instructions toggle | Small polyline, rotates 180° |
| Trash | Remove exercise, delete account | 3-path trash (Lucide trash-2) |
| Brush-cleaning | Clear workout button | Brush with handle (Lucide brush-cleaning) |
| Biceps-flexed (filled) | Primary muscle label | Biceps path, filled |
| Biceps-flexed (outline) | Secondary muscle label | Biceps path, no fill |
| Warning triangle | Modal confirm delete | Triangle with ! (Lucide alert-triangle) |
| Google logo | Login button | 4-color Google G (brand colors: #4285F4, #34A853, #FBBC05, #EA4335) |
| Home | 404 home button | House icon (Lucide home) |
| Plus | Feature card | Document icon |
| Chart | Feature card | Trending-up polyline (Lucide trending-up) |
| Clock | Feature card | Circle with clock hands |
| Arrow right | Hero CTA, add | Chevron-right polyline |
| User | Profile row | Person circle outline (Lucide user) |
| Mail | Profile row | Envelope (Lucide mail) |
| Delete account | Danger zone | Trash (Lucide trash-2) |

---

## 11. Anti-patterns

- **No purple gradient washes** or gradient on every background
- **No emoji as functional icons** — use Lucide-style SVGs (exception: 💪 for muscle labels as native inline symbol)
- **No rounded card with left color-border accent**
- **No hand-drawn SVG humans or scenery**
- **No icon beside every heading** (icons are functional, not decorative)
- **No Inter as display face is acceptable here** (it's the only face across product)
- **No warm beige/cream default canvases** — use `--background: 210 40% 98%`
- **No invented metrics or filler copy** — use honest "—" placeholders
- **No chart outlines without fill** — charts should encode with fills
- **No `white-space: nowrap` that causes text overflow** — use ellipsis or wrap
- **No card/button that is not interactive** — every card is clickable
- **No decorative gradients, indigo, or warm tones**
- **No hero image without dark overlay** — photo backgrounds must have brightness filter + gradient to ensure white text legibility
- **No `filter: drop-shadow()` for card elevation** — use `box-shadow` instead for consistent results

---

## 12. HTML Structure Pattern

Every page follows this structure:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ficha Treino — [Page Name]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>@import "colors_and_type.css";</style>
</head>
<body>
  <header class="header">...</header>
  <main class="container">...</main>
  <script>...</script>
</body>
</html>
```

### data-od-id convention
Use `data-od-id="kebab-case-id"` on interactive elements:
- `btn-voltar`, `btn-entrar-header`, `btn-comecar-agora`
- `day-card-segunda`, `day-card-terca`
- `input-busca-exercicios`
- `btn-instrucoes-{id}`, `btn-remover-{id}`, `btn-add-{id}`
- `check-feito-{id}`
- `prev-{id}`, `next-{id}`, `dot-{id}-{n}`
- `btn-limpar-treino`, `btn-excluir-conta`, `btn-cancelar-exclusao`, `btn-confirmar-exclusao`
- `hero`, `features`, `feature-card-plano`, `feature-card-evolucao`, `feature-card-simplicidade`, `footer`

### Implementation notes

- **Google button:** Use the full 4-color SVG path for the Google "G" logo. Brand colors: `#4285F4` (blue), `#34A853` (green), `#FBBC05` (yellow), `#EA4335` (red). Do NOT use `currentColor`.
- **Hero image:** Always apply `filter: brightness(0.35)` AND `linear-gradient(180deg, ...)` overlay. The overlay alone doesn't darken enough; the brightness filter is essential for text legibility.
- **Muscle labels:** Use 💪 emoji as inline symbol before text. For primary/secondary, differentiate via icon fill (Lucide biceps-flexed filled vs outline).
- **404 "0" effect:** The middle character in "404" uses `hsl(var(--muted-foreground) / 0.3)` opacity to create visual rhythm.
- **Card hover:** Always pair `border-color` change with `box-shadow`. The border change uses `--ring / 0.12`, the shadow uses `--foreground / 0.04–0.06`.
- **Profile rows:** Use a `+` selector for separators: `.profile-row + .profile-row { border-top: 1px solid hsl(var(--border)); }`.
