# Local SEO blueprint for every site I run

_Reusable plan (not an audit). Written 2026-09-17 from the viasmedia.com diagnosis. Applies to any
small-business site: Vias Media, Akkerman Stroy, Eagle Air, Luxe Bouquets, Jesus Punkt, client sites._

The order matters. Phases 0–2 are cheap and decide 80 % of local rankings. Content and links only
pay off once the entity exists.

---

## Phase 0 — Foundation (day 1, ~2 hours, once per site)

| # | Task | Done when |
|---|---|---|
| 0.1 | One canonical host. `www` and apex both resolve; one 308-redirects to the other. | `curl -sI https://www.<domain>/` → 308 → canonical |
| 0.2 | HTTPS + HSTS, no mixed content. | `curl -sI` shows `strict-transport-security` |
| 0.3 | `robots.txt` allows everything public, names `Sitemap:`; AI crawlers explicitly allowed. | `curl https://<domain>/robots.txt` |
| 0.4 | `sitemap.xml` lists every indexable URL with real `lastmod`; generated, not hand-edited. | validates, every URL 200 |
| 0.5 | Google Search Console **Domain property** + sitemap submitted + "Request indexing" for the money pages. | GSC shows "Erfolgreich" |
| 0.6 | Bing Webmaster Tools (import from GSC). IndexNow key file at root; ping after each deploy. | key URL returns the key |
| 0.7 | `<title>`, `meta description`, canonical, OG image on every page; `lang` correct; one `<h1>` per page. | grep across all pages |
| 0.8 | Static/SSR HTML — all content and JSON-LD in the source, not injected by JS. | `curl` shows the copy |
| 0.9 | Core Web Vitals green on phone (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1). | PageSpeed mobile |

## Phase 1 — Entity (week 1): make Google believe the business exists

1. **Google Business Profile** — verified, exact legal name (no keywords), primary category chosen
   from what competitors in the map pack use, all fields filled, 10+ photos, services, hours,
   booking/contact link, description = the first paragraph of `llms.txt`.
2. **NAP consistency** — name, address, phone, URL byte-identical everywhere: footer of every page,
   Impressum, contact page, GBP, every directory. Put the NAP in the footer template once.
3. **Organization / LocalBusiness JSON-LD** on the homepage with `@id`, address, geo, phone,
   `areaServed`, `founder`, `sameAs` (only profiles that really exist), `alternateName` with the
   one-word spelling people type (`viasmedia`, `akkermanstroy`).
4. **Citations** (same NAP): Bing Places, Apple Business Connect, Gelbe Seiten, Das Örtliche, 11880,
   Cylex, GoYellow, wlw, meinestadt, Yelp, plus the trade body (IHK / HWK) and city directory.
5. **Profiles that count as `sameAs`:** LinkedIn (company + person), Instagram, Facebook page,
   GitHub/YouTube where relevant. Website URL in every bio.
6. **`llms.txt`** at the root — one paragraph on what the business is, who it serves, where; links
   to the money pages. AI answer engines read it; nothing else is that cheap.

## Phase 2 — Reviews (weeks 1–4, then forever)

- Ask every real customer for a Google review at the moment of delivery, with the direct link.
  Target 5 in month one, then 1–2 per month. Review *velocity* matters more than the total.
- Reply to every review within 24 h (Google shows it, customers read it).
- Pull real reviews onto the site through the Places API — **one cached call per day**, never per
  visitor (frugal-resources rule). Never hand-write testimonials that cannot be verified; in
  Germany that is a UWG problem, and Google cross-checks the numbers.

## Phase 3 — Keyword map and money pages (weeks 2–4)

1. **One page = one intent.** Build a table: query → page → title → H1. Never two pages for the
   same query (cannibalisation), never one page for two intents.
   - Homepage: brand + primary service + city ("Webagentur Neubrandenburg").
   - One landing page per **service × city** that has real demand ("Webdesign Neubrandenburg",
     "Komplettsanierung Neubrandenburg"), 1,000+ words, unique copy.
   - Additional city pages only with genuinely different content (references, travel radius, local
     detail). Find-and-replace city pages get filtered as doorway pages.
