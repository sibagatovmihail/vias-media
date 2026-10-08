<!-- Source: https://flowers-sim.ru/ · captured 2026-10-07 at 1440x900 · Tilda Zero Block + GSAP ScrollTrigger + SplitType · page height 14865px -->

# Design Map

## Spacing Scale
- Scale: 6px, 10px, 20px
- Base unit: 10px
- Page margin: 10px
- Card joint: 6px

## Font Hierarchy
- Families: VC Garamond Condensed, SF Mono
- footer-wordmark: 272px, weight 400, VC Garamond Condensed
- headline-and-statement: 50px, weight 300, VC Garamond Condensed (note emphasis by italic inside the line)
- name: 30px, weight 400, VC Garamond Condensed
- nav: 15px, weight 400, SF Mono
- body: 13px, weight 400, SF Mono
- caption: 10px, weight 400, SF Mono

## Color Palette
- background: `#000000` (reads as ~#111111 under the grain overlay)
- text-primary: `#FFFFFF`
- caption-block: `#A72D25` (0.7% of surface)
- caption-block-alt: `#FFFFFF`

## Image Ratios
- hero and pinned backgrounds: 16:10 (1440x900 full bleed)
- use-case card: 330x400: photo 330x230 over caption 330x170
- product tile: 0.89:1
- catalogue thumbnail in header: 175x110

## Component Tokens
- Border radius: 0px, 500px (40px inline image circles)
- Shadows: none
- Grid: 4 columns of 350px, gutter 6px, margin 10px, max-width none (full bleed)
- Column lines at x = 10, 366, 722, 1078 (1440px viewport)

## Motion
- Scroll driven elements: 17
- Intoview elements: 55
- Hover elements: 73
- Pinned block px: 4686
- Pinned: full-bleed blurred enlargement of each card photo crossfades while the card slides sideways
- Text: line-by-line reveal (SplitType), 1s linear
- Hover: scale 0.9 and backdrop-filter: blur(3px)
- Header: fixed, mix-blend-mode: difference
- Reduced motion: no

---

# Taste DNA

### Photographs do the colouring
- **Trigger**: When a flower shop needed a palette
- **Decision**: Chose white text on black plus one red caption block and left every other hue to the photos, over coloured panels and gradients
- **Reason**: Flowers are bought with the eyes, and any interface colour would compete with a petal
- **Evidence**: text #FFFFFF on 1179 nodes; red #A72D25 on 0.7% of surface; hero is one 1440x900 photo with type set directly on it; 0 shadows, 0 gradients in the UI

### One serif size, emphasis by italic
- **Trigger**: When headlines, statements and list titles all needed a voice
- **Decision**: Chose a condensed serif at a single 50px size with italic phrases over a six-step scale with bold
- **Reason**: A condensed serif fits a full sentence into 3-5 lines at 50px, so the brand speaks in sentences instead of slogans, and the 13px mono beside it keeps it from turning into wedding stationery
- **Evidence**: 1007 text nodes at 50px; VC Garamond Condensed weights 300 and 400 only; italic used for 2-4 words per headline; body SF Mono 13px, captions 10px

### The picture escapes its card
- **Trigger**: When four use cases (home, office, gift, event) needed a section
- **Decision**: Chose a 4686px pinned scene where each card's photo is repeated full-bleed and blurred behind it, over a four-card grid
- **Reason**: One subject at full screen gives each use case its own mood; four cards side by side would have averaged them
- **Evidence**: pinned block of 4686px; card 330x400 over a 1440x800 enlargement of the same photo; cards slide sideways while backgrounds crossfade; caption blocks alternate red, black, white

### Navigation dissolved into the grid
- **Trigger**: When the hero photo was supposed to reach the top edge
- **Decision**: Chose to hang logo, socials, links and a catalogue thumbnail from the four column lines over a navbar strip
- **Reason**: With no bar, the photograph owns the whole first screen. The cost is real: the stacked links collide with headlines mid-scroll
- **Evidence**: logo at x=10, socials at x=366, four links stacked at x=722, 175x110 thumbnail at x=1255; links 15px mono on a 15px line; mix-blend-mode: difference; overlap with headlines visible at scroll positions 1164 and 3491

---

# What this page pays for it

- Fixed header links overlap headlines while scrolling (visible in the captures).
- Body copy in 13px mono over photographs: contrast depends on the photo behind it.
- The imagery is generated (the video files are named like Midjourney exports). On a German business site that needs labelling under Art. 50 KI-VO and may never stand in for real people, premises or work.
- Hover shrinks tiles to 0.9 scale; no `prefers-reduced-motion` handling.
