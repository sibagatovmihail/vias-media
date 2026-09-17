# Vias Media — Go-Live & SEO Checklist

_Last updated: 2026-06-15. This file is for you; it is git-tracked but excluded from the deploy (`.vercelignore` ignores `docs`), so it never goes public._

---

## 1. Where do robots.txt, sitemap.xml, favicons etc. "go"?

**Nowhere special — there is no separate upload step.** This is a Vercel project. Every file at the repo root deploys as-is and is served from the domain root. There is no cPanel, no FTP, no "upload robots.txt to the server". The deploy command *is* the publish.

After you run `vercel --prod`, these resolve automatically:

| File (repo root) | Live URL |
|---|---|
| `robots.txt` | https://viasmedia.com/robots.txt |
| `sitemap.xml` | https://viasmedia.com/sitemap.xml |
| `favicon.ico`, `favicon.svg`, `favicon-32x32.png` … | https://viasmedia.com/favicon.ico … |
| `site.webmanifest`, `icon-192.png`, `icon-512.png` | served at root |
| `assets/img/og/*.png` | https://viasmedia.com/assets/img/og/… |
| `blog/…` | https://viasmedia.com/blog, /blog/<slug> |

> **Important for this project:** `git push` does NOT deploy (there's no GitHub auto-deploy). Production updates **only** when you run `vercel --prod`.

---

## 2. Go live now

From the repo (`~/Desktop/vias media`):

```bash
vercel --prod
```

That ships the current `main` (blog + all SEO assets + the lang/LCP fixes). Optional backup to GitHub (does not deploy):

```bash
git push origin main
```

Then sanity-check the live site:

```bash
curl -sI https://viasmedia.com/robots.txt | head -1     # 200
curl -sI https://viasmedia.com/sitemap.xml | head -1    # 200
curl -sI https://viasmedia.com/blog | head -1           # 200 (was 404 before deploy)
curl -s  https://viasmedia.com/blog/was-kostet-eine-website | grep -c BlogPosting   # 1
```

---

## 3. Post-deploy SEO checklist (these ARE manual, one-time)

1. **Google Search Console** — https://search.google.com/search-console
   - Add the property `viasmedia.com` (Domain property = verify via a DNS TXT record at your registrar; or URL-prefix = verify via the HTML-tag/file method).
   - **Submit the sitemap:** Sitemaps → enter `sitemap.xml` → Submit.
   - Use **URL Inspection** → "Request indexing" for the homepage, `/blog`, and the first article.
2. **Bing Webmaster Tools** (optional, quick win) — https://www.bing.com/webmasters — add site, submit the same sitemap. You can import directly from Search Console.
3. **Google Business Profile** — https://business.google.com — claim/create the Neubrandenburg listing (same name/address/phone as `impressum.html`). For a local studio this moves the needle more than anything else; it also powers the map pack.
4. **Validate structured data** — https://search.google.com/test/rich-results — test the homepage (ProfessionalService + FAQPage) and `/blog/was-kostet-eine-website` (BlogPosting). Fix any warnings it surfaces.
5. **Check social share cards** — paste the homepage, a case study, and the blog article into https://www.opengraph.xyz (or LinkedIn Post Inspector / X Card Validator). Confirm the 1200×630 image + title/description render.
6. **PageSpeed / Lighthouse** — https://pagespeed.web.dev — run the homepage and a case page; confirm green Performance + SEO. (The LCP image fix we just made should help the case pages.)
7. **Analytics** — confirm GA4 fires only after cookie consent (your banner gates it): accept cookies on the live site, then check GA4 Realtime shows the visit.

---

## 4. Publishing future blog posts

```bash
# 1. write the post
#    content/blog/<slug>.md  (front-matter: title, description, date, category, related_case)
# 2. build
python3 build_blog.py        # regenerates blog/, blog/index.html, sitemap.xml
# 3. deploy
vercel --prod
```

Google re-crawls the updated `sitemap.xml` automatically; you don't need to resubmit it each time (though you can "Request indexing" on a brand-new post to speed it up).

---

## 5. Audit status (2026-06-15)

Full SEO audit passed — favicons/manifest valid, robots+sitemap correct, unique titles/descriptions/canonicals on all 12 pages, OG images all 1200×630, all JSON-LD valid with consistent NAP. **Fixed:** `lang="de"` on the German legal pages; case-study hero (LCP) image switched from `loading="lazy"` to `fetchpriority="high"`.

**Open decision:** `login.html` and `teacher.html` (plus `api/`, `middleware.js`) are leftover auth-demo/template artifacts. They're noindexed + robots-disallowed (no SEO harm), but a placeholder "Sign in" page is live in production. Decide: delete them, or keep deliberately.

**Optional polish (not blocking):** give the blog a distinct OG share image (currently a copy of the homepage default); trim the blog-article `<title>` (~83 chars → ≤60) and the homepage/services meta descriptions (~175 chars → ≤160) so they don't truncate in search results; pad the PWA maskable icon's safe zone; optionally add `Article` schema to case pages.
