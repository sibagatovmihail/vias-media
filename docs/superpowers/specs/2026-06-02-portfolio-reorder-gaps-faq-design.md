# Homepage: reorder portfolio, bigger gaps, add FAQ — Design

Date: 2026-06-02

## Goal

Three changes to `index.html` (homepage):

1. Move the Work/portfolio section up, between "Why Vias Media" and "Services".
2. Increase vertical spacing between sections.
3. Add a Q&A / FAQ accordion section.

## 1. Reorder

Move `<section class="section work" id="work">…</section>` from its current position
(after Services) to between Features (`#why`) and Services (`#services`).

New `<main>` order:
Hero → Trust marquee → Why Vias Media (`#why`) → Work/portfolio (`#work`) →
Services (`#services`) → Testimonials (`#reviews`) → Q&A (`#faq`) → Footer CTA → Footer.

Verify background alternation (`--bg` / `--bg-alt`) still reads cleanly after the
swap; adjust a section background only if two same-colored sections end up adjacent.

## 2. Section gaps

`home.css`: `.section { padding-block: var(--space-3xl) }` (4rem) → `var(--space-5xl)` (7.5rem).
Progressive scale-down (per CLAUDE.md "never single-step jumps"):
- desktop: 7.5rem
- ≤48rem: 5rem (--space-4xl)
- ≤37.5rem: 4rem (--space-3xl)

Testimonials keeps its existing larger padding.

## 3. FAQ section

New `<section class="section faq" id="faq">` placed after Testimonials, before footer CTA.

- `.container` + centered `.section-head` (pill "FAQ" + heading + lead).
- Accordion list: click a question to expand its answer; opening one closes others;
  smooth height transition; keyboard accessible with `aria-expanded` / `aria-controls`.
- Small accordion handler added to `main.js` next to existing reveal/slider logic.
- Reuses existing tokens (`.card`, pills, dividers, accent) — no new colors.
- Markup follows CLAUDE.md semantics: text nodes wrapped in cover `<div>`s.
- English-only body copy (consistent with rest of body; only header/menu use `data-de`).

### Questions & answers

1. **How much does a website cost?** — Every project is priced individually. After a
   free consultation where we discuss your goals, scope, and requirements, we send you a
   clear fixed quote — no hourly guesswork, no surprises.
2. **How long does a project take?** — Most small-business sites launch in 2–4 weeks. The
   exact timeline depends on scope and how quickly we get your content and feedback; we
   map it out together at the start.
3. **What do I need to get started?** — Just your goals and any branding you already have
   (logo, photos, text). Don't have those yet? We'll guide you through it — many clients
   start from scratch.
4. **Do you work with trades and new local businesses?** — Yes — that's our focus. We help
   tradespeople, Handwerker, and growing local businesses get found on Google and turn
   visitors into booked jobs.
5. **What happens after launch?** — We don't disappear. We offer ongoing support, updates,
   and optimization so your site keeps performing month after month.
6. **Will my site be found on Google?** — Local SEO is built into every project, so nearby
   customers find you first when they search for what you do.
