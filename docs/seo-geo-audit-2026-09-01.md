# SEO + GEO Audit & Implementation — viasmedia.com
**Date:** 2026-09-01 · **Business type:** Agency / Professional Service (local, DE)
**Primary market:** Neubrandenburg + Landkreis Mecklenburgische Seenplatte
**Money keywords:** „Webdesign Neubrandenburg", „Website Handwerksbetrieb MV", „Homepage kleines Unternehmen Neubrandenburg"

---

## Composite score

| Category | Weight | Before | After | Δ |
|---|---|---|---|---|
| AI Citability & Visibility | 25% | 45 | 78 | +33 |
| Brand Authority (off-site) | 20% | 5 | 5 | 0 |
| Content E-E-A-T | 20% | 40 | 55 | +15 |
| Technical Foundations | 15% | 85 | 85 | 0 |
| Structured Data | 10% | 52 | 80 | +28 |
| Platform Optimization | 10% | 35 | 62 | +27 |
| **Composite** | | **41.7 (Poor)** | **58.5 (Poor→Fair edge)** | **+16.8** |

The ceiling is **Brand Authority (20% of the score, sitting at 5/100)**. Every on-site lever has now been
pulled; the remaining gain is off-site and cannot be done in the repo. See "What I could not fix" below.

---

## Findings

### Critical
None. The site is static HTML on Vercel — server-rendered, HTTPS, valid certificate, no JS-only content.
AI crawlers were never blocked.

### High
1. **No `llms.txt`** — fewer than 5% of sites have one; its absence meant no AI system had a structured
   summary of what Vias Media is, who it serves, or which pages matter. → **Fixed.**
2. **Zero `sameAs` links in Organization schema** — 0/15 schema points and the single largest GEO gap.
   ChatGPT resolves 47.9% of its citations through Wikipedia/entity graphs; with no external profile
   anywhere, "Vias Media" is not a recognised entity to any AI system. → **Not fixable in-repo** (no
   profiles exist to link). Action plan below.
3. **`services.html`, `work.html`, `contact.html` had no structured data at all** and no question-headed
   answer blocks. `services.html` was 289 words against a 500-word service-page floor. → **Fixed.**

### Medium
4. Case-study pages carried only `BreadcrumbList` — no `Article`, no author, no `about` entity, no
   `speakable`. Case studies are an agency's highest-citability asset. → **Fixed.**
5. Blog `BlogPosting` schema had author as a bare name string, publisher with no logo, no breadcrumb,
   no `wordCount`, no `speakable`. → **Fixed in the generator**, so future posts inherit it.
6. Blog index (`/blog`) had zero structured data. → **Fixed.**
7. Generic page titles („Leistungen — Vias Media") wasting the strongest on-page ranking signal —
   no location keyword, no service keyword. → **Fixed.**
8. `robots.txt` allowed AI crawlers only implicitly via `User-agent: *`, and allowed Bytespider and
   CCBot, which take content and send no referral traffic. → **Fixed.**

### Low
9. No CSP header (`vercel.json` has HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
   Permissions-Policy). −10 on the security sub-score. Left alone deliberately: a CSP on a site with
   inline theme/i18n scripts needs testing, not a blind header.
10. ~~Blog posts are ~300 words each against a 1,500-word floor.~~ **Resolved in a second pass — see
    "Blog expansion" below.**

---

## Changes made

| File | Change |
|---|---|
| `robots.txt` | Rewritten. Explicit `Allow` for 9 Tier-1 AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User) and 7 Tier-2 (Google-Extended, GoogleOther, Applebot, Applebot-Extended, Amazonbot, FacebookBot, meta-externalagent). `Disallow: /` for Bytespider and CCBot. Added IETF `Content-Signal: search=yes, ai-train=yes, ai-retrieval=yes`. |
| `llms.txt` | **New.** 48 lines: description, 4 sections (Services, Case Studies, Blog, Legal), 13 page entries with factual descriptions, 10 Key Facts, contact block. |
| `index.html` | Organization schema rebuilt: `additionalType` (Product Ontology entity links), `slogan`, `logo` as ImageObject, `founder`/`employee` as a `@id`-addressable Person, `knowsAbout` (8 topics), `knowsLanguage`, `currenciesAccepted`, `areaServed` expanded from 2 to 8 entries (6 named towns + district + state), and a full `hasOfferCatalog` with all 6 services. Added a `WebPage` node with `speakable`. |
| `services.html` | **New FAQ section, 7 question-headed Q&As** (pricing, local SEO inclusion, time-to-rank, design vs. development, BFSG accessibility law, website vs. social media, post-launch support) — each written answer-first, self-contained, with concrete numbers. German + `data-en` English throughout. Word count **289 → 970**. New `@graph`: BreadcrumbList + CollectionPage (`speakable`) + ItemList of 6 `Service` nodes with `areaServed` and `availableChannel` + FAQPage generated from the visible copy. Anchor `id`s added to the 6 service cards. Title/description rewritten with location keywords. |
| `work.html` | New `@graph`: BreadcrumbList + CollectionPage + ItemList of the 4 case studies. Title/description rewritten to lead with the measured results. |
| `contact.html` | New `@graph`: BreadcrumbList + ContactPage linked to the Organization. Title/description rewritten. |
| `work-*.html` (×4) | BreadcrumbList-only schema replaced with `@graph`: Article+CreativeWork (with `about` = client Organization, `abstract` = measured result, `locationCreated`, `mentions`, `speakable`) + author Person cross-referenced to `#mykhailo`. |
| `build_blog.py` | `_jsonld()` rewritten to emit a 3-node `@graph` (BlogPosting + Person + BreadcrumbList) with `@id` cross-references to the homepage entities, `wordCount`, `timeRequired`, `speakable`. New `_index_jsonld()` emits `Blog` + `BreadcrumbList` for `/blog`. `word_count` added to the post dict. |
| `content/_templates/index.html` | `{{JSONLD}}` slot added; title/description rewritten with keywords. |
| `assets/css/components.css` / `pages/home.css` | `.faq*` accordion rules moved from `home.css` to `components.css` — it is now a shared component used by two pages. No visual change. |
| `sitemap.xml`, `blog/**` | Regenerated by `build_blog.py`. |