2. **Title formula:** `<Service> <City>: <benefit> | <Brand>` ≤ 60 chars. **H1** contains the
   query verbatim once. Query appears in the first paragraph, one H2, the URL slug, image alt.
3. **Landing page skeleton that ranks** (what page-1 competitors actually have): H1 → 2-sentence
   answer → why-local block → process (4 steps) → services → price range (real numbers or an honest
   range) → comparison table → audience → references with measured results → service-area towns
   list + NAP → 6–8 FAQs (question-headed, answer-first) → CTA. Schema: BreadcrumbList + WebPage +
   Service (`areaServed`) + FAQPage generated from the visible FAQ.
4. **Use the words customers use.** Check the live SERP for the query: which words appear in the
   ranking titles ("Webagentur", "Werbeagentur", "Website erstellen lassen") and use each at least
   once. A word that never appears on the site cannot rank.
5. **Internal links:** every money page reachable from the footer and the homepage; blog posts link
   *to* money pages with descriptive anchors, never "hier klicken".

## Phase 4 — Links (from week 3, ongoing, 1 hour/week)

Priority by effort-to-value for a small local business:
1. Footer credit on every site you build ("Website: <Brand>", linked). Local + relevant + free.
2. Supplier / partner / client "Partner" pages — ask, most say yes.
3. Trade body member directories (IHK, HWK, Innung, Verband).
4. Local press: new-business notices, project stories with a number in the headline.
5. One guest article per quarter on a regional site (a case study, not an ad).
6. Community: local Facebook groups, Nebenan.de, Reddit r/de local subs — share the *guide*
   article, not the homepage.
Skip: link farms, paid directories with no local relevance, "SEO packages" with 100 links.

## Phase 5 — Content cadence (from month 2)

- One article per month answering a question customers type ("Was kostet …", "… Pflicht 2026",
  "… selbst machen oder Agentur"). 1,200–1,800 words, question-headed H2s, answer-first paragraphs,
  a table with real numbers, named author with credentials, `dateModified` maintained.
- Every article links to one money page and one other article.
- Post the article on the GBP as an update the same day.

## Phase 6 — Measure (monthly, 20 minutes)

- Search Console → Queries filtered by city: impressions first (visibility), clicks second.
- GBP Insights: searches, calls, direction requests.
- Rank checks only via GSC average position — never by googling yourself (personalised, and your
  clicks pollute the data).
- One number per site in the Brain project file: impressions for `<city>` queries, month over month.

## Expectations to set (new domain)

| Time | Realistic outcome |
|---|---|
| Week 1 | Indexed, GBP live, brand query returns the site. |
| Month 1–2 | Map pack for city + service once reviews > 3; landing page top 20–30. |
| Month 3–6 | Top 10 for city + service with 10+ reviews, 5+ local links, one landing page per service. |
| Month 6+ | Compounding: each new review, link and article moves everything. |

## Per-site checklist (copy into the project file)

```
[ ] 0.1 www + apex + redirect        [ ] 1.1 GBP verified, complete
[ ] 0.5 GSC domain property          [ ] 1.2 NAP in footer template
[ ] 0.6 Bing + IndexNow key          [ ] 1.3 LocalBusiness JSON-LD + sameAs
[ ] 0.7 titles/H1/canonical/OG       [ ] 1.4 12 citations, identical NAP
[ ] 0.9 CWV green on phone           [ ] 1.6 llms.txt
[ ] 2   review request flow live     [ ] 3   keyword map, 1 page = 1 intent
[ ] 3.3 service×city landing page(s) [ ] 4   footer credits on built sites
[ ] 5   monthly article              [ ] 6   GSC city impressions logged monthly
```
