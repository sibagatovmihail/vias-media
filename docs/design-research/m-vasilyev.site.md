<!-- Source: https://m-vasilyev.site/ · captured 2026-10-07 at 1440x900 · Tilda Zero Block + GSAP ScrollTrigger + Lenis · page height 22018px -->

# Design Map

## Spacing Scale
- Scale: 6px, 10px, 15px, 20px
- Base unit: 10px
- Page margin: 10px
- Card joint: 6px

## Font Hierarchy
- Families: RF Dewi Expanded
- mask-word: 290px, weight 400, RF Dewi Expanded
- footer-word: 218px, weight 400, RF Dewi Expanded
- hero: 180px, weight 400, RF Dewi Expanded
- h2: 50px, weight 400, RF Dewi Expanded (line height 45px, letter spacing -3px)
- row-title: 20px, weight 400, RF Dewi Expanded (line height 20px)
- body: 10px, weight 400, RF Dewi Expanded (line height 12px)
- label: 8px, weight 400, RF Dewi Expanded

## Color Palette
- background: `#000000` (reads as ~#151515 under the grain overlay)
- text-primary: `#FEE9CE`
- accent: `#EF5143`
- accent-secondary: `#FFB261`
- section-light: `#FEE9CE`
- marker: `#FFF705` (0.4% of surface)

## Image Ratios
- case video loop: 16:9 (515x290)
- portrait video: 2:3 (380x567)
- client logo tile: 1:1 (200x200)
- course card photo: 3:4 (350x470)

## Component Tokens
- Border radius: 1px, 30px, 500px
- Shadows: none
- Grid: 4 columns of 350px, gutter 6px, margin 10px, max-width none (full bleed)

## Motion
- Scroll driven elements: 59
- Hover elements: 26
- Pinned blocks px: [9000, 4400]
- Hero pan: translateX -2980px over 3700px of scroll
- Mask zoom: scale 22.4 over 2000px of scroll
- Marquee: 20s and 50s linear infinite
- Micro: color/background 0.2s ease-in-out
- Reduced motion: no

---

# Taste DNA

### Size instead of weight
- **Trigger**: When one typeface had to carry hero, headings, body and labels
- **Decision**: Chose a single weight (400) with an 18x size jump between hero and body over a bold/regular pairing
- **Reason**: A wide letterform at 180px already fills the screen; making it bold as well would read as shouting, while thin strokes at that size read as calm
- **Evidence**: 304 of 317 text nodes at weight 400; hero 180px vs body 10px; only 5 working sizes: 180/50/20/10/8px; h2 line-height 45px on 50px type, letter-spacing -3px

### The scroll is the showreel
- **Trigger**: When the studio had to prove it can do motion before showing a single case
- **Decision**: Chose a 9000px pinned scene driven by the visitor's own scroll over a static portfolio grid
- **Reason**: Someone shopping for an animated site believes what moves under their own finger more than a list of logos
- **Evidence**: block of 9000px page height pinned to one screen; hero stage 3900px wide pans -2980px; word 'Portfolio' pans -5070px then scales 22.4x until the photo inside the letters becomes the frame; cost: about 9 screens of scrolling before the first case text

### No box around anything
- **Trigger**: When listing advantages, prices and reviews
- **Decision**: Chose hairline rows and cards separated by 6px joints over elevated cards with shadows
- **Reason**: On a grainy near-black ground a shadow has nothing to fall on; lines keep the eye on the words
- **Evidence**: 0 box-shadows on the page; radius 1px on 54 of 78 rounded elements; advantage rows on an 87px pitch with 1px rules; 4 price cards 350px wide with 6px gaps

### Three warm inks, one of them a pointing finger
- **Trigger**: When colouring a dark page that runs 22 screens
- **Decision**: Chose cream text plus orange labels plus a coral reserved for start, end and the one action over white text with several accent hues
- **Reason**: Cream on near-black glares less over a long scroll, and a colour that appears rarely is read as 'here'
- **Evidence**: #FEE9CE on 233 text nodes; #FFB261 on 33; #EF5143 on 23: hero headline, the footer word, and the 0-rouble consultation card among four price cards; coral backgrounds cover 2% of surface

---

# What this page pays for it

- Body copy at 10px and labels at 8px: unreadable for anyone over 45 and far below what a Handwerker audience tolerates.
- About 9 screens of pinned scroll before the first case study; on a phone the scene is cut down to a short pan.
- Eight autoplaying video loops on one page.
- No `prefers-reduced-motion` handling.
- Built as absolutely positioned artboards per breakpoint (Tilda Zero), so the phone layout is a second, separate design.