**Verification:** all 11 JSON-LD blocks parse as valid JSON and resolve to valid schema.org types.
Layout re-verified via CDP at 375 / 600 / 1280 px: `scrollWidth === innerWidth` at every width,
zero overflow offenders on `services.html`.

---

## What I could not fix in the repo — off-site, highest remaining ROI

Brand Authority is 20% of the composite and scores 5/100. Ahrefs' Dec 2025 study of 75,000 brands found
unlinked brand mentions correlate ~3x more strongly with AI citation than backlinks; Domain Rating
correlates only ~0.266, YouTube mentions ~0.737. In priority order:

1. **Google Business Profile for Vias Media** (Robert-Koch-Str. 15, 17036 Neubrandenburg). This is the
   single biggest local-search lever and it does not exist yet. It also feeds Gemini directly.
2. **LinkedIn company page + personal profile.** Cheapest `sameAs` link, and Bing/Copilot weight it.
3. **A YouTube channel with 3–5 short explainers** („Was kostet eine Website?", „Warum Ihr Betrieb bei
   Google nicht gefunden wird") — highest single correlation with AI citation of any platform.
4. Once 2–4 of these exist, add them to `sameAs` in `index.html` and to `llms.txt`.
5. **Bing Webmaster Tools + IndexNow.** ChatGPT Search and Copilot both run on Bing's index.
6. **Google Search Console**: submit `https://viasmedia.com/sitemap.xml`.

## Blog expansion (second pass, same day)

| Article | Before | After | H2 questions | Tables |
|---|---|---|---|---|
| `was-kostet-eine-website` | 299 | **1,419** | 10 | 3 |
| `warum-eine-website-fuer-kleine-betriebe-wichtig-ist` | ~300 | **1,455** | 10 | 1 |
| `wie-handwerker-bei-google-gefunden-werden` (**new**) | — | **1,504** | 10 | 2 |

Every H2 is a question a customer would actually type; every section opens with a direct answer.
`datePublished` is preserved on the two rewrites and `dateModified` set to 2026-09-01.

Facts verified from source before use: Bitkom (503 Handwerksbetriebe, representative telephone survey,
published 1 July 2022) — 97% have their own website, used to argue that *having* a site is no longer the
differentiator; § 5 DDG replaced § 5 TMG on 14 May 2024 with the Impressumspflicht unchanged in
substance; Core Web Vitals thresholds LCP ≤ 2.5 s, INP ≤ 200 ms (replaced FID March 2024), CLS ≤ 0.1;
Google's three documented local-ranking factors (Relevanz / Entfernung / Bekanntheit).

Deliberately dropped: a widely-repeated "95% / 89% / 16%" Bitkom set that search results attribute to
2025 but which traces back to a **2017** study; the 2025/26 Bitkom Handwerk figures (PDF could not be
text-extracted on this machine, so they could not be confirmed first-hand); any "users decide in 10–15
seconds" claim; specific hosting euro figures. No client names, review counts or testimonials invented.

### Two generator defects the expansion surfaced — both fixed

1. **`dateModified` was always wrong.** `_jsonld()` read `post.get("updated")`, but `load_post()` never
   copied the front-matter `updated` key into the post dict, so `dateModified` silently fell back to
   `datePublished` on every post forever. Perplexity in particular deprioritises content without a
   visible recent update. Fixed in `load_post()`.
2. **`wordCount` and `timeRequired` counted markup.** Both measured raw markdown, so table pipes and any
   inline HTML inflated the schema's `wordCount` and the displayed reading time. Added a `_prose()`
   helper that strips `<style>` blocks, tags and table pipes before counting.

Also moved the article-table CSS out of the three markdown files into `assets/css/pages/blog.css`, where
it belongs, and added **scroll shadows** to the table wrapper — a pure-CSS `background-attachment:
local`/`scroll` pair that shows an edge shadow only on a side with content still off-screen. At 375 px a
3-column German table is 448 px wide inside a 327 px wrapper; it scrolls within its own container (the
page never scrolls sideways) and now visibly signals that it does. At 600 px the table fits and no shadow
appears.

## Next content actions (in-repo, ranked)

1. Add 3–4 city/service landing pages (`webdesign-neustrelitz`, `website-handwerker-mv`, …) modelled on
   the `Service` nodes already in the schema — the `areaServed` list now names the towns to target.
3. Add a visible „Zuletzt aktualisiert" date to service and case-study pages. Perplexity deprioritises
   undated content.
4. Add `aggregateRating` to the Organization once real Google reviews exist — never before.
