# MakiSync — Public Portfolio Page Specification
> Single-page scrollable portfolio for a Social Media Manager & Virtual Assistant.
> Built with Next.js (App Router), TypeScript, inline styles only (no Tailwind/CSS modules).
> All data fetched from the existing backend API.

---

## Tech Stack & Libraries

| Purpose | Library |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Animations / scroll reveals | **Framer Motion** (`framer-motion`) |
| Smooth scroll behavior | CSS `scroll-behavior: smooth` + `framer-motion` scroll hooks |
| Intersection observer (reveal on scroll) | Framer Motion `useInView` |
| Dot grid canvas (background) | Custom canvas (same as login page right panel) |
| Icons | Bootstrap Icons via CDN (`bi-*`) |
| Font | Inter (Google Fonts) |
| Lightbox (gallery) | Custom (same pattern as admin gallery) |
| Contact form | Native fetch → `POST /api/messages` |

---

## Color System

Uses the same CSS custom properties as the admin panel.
Set via `data-theme` attribute on `<html>` — dark default, light toggle available.

```css
/* Dark mode */
--admin-bg-primary:    #0a0f1a
--admin-bg-secondary:  #0f1724
--admin-card:          rgba(16,23,34,0.96)
--admin-border:        rgba(140,171,214,0.12)
--admin-border-strong: rgba(59,130,246,0.22)
--admin-text-primary:  #f4f8ff
--admin-text-secondary:#a5b4cf
--admin-text-muted:    #6f83a6
--admin-accent:        #3b82f6
--admin-shadow:        0 18px 40px rgba(0,0,0,0.28)

/* Light mode */
--admin-bg-primary:    #f0f4ff
--admin-bg-secondary:  #e8edf8
--admin-card:          rgba(255,255,255,0.96)
--admin-text-primary:  #0f172a
--admin-text-secondary:#334155
--admin-text-muted:    #64748b
--admin-accent:        #2563eb
```

**Body background** (both modes):
```css
background:
  radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 26%),
  linear-gradient(180deg, var(--admin-bg-primary) 0%, var(--admin-bg-secondary) 100%);
```

---

## Typography

- **Font:** `'Inter', system-ui, sans-serif`
- **Load via:** `next/font/google` (already in root layout)
- Letter spacing: `-0.02em` to `-0.03em` on headings

| Role | Size | Weight |
|---|---|---|
| Section title | `2rem–2.5rem` | 800 |
| Card title | `1rem–1.1rem` | 700 |
| Body | `0.9rem–1rem` | 400–500 |
| Muted / meta | `0.78rem–0.82rem` | 400 |
| Nav links | `0.85rem` | 600 |

---

## Layout Overview

```
┌─────────────────────────────────────────────────┐
│  NAVBAR (fixed top, blur backdrop)               │
│  [Logo + Name]    [About Services Projects ...]  │
│                                    [Theme Toggle]│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  #hero — full viewport height                    │
│  Dot grid canvas background                      │
│  [Headline]  [Subheadline]  [CTA Button]         │
│  Animated entrance (fadeUp)                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  #about — two-column (avatar left, bio right)    │
│  Avatar, name, tagline, bio, location, years exp │
│  Social links row (icons)                        │
│  Download Resume button                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  #services — card grid (1→2→3 col)              │
│  Icon + Title + Description per card             │
│  Hover: border glow + lift                       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  #skills — grouped by category                   │
│  Logo/icon grid, category pill filter            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  #tools — same layout as skills                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  #projects — card grid (1→2→3 col)              │
│  Cover image (16:9) + title + description        │
│  Status: published only                          │
│  Click cover → lightbox                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  #gallery — masonry or square grid               │
│  Image + gradient overlay (title + description)  │
│  Category filter pills                           │
│  Click → lightbox                                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  #testimonials — horizontal scroll or grid       │
│  Avatar + Name + Title + Stars + Quote           │
│  published only                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  #certifications — card grid                     │
│  Certificate image + title + issuer + dates      │
│  Expired badge if past expiry                    │
│  View Credential link                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  #contact — two column (info left, form right)  │
│  Left: email, phone, social links                │
│  Right: Name, Email, Subject, Message, Send btn │
│  POST → /api/messages                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  FOOTER                                          │
│  © 2026 [site_name] · Social links              │
└─────────────────────────────────────────────────┘
```

