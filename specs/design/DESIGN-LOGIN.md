# Login Page — Design Specification (Doraemon & Friends)

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ⭐        ☁️ cloud-sm         ⭐        ⭐                  │  sky top
│       ☁️ cloud-lg                    ☁️ cloud-md             │
│  [Doraemon]      [Nobita]      [Shizuka]    [Gian]  [Suneo]  │  characters
│                                                               │
│              ┌────────────────────────┐                      │
│              │       🔔 Bell          │                      │
│              │                        │                      │
│              │  LuyenThi              │  frosted glass card  │
│              │  Nền tảng luyện thi    │                      │
│              │  ✦ Học vui – Thi giỏi ✦│                      │
│              │                        │                      │
│              │  [ G  Đăng nhập Google]│                      │
│              │                        │                      │
│              │  🤖 📚 ⭐ 🎯 🏆        │                      │
│              └────────────────────────┘                      │
│  ☁️ cloud-sm          ☁️ cloud-lg                            │  sky bottom
│  🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿     │  ground strip
└──────────────────────────────────────────────────────────────┘
```

---

## Background Layers (back → front)

| Layer | Element | Detail |
|---|---|---|
| 1 | Sky gradient | `#1aadd9` → `#4cbfe8` → `#87ceeb` → `#c2ebf9` (top → bottom) |
| 2 | Color blobs | Blurred circles: blue (Doraemon), yellow (Nobita), pink (Shizuka) — `blur-3xl opacity-20` |
| 3 | Clouds | 5 SVG clouds, CSS drift animation, different sizes & speeds |
| 4 | Character icons | 5 floating SVG characters, gentle bob animation |
| 5 | Stars | 12 sparkle emojis, fade-in/out twinkle loop |
| 6 | Ground | Soft green gradient strip at bottom |
| 7 | **Login card** | Frosted glass center card |

---

## Sky Gradient

```css
background: linear-gradient(180deg,
  #1aadd9 0%,    /* deep Doraemon blue at horizon top */
  #4cbfe8 35%,   /* mid sky */
  #87ceeb 65%,   /* light sky blue */
  #c2ebf9 100%   /* pale near ground */
);
```

---

## Clouds

Shape: SVG multi-ellipse (puffy), fill white, opacity 0.85–0.95.

| Cloud | Width | Top | Speed | Direction |
|---|---|---|---|---|
| A | 220px | 6% | 20s | left → right |
| B | 300px | 18% | 28s | right → left (starts off-screen right) |
| C | 160px | 8% | 16s | left → right (delayed 10s) |
| D | 250px | 60% | 24s | right → left (delayed 6s) |
| E | 180px | 72% | 19s | left → right (delayed 14s) |

Animation: `@keyframes cloudDrift` — translate from `-120%` to `120%` on X axis, infinite linear.

---

## Character Representations

Simple stylized SVG icons (non-copyright-infringing abstract forms). Float with `@keyframes bobFloat` (translateY ±10px, 3s ease-in-out infinite).

| Character | Colors | Position | Bob delay |
|---|---|---|---|
| Doraemon | Blue `#0095c8` + white + red nose | Left 12%, top 35% | 0s |
| Nobita | Skin `#f5c97a` + blue glasses | Left 28%, top 42% | 0.6s |
| Shizuka | Pink `#ffb3c6` + white | Right 28%, top 38% | 1.2s |
| Gian | Orange-brown + wide face | Right 14%, top 44% | 1.8s |
| Suneo | Purple `#c084fc` + smug grin | Left 48%, top 55% | 0.9s |

Size: 56×64px each, semi-transparent (`opacity-80`), shrink on mobile.

---

## Login Card

| Property | Value |
|---|---|
| Width | `max-w-sm` (384px) |
| Background | `bg-white/90 backdrop-blur-md` |
| Border | `1px solid rgba(255,255,255,0.7)` |
| Border radius | `rounded-4xl` (32px) |
| Padding | `p-8` |
| Shadow | `0 20px 60px rgba(0,42,101,0.25)` |
| Inner glow | `0 0 0 1px rgba(255,255,255,0.6)` |

### Card Contents (top → bottom)

1. **Bell icon** — golden SVG, 64×64, centered, slight drop shadow
2. **Title** — "LuyenThi" `text-4xl font-black text-doraemon-700`
3. **Subtitle** — "Nền tảng luyện thi thông minh" `text-sm font-semibold text-doraemon-400`
4. **Tagline** — "✦ Học vui – Thi giỏi – Tiến xa ✦" `text-xs text-doraemon-300`
5. **Error alert** (conditional) — red rounded banner
6. **Google button** — pill, white bg, `border-2 border-doraemon-200`, Google icon + text, hover lifts
7. **Emoji row** — 🤖 📚 ⭐ 🎯 🏆 (decorative)
8. **Legal text** — `text-xs text-doraemon-300`

---

## Animations

```css
/* Cloud drifting across screen */
@keyframes cloudDrift {
  from { transform: translateX(-120%); }
  to   { transform: translateX(120vw); }
}

/* Characters floating up and down */
@keyframes bobFloat {
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50%       { transform: translateY(-12px) rotate(2deg); }
}

/* Stars twinkling */
@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1.2); }
}
```

---

## Responsive

- Mobile: hide characters on `sm:hidden`, keep clouds & background
- Card: full width on mobile with `mx-4`
- Reduce star count to 6 on small screens via CSS `nth-child`
