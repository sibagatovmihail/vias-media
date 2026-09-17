# Why viasmedia.com does not rank yet — diagnosis, fix, and the 90-day plan

_Date: 2026-09-17. Git-tracked, excluded from deploy via `.vercelignore`._

## 1. What the facts say (checked live today)

| Check | Result |
|---|---|
| Is the site indexed by Google? | **Yes.** `site:viasmedia.com` returns 10+ pages, incl. blog posts. |
| Is it indexed by Bing? | Yes, 9 pages — but Bing still shows the **old titles from before the 2026-09-01 SEO pass** ("Leistungen — Vias Media"). Bing has not recrawled in 2+ weeks. |
| "vias media neubrandenburg" | **Position 1–4** (services, home, contact, blog). The site is fine when Google knows you mean *this* Vias Media. |
| "viasmedia" (one word) | Not on page 1. Google rewrites it to *via media* and shows viamedien.de, viamedia.ai, viamedia.tv, a Wikipedia article, a Bosnian agency… The name collides with a dozen older, better-linked entities worldwide. |
| "webagentur neubrandenburg" / "webdesign neubrandenburg" | Not in the top 30. Page 1 is a **map pack** (LT web-solution 5.0/67 reviews, Donner Digital, Maia Studio, 13° Crossmedia, NØRR Design…) followed by dedicated landing pages `/webdesign-neubrandenburg` from inventmedia.de, belumedia.de, fiz-soft.de, maiastudio.de, publiccom.de, webdesigner-neubrandenburg.de, konex-marketing.de. |
| Google Business Profile | **Exists but is pending verification** ("Google verarbeitet derzeit Ihre Angaben zur Verifizierung"). Until verified you cannot appear in the map pack at all. |
| Backlinks / mentions | Exactly **one** external mention found: the footer credit on akkerman-stroy.de. Nothing else on the web says "Vias Media, Neubrandenburg". |
| Domain age | Registered **2026-06-06** — 14 weeks old. |
| `www.viasmedia.com` | **Does not resolve** (no DNS record). Anyone typing `www.` gets an error. |
| Word "Webagentur" on the site | **0 occurrences** before today. You cannot rank for a word you never use. |
| NAP (name, address, phone) | Only on the Impressum. Not in the footer, not on the contact page. |
| Technical SEO / structured data | Good (audit of 2026-09-01). Not the problem. |

**Bottom line:** the site is technically healthy and indexed. It does not rank because it has no
*authority* and no *local entity* yet: no verified Google Business Profile, no reviews, no citations,
one backlink, a 3-month-old domain, and a brand name that Google resolves to other companies.
Your friend's Wix site ranks not because of Wix, but because he has a verified profile with reviews,
an older domain, and people linking to and searching for his name. Wix does nothing you do not have.

## 2. What was changed in the repo today (on-site part — done)

1. **New landing page `webagentur-neubrandenburg.html`** (~1,230 German words + English on
   `data-en`), modelled on the pages that actually rank: H1 with the exact query, why-local block,
   4-step process, service list, price range, an honest builder-vs-agency-vs-Vias comparison table,
   audience, 4 references with numbers, service-area towns, NAP, 7 FAQs. Schema: BreadcrumbList +
   WebPage + Service (areaServed 10 towns) + FAQPage. Own stylesheet `assets/css/pages/landing.css`.
2. **Homepage** title, description, OG/Twitter, H1 and WebPage schema now carry "Webagentur
   Neubrandenburg"; homepage links to the new page from the services intro.
   Organization/WebSite schema `alternateName` now includes `viasmedia` and `viasmedia.com` so the
   one-word brand query is tied to the entity.
3. **Footer on every page and both blog templates**: NAP block (Vias Media · Robert-Koch-Str. 15,
   17036 Neubrandenburg · phone · email) and a "Webagentur Neubrandenburg" link — 13 files patched,
   blog regenerated with `build_blog.py`.
4. `services.html` links to the landing page; `build_blog.py` STATIC_PAGES and `sitemap.xml` include
   it; `llms.txt` lists it.
5. **IndexNow key** file created at the site root (`605d19caf2350703e7778474691b279d.txt`) so
   Bing/Yandex/DuckDuckGo can be pinged instantly after each deploy (see §3.5).

Not changed on purpose: the hand-written testimonial cards on the homepage (see §4).

## 3. What only you can do — in priority order (this is 80 % of the result)

### 3.1 Finish Google Business Profile verification (this week)
- https://business.google.com → follow the pending verification (postcard/video/phone).
- Category: **Webdesigner** (primary), add "Werbeagentur", "Internetagentur" as secondary.
- Name **exactly** "Vias Media" — no keywords in the name (Google suspends for that).
- Address/phone/email exactly as in the footer and Impressum. Website: `https://viasmedia.com/`.
- Fill *everything*: opening hours, description (use the llms.txt summary), services list (the six
  services), 10+ photos (you, workspace, screenshots of client sites), booking link → contact page.
- Post an update every 2 weeks (a blog post, a launched site). Google rewards active profiles.

### 3.2 Reviews (weeks 1–4) — the single biggest local ranking factor
- Ask the real clients behind Akkerman Stroy, Eagle Air, Luxe Bouquets and Safari for a Google review
  as soon as the profile is verified. Send each a direct review link (from the profile → "Bewertung
  anfordern"). Aim: 5 reviews in the first month, then 1–2/month forever.
- Reply to every review within a day.
- Once you have a Place ID, set `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` on Vercel
  (see `docs/google-reviews-setup.md`) — the site then shows the *real* reviews.

### 3.3 Google Search Console + Bing Webmaster Tools (today, 20 minutes)
- https://search.google.com/search-console → add **Domain property** `viasmedia.com` (DNS TXT at
  Cloudflare). Submit `https://viasmedia.com/sitemap.xml`. URL-inspect and "Request indexing" for
  `/`, `/webagentur-neubrandenburg.html`, `/services.html`.
