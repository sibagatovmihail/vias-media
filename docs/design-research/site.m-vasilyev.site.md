<!-- Source: https://site.m-vasilyev.site/ · captured 2026-10-07 at 1440x900 · Tilda Zero Block + GSAP ScrollTrigger · page height 16392px -->

# Design Map

## Spacing Scale
- Scale: 10px, 20px, 30px, 176px
- Base unit: 10px
- Page margin: 30px
- Row pitch: 22px

## Font Hierarchy
- Families: RF Dewi Expanded, JetBrains Mono
- footer-word: 230px, weight 400, RF Dewi Expanded
- hero-wordmark: 100px, weight 400, RF Dewi Expanded
- section-word: 70px, weight 400, RF Dewi Expanded
- statement: 56px, weight 400, RF Dewi Expanded
- body: 12px, weight 400, JetBrains Mono
- annotation: 10px, weight 400, JetBrains Mono
- micro: 8px, weight 400, JetBrains Mono

## Color Palette
- background: `#FFFFFF` (reads as ~#ECECEC under the grain overlay)
- text-primary: `#000000`
- text-on-media: `#FFFFFF`
- ink-soft: `#151617`

## Image Ratios
- hero video: 16:9 (1380x780)
- embedded student work: 16:9 (780x430)

## Component Tokens
- Border radius: 1px
- Shadows: none
- Grid: 8 columns of 176px, gutter 0px, margin 30px, max-width none (full bleed)
- Visible grid marks: '+' every 176px x 175px, fixed to the viewport

## Motion
- Scroll driven elements: 52
- Hover elements: 621
- Logo: 100px wordmark scales to 0.2 over 300px of scroll, then stays fixed with mix-blend-mode: difference
- Blur band: fixed 1440x120 gradual blur at the bottom edge of the viewport
- Row hover: backdrop-filter: invert(1)
- Cursor: 100x100 custom cursor with full-width and full-height guide lines
- Marquee: 2.5s linear infinite
- Reduced motion: no

---

# Taste DNA

### The construction lines stay on
- **Trigger**: When a course about grids needed a page of its own
- **Decision**: Chose to leave registration marks, brackets and cursor guides visible over hiding the grid once the layout was done
- **Reason**: The marks give empty columns a job, so open space looks measured instead of unfinished, and the page becomes its own lesson
- **Evidence**: '+' marks on a 176px x 175px pitch, fixed while content scrolls; every label wrapped in [ ]; cc-guide-h 1440x1 and cc-guide-v 1x900 follow the pointer; 8 columns of 176px inside 30px margins

### No colour of its own
- **Trigger**: When framing student work that comes in every colour
- **Decision**: Chose a strictly black-and-grey frame over a brand accent
- **Reason**: A grey frame hands all the chroma to the work inside it, so the red and blue embeds look louder than they are
- **Evidence**: 2 background values, 3 text values, all neutral; 0 accent colours; colour appears only inside the 780x430 work embeds; radius 1px, 0 shadows

### Wide grotesk speaks, mono annotates
- **Trigger**: When claims and explanations had to sit side by side
- **Decision**: Chose two typefaces with a hard job split over one family in several weights
- **Reason**: A reader sorts statement from footnote at a glance, and mono reads like a spec sheet, which lends a paid course some rigour
- **Evidence**: RF Dewi Expanded only at 56-230px (133 nodes); JetBrains Mono at 8-12px (554 nodes); 56px statements with a first-line indent of about 350px (2 grid columns); lists as 22px hairline rows ending in [ + ]

### Content arrives out of fog
- **Trigger**: When hundreds of elements needed an entrance
- **Decision**: Chose one fixed blur band at the viewport's bottom edge over a fade-up timed per element
- **Reason**: One global effect gives everything an entrance for free and marks the sharp zone as the reading zone
- **Evidence**: fixed 1440x120 gradual-blur layer; no per-element reveal on text rows; logo shrinks 100px to 20px in the first 300px of scroll and never leaves the screen

---

# What this page pays for it

- Body copy at 10-12px mono.
- Custom cursor (`cursor: none`) with guide lines: gone on touch, and a hazard for keyboard and low-vision users.
- 621 hover-driven elements do nothing on a phone.
- No `prefers-reduced-motion` handling.
- On the 390px capture the shrunken wordmark covers the first lines of several sections.
