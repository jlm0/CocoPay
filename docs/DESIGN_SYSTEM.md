# CocoPay Design System

A unified design language for web and mobile. Both platforms share the same visual identity: **Neo-Brutalist Typographic Maximalism** — loud, confident, unapologetically fun, and a deliberate rejection of corporate fintech aesthetics.

---

## 1. Color Palette

Five colors. No exceptions.

| Token   | Hex       | HSL                | Role                                    |
|---------|-----------|--------------------|-----------------------------------------|
| `black` | `#0A0A0A` | 0 0% 4%            | Primary surface (dark), primary text (light) |
| `white` | `#FAFAFA` | 0 0% 98%           | Primary text (dark), primary surface (light) |
| `pink`  | `#FF2E63` | 345 100% 59%       | Destructive, accent, energy, urgency    |
| `green` | `#BAFF29` | 82 100% 58%        | Primary action, CTA, success, money     |
| `blue`  | `#00D4FF` | 191 100% 50%       | Info, secondary accent, numbering       |

### Semantic Token Mapping

Semantic tokens map the 5 palette colors to UI roles. Both platforms use the same token names.

#### Dark Mode

| Token                    | Value               | Source   |
|--------------------------|---------------------|----------|
| `background`             | `#0A0A0A`           | black    |
| `foreground`             | `#FAFAFA`           | white    |
| `primary`                | `#BAFF29`           | green    |
| `primary-foreground`     | `#0A0A0A`           | black    |
| `destructive`            | `#FF2E63`           | pink     |
| `destructive-foreground` | `#0A0A0A`           | black    |
| `info`                   | `#00D4FF`           | blue     |
| `info-foreground`        | `#0A0A0A`           | black    |
| `card`                   | `#111111`           | black +  |
| `card-foreground`        | `#FAFAFA`           | white    |
| `surface`                | `#161616`           | black +  |
| `surface-foreground`     | `#FAFAFA`           | white    |
| `muted`                  | `#1A1A1A`           | black +  |
| `muted-foreground`       | `rgba(250,250,250,0.5)` | white 50% |
| `border`                 | `rgba(250,250,250,0.1)` | white 10% |
| `input`                  | `rgba(250,250,250,0.1)` | white 10% |
| `ring`                   | `#BAFF29`           | green    |

#### Light Mode

| Token                    | Value               | Source   |
|--------------------------|---------------------|----------|
| `background`             | `#FAFAFA`           | white    |
| `foreground`             | `#0A0A0A`           | black    |
| `primary`                | `#BAFF29`           | green    |
| `primary-foreground`     | `#0A0A0A`           | black    |
| `destructive`            | `#FF2E63`           | pink     |
| `destructive-foreground` | `#FAFAFA`           | white    |
| `info`                   | `#00D4FF`           | blue     |
| `info-foreground`        | `#0A0A0A`           | black    |
| `card`                   | `#F0F0F0`           | white -  |
| `card-foreground`        | `#0A0A0A`           | black    |
| `surface`                | `#E8E8E8`           | white -  |
| `surface-foreground`     | `#0A0A0A`           | black    |
| `muted`                  | `#E0E0E0`           | white -  |
| `muted-foreground`       | `rgba(10,10,10,0.5)` | black 50% |
| `border`                 | `rgba(10,10,10,0.15)` | black 15% |
| `input`                  | `rgba(10,10,10,0.15)` | black 15% |
| `ring`                   | `#BAFF29`           | green    |

### Foreground-on-Color Reference

When a palette color is used as a background, use this foreground:

| Background | Foreground | Example                      |
|------------|------------|------------------------------|
| `black`    | `white`    | Default dark sections        |
| `white`    | `black`    | Default light sections       |
| `green`    | `black`    | CTA buttons, success states  |
| `pink`     | `black`    | Marquee strips, alerts       |
| `blue`     | `black`    | Info badges, chaos strips    |

### Color Rules

- Colors appear in large, unblended blocks — never as subtle tints or low-opacity washes
- Green and pink are the dominant accent pair. Blue is reserved for numbering, metadata, and info states
- Section backgrounds alternate between black and accent colors to create visual rhythm
- Text selection uses pink on black — even selection is branded

---

## 2. Typography

Four font families. Each has a defined role. Hierarchy is expressed through typeface switching, not weight variation.

| Role      | Family          | Weight  | Usage                                      |
|-----------|-----------------|---------|--------------------------------------------|
| Display   | Anton           | 400     | Hero headlines, section titles, screen headers |
| Brutal    | Bebas Neue      | 400     | Sub-headlines, CTAs, card titles, tab labels |
| Ops       | Black Ops One   | 400     | Numbering, step indicators, stats, amounts |
| Mono      | Space Mono      | 400/700 | Body text, labels, nav, metadata, inputs   |

