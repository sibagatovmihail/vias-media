#!/usr/bin/env python3
"""Copy the shared chrome from index.html into every other page.

The header, the phone menu, the icon sprite, the footer and the script tags are
written once, in index.html, and repeated in every page (the site has no build
step). After changing any of them in index.html, run

    python3 tools/sync-chrome.py            # write
    python3 tools/sync-chrome.py --check    # only report what would change

and then `python3 build_blog.py`, because the two blog templates are among the
targets. The asset version (?v=) of index.html is copied to every page as well.

Kept per page: everything between the menu and the footer (<main> and anything
after it), which nav entry is current (aria-current), and the footer variant
(ftr--bare on the contact page; ftr--over where the last section is wrapped in
.tail). Blog templates get their ../ or ../../ path prefix.
"""
import glob
import re
import sys

TOP_START, TOP_END = '<a class="skip-link"', '<main id="main"'
FOOT_START, FOOT_END = '<!-- ===== FOOTER ===== -->', '</body>'
NAV = {'services': 'services.html', 'work': 'work.html', 'contact': 'contact.html', 'blog': 'blog/index.html'}


def cut(s, start, end):
    i = s.index(start)
    return i, s.index(end, i)


def rebase(html, prefix):
    if not prefix:
        return html

    def fix(m):
        attr, url = m.group(1), m.group(2)
        if url == '' or re.match(r'^(https?:|mailto:|tel:|/|#|data:)', url):
            return m.group(0)
        return f'{attr}="{prefix}{url}"'
    return re.sub(r'\b(href|src)="([^"]*)"', fix, html)


def current_of(page):
    """Which nav entry the page marks as current, and with which value."""
    m = re.search(r'<a href="(?:\.\./)*([^"]+)" class="(?:blink|menu__row)" aria-current="(page|true)"', page)
    if not m:
        return None, None
    for key, target in NAV.items():
        if m.group(1) == target:
            return key, m.group(2)
    return None, None


def main():
    check = '--check' in sys.argv
    index = open('index.html', encoding='utf-8').read()
    i, j = cut(index, TOP_START, TOP_END)
    top = index[i:j].replace('href="#preise"', 'href="index.html#preise"')
    i, j = cut(index, FOOT_START, FOOT_END)
    foot = re.sub(r'<footer class="ftr[^"]*"', '<footer class="ftr"', index[i:j], count=1)
    version = re.search(r'tokens\.css\?v=([0-9a-z]+)', index).group(1)

    targets = sorted(f for f in glob.glob('*.html') if f != 'index.html' and 'assets/css/v2/' in open(f, encoding='utf-8').read())
    targets += ['content/_templates/article.html', 'content/_templates/index.html']
    changed = 0
    for path in targets:
        page = open(path, encoding='utf-8').read()
        prefix = '../../' if path.endswith('_templates/article.html') else '../' if path.endswith('_templates/index.html') else ''
        key, value = current_of(page)
        t = top
        if key:
            for cls in ('blink', 'menu__row'):
                t = t.replace(f'<a href="{NAV[key]}" class="{cls}">', f'<a href="{NAV[key]}" class="{cls}" aria-current="{value}">')
        f = foot
        if 'ftr--bare' in page:
            f = f.replace('<footer class="ftr"', '<footer class="ftr ftr--bare"', 1)
        elif 'class="tail"' in page:
            f = f.replace('<footer class="ftr"', '<footer class="ftr ftr--over"', 1)
        a0, a1 = cut(page, TOP_START, TOP_END)
        b0, b1 = cut(page, FOOT_START, FOOT_END)
        new = page[:a0] + rebase(t, prefix) + page[a1:b0] + rebase(f, prefix) + page[b1:]
        new = re.sub(r'(assets/(?:css|js)/(?!vendor/)[^"?]+)\?v=[0-9a-z]+', lambda m: f'{m.group(1)}?v={version}', new)
        if new != page:
            changed += 1
            if not check:
                open(path, 'w', encoding='utf-8').write(new)
        print(('would change ' if check else 'updated      ') if new != page else 'unchanged    ', path)
    print(f'{changed} of {len(targets)} pages {"differ" if check else "written"}; asset version {version}')
    if changed and not check:
        print('now run: python3 build_blog.py')


if __name__ == '__main__':
    main()
