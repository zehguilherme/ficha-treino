# Design System — Ficha Treino

Baseado nos tokens ShadCN (HSL) + Tailwind + Inter, extraído de `login.html`, `dashboard.html`, `workout-day.html`, `minha-conta.html`.

---

## 1. Tokens (CSS custom properties)

```css
:root {
  --background: 210 40% 98%;    /* #f4f5f7 */
  --foreground: 222.2 84% 4.9%; /* #0a0a0b */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;   /* #f1f5f9 */
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%; /* #6b7280 */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%; /* #ef4444 */
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;  /* #e2e8f0 */
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

OBS: `login.html` usa `--background: 0 0% 100%` (branco puro) na página de login centralizada — os demais screens usam o tom cinza claro `210 40% 98%`.

---

## 2. Tipografia

| Família | Uso |
|---------|-----|
| Inter (400, 500, 600, 700) | Body + headings |
| Fallback | `system-ui, -apple-system, sans-serif` |

### Escala

| Papel | Tamanho | Weight | Letter-spacing | Onde |
|-------|---------|--------|----------------|------|
| Título de página | 1.5rem | 600 | -0.02em | `.page-title`, `.day-name-large` |
| Título de header | 1rem | 600 | -0.01em | `.header-title` |
| Nome de exercício | 0.9375rem | 600 | normal | `.exercise-name` |
| Nome do dia (card) | 0.9375rem | 500 | normal | `.day-name` |
| Subtítulo | 0.875rem | 400 | normal | `.page-subtitle`, `.delete-description`, `.modal p` |
| Search input | 0.875rem | 400 | normal | `.search-input` |
| Search results | 0.875rem | 500 | normal | `.search-result-name` |
| UI buttons | 0.8125rem | 500 | 0.02em | `.btn-*` |
| Exercise meta | 0.75rem | 400 | normal | `.exercise-meta` |
| Instructions toggle | 0.75rem | 500 | normal | `.instructions-toggle` |
| Badge / Dia badge | 0.75rem | 500 | normal | `.day-badge` |
| Small labels | 0.75rem | 400 | 0.02em | `.profile-label` |
| Tag / CAPS | 0.6875rem | 500 | 0.06em | `.tag`, `.carousel-counter`, `.search-results-title`, `.search-result-category` |
| Carousel counter | 0.6875rem | 500 | 0.06em | `.carousel-counter` |

### Regras

- Body line-height: 1.5–1.6
- Display negrito tracking: `h1` (1.5rem) usa `-0.02em`
- Tags uppercase com `letter-spacing: 0.06em`
- UI buttons uppercase tracking `0.02em`

---

## 3. Paleta funcional

| Token | Aparência | Uso |
|-------|-----------|-----|
| `--bg` | Cinza claro #f4f5f7 | Fundo das páginas internas |
| `--card` | Branco #fff | Cards, header, seções |
| `--fg` | Preto suave #0a0a0b | Texto principal |
| `--muted-fg` | Cinza médio #6b7280 | Texto secundário, placeholders |
| `--border` | Cinza claro #e2e8f0 | Todas as bordas |
| `--secondary` | Cinza azulado #f1f5f9 | Hover, tags, carousel background |
| `--destructive` | Vermelho #ef4444 | Ações destrutivas (remover, excluir) |
| `--ring` | Preto foco | Focus ring dos inputs |

---

## 4. Componentes

### 4.1 Botões

| Variante | Borda | Fundo | Texto | Hover |
|----------|-------|-------|-------|-------|
| **Back** (ícone) | 1px `--border` | `--card` | `--fg` | `--secondary` |
| **Destrutivo** | none | `--destructive` | white | `--destructive / 0.9` |
| **Outline default** | 1px `--border` | none / `--card` | `--fg` / `--muted-fg` | `--secondary` |
| **Add (sólido)** | none | `--fg` | `--primary-fg` | opacity 0.85 |
| **Clear (hover destr.)** | 1px `--border` | none | `--muted-fg` → `--destructive` | border `--destructive / 0.3` |
| **Cancel (modal)** | 1px `--border` | `--card` | `--fg` | `--secondary` |
| **Google (full-width)** | 1px `--border` | `--card` | `--fg` | `--secondary`, border `--ring / 0.2` |

**Dimensões:**
- Ícone-only: 2rem × 2rem
- Destrutivo/Add/Clear: padding `0.375rem 0.75rem`, border-radius `--radius`
- Delete account: padding `0.5rem 1rem`
- Google login: padding `0.75rem 1.5rem`, width 100%
- Instructions toggle: padding `0.25rem 0.5rem`, border-radius `0.375rem`

**Ícone em botões:** sempre SVG 0.875rem × 0.875rem (destrutivos) ou 1rem × 1rem

### 4.2 Cards

| Tipo | Padding | Border-radius | Borda | Fundo |
|------|---------|---------------|-------|-------|
| Login card | 2.5rem | `--radius + 0.25rem` | 1px `--border` | `--card` |
| Day card (dashboard) | 1.25rem | `--radius + 0.125rem` | 1px `--border` | `--card` |
| Exercise card | body: 1.25rem | `--radius + 0.125rem` | 1px `--border` | `--card` |
| Settings section | body: 1.25rem | `--radius + 0.125rem` | 1px `--border` | `--card` |

### 4.3 Header (sticky)

| Propriedade | Valor |
|-------------|-------|
| Altura | 3.5rem |
| Fundo | `--card` |
| Borda inferior | 1px `--border` |
| Inner max-width | 80rem |
| Inner padding | 0 1.5rem |
| Gap (ícone + título) | 0.75rem |

### 4.4 Formulários

**Search input:**
- Padding: 0.625rem 0.75rem 0.625rem 2.25rem (ícone no padding-left)
- Border-radius: `--radius`
- Focus: border `--ring` + box-shadow `--ring / 0.1`

**Checkbox custom:**
- 1rem × 1rem, border 1.5px `--border`
- Checked: bg `--fg`, SVG checkmark como background-image
- Border-radius: 0.25rem

### 4.5 Modal

| Elemento | Valor |
|----------|-------|
| Overlay | fixed inset 0, bg `--fg / 0.5` |
| Modal box | `--card`, border 1px `--border`, radius `--radius + 0.125rem`, shadow `0 8px 30px --fg / 0.1`, max-width 24rem, padding 1.5rem |
| Ícone modal | 2.5rem × 2.5rem, border-radius 9999px, bg `--destructive / 0.1`, svg `--destructive` 1.25rem |

### 4.6 Tags / Chips

- Padding: 0.125rem 0.5rem
- Border-radius: 9999px
- Font: 0.6875rem, weight 500, uppercase, letter-spacing 0.06em
- Cores: text `--muted-fg`, bg `--secondary`

### 4.7 Carrossel (ShadCN pattern)

- Wrapper: 16/9 aspect-ratio, `--secondary` bg, border-radius `--radius`, 1px `--border`
- Viewport: overflow hidden
- Track: flex, scroll-snap-type x mandatory, scroll-behavior smooth
- Buttons (prev/next): 2rem circle, `--card / 0.85` bg, backdrop-filter blur, opacity 0 → 1 on hover
- Footer: absolute bottom, centered, `--fg / 0.45` bg, border-radius 9999px, backdrop-filter blur
- Dots: 0.5rem × 0.5rem circles, `--bg / 0.5` → `--bg` when active
- Counter: 0.6875rem, letter-spacing 0.06em

---

## 5. Layout

| Screen | Container max-width | Padding |
|--------|-------------------|---------|
| Dashboard | 80rem | 2rem 1.5rem |
| Workout day | 56rem | 2rem 1.5rem |
| Minha conta | 48rem | 2rem 1.5rem |
| Login | 22rem (card) | centralizado |

**Grid:** `grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr))` + gap 1rem (dashboard)

**Mobile (< 640px):** padding reduzido para 1.5rem 1rem, grid vira 1 coluna, carrossel vai para 4/3

**Responsivo sem media queries:** max-width containers + flex/grid adaptável

---

## 6. Micro-interações

- Hover destrutivo: `opacity 0.9`
- Hover outline: bg `--secondary`
- Focus input: ring de 2px `--ring / 0.1`
- Chevron instruções: rotate 180deg com transition 0.2s
- Carrossel buttons: opacity 0 → 1, transition 0.15s
- Header sticky z-index: 50
- Modal overlay z-index: 200
- All transitions: 0.15s ease

---

## 7. Icones (Lucide-style)

| Ícone | Onde | SVG |
|-------|------|-----|
| Logo (X + 4 dots) | Header dashboard, login | 4 círculos + 2 diagonais |
| Search | workout-day | circle + line |
| Chevron (instruções) | workout-day | polyline 6 9 12 15 18 9 |
| Lixeira | Remover, Excluir conta | trash (3 paths) |
| Brush-cleaning | Limpar treino | brush with handle |
| Target (3 circles) | Músculo primário | 3 concentric circles |
| Target outline (2 circles) | Músculo secundário | 2 concentric circles |
| Back arrow | workout-day, conta | chevron left (polyline) |
| Warning triangle | Modal excluir | triangle with ! |
| Google logo | Login | 4-color Google G |

---

## 8. Menu dropdown

- Posição: absolute abaixo do avatar, right: 0
- Box: `--card`, 1px `--border`, shadow `0 4px 12px --fg / 0.06`
- Items: padding 0.5rem 0.75rem, font 0.8125rem, hover `--muted`
- Item `.danger`: cor `--destructive`
- Min-width: 10rem