---

## Navbar

- **Position:** `fixed`, `top: 0`, `z-index: 100`
- **Background:** `rgba(10,15,26,0.85)` dark / `rgba(255,255,255,0.9)` light with `backdrop-filter: blur(16px)`
- **Height:** 60px
- **Content:** Logo (32×32) + site name left · Nav links center/right · Theme toggle right
- **Active link:** underline or accent color based on scroll position
- **Mobile:** hamburger → slide-down menu
- **Smooth scroll:** clicking nav link scrolls to `#section-id`
- **Scroll behavior:** navbar gets border-bottom on scroll (`borderBottom: '1px solid var(--admin-border)'`)

---

## Section Styles

Every section follows this pattern:
```js
// Section wrapper
{
  padding: '5rem 2rem',           // desktop
  padding: '3.5rem 1.25rem',      // mobile
  maxWidth: 1200,
  margin: '0 auto',
}

// Section label (above title)
{
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--admin-accent)',
  marginBottom: '0.5rem',
}

// Section title
{
  fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
  fontWeight: 800,
  color: 'var(--admin-text-primary)',
  letterSpacing: '-0.03em',
  marginBottom: '0.5rem',
}

// Section subtitle
{
  fontSize: '1rem',
  color: 'var(--admin-text-muted)',
  marginBottom: '3rem',
}
```

---

## Background — Dot Grid Canvas

Same interactive dot grid as the login page right panel:
- Canvas fills the page background (full `position: fixed, inset: 0, z-index: 0`)
- Grid of dots spaced **28px** apart, radius **1.8px**
- **Mouse repel:** dots within **120px** radius push away from cursor
- **Lerp 0.08** for smooth return
- Dot color: `rgba(255,255,255,0.07)` dark / `rgba(0,0,0,0.06)` light
- All page content has `position: relative, z-index: 1` above the canvas
- `pointer-events: none` on canvas
- Mobile: skip canvas for performance (< 768px)

---

## Animations (Framer Motion)

### Scroll reveal — every section animates in:
```js
// Wrap each section content with:
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
>
```

### Hero entrance — staggered children:
```js
// Each element (label, title, subtitle, CTA) delays by 0.1s
transition={{ delay: index * 0.1, duration: 0.7 }}
```

### Card hover:
```js
<motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }}>
```

### Navbar hide/show on scroll:
```js
// useScroll + useTransform to hide navbar when scrolling down fast
// show when scrolling up
```

---

## Section Details

### Hero (`#hero`)
- **Height:** `100vh`
- **Background:** dot canvas + gradient
- **Layout:** centered, `flexDirection: column`, `alignItems: center`, `textAlign: center`
- **Content:**
  - Small label: `"WELCOME"` or profession tagline
  - Avatar (80px circle) — optional
  - Headline from `hero.headline`
  - Subheadline from `hero.subheadline`
  - CTA button → scrolls to `#contact` (or `hero.cta_url`)
  - Scroll indicator arrow bouncing at bottom
- **Entrance:** staggered fadeUp animation

### About (`#about`)
- **Layout:** two-column desktop (avatar+info left, bio right), single column mobile
- **Left:** Avatar (160px circle, bordered), name, tagline, location badge, years experience badge
- **Right:** Bio text, social links row (icons from `contacts` table), Download Resume button (links to `resume.file_url`)
- **Social icons:** email, phone, instagram, facebook, linkedin, twitter — show only if value exists

### Services (`#services`)
- **Grid:** `repeat(auto-fill, minmax(280px, 1fr))`
- **Card:** icon (48px accent-colored box) + title + description (3-line clamp)
- **Hover:** `border-color` → accent + slight `translateY(-4px)`