### Font Loading

**Web** (Next.js Google Fonts):
```
Anton         → --font-display
Bebas Neue    → --font-brutal
Black Ops One → --font-ops
Space Mono    → --font-mono
```

**Mobile** (expo-google-fonts):
```
@expo-google-fonts/anton           → Anton_400Regular
@expo-google-fonts/bebas-neue      → BebasNeue_400Regular
@expo-google-fonts/black-ops-one   → BlackOpsOne_400Regular
@expo-google-fonts/space-mono      → SpaceMono_400Regular, SpaceMono_700Bold
```

### Tailwind Font Family Classes

Both platforms register the same utility classes:

```
font-display  → Anton
font-brutal   → Bebas Neue
font-ops      → Black Ops One
font-mono     → Space Mono
```

### Typography Scale

#### Web (responsive, clamp-based)

| Token         | Size                            | Font    | Usage               |
|---------------|---------------------------------|---------|---------------------|
| `headline-xl` | `clamp(4rem, 16vw, 14rem)`     | Display | Hero main headline  |
| `headline-lg` | `clamp(3rem, 10vw, 10rem)`     | Display | Section titles      |
| `headline-md` | `clamp(2rem, 5vw, 4rem)`       | Brutal  | Sub-section headers |
| `headline-sm` | `clamp(1.5rem, 3vw, 2.5rem)`   | Brutal  | Card titles         |
| `stat`        | `clamp(4rem, 15vw, 10rem)`     | Ops     | Stats, counters     |
| `step-number` | `clamp(3rem, 8vw, 6rem)`       | Ops     | Step indicators     |
| `body`        | `0.9rem`                        | Mono    | Body copy           |
| `label`       | `0.75rem`                       | Mono    | Labels, metadata    |
| `tiny`        | `clamp(0.6rem, 1.5vw, 1rem)`   | Mono    | Fine print          |

#### Mobile (fixed sizes, pt-based)

| Token         | Size   | Font    | Usage                         |
|---------------|--------|---------|-------------------------------|
| `headline-xl` | 48px   | Display | Screen hero headlines         |
| `headline-lg` | 36px   | Display | Section titles                |
| `headline-md` | 28px   | Brutal  | Sub-section headers           |
| `headline-sm` | 22px   | Brutal  | Card titles, list headers     |
| `stat`        | 48px   | Ops     | Balance amounts, counters     |
| `step-number` | 36px   | Ops     | Step indicators, numbering    |
| `body`        | 14px   | Mono    | Body copy                     |
| `label`       | 12px   | Mono    | Labels, metadata, timestamps  |
| `tiny`        | 10px   | Mono    | Fine print, legal, captions   |

### Typography Rules

- **ALL CAPS** for Display, Brutal, and Ops text universally — lowercase is never used in display type
- **Normal case** for Mono body text — readability over style
- Hierarchy is expressed through typeface switching AND scale contrast, not weight variation within a family
- Space Mono body copy stays small (14px mobile, 0.9rem web) at 0.7–0.8 opacity. It's functional, not decorative
- Minimum body text size: 12px on mobile, 0.75rem on web

---

## 3. Spacing

8pt grid base, aligned with Tailwind's default spacing scale.

### Named Tokens

| Token  | Value | Tailwind | Usage                              |
|--------|-------|----------|------------------------------------|
| `xs`   | 4px   | `1`      | Tight gaps, icon-to-label          |
| `sm`   | 8px   | `2`      | Compact element spacing            |
| `md`   | 12px  | `3`      | Default list/grid gap              |
| `base` | 16px  | `4`      | Standard section gap, card padding |
| `lg`   | 24px  | `6`      | Section padding, generous gaps     |
| `xl`   | 32px  | `8`      | Large section breaks               |
| `2xl`  | 48px  | `12`     | Major section padding              |
| `3xl`  | 64px  | `16`     | Hero-level spacing                 |

### Section Padding

**Web** (responsive with clamp):
```
Hero:           min-height: 100vh, padding: 2rem
Sections:       clamp(4rem, 10vw, 10rem) vertical, 2rem horizontal
Feature grid:   gap: 2rem
Stats grid:     gap: 3rem
```

**Mobile** (fixed, safe-area-aware):
```
Screen:         paddingHorizontal: 24px (lg), safe area insets top/bottom
Section gap:    16px (base) between major sections
List gap:       12px (md) between list items
Card padding:   16px (base) internal padding
Card gap:       12px (md) between card content elements
```

