# Vias Media — Header, Hero, Motif & Gradient Pass

Date: 2026-06-04
Status: Approved

## Goal
Restructure CTA buttons, add a 999px navbar-accordion menu tier, keep the
logo always visible, unify the close affordance, deepen the navbar shadow,
re-scale the hero on phones, weave the logo mark in as a tiled background, and
reconnect the mid-page section gradients into one continuous band.

Surface: shared `assets/css/components.css`, `assets/css/pages/home.css`,
`assets/css/tokens.css`, `assets/js/main.js`, and the header/CTA markup on all
four pages (`index.html`, `services.html`, `work.html`, `contact.html`).

## 1. CTA button restructure
Every arrow `<svg>` becomes a child of its own fixed-size box:

```html
<a class="btn btn--primary"><span>Start a Project</span>
  <span class="btn__arrow"><svg …/></span>
</a>
```

- `.btn__arrow`: `display:inline-flex; width:0.75rem; height:0.75rem;
  flex-shrink:0;` SVG inside fills it (`width:100%;height:100%`).
- Hover translate moves `.btn__arrow` (replacing the `.btn:hover .arrow-icon`
  rule, which is retired).
- Applied identically to all 16 arrow buttons across the 4 pages.

## 2. 999px tier + inline accordion (768–999px)
- `@media (max-width: 62.4375rem)` (999px): `.navbar__links` hide, `.hamburger`
  shows. A panel slides down **inside the navbar card** — implemented with the
  `grid-template-rows: 0fr → 1fr` height-animation technique (no JS measure).
- Panel content: the 4 nav links (stacked) **+ EN/DE toggle**. The CTA button
  stays in the navbar bar.
- `@media (max-width: 47.9375rem)` (767px): the hamburger instead opens the
  existing fullscreen `.mobile-menu` overlay (unchanged).
- JS picks the mode on hamburger click via
  `window.matchMedia('(max-width: 47.9375rem)').matches`.

## 3. Logo + wordmark always visible
Remove `.navbar__logo .wordmark { display:none }` at ≤37.5rem. Mark + "vias."
visible at every width. (Intentional override of the CLAUDE.md icon-crop rule.)

## 4. Unified close cross
The hamburger button morphs bars → X in place via an `.is-open` class (two SVGs,
one shown at a time). Used for both the accordion and the fullscreen popup, so
the cross sits exactly where the user tapped. The popup's separate top-right
close button is removed; the header/hamburger z-index is raised above the
overlay so it stays tappable.

## 5. Bigger navbar shadow
Navbar resting shadow → larger soft spread (≈ `0 0.5rem 2rem` with slightly more
opacity); `.scrolled` deeper still. New token e.g. `--shadow-nav` /
`--shadow-nav-scrolled` so it doesn't disturb card shadows.

## 6. Hero mobile type
`@media (max-width: 37.5rem)`: `.hero__text h1` → `2.75rem`;
`.hero__lead` → `0.8125rem` (13px).

## 7. Tiled logo background
A faint repeating logo-mark texture as a `background-image` band behind the
**testimonials** section: low opacity, edge-masked fade, below content,
`pointer-events:none`.

## 8. Reconnected gradients
Wrap **Why → Work → Services** in a single `<div class="flow-band">` carrying
one continuous vertical gradient (`bg → bg-alt`, top to bottom) so it hands off
seamlessly into the testimonials band (which starts on `bg-alt`); remove those
three sections' individual `background:` gradients. Testimonials and footer keep
their current gradients.

## Verification
- All four pages get the CTA `.btn__arrow` wrapper.
- Accordion (≤999px) and fullscreen popup (≤767px) do not both fire at the
  768px boundary.
- Logo + wordmark visible at 320px; hamburger remains rightmost on phones.
- Render-check against each breakpoint (1024 / 999 / 768 / 600 / 375).
