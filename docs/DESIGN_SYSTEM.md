# CocoPay Design Language

## Style Classification

**Neo-Brutalist Typographic Maximalism** with Kinetic and Glitch accents.

This is a hybrid style that draws from three distinct design movements and fuses them into a single visual identity. The result is loud, confident, and unapologetically fun — a deliberate rejection of corporate fintech aesthetics.

---

## The Three Pillars

### 1. Neo-Brutalism (Structure)

The structural foundation. Neo-Brutalism provides the bones of the layout and interaction language.

**Present in:**
- Hard-edge box shadows (offset, single-color, no blur) on CTAs and cards
- High-contrast color blocking — entire sections shift between solid black, acid green, hot pink
- Thick borders on feature cards with no border-radius
- Raw, unpolished interaction states — cards invert fully on hover, buttons physically translate with shadow growth
- No rounded corners, no soft gradients, no glass effects
- Crosshair cursor as a deliberate anti-comfort choice

**Key principle:** If it feels "designed" or "polished," strip it back. If it feels uncomfortably bold, it's right.

### 2. Typographic Maximalism (Voice)

Typography IS the design. Not a carrier of content — the content is secondary to the letterforms themselves.

**Present in:**
- Four typefaces used at extreme scale contrast (16rem headlines vs 0.8rem labels)
- Text treated as visual texture: the giant "PAY" watermark behind the hero, the rotated "HOW" background element
- Outline/stroke text mixed with solid fills within the same composition ("PAY" in stroke, "COMMERCE" in fill)
- Intentional rotation and skew on headline elements (-8deg, 5deg offsets)
- Staggered, cascading headline rows with progressive indentation
- ALL CAPS universally — lowercase is never used in display type
- Font mixing within a single heading: condensed display (Anton) next to stencil (Black Ops One) next to monospace (Space Mono)

**Key principle:** Type should dominate the viewport. If you can read the page without noticing the typography, the type isn't big enough.

### 3. Kinetic Glitch (Energy)

Motion and digital distortion create the emotional texture — restless, energetic, slightly chaotic.

**Present in:**
- Chromatic aberration glitch on "COCO" (pink and cyan offset layers via clip-path animation)
- Film grain noise overlay (SVG fractal noise, animated at 0.5s steps)
- Typewriter character-by-character reveals on headlines
- Scramble/decode text effect on hover (CTA button)
- Physics-based coconut spawning on click (gravity, rotation, opacity decay)
- Cursor follower with `mix-blend-mode: difference`
- Scroll-velocity-triggered glitch re-animation
- Counter roll-up animation on stats
- Marquee strips (continuous, reversed)

**Key principle:** Nothing should feel static. Rest states are just slower motion. Every interaction should produce visible, slightly unpredictable feedback.

---

## Color System

| Token    | Value     | Role                                           |
|----------|-----------|-------------------------------------------------|
| `black`  | `#0A0A0A` | Primary background, text on light surfaces      |
| `white`  | `#FAFAFA` | Primary text, card hover fills                  |
| `pink`   | `#FF2E63` | Primary accent, destructive energy, urgency     |
| `green`  | `#BAFF29` | CTA, success, money, rewards — the "action" color |
| `blue`   | `#00D4FF` | Secondary accent, informational, numbering      |

**Usage rules:**
- Colors appear in large, unblended blocks — never as subtle tints or low-opacity washes (except in background textures)
- Green and pink are the dominant pair. Blue is reserved for numbering and metadata
- Section backgrounds alternate between black, green, and pink to create rhythm
- Selection highlight uses pink on black — even text selection is branded

---

## Typography Scale

| Role         | Family          | Weight | Usage                              |
|--------------|-----------------|--------|------------------------------------|
| Display      | Anton           | 400    | Hero headlines, section titles (4-16rem) |
| Brutal       | Bebas Neue      | 400    | Sub-headlines, CTAs, card titles (1.2-4rem) |
| Ops          | Black Ops One   | 400    | Numbering, step indicators, stats (3-10rem) |
| Mono         | Space Mono      | 400/700| Body text, labels, nav, metadata (0.55-1rem) |

**Hierarchy is expressed through:**
1. Scale (extreme contrast between heading and body)
2. Typeface switching (not weight variation within a single family)
3. Color (green for emphasis, pink for energy, stroke for secondary)
4. Spatial offset (indentation, rotation, vertical stagger)

