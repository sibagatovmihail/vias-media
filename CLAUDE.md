# EagleAir — Project Standards

<!-- ## Core Directive: 1:1 Design Fidelity

- **Strict adherence:** Implement an exact 1:1 copy of the Figma design. Do not add, remove, or "improve" any element.
- **Non-creative mode:** If it is not in the Figma design, it does not belong in the code.
- **Style source:** Use only the hex codes and tokens defined in `styles/tokens.css`. Never use framework defaults or arbitrary values. -->

---

## Figma MCP Integration

- Always call `get_design_context` **and** `get_variable_defs` for every new section before writing any CSS.
- Rely on the semantic layer (metadata) for spatial data — never estimate visually from screenshots.
- After rendering, compare against the Figma screenshot. Any discrepancy > 1px (equivalent rem value) must be corrected.

---

## Unit System

| Use | Rule |
|---|---|
| All sizing | `rem` (px ÷ 16) |
| 1px borders / dividers | `px` only exception |
| Viewport-relative | `dvh`, `dvw`, `svh` for hero/full-bleed |
| Never | Hard-coded `px` widths or heights |

---

## Layout Engines

- **CSS Grid** — page-level structure, multi-column grids (service cards, feature lists).
- **Flexbox** — component-level: navbars, buttons, badges, icon+text pairs.
- **Positioning** — `relative` by default; `absolute` only for overlapping layers (hero background, overlays).

---

## Container Pattern

Every section uses an inner `.container` div — never pad the section itself:

```css
.container {
  max-width: 72.5rem;          /* 1160px */
  margin-inline: auto;
  padding-inline: var(--space-lg); /* 1.5rem — safety padding on small screens */
}
```

Example: `<section class="hero"><div class="container hero__container">…</div></section>`

---

## Responsive Breakpoints

Use these named tiers consistently across **all** stylesheets:

| Token name | Value | Context |
|---|---|---|
| Desktop | `> 64rem` (1024px) | Full layout — no overrides needed |
| Tablet landscape | `≤ 64rem` | Tighten gaps, reduce logo height slightly |
| Nav collapse | `≤ 62.4375rem` (999px) | Desktop nav hides; hamburger appears and opens the **inline accordion** (drops down inside the navbar card) |
| Tablet portrait | `≤ 47.9375rem` (767px) | Hamburger switches to the **fullscreen popup**; accordion off |
| Phone | `≤ 37.5rem` | Hamburger far right; hero heading grows, lead shrinks |
| Small phone | `≤ 30rem` | Topbar text hidden; in-bar CTA hides (lives in the menu) |

**Never use single-step jumps.** Scale properties progressively across breakpoints. Use `clamp()` for fluid type where appropriate.

---

## Header Rules

- **Logo:** The mark **and** the `vias.` wordmark stay visible at **every** width — never cropped.
- **Menu collapse:** Desktop nav collapses into the hamburger at `≤ 999px`. The hamburger opens an **inline accordion** (links + EN/DE) that animates down inside the navbar card via `grid-template-rows 0fr→1fr` (768–999px), and the **fullscreen popup** at `≤ 767px`. The hamburger morphs bars⇄X in place (`.hamburger.is-open`) — the close cross is the same button, so it sits exactly where the user tapped. Header `z-index` sits above the overlay so it stays tappable.
- **Hamburger order:** On mobile, hamburger must be the **rightmost** element (`order: 2`).
- **CTA button:** Never resize at the nav-collapse breakpoint; it shrinks at phone (`≤ 37.5rem`) and hides at `≤ 30rem` (the popup menu carries it).
- **Topbar:** Collapses on scroll via `.scrolled` class; text hidden at `≤ 30rem`.

---

## Hero Section Rules

- **Height:** `calc(100dvh - var(--header-height))` — JS sets `--header-height` on `:root` via `updateSpacer()`.
- **Gap:** The `3.75rem` (60px) gap between the text block (`.hero__text`) and the CTA buttons (`.hero__actions`) must **never** be overridden by responsive rules.
- **Button stacking breakpoint:** `≤ 37.5rem` (600px) — not at tablet width.
- **Heading scale:** At `≤ 48rem` scale to `2.5rem`; at `≤ 37.5rem` the heading grows to `2.75rem` (bolder on phones) while the lead paragraph drops to `0.8125rem`.

---

## HTML Semantics

