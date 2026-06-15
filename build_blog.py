#!/usr/bin/env python3
"""Vias Media blog generator. Markdown -> static HTML + sitemap."""
import json
import re
from pathlib import Path

import markdown as _md

SITE = "https://viasmedia.com"
ROOT = Path(__file__).resolve().parent

MONTHS_DE = ["", "Januar", "Februar", "März", "April", "Mai", "Juni",
             "Juli", "August", "September", "Oktober", "November", "Dezember"]

CASES = {
    "eagle-air":      {"href": "work-eagle-air.html",      "name": "Eagle Air HVAC",  "stat": "2×",    "stat_label": "Anfragen seit Launch"},
    "akkerman-stroy": {"href": "work-akkerman-stroy.html", "name": "Akkerman Stroy",   "stat": "+140%", "stat_label": "organischer Traffic"},
    "luxe-bouquets":  {"href": "work-luxe-bouquets.html",  "name": "Luxe Bouquets",    "stat": "+85%",  "stat_label": "Online-Bestellungen"},
    "safari":         {"href": "work-safari.html",         "name": "Safari",           "stat": "+38%",  "stat_label": "Conversion-Rate"},
}

STATIC_PAGES = [
    ("/", "monthly", "1.0"),
    ("/services.html", "monthly", "0.9"),
    ("/work.html", "monthly", "0.9"),
    ("/contact.html", "monthly", "0.8"),
    ("/blog", "weekly", "0.8"),
    ("/work-eagle-air.html", "yearly", "0.7"),
    ("/work-safari.html", "yearly", "0.7"),
    ("/work-akkerman-stroy.html", "yearly", "0.7"),
    ("/work-luxe-bouquets.html", "yearly", "0.7"),
]


# ---------------------------------------------------------------------------
# Task 1: front-matter parser
# ---------------------------------------------------------------------------

def parse_front_matter(text):
    """Split leading '--- ... ---' front-matter from the Markdown body.
    Front-matter is simple flat `key: value` lines. Returns (meta, body)."""
    if not text.startswith("---"):
        raise ValueError("missing front-matter")
    close = text.find("\n---", 3)
    if close == -1:
        raise ValueError("unterminated front-matter")
    block = text[3:close].strip("\n")
    body = text[close + 4:].lstrip("\n")
    meta = {}
    for line in block.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, val = line.partition(":")
        key, val = key.strip(), val.strip()
        if val.lower() in ("true", "false"):
            meta[key] = (val.lower() == "true")
        else:
            meta[key] = val
    return meta, body


# ---------------------------------------------------------------------------
# Task 2: reading time + German date helpers
# ---------------------------------------------------------------------------

def reading_time(body):
    words = len(re.findall(r"\w+", body))
    return max(1, round(words / 200))


def format_date_de(iso):
    y, m, d = (int(p) for p in iso.split("-"))
    return f"{d}. {MONTHS_DE[m]} {y}"


# ---------------------------------------------------------------------------
# Task 3: excerpt + load_post
# ---------------------------------------------------------------------------

def excerpt(meta, body):
    if meta.get("description"):
        return meta["description"].strip()
    for para in body.split("\n\n"):
        para = para.strip()
        if para and not para.startswith(("#", "!", ">", "-", "|")):
            return re.sub(r"\s+", " ", para)
    return ""


def load_post(path):
    text = path.read_text(encoding="utf-8")
    meta, body = parse_front_matter(text)
    if meta.get("draft"):
        return None
    slug = meta.get("slug") or path.stem
    return {
        "slug": slug,
        "title": meta.get("title", "").strip(),
        "description": meta.get("description", "").strip(),
        "date": meta.get("date", "").strip(),
        "date_de": format_date_de(meta["date"]) if meta.get("date") else "",
        "category": meta.get("category", "").strip(),
        "image": meta.get("image", "").strip(),
        "related_case": meta.get("related_case", "").strip(),
        "reading_time": reading_time(body),
        "body_html": "",               # filled by render step later
        "excerpt": excerpt(meta, body),
        "url": f"/blog/{slug}",
        "_body": body,                 # raw markdown, used by the renderer
    }


# ---------------------------------------------------------------------------
# Task 4: markdown body rendering
# ---------------------------------------------------------------------------

def render_body(body):
    return _md.markdown(body, extensions=["extra", "sane_lists"])


# ---------------------------------------------------------------------------
# Task 6: render_article
# ---------------------------------------------------------------------------

def _related_case_html(key):
    c = CASES.get(key)
    if not c:
        return ""
    return (
        f'<a class="post__case" href="../../{c["href"]}">'
        f'<div class="post__case-stat"><span class="post__case-num">{c["stat"]}</span>'
        f'<span class="t-small">{c["stat_label"]}</span></div>'
        f'<div class="post__case-text"><span class="t-label-md t-muted">Fallstudie</span>'
        f'<span class="t-card">{c["name"]}</span>'
        f'<span class="link">Fallstudie ansehen →</span></div></a>'
    )