### Gap Patterns

| Context             | Web     | Mobile  | Tailwind |
|---------------------|---------|---------|----------|
| Icon + label        | 0.5rem  | 4px     | `gap-1`  |
| Inline elements     | 0.75rem | 8px     | `gap-2`  |
| List items          | 1rem    | 12px    | `gap-3`  |
| Cards in grid       | 2rem    | 16px    | `gap-4`  |
| Sections            | 3rem    | 24px    | `gap-6`  |

### Touch Targets (Mobile Only)

- Minimum interactive element height: **44px** (`h-11`)
- Minimum interactive element width: **44px** (`w-11`)
- Button heights: 44px default, 36px compact, 48px large
- Icon button minimum: 44×44px hit area (visual size can be smaller with padding)

---

## 4. Borders & Shadows

### Border Radius

**Zero. Everywhere.** No rounded corners, no `border-radius`, no `rounded-*` utilities. Everything is sharp rectangles.

Tailwind config:
```
borderRadius: {
  none: '0px',
  DEFAULT: '0px',
  sm: '0px',
  md: '0px',
  lg: '0px',
  xl: '0px',
  '2xl': '0px',
  '3xl': '0px',
  full: '0px',
}
```

### Border Weights

| Token     | Width | Usage                                  |
|-----------|-------|----------------------------------------|
| `thin`    | 1px   | Dividers, subtle separators            |
| `default` | 2px   | Card borders, input borders            |
| `thick`   | 3px   | CTA underlines, emphasis borders       |

Border color defaults to `foreground` (white in dark mode, black in light mode). Accent borders use palette colors directly.

### Shadows (Brutal)

Hard-offset, zero blur, single palette color. Shadows cast down-right.

| Token         | Value                | Usage                          |
|---------------|----------------------|--------------------------------|
| `brutal-sm`   | `2px 2px 0`         | Subtle depth on small elements |
| `brutal-md`   | `4px 4px 0`         | Default card/button shadow     |
| `brutal-lg`   | `6px 6px 0`         | Hover state growth             |
| `brutal-xl`   | `8px 8px 0`         | Active/pressed emphasis        |

Shadow colors:
- Default: `pink` on dark backgrounds
- On green/pink/blue backgrounds: `black`
- Hover state: shadow grows (sm → md, md → lg)
- Press state (mobile): shadow shrinks (md → sm) with translate to simulate push

Tailwind utilities:
```
shadow-brutal-sm: 2px 2px 0 var(--pink)
shadow-brutal-md: 4px 4px 0 var(--pink)
shadow-brutal-lg: 6px 6px 0 var(--pink)
shadow-brutal-xl: 8px 8px 0 var(--pink)
```

---

## 5. Surfaces & Background/Foreground Patterns

### Surface Hierarchy

Three levels of surface depth, defined for both modes:

| Level      | Dark Mode  | Light Mode | Usage                      |
|------------|------------|------------|----------------------------|
| Background | `#0A0A0A`  | `#FAFAFA`  | Screen/page background     |
| Card       | `#111111`  | `#F0F0F0`  | Cards, containers, modals  |
| Surface    | `#161616`  | `#E8E8E8`  | Elevated elements, inputs  |

### Section Color Blocking

Sections alternate between dark and accent-colored blocks to create rhythm:

```
[Black section]  → white text, green/pink accents
[Green section]  → black text, black borders
[Black section]  → white text, blue accents
[Pink section]   → black text, black borders
[Black section]  → white text, green CTA
```

On mobile, this same rhythm applies to full-screen sections and scrollable content areas. Cards within colored sections use the section's foreground color for borders.

### Text-on-Background Matrix

| Background | Primary Text | Secondary Text       | Accent Text |
|------------|-------------|----------------------|-------------|
| Black      | White       | White at 50% opacity | Green/Pink  |
| White      | Black       | Black at 50% opacity | Pink/Blue   |
| Green      | Black       | Black at 70% opacity | Pink        |
| Pink       | Black       | Black at 70% opacity | White       |
| Blue       | Black       | Black at 70% opacity | Pink        |

---

## 6. Interaction Language

### Shared (Web + Mobile)

| Pattern         | Behavior                                         |
|-----------------|--------------------------------------------------|
| Section enter   | Elements fade up from below, staggered (300ms offset per element) |
| Stat counter    | Numbers roll up with easeOut cubic               |
| Screen mount    | Content reveals with choreographed fade-up        |

### Web Only