Use semantic tags: `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`, `<article>`.
Wrap all text elements (`<span>`, `<p>`, `h1, h2, h3, h4, h5, h6`, `<a>`) in a `<div>` cover element — apply layout/spacing styles to the cover, not the text node directly. Apply this rule to the forms as well. 

---

## Asset Handling

- **Icons and logos:** Export as SVG from Figma using `download_figma_images`.
- **Images:** Download from Figma MCP asset URLs; rename to reflect content (`hero-bg.png`, not generic names).
- **Optimization:** Strip metadata, use correct file extension (verify with `file` command).

---

## Anti-Pattern Guardrails

- No creative additions — no social icons, hover effects, or features absent from Figma.
- No `px` widths/heights (except 1px borders).
- No Tailwind defaults or framework color palettes.
- No `overflow: hidden` on `<body>` or `<html>` — use it only on specific components that require clipping.

---

## Code Health — Fallow (run regularly)

Fallow is installed as a Claude Code skill (`fallow@fallow-skills`). It is a static-analysis tool for **JS/CSS**: dead code, duplication, and complexity. Use it as a recurring sanity check — not a one-off.

**Scope on this project:** This is a static HTML/CSS/JS site (no `package.json`/TypeScript). Fallow's value here is narrow but real:
- **JS** — `middleware.js`, `api/**`, `assets/js/v2/main.js`: unused exports/files, duplication, complexity hotspots.
- **CSS** — `assets/css/**`: unused selectors and duplicated rule blocks (Fallow's CSS layer).
- It will **not** meaningfully cover inline HTML, the standalone `Vias Media (standalone).html` dump, or design fidelity. Don't expect dependency-graph results without a `package.json`.
- **`.fallowrc.json` (added 2026-10-09) names the entry points:** the root HTML pages, the built blog pages,
  `api/*.js` and `middleware.js`. Without it Fallow sees no entry point and reports every stylesheet and script
  as an unused file. With it, an "unused file" is one that no page loads. The blog templates are ignored
  (their relative paths only resolve after `build_blog.py` has written the pages). A new top-level page folder
  needs a line in `entry`.
- **Reading `health`:** the script files have no tests, so the CRAP score flags any function with five or more
  branches; look at cyclomatic (> 20) and cognitive (> 15) instead. The top-level function of
  `assets/js/v2/main.js` scores high by design: it is a flat list of "is this markup on the page?" guards.

**Setup (once):** `npm install -g fallow` (frictionless CLI), or rely on `npx fallow …` per run. Verify with `fallow --version`.

**When to run — make this a habit:**
- Before every commit that touches `.js` or `.css`.
- After deleting/renaming a component, section, or stylesheet (catches orphaned CSS/JS left behind).
- Before a release or any "clean up the codebase" task.
- When duplication is suspected (e.g. a snippet copy-pasted across `index.html` / `services.html` / `work.html`).

**Core commands** (always `--format json --quiet 2>/dev/null` and append `|| true` — exit 1 = "issues found", which is normal, not an error):

```bash
fallow dead-code --format json --quiet 2>/dev/null || true   # unused JS/CSS
fallow dupes     --format json --quiet 2>/dev/null || true   # copy-paste / clones
fallow health    --format json --quiet 2>/dev/null || true   # complexity hotspots
fallow           --format json --quiet 2>/dev/null || true   # all three at once
```

**Safe auto-fix cycle (never skip the dry-run):**

```bash
fallow fix --dry-run --format json --quiet 2>/dev/null || true   # 1. preview
# review the proposed removals against the findings below
fallow fix --yes     --format json --quiet 2>/dev/null || true   # 2. apply (--yes required, non-TTY)
fallow dead-code     --format json --quiet 2>/dev/null || true   # 3. re-verify
```

**Improve, don't just delete:** treat findings as a worklist — confirm each removal is truly unused (use `fallow dead-code --trace <file>:<symbol>` before deleting anything non-obvious), refactor duplicated blocks into shared partials/CSS instead of leaving copies, and split complexity hotspots flagged by `health`. For genuine false positives, add `/* fallow-ignore-next-line */` (or `// fallow-ignore-next-line` in JS) rather than reshaping code to satisfy the tool.

**Never** run `fallow watch` (interactive, never exits). Trigger the skill by asking in plain language ("run fallow", "find dead code/dupes", "check code health") or `/fallow`.

---

## Redesign v2 "Bauplan" (branch `redesign/reference-study`, started 2026-10-07)

**Every page of the site is on v2 since 2026-10-09** (homepage, services, projects, five case studies, contact,
the Neubrandenburg landing page, Impressum, Datenschutz, blog index and articles). The sections above describe
the previous design: its stylesheets and `assets/js/main.js` were removed. What still applies from them: `rem`
units, semantic HTML, no `overflow: hidden` on `<body>`/`<html>`, Fallow before commits, the commit rules.
Direction and reasoning: `docs/design-research/`.

- **Files:** `assets/css/v2/tokens.css` (fonts + tokens, **one dark scheme**; the light scheme and its switch
  were removed on 2026-10-08), `base.css` (ground, grid, type primitives, split-text states, page-change
  transition), `components.css` (shared: buttons, header, menu, rows, FAQ, cursor, footer), `home.css`
  (homepage only), `pages.css` (all other pages, one file so it is cached once); `assets/js/v2/main.js` (one
  script for every page, each block looks for its own markup); `assets/js/vendor/lenis.min.js`.
- **Header, menu sheet, footer and the script tags are copied into every page.** Change them in `index.html`,
  then run `python3 tools/sync-chrome.py` (copies them into all root pages and both blog templates, keeps each
  page's own `<main>`, current nav entry and footer variant, and gives every page index.html's `?v=`) and
  `python3 build_blog.py`. `--check` only reports.
  Differences on purpose: `aria-current` on the current nav link (`"page"`, or `"true"` on a child page such as
  a case study), "Preise" points to `index.html#preise` outside the homepage, blog pages prefix paths with
  `../` or `../../`, the contact page's footer has `ftr--bare` (no second call to action).
- **One asset version for all pages:** the `?v=` on the CSS/JS links is the same string in every HTML file and
  both blog templates. Bump all of them together (and rebuild the blog), or pages load two copies of one file.
- **Page change:** native cross-document view transitions (`@view-transition` in `base.css`): the next page
  comes up as a sheet while header, registration marks and grain stay still (`view-transition-name`). No
  script, nothing to maintain per page; browsers without it just load the page; off under reduced motion.
  Every page also carries speculation rules that prefetch a same-site link on hover (HTML only, Chromium).
- **Grid replaces the 72.5rem container:** full bleed, `.wrap` (fluid `--margin`) + `.grid` (4 columns, 8 from
  48rem). Section label in columns 1–2, content from column 3. No shadows, radius 0, hairline rows instead of cards.
- **Type:** titles in Bebas Neue (`--font-display`, classes `.display`, `.d1`–`.d3`; caps only, so check
  umlauts are not clipped). Body in Archivo at 16px. The `vias.` wordmark and the footer contact lines stay in
  Archivo at `font-stretch: 125%`. Martian Mono only for bracket labels (`.tag`) and annotations, never for
  body copy. Accent phrase = `.mark` block. To return to the expanded grotesk titles, change `--font-display`
  (see the comment in `tokens.css`).
- **Accent (#E8593A) is a fill behind dark text only** (primary CTA, `.mark`, wordmark dot, the free pricing
  card). Never accent-coloured text.
- **Pricing:** lies under Services (`.under`) and has a photograph that does not scroll (`.pricing__img` is
  `position: fixed`, cut to the section by `clip-path: inset(0)` on its wrapper; `background-attachment: fixed`
  does not work on iOS). Text directly on the photograph is `--ink`, never `--ink-2`: the file is darkened so
  ink keeps 4.6:1 on its brightest band. Cards are slightly see-through.
- **Footer over the last section:** wrap a page's last section in `.tail` and the footer gets `ftr--over`
  (sync-chrome sets it): the section is scrolled to its very end, holds for a quarter of a screen, and only
  then the footer slides over it (owner, 2026-10-09: "let him scroll to the end of the section and only then
  transition"). Used on the homepage, services and landing page (all end in the FAQ). It waits for the script
  (`.js:not(.rv-fallback)`). `main.js` pins the section by its bottom edge and a `ResizeObserver` keeps that
  top current when the section changes height.
- **Scroll-linked entrances are slow:** the closing headline's halves travel 16vw with a fade, spread over
  0.6 of a screen, with inertia (`convStep()`). The owner called the earlier fast 70vw fly-in unprofessional.
- **Section flow:** every section is an opaque sheet (`.s` has the ground colour and `z-index: 1`). Pinned
  sheets stay put while the next one slides over them: the hero, the projects intro and each `.case` are
  `position: sticky; top: 0` (CSS only). Pricing does the opposite: `.under` starts one screen before Services
  ends, so Services (higher `z-index`) lifts off it. A new section must be opaque or it shows what is pinned
  underneath.
- **Hero:** frozen `--vh` set inline in `<head>`, **in a script that comes after the viewport tag**. Before
  that tag an iPhone still reports a 980px wide page and a height about 2.5 times too large; every pinned
  scene was then far too long on phones (found 2026-10-09). The hero is exactly one screen, laid out as an F:
  title across the top, note on the left, one action bottom right. That action is `.cta`: a small lower-case
  text link (14px, `text-transform: lowercase`, an arrow, one hairline), not a button box (owner, 2026-10-09:
  "remove this default button look", "smaller and simpler", then "smaller, in small letters"). The service
  pages and "alle projekte ansehen" use the same `.cta`. From 62.5rem the title is forced onto two lines
  (`data-lines="dash"`) and `fitLines()` scales it to the full width; below that it wraps on four. Check the
  lines in DE and EN at 320–1920px after any copy or size change.
- **Projects:** `.cases`. The ghost word behind the intro is fitted to the width (`data-fitw`) and starts
  below the header, not behind it. Every case is at least one screen and **holds** before the next one covers
  it: the hold is the case's bottom margin (`--case-hold`), which is never seen because a pinned case covers
  the screen. **The last case is covered too:** the list is one screen longer than its cases
  (`.cases__list::after`) and what follows (`.reel-more`, then the next section) starts one screen early.
  Laptops: blurred dark backdrop (`.case__bg`) on the left with the screenshot gliding through it (`--cy`,
  `updateCases()`), story top right. Phones: **one** screenshot, whole at its own ratio (never
  `object-fit: cover`); tablets: two side by side.
- **Word mask ("So arbeite ich" → Services):** the next section's name is the **last thing in the row of
  panels** (an empty cell, `.hs__wordcell`, keeps its place; the word is drawn over it in an SVG covering the
  stage). It pans in with the cards; when the row is at its end the word grows from that place into its
  letter I until the photograph is the screen (`updateHs()`, `setZoom()`). On phones and upright tablets the
  whole word would be a thin strip, so it is set as tall as the row allows and runs off the right edge; the
  row ends with the I in the middle of the screen and the zoom starts there (owner: "taller, never mind
  seeing the whole word"); the zoom is shorter there (0.8 of a screen). The letters are **outlines** in an SVG clip path (`MASK_WORDS` in `main.js`),
  not live text: Chrome stops drawing `<text>` in a clip path beyond about 10× magnification. If the section
  is renamed, regenerate both languages with `python3 tools/word-path.py WORD I` (needs fontTools + brotli).
- **Motion:** Lenis on fine pointers only. Every scene has a static default and a `prefers-reduced-motion`
  path (nothing pinned, no mask). Scroll-driven values: `--drive` (hero lines part), `--cy` (case
  screenshots), the hs scene, `--conv` (the footer question's two halves come in from the sides and meet).
  Content hidden for reveals must stay covered by the `rv-fallback` failsafe in `<head>`.
- **Start-up order (`main.js`, end of file):** nothing is measured before the stylesheets have applied and
  the title face is really in use (`cssIn()`, `faceActive()`, `settle()`). Safari runs a deferred script
  before a stylesheet that is not cached yet, and reports a font as loaded before it has arrived; both made
  titles break in the wrong places on the owner's iPhone. Do not go back to `document.fonts.ready`.
- **Pressed states:** every hover state has an `:active` twin (blocks at the end of `components.css` and
  `pages.css`), because a finger has no hover. iOS only applies `:active` because `main.js` registers an
  empty `touchstart` listener.
- **Testing phones:** Chromium with a resized window does **not** reproduce iPhone behaviour (viewport tag,
  script and font timing). Use the WebKit scripts in `.playwright-mcp/wk/` (untracked): `run.js` scrolls a
  page on an iPhone profile and takes screenshots, `sweep.js` checks ten pages on four devices with slow
  fonts, `csweep.js` is the 13-width Chromium sweep.
- **Performance rules learned on this page:** no `mix-blend-mode` and no `backdrop-filter` on full-screen fixed
  layers beyond the two fog strips; hover states change `opacity`/`transform` of a layer, text colour switches
  in one step; `will-change` only under `.is-near` (set while a scene is within a screen of the viewport).
- **Header:** ≥ 62.5rem logo and four links (letter-roll hover), nothing else: no CTA, no language switch, no
  theme switch. Tablets (48–62.5rem): logo, CTA, burger on the solid bar. **Phones (< 48rem): logo and burger
  only, no bar** (owner, 2026-10-09); a short gradient under them lets text that scrolls beneath fade out,
  and the solid ground comes back while the menu is open. The language switch lives only in the footer
  bar. Phone menu foot: the call button is an icon in a square on the left, the main action
  ("Beraten Sie mich") beside it (`flex-direction: row-reverse`).
- **Sub-pages** (all in `pages.css`):
  - `.phero`: one-screen page hero with the homepage's F layout (title top, note left, foot row with facts
    left and action right), pinned so the first section slides over it. `.phero--short` for text pages
    (legal, blog): content height, not pinned. A title with `data-lines="dash" data-fit` is set on two
    lines and fitted to the width on laptops (homepage, landing page).
  - Because the hero stays pinned under the whole page, **every block inside `<main>` must be opaque and
    gaps must be padding, never margin** (a margin shows the hero through).
  - Services: `.svc` sheets (ids are link targets). Sequences: `.steps` (rows on phones, four standing panels
    on laptops). Projects: `.wk` (the whole entry is one link). Case study: `.shots`, `.moves`, gallery
    (`[data-slider]`, native sideways scroll, `overflow-y: hidden`), `.stats`, `.pn`.
  - Service pages: `webdesign.html`, `webentwicklung.html`, `seo.html`, `beratung.html`,
    `barrierefreiheit.html`, `support.html` (hero with breadcrumb and three facts, "Enthalten" rows, four
    steps, one reference, cost, FAQ, previous/next). Their copy only repeats claims the site already makes.
    They **repeat the three package prices** in `data-price` spans: change prices there too. They are listed
    in `STATIC_PAGES` (`build_blog.py`) and `llms.txt`.
  - Contact: the form comes before the details on phones. It is a three-step quiz (`[data-quiz]`): answer
    tiles (a custom radio group synced to a hidden input; a tap moves on), an optional note, then name and
    contact. All steps share one grid cell, so the panel never changes height; error lines sit in reserved
    space; the last step says "sent". Without JavaScript the steps follow each other as one form. It still
    posts to Web3Forms (see open points).
  - Text pages use `.prose`: mixed-case Archivo for headings, only the page title is in Bebas Neue (long
    all-caps headings are hard to read). Blog list and article blocks are styled on the class names
    `build_blog.py` writes (`.blog-card`, `.post__case`, `.post__related`, `.post__cta`); `.post__body`
    stays on the prose wrapper because the structured data's speakable selector uses it.
- **Removed claims (2026-10-09):** "Servern/Hosting in Deutschland", "rechtssicher" and "DSGVO-konform" are
  gone from services and landing page (visible text, meta description, structured data); the services FAQ
  "Wo wird meine Website gehostet?" was removed. Voice is "ich" on every page.
- **Open points:** the contact form's backend (Web3Forms, against the own-sites rule; needs an SMTP function
  and credentials), the result figures in the case studies ("2× Anfragen" at Eagle Air was already
  questioned), the Akkerman Stroy quote.
- **Images:** sources and licences in `assets/img/v2/CREDITS.md`; add a line for every new image and say
  whether it is a photo, drawn by script or AI-generated.
- **Pricing:** card prices carry `data-price` (figures supplied by the owner on 2026-10-08: Onepager 575 €,
  Website 695 €, Onlineshop 1.295 €). Change them only on the owner's word, in both `data-en` and the text.
- **Breakpoints in use:** 22.5rem, 30rem, 37.5rem, 48rem (grid 4→8), 62.5rem (burger → nav), 75rem, 87.5rem.
- **Claims:** the homepage no longer says "Hosting/Server in Deutschland" (not true yet, see global guardrails).

---

## Git Commit Rules

- Never include Claude or any AI tool as a co-author in commit messages. No `Co-Authored-By:` lines.