---

## Layout Principles

- **Asymmetric composition** — Headlines cascade with progressive left-margin offsets. Nothing is center-aligned in the hero
- **Full-bleed color sections** — Content sections own their background entirely (green for social proof, pink for marquee, blue for chaos strip)
- **Generous negative space in dark sections** — The black background is not "empty," it's breathing room that makes the type hit harder
- **Broken grid** — Elements rotate (-2deg, -8deg, 5deg), marquee strips are skewed, text overlaps its container bounds
- **8pt spacing base** — Despite the chaos, spacing uses consistent increments (0.5rem, 1rem, 2rem, 3rem, 4rem)

---

## Interaction Language

| Pattern | Behavior | Feeling |
|---------|----------|---------|
| Card hover | Background slides up from bottom, colors invert, card translates with shadow growth | Confident, physical |
| Button hover | Pink sweep from left, card lifts with shadow expansion | Energetic, rewarding |
| Text hover (scramble) | Characters randomize then resolve | Hackerly, playful |
| Click anywhere | Coconut emoji spawns with physics (gravity, rotation, fade) | Surprising, delightful |
| Scroll (fast) | Glitch effect re-triggers on headline | Reactive, alive |
| Section enter | Elements fade up from below, staggered | Choreographed, rhythmic |
| Quote reveal | Character-by-character typewriter | Suspenseful, editorial |
| Stat counter | Numbers roll up with easeOut cubic | Impressive, satisfying |

---

## What This Style IS

- **Loud** — It demands attention, not permission
- **Playful** — Coconuts, glitches, scramble text — it doesn't take itself too seriously
- **Typographic** — Letterforms are the hero, not illustrations or photography
- **Physical** — Shadows cast, elements translate, interactions have weight
- **Rhythmic** — Alternating dark/bright sections, staggered reveals, marquee pulse
- **Gen-Z native** — The visual language of streetwear drops, rave posters, and TikTok energy

## What This Style is NOT

- **Minimalist** — No "less is more." More is more
- **Corporate** — No Stripe clones, no Inter font, no soft blue gradients
- **Skeuomorphic** — No realistic textures, no glass, no depth simulation
- **Swiss/International** — Despite strong typography, this breaks every grid rule Swiss design holds sacred
- **Neumorphic/Glassmorphic** — No frosted glass, no subtle embossing, no gentle shadows
- **Accessible-first** — Contrast ratios are strong, but the crosshair cursor, noise overlay, and glitch effects prioritize expression over universal comfort
- **Illustrative** — No custom illustrations, icons, or imagery. The coconut emoji is the only visual motif and it's deliberately low-fi
- **Precious** — Nothing feels fragile or carefully arranged. If it looks like it might break, that's the point

---

## Design Lineage & References

This style sits at the intersection of:

- **Neo-Brutalism** — The modern web design movement emphasizing raw aesthetics, bold shadows, and high contrast (see: Gumroad, Figma community templates)
- **Deconstructivist typography** — David Carson's Ray Gun magazine, where type is art first and readable second
- **Acid Graphics** — The Y2K-revival aesthetic of warped type, neon colors, and digital noise
- **Streetwear web** — Palace, Supreme, and Stussy's approach to web as brand energy rather than information architecture
- **Kinetic web typography** — The 2024-2025 trend of scroll-driven, animated, interactive type as the primary design element

---

## Guardrails

When extending this design system:

1. **Never add a fifth color.** The palette is closed. New sections use existing colors in new combinations
2. **Never use rounded corners.** Everything is sharp. Rectangles only
3. **Never use a fifth typeface.** The four families cover every need. If something feels wrong, change the scale, not the font
4. **Never use subtle shadows.** Shadows are hard-offset, single-color, and visible. If you need depth, translate the element and add a box-shadow
5. **Never center a hero headline.** Display type is always left-aligned with asymmetric offsets
6. **Never use stock photography.** If imagery is needed, use emoji or abstract generated elements
7. **Every section must move.** Static sections break the rhythm. At minimum: a scroll-triggered reveal
8. **Body copy stays small and mono.** Space Mono at 0.9rem, 0.7-0.8 opacity. It's functional, not decorative
