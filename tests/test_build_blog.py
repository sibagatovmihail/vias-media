import sys
import os
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from build_blog import (
    parse_front_matter,
    reading_time,
    format_date_de,
    excerpt,
    load_post,
    render_body,
    render_article,
    render_index,
    build_sitemap,
)


# ---------------------------------------------------------------------------
# Task 1: front-matter parser
# ---------------------------------------------------------------------------

class TestFrontMatter(unittest.TestCase):
    def test_parses_keys_and_body(self):
        text = "---\ntitle: Hallo Welt\ndate: 2026-06-15\ndraft: false\n---\n\nErster Absatz.\n"
        meta, body = parse_front_matter(text)
        self.assertEqual(meta["title"], "Hallo Welt")
        self.assertEqual(meta["date"], "2026-06-15")
        self.assertFalse(meta["draft"])
        self.assertEqual(body.strip(), "Erster Absatz.")

    def test_missing_front_matter_raises(self):
        with self.assertRaises(ValueError):
            parse_front_matter("kein front-matter hier")


# ---------------------------------------------------------------------------
# Task 2: reading time + German date helpers
# ---------------------------------------------------------------------------

class TestHelpers(unittest.TestCase):
    def test_reading_time_minimum_one(self):
        self.assertEqual(reading_time("Nur drei Wörter hier"), 1)

    def test_reading_time_scales(self):
        body = " ".join(["wort"] * 600)   # 600 words at 200 wpm -> 3
        self.assertEqual(reading_time(body), 3)

    def test_format_date_de(self):
        self.assertEqual(format_date_de("2026-06-15"), "15. Juni 2026")
        self.assertEqual(format_date_de("2026-01-03"), "3. Januar 2026")


# ---------------------------------------------------------------------------
# Task 3: excerpt + load_post
# ---------------------------------------------------------------------------

class TestExcerpt(unittest.TestCase):
    def test_prefers_description(self):
        self.assertEqual(excerpt({"description": "Kurz."}, "## H\n\nLanger Text."), "Kurz.")

    def test_falls_back_to_first_paragraph(self):
        out = excerpt({}, "## Überschrift\n\nDer erste echte Absatz hier.\n\nZweiter.")
        self.assertEqual(out, "Der erste echte Absatz hier.")


class TestLoadPost(unittest.TestCase):
    def _write(self, name, text):
        p = Path(self.dir.name) / name
        p.write_text(text, encoding="utf-8")
        return p

    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.dir.cleanup()

    def test_loads_fields(self):
        p = self._write("was-kostet.md",
            "---\ntitle: Was kostet?\ndescription: Antwort.\ndate: 2026-06-15\n"
            "category: Ratgeber\nrelated_case: eagle-air\ndraft: false\n---\n\nText hier.\n")
        post = load_post(p)
        self.assertEqual(post["slug"], "was-kostet")
        self.assertEqual(post["title"], "Was kostet?")
        self.assertEqual(post["date_de"], "15. Juni 2026")
        self.assertEqual(post["url"], "/blog/was-kostet")
        self.assertEqual(post["related_case"], "eagle-air")
        self.assertEqual(post["excerpt"], "Antwort.")

    def test_draft_returns_none(self):
        p = self._write("d.md", "---\ntitle: T\ndate: 2026-06-15\ndraft: true\n---\n\nx\n")
        self.assertIsNone(load_post(p))


# ---------------------------------------------------------------------------
# Task 4: markdown body rendering
# ---------------------------------------------------------------------------

class TestRenderBody(unittest.TestCase):
    def test_headings_and_emphasis(self):
        html = render_body("## Titel\n\nEin **fetter** Absatz.")
        self.assertIn("<h2", html)
        self.assertIn("<strong>fetter</strong>", html)


# ---------------------------------------------------------------------------
# Task 6: render_article
# ---------------------------------------------------------------------------

ART_TPL = ("<title>{{TITLE}} — Vias Media</title>{{DESCRIPTION}}{{CANONICAL}}"
           "{{OG_IMAGE}}{{JSONLD}}{{CATEGORY}}{{DATE_DE}}{{READING_TIME}}"
           "{{BODY}}{{RELATED_CASE}}")


class TestRenderArticle(unittest.TestCase):
    def _post(self, **kw):
        base = {"slug": "was-kostet", "title": "Was kostet?", "description": "Antwort.",
                "date": "2026-06-15", "date_de": "15. Juni 2026", "category": "Ratgeber",
                "image": "", "related_case": "eagle-air", "reading_time": 4,
                "excerpt": "Antwort.", "url": "/blog/was-kostet",
                "_body": "## H\n\nText."}
        base.update(kw)
        return base

    def test_fills_placeholders_and_canonical(self):
        html = render_article(self._post(), ART_TPL)
        self.assertIn("Was kostet? — Vias Media", html)
        self.assertIn("https://viasmedia.com/blog/was-kostet", html)
        self.assertIn("BlogPosting", html)            # JSON-LD
        self.assertIn("<h2", html)                    # rendered body
        self.assertIn("work-eagle-air.html", html)    # related case link
        self.assertNotIn("{{", html)                  # no leftover placeholders

    def test_no_related_case_leaves_block_empty(self):
        html = render_article(self._post(related_case=""), ART_TPL)
        self.assertNotIn("work-", html)
        self.assertNotIn("{{", html)


# ---------------------------------------------------------------------------
# Task 8: render_index
# ---------------------------------------------------------------------------

IDX_TPL = "<main>{{CARDS}}</main>"


class TestRenderIndex(unittest.TestCase):
    def _post(self, slug, title, date):
        return {"slug": slug, "title": title, "date": date, "date_de": "15. Juni 2026",
                "category": "Ratgeber", "image": "", "reading_time": 4,
                "excerpt": "Kurz.", "url": f"/blog/{slug}"}

    def test_renders_cards_newest_first(self):
        posts = [self._post("a", "Alt", "2026-01-01"), self._post("b", "Neu", "2026-06-15")]
        html = render_index(posts, IDX_TPL)
        self.assertNotIn("{{", html)
        self.assertIn("/blog/a", html)
        self.assertIn("/blog/b", html)
        # newest (b/"Neu") appears before oldest (a/"Alt")
        self.assertLess(html.index("Neu"), html.index("Alt"))


# ---------------------------------------------------------------------------
# Task 9: build_sitemap
# ---------------------------------------------------------------------------

class TestSitemap(unittest.TestCase):
    def test_includes_static_blog_and_posts(self):
        posts = [{"url": "/blog/was-kostet", "date": "2026-06-15"}]
        xml = build_sitemap(posts)
        self.assertIn("<loc>https://viasmedia.com/</loc>", xml)
        self.assertIn("<loc>https://viasmedia.com/work-eagle-air.html</loc>", xml)
        self.assertIn("<loc>https://viasmedia.com/blog</loc>", xml)
        self.assertIn("<loc>https://viasmedia.com/blog/was-kostet</loc>", xml)
        self.assertTrue(xml.strip().startswith("<?xml"))
        self.assertIn("</urlset>", xml)


if __name__ == "__main__":
    unittest.main()
