---
name: bulk-multipage-edit
description: Apply the same HTML/CSS/JS change safely across many static pages (e.g. 10+ landing pages sharing a header/form/footer). Uses Python with explicit OLD/NEW literal string blocks, variant tagging for formatting differences, and a per-page verification step. Use when a single edit needs to land on 5+ files identically.
metadata:
  priority: 8
  pathPatterns:
    - '*.html'
    - '/tmp/patch-*.py'
  promptSignals:
    phrases:
      - "all pages"
      - "every page"
      - "across pages"
      - "city pages"
      - "service pages"
      - "all html files"
      - "apply to all"
retrieval:
  aliases:
    - bulk edit static pages
    - apply same change to many files
    - multipage patch
    - propagate edit across html files
  intents:
    - update the same section on many static pages at once
    - keep duplicated headers/forms/footers in sync
    - patch every landing page with the same change
---

# Bulk Multi-Page Edit

Static sites without a templating engine duplicate header/footer/form markup across every page. When something needs to change, **all copies must change identically**. This skill describes the pattern proven on this project for safe, verifiable bulk edits.

---

## When to use

- ≥5 pages share the same block of markup that needs the same edit.
- The edit is non-trivial (multi-line, structural) — not just a one-token substitution.
- You need to confirm afterward that every page actually got the change.

For trivial single-token replacements (e.g. swap one filename across all files), `perl -i -pe 's|...|...|' *.html` is fine — skip the script.

---

## The core pattern: explicit OLD/NEW literal blocks in Python

**Do not use regex** for HTML structural edits. HTML whitespace varies between hand-written and generated pages, attribute order varies, and one stray match in `<head>` can corrupt a file silently. Use exact string `.replace()` on multi-line literals — if the source doesn't match exactly, the script reports `SKIP` and you investigate.

### Template script

```python
#!/usr/bin/env python3
import os

PAGES = ['index', 'page-a', 'page-b', 'page-c']  # bare names, no .html
ROOT  = '/absolute/path/to/site'

OLD = '''                <div class="block">
                  <p>old markup</p>
                </div>'''

NEW = '''                <div class="block">
                  <p>new markup</p>
                  <small>note</small>
                </div>'''

for p in PAGES:
    path = os.path.join(ROOT, p + '.html')
    with open(path, 'r', encoding='utf-8') as fh:
        text = fh.read()
    if OLD not in text:
        print(f'SKIP {p}: pattern not found')
        continue
    text = text.replace(OLD, NEW, 1)   # ALWAYS pass count=1 to avoid runaway replacements
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(text)
    print(f'OK   {p}')
```

Save under `/tmp/patch-NAME.py`, run with `python3 /tmp/patch-NAME.py`.

---

## Handling formatting variants (compact vs multi-line)

Some pages compress markup onto one line per element (label + input on a single line); others use a multi-line pretty form. Same logical structure, different whitespace.

**Solution:** keep both literal templates in the same script, try them in order:

```python
OLD_A = '''                <div class="form-group">
                  <div class="form-group__label-cover">
                    <label for="contact-name">Name</label>
                  </div>
                </div>'''

OLD_B = '''                <div class="form-group">
                  <div class="form-group__label-cover"><label for="contact-name">Name</label></div>
                </div>'''

NEW_A = '''<...multi-line replacement...>'''
NEW_B = '''<...compact replacement...>'''

for p in PAGES:
    path = os.path.join(ROOT, p + '.html')
    text = open(path, encoding='utf-8').read()
    if OLD_A in text:
        text = text.replace(OLD_A, NEW_A, 1); tag = 'A'
    elif OLD_B in text:
        text = text.replace(OLD_B, NEW_B, 1); tag = 'B'
    else:
        print(f'SKIP {p}: no match'); continue
    open(path, 'w', encoding='utf-8').write(text)
    print(f'OK   {p} (variant {tag})')
```

The variant tag in the log tells you at a glance which formatting each page uses — useful when diagnosing partial misses.

---

## Verification — always run after the script

A script reporting `OK` for every page only proves the substitution ran. It doesn't prove the result is correct. Always grep for a unique marker from `NEW` across all pages:

```bash
cd /path/to/site && for p in index page-a page-b page-c; do
  count=$(grep -c "UNIQUE_MARKER_FROM_NEW" "$p.html")
  echo "$p: marker=$count"
done
```

Expect every page to print `marker=1`. Anything else = investigate.

For larger changes verify multiple markers (one per major addition) so you catch partial replacements.

---

## When to use `perl -i -pe` instead

For **single-line, single-token** swaps where the tag/attribute is unique:

```bash
perl -i -pe 's|<a href="[^"]*" class="navbar__logo"|<a href="index.html" class="navbar__logo"|' *.html
```

Rules of thumb for choosing perl over Python:
- Change is one line ✓
- The match anchors on a class/id that appears once per page ✓
- Replacement contains no shell-metachars or quotes that need escaping ✓
- You'll grep-verify after ✓

Anything multi-line → Python with explicit OLD/NEW.

---

## File discovery

Don't hard-code page lists if they change often. Discover dynamically:

```bash
# All HTML files at site root
ls /path/*.html

# All pages containing a specific component (e.g. forms)
grep -l 'id="contact-form"' /path/*.html
```

Then paste the bare names into the script's `PAGES` list. Hard-coding is intentional — you want the script to be explicit about scope so a stray HTML file (legal page, redirect stub) doesn't get edited by accident.

---

## Anti-patterns (these have all bitten us)

| Anti-pattern | What goes wrong |
|---|---|
| `re.sub` over multi-line HTML | Whitespace differences between pages cause silent misses; one greedy `.*` eats too much |
| `.replace(OLD, NEW)` without `count=1` | If `OLD` accidentally matches twice (rare but possible in long files), both get replaced |
| Skipping the verification grep | Script logs `OK` but the pattern matched a different occurrence than intended |
| Running on uncommitted work | Hard to revert if the script has a bug. Always commit (or at least stash) before bulk edits |
| Editing `*.html` with `perl -i` for multi-line edits | `-pe` works line-by-line; multi-line patterns silently don't match |

---

## Recovery if a bulk edit goes wrong

```bash
git diff               # see what changed across all pages
git checkout -- .      # revert all unstaged changes
# then fix the script and re-run
```

If you've already committed a bad bulk edit:

```bash
git revert HEAD        # creates a new commit undoing it (safe, preserves history)
```

Never `git reset --hard` to recover from a bulk edit unless you're 100% sure no other unstaged work is at risk.