### Skills & Tools (`#skills`, `#tools`)
- **Layout:** category filter pills row + logo grid below
- **Logo grid:** `repeat(auto-fill, minmax(100px, 1fr))`
- **Each item:** logo image (48px) + name below, centered
- **No logo fallback:** initials or icon placeholder

### Projects (`#projects`)
- **Grid:** `repeat(auto-fill, minmax(300px, 1fr))`
- **Card:** 16:9 cover image + gradient overlay with title + description snippet
- **Filter:** published only (`status = 'published'`)
- **Click cover:** lightbox

### Gallery (`#gallery`)
- **Grid:** `repeat(auto-fill, minmax(240px, 1fr))`, square aspect ratio
- **Card:** image fills card + gradient overlay at bottom (title + description)
- **Category filter pills** — filter by `category_name`
- **Click:** lightbox with blur backdrop

### Testimonials (`#testimonials`)
- **Layout:** horizontal scroll on mobile, 2–3 col grid on desktop
- **Card:** quote icon top-left, message (italic), stars, avatar + name + title at bottom
- **Published only**
- **Subtle card background:** slightly lighter than page bg

### Certifications (`#certifications`)
- **Grid:** `repeat(auto-fill, minmax(260px, 1fr))`
- **Card:** certificate image (16:9) + title + issuer + date range
- **Expired badge:** red pill overlay if past `expiry_date`
- **Click image:** lightbox
- **View Credential:** external link button

### Contact (`#contact`)
- **Layout:** two-column desktop (info left 40%, form right 60%), stacked mobile
- **Left:** heading, subtitle, contact items (icon + label + value), social icons
- **Right:** form — Name*, Email*, Subject, Message* (textarea), Send button
- **Submit:** `POST /api/messages` → success toast / error message
- **Form validation:** required fields highlighted on empty submit

---

## Responsiveness

| Breakpoint | Width | Changes |
|---|---|---|
| Mobile | < 768px | Single column, no canvas, hamburger nav, stacked sections |
| Tablet | 768–1023px | 2-col grids, canvas on |
| Desktop | ≥ 1024px | 3-col grids, full layout |

---

## API Calls (all public, no auth needed)

```
GET /api/content/hero          → hero section data
GET /api/profile               → name, tagline, bio, avatar_url, location, years_experience
GET /api/profile/contacts      → social links
GET /api/profile/resume        → title, file_url
GET /api/services              → services list
GET /api/skills                → skills list
GET /api/tools                 → tools list
GET /api/projects              → filter published only client-side
GET /api/gallery               → all photos
GET /api/gallery/categories    → category list
GET /api/testimonials          → filter is_published only client-side
GET /api/certifications        → all certifications
POST /api/messages             → contact form submission
  body: { sender_name, sender_email, subject, body }
```

---

## Footer

- **Background:** slightly darker than page bg
- **Content:**
  - Logo + site name (left)
  - Nav links (center, same as navbar)
  - `© 2026 [site_name]. All rights reserved.` (right or centered on mobile)
- **Social icons row** (from contacts table)
- **Top border:** `1px solid var(--admin-border)`

---

## Theme Toggle

- Fixed top-right corner (same pill toggle as login page)
- Persists to `localStorage` key `'theme'`
- Updates `data-theme` on `<html>`

---

## Lightbox

- Fixed overlay, `z-index: 9999`
- `background: rgba(0,0,0,0.9)`, `backdrop-filter: blur(8px)`
- Image centered, `max-height: 90vh`, `border-radius: 12px`
- Close on backdrop click or `Escape` key
- X button top-right

---

## Performance Notes

- All API calls in parallel using `Promise.all` on page mount
- Images use `loading="lazy"` except hero avatar
- Canvas skipped on mobile (< 768px) for performance
- Framer Motion `viewport={{ once: true }}` so animations only fire once

---

*Generated for: MakiSync Portfolio — SMM & VA Website*
*Stack: Next.js · TypeScript · Framer Motion · Bootstrap Icons · Inter Font*
*Theme: Dark/Light via CSS custom properties*