| Pattern              | Behavior                                    | Feeling           |
|----------------------|---------------------------------------------|--------------------|
| Card hover           | Background slides up, colors invert, shadow grows | Confident, physical |
| Button hover         | Pink sweep from left, shadow expansion      | Energetic          |
| Text hover (scramble)| Characters randomize then resolve            | Hackerly, playful  |
| Click anywhere       | Coconut emoji spawns with physics            | Surprising         |
| Fast scroll          | Glitch effect re-triggers on headlines       | Reactive, alive    |
| Quote reveal         | Character-by-character typewriter            | Suspenseful        |
| Cursor               | Mix-blend-mode difference circle follower    | Branded            |

### Mobile Only

| Pattern              | Behavior                                    | Feeling            |
|----------------------|---------------------------------------------|--------------------|
| Button press         | Scale to 0.95, shadow shrinks (md → sm), translate +2px down | Physical, tactile |
| Card press           | Colors invert, shadow shrinks              | Confident           |
| Long press           | Haptic impact (medium), scale 0.97         | Weighted            |
| Success action       | Haptic success, green flash overlay        | Rewarding           |
| Error action         | Haptic error, pink flash overlay           | Clear feedback      |
| Pull to refresh      | Coconut emoji drops from top               | Playful             |
| List item swipe      | Reveal action with pink/green background   | Decisive            |

### Animation Timing

| Token      | Duration | Easing                                 | Usage                   |
|------------|----------|----------------------------------------|-------------------------|
| `instant`  | 100ms    | `ease-out`                             | Press feedback           |
| `fast`     | 200ms    | `cubic-bezier(0.16, 1, 0.3, 1)`       | Hover states, toggles    |
| `normal`   | 300ms    | `cubic-bezier(0.16, 1, 0.3, 1)`       | Reveals, transitions     |
| `slow`     | 600ms    | `cubic-bezier(0.16, 1, 0.3, 1)`       | Section entrances        |
| `dramatic` | 1000ms   | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Hero animations      |

---

## 7. Tailwind / NativeWind Configuration

Both platforms should produce the same utility classes. Below are the `theme.extend` values.

### Colors (shared)

```js
colors: {
  black: '#0A0A0A',
  white: '#FAFAFA',
  pink: '#FF2E63',
  green: '#BAFF29',
  blue: '#00D4FF',

  background: 'var(--background)',
  foreground: 'var(--foreground)',
  primary: {
    DEFAULT: 'var(--primary)',
    foreground: 'var(--primary-foreground)',
  },
  destructive: {
    DEFAULT: 'var(--destructive)',
    foreground: 'var(--destructive-foreground)',
  },
  info: {
    DEFAULT: 'var(--info)',
    foreground: 'var(--info-foreground)',
  },
  card: {
    DEFAULT: 'var(--card)',
    foreground: 'var(--card-foreground)',
  },
  surface: {
    DEFAULT: 'var(--surface)',
    foreground: 'var(--surface-foreground)',
  },
  muted: {
    DEFAULT: 'var(--muted)',
    foreground: 'var(--muted-foreground)',
  },
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
}
```

### Font Families

```js
fontFamily: {
  display: ['Anton', 'sans-serif'],           // or ['Anton_400Regular'] on mobile
  brutal:  ['Bebas Neue', 'sans-serif'],       // or ['BebasNeue_400Regular']
  ops:     ['Black Ops One', 'cursive'],       // or ['BlackOpsOne_400Regular']
  mono:    ['Space Mono', 'monospace'],         // or ['SpaceMono_400Regular']
}
```

### Border Radius (override all to 0)

```js
borderRadius: {
  none: '0px',
  sm: '0px',
  DEFAULT: '0px',
  md: '0px',
  lg: '0px',
  xl: '0px',
  '2xl': '0px',
  '3xl': '0px',
  full: '0px',
}
```

### Box Shadow (brutal scale)

```js
boxShadow: {
  'brutal-sm': '2px 2px 0 #FF2E63',
  'brutal-md': '4px 4px 0 #FF2E63',
  'brutal-lg': '6px 6px 0 #FF2E63',
  'brutal-xl': '8px 8px 0 #FF2E63',
  'brutal-sm-black': '2px 2px 0 #0A0A0A',
  'brutal-md-black': '4px 4px 0 #0A0A0A',
  'brutal-lg-black': '6px 6px 0 #0A0A0A',
  'brutal-xl-black': '8px 8px 0 #0A0A0A',
  'brutal-sm-green': '2px 2px 0 #BAFF29',
  'brutal-md-green': '4px 4px 0 #BAFF29',
  'brutal-lg-green': '6px 6px 0 #BAFF29',
  'brutal-xl-green': '8px 8px 0 #BAFF29',
  none: 'none',
}
```

