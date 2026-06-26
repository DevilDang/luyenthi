# LuyenThi — Design Specification (Doraemon Style)

A cheerful, rounded, and playful UI inspired by Doraemon's visual identity:
sky-blue as the hero color, bubbly shapes, soft shadows, and friendly typography.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `doraemon-50`  | `#e8f7fd` | Page backgrounds, card fills |
| `doraemon-100` | `#c2ebf9` | Hover states, subtle highlights |
| `doraemon-200` | `#8dd8f4` | Borders, dividers |
| `doraemon-300` | `#4cbfe8` | Disabled buttons, placeholders |
| `doraemon-400` | `#1aadd9` | Secondary actions |
| `doraemon-500` | `#0095c8` | Primary brand (Doraemon blue) |
| `doraemon-600` | `#007aaa` | Button hover |
| `doraemon-700` | `#005e87` | Active states, headings |
| `doraemon-800` | `#004265` | Dark text on light bg |
| `doraemon-900` | `#002844` | Footer, deep backgrounds |
| `accent-red`   | `#ff4757` | Alerts, Doraemon nose/collar detail |
| `accent-yellow`| `#ffd32a` | Badges, stars, Doraemon's bell |
| `accent-white` | `#ffffff` | Cards, panels |
| `surface`      | `#f0f9ff` | Main page background |

---

## Typography

**Font**: [Nunito](https://fonts.google.com/specimen/Nunito) — rounded letterforms that feel friendly.

```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

| Scale | Size | Weight | Usage |
|---|---|---|---|
| `text-xs`   | 12px | 500 | Tags, labels |
| `text-sm`   | 14px | 500 | Body, captions |
| `text-base` | 16px | 600 | Default text |
| `text-lg`   | 18px | 700 | Card titles |
| `text-xl`   | 20px | 700 | Section headings |
| `text-2xl`  | 24px | 800 | Page headings |
| `text-3xl`  | 30px | 900 | Hero headings |
| `text-4xl`  | 36px | 900 | Display / login title |

---

## Border Radius

Everything is **very rounded** — no sharp corners anywhere.

| Token | Value | Usage |
|---|---|---|
| `rounded-xl`  | 12px | Inputs, small cards |
| `rounded-2xl` | 16px | Buttons, chips |
| `rounded-3xl` | 24px | Cards, modals |
| `rounded-full`| 9999px | Avatars, badges, pill buttons |

---

## Shadows

Soft, slightly colored shadows (blue-tinted, not gray).

```css
/* card */ box-shadow: 0 4px 20px rgba(0, 149, 200, 0.12);
/* card hover */ box-shadow: 0 8px 32px rgba(0, 149, 200, 0.22);
/* button */ box-shadow: 0 4px 12px rgba(0, 149, 200, 0.35);
/* modal */ box-shadow: 0 16px 48px rgba(0, 42, 101, 0.18);
```

---

## Component Rules

### Buttons

- Shape: `rounded-full` (pill)
- Primary: `bg-doraemon-500 text-white` with blue shadow, hover `bg-doraemon-600`
- Secondary: `border-2 border-doraemon-400 text-doraemon-600` transparent bg
- Danger: `bg-accent-red text-white`
- Padding: `px-6 py-2.5` for normal, `px-8 py-3` for large
- Font: `font-bold` (700)
- Transition: `transition-all duration-200`

### Cards

- Background: `bg-white`
- Border: `border border-doraemon-100`
- Radius: `rounded-3xl`
- Padding: `p-6`
- Shadow: blue-tinted shadow (see Shadows)
- Hover: lift + deeper shadow

### Inputs & Selects

- Radius: `rounded-2xl`
- Border: `border-2 border-doraemon-200 focus:border-doraemon-500`
- Padding: `px-4 py-2.5`
- Font: `font-semibold`
- Focus ring: `outline-none ring-2 ring-doraemon-300`
- Background: `bg-doraemon-50`

### Navbar

- Background: `bg-white` with bottom border `border-doraemon-100`
- Logo: bold, `text-doraemon-700`, large rounded font
- Active link: `text-doraemon-500 font-bold` with bottom indicator dot
- Avatar: `rounded-full` with `ring-2 ring-doraemon-300`

### Badges / Chips

- Shape: `rounded-full`
- Subject colors:
  - Math → `bg-doraemon-100 text-doraemon-700`
  - Science → `bg-green-100 text-green-700`
  - Social → `bg-yellow-100 text-yellow-700`
- Admin badge → `bg-accent-red text-white`

### Page Background

```css
background: linear-gradient(135deg, #e8f7fd 0%, #f0f9ff 50%, #ffffff 100%);
```

---

## Decorative Elements

To reinforce the Doraemon feel, add these small touches:

- **Bubbles / circles**: Subtle `doraemon-100` or `doraemon-50` circles as background blobs (absolute positioned, blurred)
- **Stars/sparkles**: Use `⭐` or SVG stars near score displays
- **Bell icon**: Use as favicon or leaderboard trophy icon (golden yellow)
- **Pocket motif**: Rounded card with a dashed border for "saved" or "favorites"

---

## Spacing System (standard Tailwind scale)

Use multiples of 4px. Prefer generous padding — the design should feel roomy and open, not cramped.

- Inside cards: `p-6` (24px)
- Between cards: `gap-4` or `gap-6`
- Section vertical rhythm: `space-y-8`
- Page max-width: `max-w-5xl mx-auto px-4`

---

## Animation & Transitions

| Element | Animation |
|---|---|
| Buttons | `transition-all duration-200 hover:scale-105` |
| Cards | `transition-shadow duration-300 hover:-translate-y-1` |
| Loading spinner | Bouncing dots or spinning circle in `doraemon-500` |
| Page enter | `fade-in` + slight upward slide (`translate-y-2 → 0`) |
| Score reveal | Count-up animation |

---

## Implementation Checklist

- [ ] Update `tailwind.config.js` — add `doraemon` + `accent` color tokens
- [ ] Update `index.css` — import Nunito, set `font-family`, page background, base styles
- [ ] Restyle `LoginPage` — hero card with Doraemon blue gradient
- [ ] Restyle `Navbar` — rounded logo, active link dots
- [ ] Restyle `ExamListPage` — subject-colored card chips
- [ ] Restyle `ExamPage` — question cards with bubble styling
- [ ] Restyle `ResultPage` — animated score reveal, star badges
- [ ] Restyle `LeaderboardPage` — trophy/bell icons, rank badges
- [ ] Restyle `Admin` pages — consistent card & table styling