def _jsonld(post, canonical, og_image):
    data = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post["title"],
        "description": post["description"],
        "datePublished": post["date"],
        "dateModified": post["date"],
        "author": {"@type": "Person", "name": "Mykhailo Sibahatov"},
        "publisher": {"@type": "Organization", "name": "Vias Media"},
        "image": og_image,
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
        "inLanguage": "de",
    }
    return json.dumps(data, ensure_ascii=False)


def render_article(post, template):
    canonical = f"{SITE}{post['url']}"
    og_image = f"{SITE}/{post['image']}" if post.get("image") else f"{SITE}/assets/img/og/blog-default.png"
    body_html = render_body(post["_body"])
    out = template
    out = out.replace("{{TITLE}}", post["title"])
    out = out.replace("{{DESCRIPTION}}", post["description"])
    out = out.replace("{{CANONICAL}}", canonical)
    out = out.replace("{{OG_IMAGE}}", og_image)
    out = out.replace("{{CATEGORY}}", post["category"])
    out = out.replace("{{DATE_DE}}", post["date_de"])
    out = out.replace("{{READING_TIME}}", str(post["reading_time"]))
    out = out.replace("{{BODY}}", body_html)
    out = out.replace("{{RELATED_CASE}}", _related_case_html(post["related_case"]))
    out = out.replace("{{JSONLD}}", _jsonld(post, canonical, og_image))
    return out


# ---------------------------------------------------------------------------
# Task 8: render_index
# ---------------------------------------------------------------------------

def _card_html(post):
    thumb = (f'<div class="blog-card__media"><img src="../{post["image"]}" alt="" '
             f'loading="lazy" decoding="async"></div>') if post.get("image") else ""
    return (
        f'<a class="blog-card" href="..{post["url"]}">'
        f'{thumb}'
        f'<div class="blog-card__body">'
        f'<div><span class="blog-card__cat t-label-md t-muted">{post["category"]}</span></div>'
        f'<div><h2 class="t-card">{post["title"]}</h2></div>'
        f'<div><p class="t-body t-muted-body">{post["excerpt"]}</p></div>'
        f'<div class="blog-card__meta"><span class="t-small">{post["date_de"]}</span>'
        f'<span aria-hidden="true"> · </span>'
        f'<span class="t-small">{post["reading_time"]} Min.</span></div>'
        f'<div class="blog-card__more"><span class="link">Weiterlesen →</span></div>'
        f'</div></a>'
    )


def render_index(posts, template):
    ordered = sorted(posts, key=lambda p: p["date"], reverse=True)
    cards = "\n".join(_card_html(p) for p in ordered)
    return template.replace("{{CARDS}}", cards)


# ---------------------------------------------------------------------------
# Task 9: build_sitemap
# ---------------------------------------------------------------------------

def _url_tag(loc, lastmod, changefreq, priority):
    return (f"  <url><loc>{SITE}{loc}</loc><lastmod>{lastmod}</lastmod>"
            f"<changefreq>{changefreq}</changefreq><priority>{priority}</priority></url>")


def build_sitemap(posts, today=None):
    from datetime import date
    today = today or date.today().isoformat()
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, cf, pr in STATIC_PAGES:
        lines.append(_url_tag(loc, today, cf, pr))
    for p in sorted(posts, key=lambda x: x["date"], reverse=True):
        lines.append(_url_tag(p["url"], p["date"], "monthly", "0.6"))
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Task 10: main() entrypoint
# ---------------------------------------------------------------------------

def main():
    content = ROOT / "content" / "blog"
    tpl_dir = ROOT / "content" / "_templates"
    art_tpl = (tpl_dir / "article.html").read_text(encoding="utf-8")
    idx_tpl = (tpl_dir / "index.html").read_text(encoding="utf-8")

    posts = []
    for md in sorted(content.glob("*.md")):
        post = load_post(md)
        if post is None:
            print(f"  skip (draft): {md.name}")
            continue
        posts.append(post)

    for post in posts:
        out_dir = ROOT / "blog" / post["slug"]
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(render_article(post, art_tpl), encoding="utf-8")
        print(f"  built: /blog/{post['slug']}")

    (ROOT / "blog").mkdir(exist_ok=True)
    (ROOT / "blog" / "index.html").write_text(render_index(posts, idx_tpl), encoding="utf-8")
    (ROOT / "sitemap.xml").write_text(build_sitemap(posts), encoding="utf-8")
    print(f"Done: {len(posts)} post(s), blog/index.html, sitemap.xml")


if __name__ == "__main__":
    main()