---

## 8. Component Patterns

### Buttons

```
┌─────────────────────┐
│   BUTTON LABEL      │  ← font-brutal, ALL CAPS, 16-20px
│                     │  ← 2px border, shadow-brutal-md
└─────────────────────┘
```

| Variant     | Background | Border     | Shadow         | Text    |
|-------------|------------|------------|----------------|---------|
| Primary     | `green`    | `black` 2px | `brutal-md-black` | `black` |
| Destructive | `pink`     | `black` 2px | `brutal-md-black` | `black` |
| Secondary   | `black`    | `white` 2px | `brutal-md`    | `white` |
| Ghost       | transparent | none      | none           | `foreground` |
| Outline     | transparent | `foreground` 2px | none    | `foreground` |

Button heights: 44px default (mobile), 48px large, 36px compact.

### Cards

```
┌──────────────────────┐
│  2px solid border    │  ← foreground color border
│                      │  ← card background
│  Content here        │  ← 16px internal padding
│                      │
└──────────────────────┘
   ↘ 4px 4px shadow
```

- No border-radius
- 2px solid border in foreground color
- `shadow-brutal-md` default
- On press/hover: colors invert (bg → foreground, text → background), shadow grows to `brutal-lg`
- Internal padding: 16px (`p-4`)
- Content gap: 12px (`gap-3`)

### Inputs

```
┌──────────────────────┐
│  Placeholder text    │  ← font-mono, 14px, muted-foreground
└──────────────────────┘
```

- 2px solid border in `border` color
- No border-radius
- Font: Mono, 14px
- Focus state: border changes to `green`, ring appears
- Height: 44px minimum (mobile touch target)
- Padding: 12px horizontal

---

## 9. Layout Principles

### Shared

- **Asymmetric composition** — Headlines align left with progressive margin offsets, never centered
- **Full-bleed color sections** — Sections own their background entirely
- **Generous negative space** — Black/white background sections breathe; the emptiness makes type hit harder
- **8pt grid** — All spacing uses consistent 8pt increments

### Web Only

- **Broken grid** — Elements rotate (-2deg, -8deg, 5deg), strips skew, text overlaps bounds
- **Viewport-scale type** — Headlines scale with viewport width via clamp()
- **Marquee strips** — Continuous horizontal scroll in alternating directions

### Mobile Only

- **Safe area respect** — Content respects device safe areas (notch, home indicator)
- **Scroll-native** — Vertical scroll is the primary navigation pattern
- **Bottom-anchored actions** — Primary CTAs anchor to screen bottom with gradient fade
- **Full-width cards** — Cards span the full content width, stacked vertically with `md` gap

---

## 10. Guardrails

### Universal (Web + Mobile)

1. **Never add a sixth color.** The palette is 5 colors, closed. New features use existing colors in new combinations
2. **Never use rounded corners.** Everything is sharp. Rectangles only
3. **Never use a fifth typeface.** The four families cover every need. Change the scale, not the font
4. **Never use subtle shadows.** Shadows are hard-offset, single-color, and visible
5. **Never use stock photography.** If imagery is needed, use emoji or abstract generated elements
6. **Body copy stays small and mono.** Space Mono, subdued opacity. Functional, not decorative
7. **ALL CAPS for display type.** Anton, Bebas Neue, and Black Ops One text is always uppercase

### Web Specific

8. **Never center a hero headline.** Display type is always left-aligned with asymmetric offsets
9. **Every section must move.** Static sections break the rhythm. At minimum: a scroll-triggered reveal
10. **Crosshair cursor everywhere.** The cursor is branded

### Mobile Specific

11. **Minimum 44px touch targets.** No interactive element smaller than 44×44px
12. **Haptic feedback on significant actions.** Press, success, error, and destructive actions trigger haptics
13. **Safe areas are sacred.** Content never renders under the notch or home indicator
14. **Mono for all input text.** Text inputs always use Space Mono
15. **No horizontal scroll on content.** Horizontal scroll is reserved for carousels/tabs only

---

## Design Lineage

This system sits at the intersection of:

- **Neo-Brutalism** — Raw aesthetics, bold shadows, high contrast (Gumroad, Figma community)
- **Deconstructivist typography** — David Carson's Ray Gun, type as art first
- **Acid Graphics** — Y2K-revival warped type, neon colors, digital noise
- **Streetwear web** — Palace, Supreme, Stussy: brand energy over information architecture
- **Kinetic typography** — Scroll-driven, animated, interactive type as primary design element