- https://www.bing.com/webmasters → "Import from Google Search Console". This is what forces Bing to
  drop the stale titles. Bing also feeds ChatGPT search and Copilot.

### 3.4 Fix `www.` (today, 5 minutes)
- Cloudflare DNS → add `CNAME www → cname.vercel-dns.com` (DNS only / grey cloud).
- Vercel project → Settings → Domains → add `www.viasmedia.com`, set it to **redirect to
  viasmedia.com** (308). Verify: `curl -sI https://www.viasmedia.com/ | head -3` → 308 to apex.

### 3.5 Ping IndexNow after every deploy (one command)
```bash
curl -s "https://api.indexnow.org/indexnow?url=https://viasmedia.com/webagentur-neubrandenburg.html&key=605d19caf2350703e7778474691b279d"
```
(HTTP 200/202 = accepted. Run it once per changed URL; never on a schedule.)

### 3.6 Citations — the same NAP on the German directories Google trusts (weeks 1–3)
Do these in this order, always with the *identical* name/address/phone/URL:
1. Bing Places (free, imports from GBP) · 2. Apple Business Connect · 3. Gelbe Seiten ·
4. Das Örtliche · 5. 11880 · 6. Cylex · 7. GoYellow · 8. wlw.de (Wer liefert was) ·
9. meinestadt.de (Neubrandenburg) · 10. Yelp DE · 11. Kennstdueinen · 12. Firmenwissen/Northdata
(appear automatically once you register a Gewerbe — check the entry matches).
Also: the **IHK Neubrandenburg** member directory and the Stadt Neubrandenburg Branchenbuch if
they accept entries.

### 3.7 Backlinks that are realistic for a one-person studio (ongoing)
- **Client footer credits.** Akkerman Stroy already links. Add a linked "Website: Vias Media" line
  to Eagle Air, Luxe Bouquets, Safari (and every future site). This is the cheapest, most relevant
  link you will ever get — and each one is a *local* link.
- **Profiles:** LinkedIn company page + your personal profile (website field), Instagram, a
  GitHub profile with the URL. Then add them to `sameAs` in `index.html` schema and to `llms.txt`.
- **Local press / community:** Nordkurier "Neue Unternehmen", Handwerkskammer newsletter, local
  Facebook groups (Neubrandenburg, Seenplatte) — post the "Wie Handwerker bei Google gefunden
  werden" article, not an ad.
- **One case study as a guest article** on a regional business site (e.g. the Akkerman Stroy
  story: "+140 % organischer Traffic").

### 3.8 Content cadence (from week 4)
- One blog article per month, each answering a query customers actually type
  (e.g. "Website Handwerker Kosten", "Google Unternehmensprofil einrichten Neubrandenburg",
  "Website Barrierefreiheit BFSG Pflicht kleine Unternehmen").
- After the GBP is live and 5+ reviews exist: town pages `webdesign-neustrelitz.html`,
  `webdesign-waren-mueritz.html`, each with unique copy (never a find-and-replace of the
  Neubrandenburg page — Google filters doorway pages).

## 4. One thing to decide: the testimonial cards on the homepage

`index.html` shows four quotes with names (James Wright, Anna Petrova, Olena Kovalenko,
David Okafor / "Sterling Properties"). "Sterling Properties" is not one of the four case studies,
and the footer says "5-Sterne-Bewertung" while no public review exists yet. If any of these are
not real, verifiable customer statements, remove them **before** the Google profile goes live:
fake reviews are a UWG violation in Germany and a visible mismatch (site says 5 stars, Google
shows 0 reviews) hurts trust more than an empty section would. Replace with the real Google
reviews via `reviews.js` as soon as they exist.

## 5. What to expect, honestly

| When | What should happen |
|---|---|
| Days 1–7 | GSC/Bing set up, www fixed, landing page indexed (request indexing). |
| Weeks 2–4 | GBP verified → you appear in the map pack for "webagentur/webdesign neubrandenburg", position depends on reviews vs. the 5.0/67 leader. "viasmedia" starts returning your site once GBP + 2–3 profiles link to it. |
| Months 2–3 | Landing page climbs into the top 20 for "webagentur neubrandenburg" (competition is weak on content; most have <1,500 words). Reviews decide the map pack. |
| Months 4–6 | Top 10 realistic for the "webagentur" and "webdesign" + Neubrandenburg queries if 10+ reviews and 5+ local links exist. New domains rarely rank competitive local terms faster than this. |

Measure monthly in Search Console (Queries → filter "neubrandenburg"), not by searching yourself
(personalised, and your own clicks distort it).

## 6. Pre-existing issues noticed on the way (not fixed, not in scope)

- `tests/test_build_blog.py::test_renders_cards_newest_first` fails on `KeyError: 'description'` — the
  test fixture predates the `description` field in `_index_jsonld()`. Fails on HEAD too.
- The uncommitted hero rework in `index.html` / `home.css` / `main.js` splits the word
  "Neubrandenburg" mid-word on phones ("NEUBRAN / DENBURG") because the title has
  `overflow-wrap: anywhere` together with balanced wrapping. Same with the old title text.
