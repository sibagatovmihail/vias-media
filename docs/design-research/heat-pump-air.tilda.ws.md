<!-- Source: https://heat-pump-air.tilda.ws/electric-air · captured 2026-10-07 at 1440x900 · Tilda Zero Block + Swiper · page height 10006px -->

# Design Map

## Spacing Scale
- Scale: 10px, 15px, 20px, 24px, 30px, 61px
- Base unit: mixed (24 for layout, 10 inside components)
- Page margin: 24px

## Font Hierarchy
- Families: Bruno Ace SC, Raleway
- hero: 102px, weight 400, Bruno Ace SC
- section-title: 58px, weight 300, Raleway
- item-title: 32px, weight 400, Raleway (transform uppercase)
- lead: 18px, weight 400, Raleway
- body: 15px, weight 400, Raleway (line height 18px)
- section-label: 14px, weight 300, Bruno Ace SC
- button: 13px, weight 400, Raleway (transform uppercase)

## Color Palette
- background: `#161616` (89.4% of surface)
- panel: `#232323` (footer, 5.9%)
- text-primary: `#FFFFFF`
- text-secondary: `#8D8D8D`
- price-small: `#00246D`
- price-medium: `#063894`
- price-large: `#1C58C6`

## Image Ratios
- hero video: 4:3 (1200x900)
- step card photo: 1:1 (342x342) inside a 2:1 card
- review card: text half + photo half

## Component Tokens
- Border radius: 20px, 30px, 150px
- Shadows: none
- Grid: 4 columns of 328px, gutter 24px, margin 24px, max-width none (full bleed)
- Column lines at x = 24, 376, 728, 1080 (1440px viewport)

## Motion
- Scroll driven elements: 13
- Hover elements: 16
- Reveal: opacity 0.3s + transform 0.7s cubic-bezier(0.22,0.61,0.36,1), 0.7s delay
- Hero: headline drifts 110px over the first 300px of scroll
- Pricing: three cards stack; each collapses to a ~115px header strip under the next
- Sliders: Swiper, cursor: grab
- Focus visible: no
- Reduced motion: no

---

# Taste DNA

### The second column is home base
- **Trigger**: When every section needed a label, a title and a body
- **Decision**: Chose a small label alone in column 1 with all content starting at column 2 or 3 over centred or full-width headings
- **Reason**: A fixed left edge lets the eye run down column 1 like a table of contents, and no body line gets longer than about 700px
- **Evidence**: section labels at x=24 in 14px Bruno Ace, grey; every section title starts at x=376; hero sub-copy and item titles start at x=728; column 1 stays empty below the label for the whole section

### Cards share walls
- **Trigger**: When three parts of one machine and three prices had to be compared
- **Decision**: Chose one fused outline with shared 1px dividers, and a stacking price deck, over separate cards with gutters
- **Reason**: Parts drawn as one object read as one system, and a stack keeps all three prices on screen so nobody scrolls back to compare
- **Evidence**: three how-it-works cards form one 1392px outline with 0 gap; 20px radius only on the outer corners; price cards overlap and collapse to ~115px header strips; 0 shadows

### Blue is only for money
- **Trigger**: When a brand owns a red-to-blue gradient
- **Decision**: Chose to keep it inside the hero video and the footer wordmark and spend solid blue on the price cards alone, over colouring buttons and headings
- **Reason**: The one saturated block on a grey page marks where the decision happens, and the darker-to-lighter ramp encodes small, medium, large without a legend
- **Evidence**: #161616 on 89.4% of surface; blue ramp #00246D, #063894, #1C58C6 on about 3%; buttons are 1px white outlines with 30px radius; no gradient on any UI element

### A display face rationed to a few words
- **Trigger**: When choosing where the wide techno face may appear
- **Decision**: Chose it for the hero, logo, section labels and tier names only, with Raleway Light for every sentence, over setting all headings in the display face
- **Reason**: The wide face says 'machine' in two lines; in a FAQ it would tire the reader, and a light humanist sans suits a product that goes into a living room
- **Evidence**: Bruno Ace SC on 15 of about 200 text nodes; section titles 58px Raleway weight 300, sentence case; item titles 32px Raleway uppercase; body 15px/18px

---

# What this page pays for it

- No `:focus-visible` styles and no `prefers-reduced-motion` handling.
- Secondary text #8D8D8D at 15px on #161616 is about 5.5:1, fine; the 13-14px grey labels in the wide display face are harder to read than the ratio suggests.
- Copy is placeholder quality ("What other says", "Any more question?"), which shows the layout carries the page, not the words.
