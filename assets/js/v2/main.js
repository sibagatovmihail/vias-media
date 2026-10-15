/* =====================================================================
   Vias Media v2 "Bauplan" — page interactions
   contact links · menu sheet · smooth scroll · split text + hero fit ·
   reveals · record sleeves · horizontal scene + masked-word zoom ·
   service drawings · hero drive + cranes · fog · FAQ · gallery ·
   enquiry quiz (page and modal) · cursor. One file for every page: each
   block looks for its own markup and does nothing where it is missing.
   (The page-change transition is CSS only: base.css.)
   ===================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  window.viasReady = true;   /* tells the <head> failsafe that this file arrived */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var desktop = window.matchMedia('(min-width: 62.5rem)');
  var hdr = document.getElementById('header');
  var hdrBar = document.querySelector('.hdr__bar');

  /* the frozen viewport height set in <head>; never innerHeight mid-scroll */
  function vh() { return (window.viasVH && window.viasVH.px) || window.innerHeight; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---- Contact details: one place for the number, so call and WhatsApp links stay in step ---- */
  var CONTACT = {
    phoneHref: '+4916095761094',
    whatsapp: '4916095761094',
    waMessage: 'Hi Vias Media — I got your card and would like a free quote for my website.'
  };
  document.querySelectorAll('[data-contact="call"]').forEach(function (el) {
    el.setAttribute('href', 'tel:' + CONTACT.phoneHref);
  });
  document.querySelectorAll('[data-contact="whatsapp"]').forEach(function (el) {
    el.setAttribute('href', 'https://wa.me/' + CONTACT.whatsapp + '?text=' + encodeURIComponent(CONTACT.waMessage));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  /* ---- Layout measures in px (the tokens are fluid clamp()s) ---- */
  var M = { margin: 16, gutter: 12, hdrH: 60, pitch: 90 };
  function measure() {
    if (!hdrBar) return;
    var cs = getComputedStyle(hdrBar);
    var cols = parseFloat(getComputedStyle(root).getPropertyValue('--cols')) || 4;
    M.margin = parseFloat(cs.paddingLeft) || 16;
    M.gutter = parseFloat(cs.columnGap) || 12;
    M.hdrH = hdr ? hdr.offsetHeight : 60;
    M.pitch = (hdrBar.clientWidth - 2 * M.margin + M.gutter) / cols;
    root.style.setProperty('--pitch', M.pitch + 'px');
  }
  measure();

  /* ---- Smooth scroll: mouse/trackpad only; touch keeps native momentum ---- */
  var lenis = null;
  if (!reduced && finePointer && window.Lenis) {
    lenis = new window.Lenis({
      autoRaf: true,
      lerp: 0.11,
      anchors: true,
      prevent: function (node) {
        return !!(node.closest && node.closest('#cc-modal-overlay, #cc-banner, .menu, .mq'));
      }
    });
  }

  /* ---- Pressed states: iOS Safari only applies :active when something listens for touches ---- */
  document.addEventListener('touchstart', function () {}, { passive: true });

  /* ---- Cookie settings link ---- */
  document.querySelectorAll('[data-cc-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (window.viasCookieConsent) window.viasCookieConsent.openSettings();
    });
  });

  /* ---- Menu sheet: body is pinned while it is open (overflow alone fails in iOS Safari) ---- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  var main = document.getElementById('main');
  var lockY = 0;
  /* pin the body at its scroll offset and put it back exactly, without a smooth scroll */
  function lockScroll() {
    lockY = window.scrollY;
    if (lenis) lenis.stop();
    var st = document.body.style;
    st.position = 'fixed'; st.top = (-lockY) + 'px'; st.left = '0'; st.right = '0';
  }
  function unlockScroll() {
    var st = document.body.style;
    st.position = ''; st.top = ''; st.left = ''; st.right = '';
    window.scrollTo(0, lockY);
    /* the smooth scroller measured the page while it was pinned (one screen high): re-measure, or it clamps to 0 */
    if (lenis) { lenis.resize(); lenis.start(); lenis.scrollTo(lockY, { immediate: true, force: true }); }
  }
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    root.classList.toggle('menu-open', open);
    if (main) main.toggleAttribute('inert', open);
    if (open) lockScroll(); else unlockScroll();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    /* a link to a place on this page closes the sheet first. A link to another page
       leaves it open: the next page comes up over it, and nothing flickers */
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (a.hash && a.pathname === window.location.pathname && a.host === window.location.host) setMenu(false);
        /* leaving: the sheet stays where it is, but the page under it gets its scroll
           position back, so "back" returns to the place the visitor left */
        else if (a.host === window.location.host && menu.classList.contains('is-open')) unlockScroll();
      });
    });
    /* back from the page cache with the sheet still open */
    window.addEventListener('pageshow', function (e) {
      if (e.persisted && menu.classList.contains('is-open')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
    desktop.addEventListener('change', function (e) {
      if (e.matches && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* =====================================================================
     Split text. The plain text in the markup is the default; JS wraps
     lines (reveals), words (ink fill) or letters (roll) and redoes it on
     width / language change.
     ===================================================================== */
  var DASH = /^[–—-]$/;
  function tokenize(el) {
    var out = [], space = false;
    [].forEach.call(el.childNodes, function (n) {
      var cls = n.nodeType === 1 ? (n.getAttribute('class') || '') : '';
      var text = n.textContent || '';
      text.replace(/(\s+)|(\S+)/g, function (m, ws, word) {
        if (ws) { space = true; return m; }
        /* a dash never starts a line: it stays glued to the word before it */
        if (DASH.test(word) && space && out.length && out[out.length - 1].cls === cls) {
          out[out.length - 1].t += ' ' + word;
          out[out.length - 1].dash = true;
          space = false;
          return m;
        }
        /* a hyphenated word may break after its hyphen ("Barrierefreiheits-" / "Audits") */
        var parts = /[A-Za-z\u00C0-\u00FF]-[A-Za-z\u00C0-\u00FF]/.test(word) ? word.match(/[^-]+-|[^-]+$/g) : [word];
        parts.forEach(function (part, k) {
          out.push({ t: part, cls: cls, sp: k === 0 && space && out.length > 0 });
        });
        space = false;
        return m;
      });
    });
    return out;
  }
  function runs(toks) {
    /* consecutive tokens of one class become one span, so a .mark block stays whole */
    var html = '', i = 0;
    while (i < toks.length) {
      var cls = toks[i].cls, part = '';
      var first = i;
      while (i < toks.length && toks[i].cls === cls) {
        part += (i > first && toks[i].sp ? ' ' : '') + esc(toks[i].t);
        i++;
      }
      html += (first > 0 && toks[first].sp ? ' ' : '') + (cls ? '<span class="' + cls + '">' + part + '</span>' : part);
    }
    return html;
  }
  /* where the browser breaks the lines: every word as an inline-block, grouped by its top */
  function measuredLines(el, toks) {
    el.innerHTML = toks.map(function (t) {
      return (t.sp ? ' ' : '') + '<span class="' + (t.cls ? t.cls + ' ' : '') + 'mw" style="display:inline-block;text-indent:0">' + esc(t.t) + '</span>';
    }).join('');
    var lines = [], lastTop = null;
    [].forEach.call(el.querySelectorAll('.mw'), function (s, i) {
      var top = s.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 4) { lines.push([]); lastTop = top; }
      lines[lines.length - 1].push(toks[i]);
    });
    return lines;
  }
  /* data-lines="dash" (laptops): exactly two lines, broken after the dash */
  function dashLines(toks) {
    var cut = -1;
    toks.forEach(function (t, i) { if (t.dash && cut < 0) cut = i; });
    return (cut < 0 || cut === toks.length - 1) ? null : [toks.slice(0, cut + 1), toks.slice(cut + 1)];
  }
  /* data-lines="mark": two parts, broken before the highlighted phrase */
  function markLines(toks) {
    var cut = -1;
    toks.forEach(function (t, i) { if (cut < 0 && /\bmark\b/.test(t.cls)) cut = i; });
    return cut > 0 ? [toks.slice(0, cut), toks.slice(cut)] : null;
  }
  /* The title as plain text in one block: the browser wraps it, live, and it is
     revealed as a whole. Nothing is measured, so nothing can go stale. */
  function plainTitle(el) {
    el.removeAttribute('aria-label');
    /* a dash stays with the word before it and never starts a line */
    el.innerHTML = '<span class="pl">' + el._src.replace(/ (?=[–—](?:\s|$))/g, '&nbsp;') + '</span>';
    el.classList.remove('is-loose');
    el.classList.add('is-ready');
  }
  function splitLines(el) {
    if (el._src == null) el._src = el.innerHTML;
    el.innerHTML = el._src;
    el.style.fontSize = '';
    var toks = tokenize(el);
    if (!toks.length) return;
    var mode = el.getAttribute('data-lines');
    var forced = mode === 'mark' ? markLines(toks) : (mode === 'dash' && desktop.matches) ? dashLines(toks) : null;
    /* Touch devices never get measured lines. On the owner's iPhone they broke in
       the wrong places more than once, for reasons no test engine reproduced; a
       line that is not frozen cannot be wrong. Lines the copy itself forces (the
       two-line hero on laptops, the footer question) are not measured either. */
    if (!forced && !finePointer) { plainTitle(el); return; }
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var lines = forced || measuredLines(el, toks);
    /* --i staggers the reveal; --dir (-1 / 1) lets lines travel in opposite directions */
    el.innerHTML = lines.map(function (ln, i) {
      ln[0] = { t: ln[0].t, cls: ln[0].cls, sp: false };
      return '<span class="ln" aria-hidden="true" style="--i:' + i + ';--dir:' + (i % 2 ? 1 : -1) + '"><span>' + runs(ln) + '</span></span>';
    }).join('');
    if (forced && el.hasAttribute('data-fit')) fitLines(el);
    var wide = false;
    [].forEach.call(el.querySelectorAll('.ln'), function (ln) { if (ln.scrollWidth > ln.clientWidth + 1) wide = true; });
    /* a measured line that does not fit its box was measured wrongly: give the title back to the browser */
    if (wide && !forced) { plainTitle(el); return; }
    el.classList.toggle('is-loose', wide);
    el._w = el.clientWidth;
    el.classList.add('is-ready');
  }
  /* scale the type so the longest line spans the full width (the top bar of the F) */
  function fitLines(el) {
    var widest = 0;
    [].forEach.call(el.querySelectorAll('.ln > span'), function (s) { widest = Math.max(widest, s.getBoundingClientRect().width); });
    if (!widest) return;
    var cur = parseFloat(getComputedStyle(el).fontSize);
    var size = cur * (el.clientWidth / widest) * 0.997;
    size = Math.min(size, vh() * 0.26);                   /* never taller than about half a screen for two lines */
    el.style.fontSize = size.toFixed(2) + 'px';
  }
  function splitWords(el) {
    if (el._src == null) el._src = el.innerHTML;
    el.innerHTML = el._src;
    var toks = tokenize(el);
    el.innerHTML = toks.map(function (t) {
      return (t.sp ? ' ' : '') + '<span class="w">' + esc(t.t) + '</span>';
    }).join('');
    el._words = el.querySelectorAll('.w');
    el._on = -1;
  }
  /* word roll (header links): the word is one cube that turns as a whole; the link
     keeps its name for assistive tech */
  function splitRoll(el) {
    var text = (el._txt != null ? el._txt : el.textContent).replace(/\s+/g, ' ').trim();
    el._txt = text;
    var link = el.closest('a, button');
    if (link) link.setAttribute('aria-label', text);
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="ch" data-c="' + esc(text) + '">' + esc(text) + '</span>';
    el.classList.add('is-split');
  }
  /* a word whose letters rise one by one (the service pages' masthead) */
  var letterEls = [].slice.call(document.querySelectorAll('[data-letters]'));
  function splitLetters(el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.innerHTML = text.split('').map(function (c, i) {
      return '<span class="lt" style="--c:' + i + '">' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>';
    }).join('');
    el.classList.add('is-split');
  }
  /* a word set as large as its box is wide (the service pages' masthead) */
  var fitEls = [].slice.call(document.querySelectorAll('[data-fitw]'));
  function fitWords() {
    fitEls.forEach(function (el) {
      el.style.fontSize = '';
      var w = el.getBoundingClientRect().width, room = el.parentElement.clientWidth - 2 * M.margin;
      if (w > 0 && room > 0) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * room / w * 0.995).toFixed(2) + 'px';
    });
  }
  var lineEls = [].slice.call(document.querySelectorAll('[data-split]'));
  var fillEls = reduced ? [] : [].slice.call(document.querySelectorAll('[data-fill]'));
  var rollEls = (reduced || !finePointer) ? [] : [].slice.call(document.querySelectorAll('[data-roll]'));
  function splitAll(fresh) {
    lineEls.forEach(function (el) {
      /* fresh: the language script has rewritten the text. Where it has not (the
         element still holds our own wrappers), the stored source stays; a plain
         block may have been translated inside, so its content is the new source */
      if (fresh) {
        var pl = el.querySelector('.pl');
        if (pl) el._src = pl.innerHTML; else if (!el.querySelector('.ln')) el._src = null;
      }
      splitLines(el);
    });
    fillEls.forEach(function (el) { if (fresh) el._src = null; splitWords(el); });
    if (fresh) rollEls.forEach(function (el) { el._txt = null; });
    rollEls.forEach(splitRoll);
    letterEls.forEach(splitLetters);
    fitWords();
  }

  /* measured lines belong to one width: when a title's box changes without the
     window changing (a late scrollbar, a container that settles), measure again */
  if (finePointer && lineEls.length && 'ResizeObserver' in window) {
    var lineT = 0;
    var lineRO = new ResizeObserver(function () {
      if (!booted) return;
      if (!lineEls.some(function (el) { return el._w != null && Math.abs(el.clientWidth - el._w) > 1; })) return;
      window.clearTimeout(lineT);
      lineT = window.setTimeout(function () { splitAll(false); requestTick(); }, 80);
    });
    lineEls.forEach(function (el) { lineRO.observe(el); });
  }

  /* ---- Reveals: hidden only while JS is alive; <head> carries a no-JS-file failsafe ---- */
  var rvEls = [].slice.call(document.querySelectorAll('.rv, .rv-lines, [data-crate], [data-letters], .sx-ref__card'));
  var io = null;
  /* phones and touch screens: the hero's action is plain text in the body face, so it
     does not wait for the title face, the observer or the stagger (it came last,
     about two seconds in). Laptops keep the order: lines, note, action */
  var heroAct = document.querySelector('.hero__actions');
  if (heroAct && !reduced && window.matchMedia('(max-width: 62.4375rem), (hover: none)').matches) {
    rvEls.splice(rvEls.indexOf(heroAct), 1);
    heroAct.classList.add('is-quick');
    window.requestAnimationFrame(function () { heroAct.classList.add('is-in'); });
  }
  function startReveals() {
    if (reduced || !('IntersectionObserver' in window)) {
      rvEls.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    rvEls.forEach(function (el) { io.observe(el); });
    /* hidden tabs and headless renderers never fire the observer: show what is on screen */
    window.setTimeout(function () {
      rvEls.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      });
    }, 2500);
  }

  /* =====================================================================
     "How I work" — pinned horizontal scene, then the masked word.
       hold → panels pan left → a sheet slides in from the right; the next
       section's name is cut out of it and a photograph shows through →
       the word zooms into its letter I until the photograph is the screen.
     The mask is an SVG clipPath with live text, so it stays sharp at any
     zoom; only the clip's transform changes per frame.
     ===================================================================== */
  var hs = document.querySelector('[data-hs]');
  var hsc = null;
  var HS_HOLD = 0.12, HS_DWELL = 0.12, HS_ZOOM = 1.15;   /* in screens of scroll; layoutHs shortens the zoom on phones */
  /* The next section's name as outlines of the title face (Bebas Neue), from
     tools/word-path.py. Live <text> in a clip path stops rendering in Chrome
     once it is magnified about ten times; outlines scale without limit.
     d: path, w: width, h: cap height, f: left and right edge of the letter I. */
  var MASK_WORDS = {
    de: { d: 'M41 0H151V600H332V700H41ZM385 0H685V100H495V285H646V385H495V600H685V700H385ZM748 0H858V700H748ZM921 534V494H1025V542Q1025 610 1082 610Q1110 610 1124 594Q1139 577 1139 540Q1139 496 1119 462Q1099 429 1045 382Q977 322 950 274Q923 225 923 164Q923 81 965 36Q1007 -10 1087 -10Q1166 -10 1206 36Q1247 81 1247 166V195H1143V159Q1143 123 1129 106Q1115 90 1088 90Q1033 90 1033 157Q1033 195 1054 228Q1074 261 1128 308Q1197 368 1223 417Q1249 466 1249 532Q1249 618 1206 664Q1164 710 1083 710Q1003 710 962 664Q921 619 921 534ZM1398 100H1283V0H1623V100H1508V700H1398ZM1672 534V0H1782V542Q1782 578 1796 594Q1811 610 1838 610Q1865 610 1880 594Q1894 578 1894 542V0H2000V534Q2000 619 1958 664Q1916 710 1836 710Q1756 710 1714 664Q1672 619 1672 534ZM2078 0H2216L2323 419H2325V0H2423V700H2310L2178 189H2176V700H2078ZM2497 534V166Q2497 81 2539 36Q2581 -10 2661 -10Q2741 -10 2783 36Q2825 81 2825 166V226H2721V159Q2721 90 2664 90Q2607 90 2607 159V542Q2607 610 2664 610Q2721 610 2721 542V405H2666V305H2825V534Q2825 619 2783 664Q2741 710 2661 710Q2581 710 2539 664Q2497 619 2497 534ZM2896 0H3196V100H3006V285H3157V385H3006V600H3196V700H2896ZM3259 0H3397L3504 419H3506V0H3604V700H3491L3359 189H3357V700H3259Z', w: 3645, h: 700, f: [748, 858] },
    en: { d: 'M22 534V494H126V542Q126 610 183 610Q211 610 226 594Q240 577 240 540Q240 496 220 462Q200 429 146 382Q78 322 51 274Q24 225 24 164Q24 81 66 36Q108 -10 188 -10Q267 -10 308 36Q348 81 348 166V195H244V159Q244 123 230 106Q216 90 189 90Q134 90 134 157Q134 195 154 228Q175 261 229 308Q298 368 324 417Q350 466 350 532Q350 618 308 664Q265 710 184 710Q104 710 63 664Q22 619 22 534ZM413 0H713V100H523V285H674V385H523V600H713V700H413ZM776 0H939Q1024 0 1063 40Q1102 79 1102 161V204Q1102 313 1030 342V344Q1070 356 1086 393Q1103 430 1103 492V615Q1103 645 1105 664Q1107 682 1115 700H1003Q997 683 995 668Q993 653 993 614V486Q993 438 978 419Q962 400 924 400H886V700H776ZM926 300Q959 300 976 283Q992 266 992 226V172Q992 134 978 117Q965 100 936 100H886V300ZM1150 0H1261L1333 543H1335L1407 0H1508L1402 700H1256ZM1561 0H1671V700H1561ZM1746 538V162Q1746 80 1788 35Q1829 -10 1908 -10Q1987 -10 2028 35Q2070 80 2070 162V236H1966V155Q1966 90 1911 90Q1856 90 1856 155V546Q1856 610 1911 610Q1966 610 1966 546V439H2070V538Q2070 620 2028 665Q1987 710 1908 710Q1829 710 1788 665Q1746 620 1746 538ZM2136 0H2436V100H2246V285H2397V385H2246V600H2436V700H2136ZM2480 534V494H2584V542Q2584 610 2641 610Q2669 610 2684 594Q2698 577 2698 540Q2698 496 2678 462Q2658 429 2604 382Q2536 322 2509 274Q2482 225 2482 164Q2482 81 2524 36Q2566 -10 2646 -10Q2725 -10 2766 36Q2806 81 2806 166V195H2702V159Q2702 123 2688 106Q2674 90 2647 90Q2592 90 2592 157Q2592 195 2612 228Q2633 261 2687 308Q2756 368 2782 417Q2808 466 2808 532Q2808 618 2766 664Q2723 710 2642 710Q2562 710 2521 664Q2480 619 2480 534Z', w: 2830, h: 700, f: [1561, 1671] }
  };
  if (hs && !reduced) {
    hsc = {
      stage: hs.querySelector('.hs__stage'),
      inner: hs.querySelector('.hs__inner'),
      vp: hs.querySelector('.hs__viewport'),
      track: hs.querySelector('.hs__track'),
      cell: hs.querySelector('.hs__wordcell'),
      svg: hs.querySelector('.hs__svg'),
      word: hs.querySelector('#hs-word'),
      img: hs.querySelector('#hs-img'),
      fade: hs.querySelector('.hs__mask-fade'),
      pan: 0, speed: 1.5, zoom: HS_ZOOM, x: -1, z: -1, geo: null
    };
    hs.classList.add('is-scene');
  }
  /* The word is the last thing in the row of panels: an empty cell one screen wide
     keeps its place in the track, and the word itself is drawn over that cell in an
     SVG that covers the stage. It pans in with the cards; when the row has been
     scrolled to its end, the word grows from that place into its letter I. */
  function layoutMask() {
    var W = hsc.stage.clientWidth, H = vh(), stageH = hsc.stage.clientHeight;
    var m = MASK_WORDS[root.lang === 'en' ? 'en' : 'de'];
    var st = hsc.stage.getBoundingClientRect(), band = hsc.vp.getBoundingClientRect();
    var bandH = band.height, bandCy = band.top - st.top + bandH / 2;
    hsc.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + stageH);
    hsc.word.setAttribute('d', m.d);
    var fit = (W - 2 * M.margin) / m.w;                   /* px per font unit with the whole word across the row */
    var mid = (m.f[0] + m.f[1]) / 2;                      /* the middle of the letter I, in font units */
    var s = Math.min(fit, 0.7 * bandH / m.h), x0 = (W - m.w * s) / 2;
    if (fit * m.h < 0.3 * bandH) {
      /* phones: the whole word would be a thin strip in a tall row. It is set as
         tall as the row allows instead and runs off the right edge; the row ends
         with the letter I in the middle of the screen, and the zoom starts there */
      s = Math.max(fit, Math.min(0.5 * bandH / m.h, (W / 2 - M.margin) / mid));
      if (s > fit) x0 = W / 2 - mid * s;
    }
    var stem = (m.f[1] - m.f[0]) * s;
    hsc.geo = {
      s: s, H: H,
      x0: x0, y0: bandCy - m.h * s / 2,                    /* the word's top left corner at rest */
      cx: W / 2, cy: bandCy,                               /* where the zoom starts from: the middle of the row */
      fx: x0 + mid * s,                                    /* the middle of the I: where the zoom ends up */
      kmax: 1.15 * Math.max(W / stem, 2 * (stageH - H / 2) / (m.h * s))
    };
    if (!hsc.img.getAttribute('href')) {
      hsc.img.setAttribute('href', 'assets/img/v2/clouds-810.webp');
    }
  }
  function layoutHs() {
    if (!hsc) return;
    var V = vh();
    hsc.speed = window.innerWidth < 768 ? 1.8 : 1.5;      /* px of pan per px of scroll */
    hsc.zoom = window.innerWidth < 768 ? 0.8 : HS_ZOOM;   /* phones: a shorter way into the photograph */
    hsc.track.style.transform = 'none';
    hsc.cell.style.width = hsc.vp.clientWidth + 'px';
    hsc.pan = Math.max(0, hsc.track.scrollWidth - hsc.vp.clientWidth);
    layoutMask();
    hsc.x = -1; hsc.z = -1;
    hs.style.height = Math.round(hsc.stage.offsetHeight + (HS_HOLD + HS_DWELL + hsc.zoom) * V + hsc.pan / hsc.speed) + 'px';
  }
  /* z: 0 → 1 zoom; ox: how far (px) the word still has to pan in from the right */
  function setZoom(z, ox) {
    var g = hsc.geo;
    if (!g) return;
    var k = Math.pow(g.kmax, z);                          /* exponential: the zoom feels even */
    var e = smooth(clamp(z / 0.3, 0, 1));
    /* early in the zoom the fixed point moves from the word's centre to the middle of
       the I, and from the row's height to the middle of the screen */
    var ax = g.cx + (g.fx - g.cx) * e;
    var sy = g.cy + (g.H / 2 - g.cy) * e;
    hsc.word.setAttribute('transform', 'translate(' + (g.cx + k * (g.x0 - ax) + ox).toFixed(2) + ' ' + (sy + k * (g.y0 - g.cy)).toFixed(2) + ') scale(' + (k * g.s).toFixed(5) + ')');
    /* at the very end the clip is dropped: the photograph is simply the screen */
    if (z >= 0.985) hsc.img.removeAttribute('clip-path'); else hsc.img.setAttribute('clip-path', 'url(#hs-clip)');
    hsc.fade.style.opacity = clamp((z - 0.6) / 0.4, 0, 1).toFixed(3);
    hsc.inner.style.opacity = (1 - clamp(z / 0.22, 0, 1)).toFixed(3);   /* the head and the row step back */
  }
  function updateHs(V) {
    var r = hs.getBoundingClientRect();
    var stageH = hsc.stage.offsetHeight;
    var s = clamp(-r.top, 0, Math.max(0, r.height - stageH));
    var panLen = hsc.pan / hsc.speed;
    var x = clamp((s - HS_HOLD * V) * hsc.speed, 0, hsc.pan);
    var z = clamp((s - HS_HOLD * V - panLen - HS_DWELL * V) / (hsc.zoom * V), 0, 1);
    if (x === hsc.x && z === hsc.z) return;
    if (x !== hsc.x) hsc.track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
    hsc.x = x; hsc.z = z;
    setZoom(z, hsc.pan - x);
  }

  /* =====================================================================
     Services: a drawing for the hovered row slides in on the left.
     Only transform and opacity change, so the hover stays on the compositor.
     ===================================================================== */
  var svc = document.querySelector('[data-svc]');
  if (svc && finePointer) {
    var svcPre = svc.querySelector('.svc-pre');
    var svcFigs = svcPre ? [].slice.call(svcPre.querySelectorAll('.svc-pre__fig')) : [];
    var svcRows = [].slice.call(svc.querySelectorAll('a.row'));
    var showSvc = function (i, row) {
      if (!svcPre || !desktop.matches) return;
      var y = Math.round(row.offsetTop + row.offsetHeight / 2 - svcPre.offsetHeight / 2) + 'px';
      if (!svcPre.classList.contains('is-on')) {
        /* first appearance: start at this row, do not travel in from another one */
        svcPre.style.transition = 'none';
        svcPre.style.setProperty('--py', y);
        void svcPre.offsetWidth;
        svcPre.style.transition = '';
      } else {
        svcPre.style.setProperty('--py', y);
      }
      svcFigs.forEach(function (f, k) { f.classList.toggle('is-on', k === i); });
      svcPre.classList.add('is-on');
    };
    var hideSvc = function () { if (svcPre) svcPre.classList.remove('is-on'); };
    svcRows.forEach(function (row, i) {
      row.addEventListener('pointerenter', function () { showSvc(i, row); });
      row.addEventListener('focus', function () { showSvc(i, row); });
      row.addEventListener('blur', hideSvc);
    });
    svc.addEventListener('pointerleave', hideSvc);
  }

  /* everything that pins at the top: the heroes and the last section before the footer */
  var pinEls = reduced ? [] : [].slice.call(document.querySelectorAll('.hero, .phero:not(.phero--short), .tail > .s'));
  /* a pinned block taller than the screen pins with its bottom edge on the
     screen's, so its last line (the button) is seen before the next sheet covers it */
  function layoutPins() {
    var V = vh();
    pinEls.forEach(function (el) { el.style.top = Math.min(0, V - el.offsetHeight) + 'px'; });
  }
  /* a pinned block that changes height later (an image arrives, the FAQ reserves its
     tallest answer) gets its top again, or the next sheet would cover it too early */
  if (pinEls.length && 'ResizeObserver' in window) {
    var pinRO = new ResizeObserver(function () { layoutPins(); });
    pinEls.forEach(function (el) { pinRO.observe(el); });
  }

  /* ---- Projects: sleeves on a wall. The pulled one faces you and its story
     stands beside the wall. Laptops with a mouse pull by the pointer: hit-testing
     the turned sleeves answered late (each shows only a narrow strip, and a pulled
     one covers its neighbours), so the choice is made from the pointer's x alone:
     every sleeve owns the strip from its visible left edge to the next one's, in
     the current state. A tap on a sleeve that is not pulled pulls it (a tap on the
     pulled one opens its case study); on touch screens a sideways swipe pulls the
     next or previous one. The last one pulled stays out, so the story is never
     empty. Keyboard focus pulls too. ---- */
  var crate = document.querySelector('[data-crate]');
  var sizeCrate = function () {};
  if (crate) {
    var recs = [].slice.call(crate.querySelectorAll('.rec'));
    var infos = recs.map(function (r) { return r.querySelector('.rec__info'); });
    var wall = window.matchMedia('(min-width: 62.5rem)');
    var onAt = 0;
    var pull = function (i) {
      i = Math.max(0, Math.min(recs.length - 1, i));
      if (i === onAt && recs[i].classList.contains('is-on')) return;
      onAt = i;
      recs.forEach(function (x, k) { x.classList.toggle('is-on', k === i); });
    };
    /* the stories stand one at a time beside the wall (under it on phones and
       tablets, left of it on laptops), so the wall reserves the tallest of them */
    sizeCrate = function () {
      var h = 0;
      infos.forEach(function (el) { if (el) h = Math.max(h, el.offsetHeight); });
      if (h) crate.style.setProperty('--info-h', h + 'px');
    };
    recs.forEach(function (r, k) {
      r.querySelector('.rec__sleeve').style.setProperty('--k', k);
      r.addEventListener('focusin', function () { pull(k); });
    });
    crate.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !wall.matches) return;
      var S = recs[0].offsetWidth, shift = S * 0.58, x = e.clientX;
      var lefts = recs.map(function (r, k) { return r.getBoundingClientRect().left + (k > onAt ? shift : 0); });
      var first = lefts[0], end = lefts[lefts.length - 1] + S;
      if (x < first || x > end) return;                          /* the story panel and the space after the wall */
      var y = e.clientY, top = recs[0].getBoundingClientRect().top - S * 0.1;
      if (y < top || y > top + S * 1.25) return;
      var i = 0;
      while (i < lefts.length - 1 && x >= lefts[i + 1]) i++;
      pull(i);
    }, { passive: true });
    /* which one was out when the finger or button went down: a tap focuses the
       sleeve, and the focus pulls it before the click arrives */
    var swX = 0, swY = 0, swOn = false, swiped = 0, downAt = -1;
    crate.addEventListener('pointerdown', function (e) {
      downAt = onAt;
      if (e.pointerType === 'mouse') return;
      swX = e.clientX; swY = e.clientY; swOn = true;
    }, { passive: true });
    crate.addEventListener('pointerup', function (e) {
      if (!swOn) return;
      swOn = false;
      var dx = e.clientX - swX, dy = e.clientY - swY;
      if (Math.abs(dx) < 32 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      swiped = Date.now();
      pull(onAt + (dx < 0 ? 1 : -1));
    }, { passive: true });
    crate.addEventListener('pointercancel', function () { swOn = false; });
    crate.addEventListener('click', function (e) {
      var sl = e.target.closest('.rec__sleeve');
      if (!sl) return;
      var k = recs.indexOf(sl.parentNode), was = downAt < 0 ? onAt : downAt;
      downAt = -1;
      if (Date.now() - swiped < 400 || k !== was) { e.preventDefault(); pull(k); }
    });
    /* after the entrance the sleeves answer without the stagger */
    crate.addEventListener('transitionend', function () {
      if (crate.classList.contains('is-in')) crate.classList.add('is-settled');
    });
  }

  /* ---- The hero's action, docked in the bottom right corner as a calendar: it
     shows once the hero has been scrolled through (the next sheet has covered it
     whole, or it has scrolled away where it is not pinned), and leaves when the
     footer comes up with its own call to action. ---- */
  var dock = document.querySelector('[data-dock]');
  var dockNext = dock ? document.querySelector('.hero') : null;
  if (dockNext) dockNext = dockNext.nextElementSibling;
  while (dockNext && !dockNext.matches('section, .tail')) dockNext = dockNext.nextElementSibling;
  var dockFtr = document.querySelector('.ftr');
  function updateDock(V) {
    if (!dock || !dockNext) return;
    var on = dockNext.getBoundingClientRect().top <= 1 &&
      !(dockFtr && dockFtr.getBoundingClientRect().top < V);
    if (on === dock.classList.contains('is-on')) return;
    dock.classList.toggle('is-on', on);
    dock.toggleAttribute('inert', !on);
  }

  /* =====================================================================
     Cranes. Every flight is new (owner: "too slow and too repetitive …
     as if they weren't alive"): one to three birds at different depths
     (nearer = bigger, brighter, faster), crossing in 9–14 s at their own
     height inside the flock's band. Each bird beats its wings in bursts,
     flutters now and then and glides in between; every beat has its own
     depth and pace, the downstroke is quicker than the upstroke, the tips
     sweep forward on the way down and trail on the way up, and the far
     wing runs a little out of step. It climbs while it beats, sinks while
     it glides, sways in a slow wave and pitches with its climb. Only the
     transforms of four elements per bird change. The loop runs only while
     the flock can be seen (not under a covered hero, not in a closed
     dialog, not in a hidden tab). Reduced motion: the birds rest in the
     print's pose (CSS).
     ===================================================================== */
  function rand(a, b) { return a + Math.random() * (b - a); }
  function initFlock(el) {
    var birds = [].slice.call(el.querySelectorAll('.crane')).map(function (c) {
      return { el: c, wn: c.querySelector('.cr__wn'), wf: c.querySelector('.cr__wf'), bob: c.querySelector('.cr__bob'), on: false };
    });
    if (!birds.length) return;
    el.classList.add('is-js');
    var W = 0, H = 0, base = 0, bandA = 0.45, bandB = 0.75, raf = 0, last = 0, wait = 0.6;
    var measure = function () {
      W = el.clientWidth; H = el.clientHeight;
      var cs = getComputedStyle(el);
      bandA = parseFloat(cs.getPropertyValue('--band-a')) || 0.45;
      bandB = parseFloat(cs.getPropertyValue('--band-b')) || 0.75;
      base = birds[0].el.offsetWidth || 200;               /* the nearest bird's width */
    };
    var launch = function () {
      measure();
      var n = Math.random() < 0.18 ? 1 : (Math.random() < 0.45 ? 2 : 3);
      var lead = rand(0.82, 1);
      var T = rand(9, 14);                                 /* seconds for the leader to cross */
      var y0 = H * rand(bandA, bandB);
      birds.forEach(function (b, i) {
        b.on = i < n;
        b.el.style.visibility = b.on ? 'visible' : 'hidden';
        if (!b.on) return;
        var z = i === 0 ? lead : clamp(lead - rand(0.12, 0.38), 0.45, 0.95);
        b.z = z;
        b.w = base * z;
        b.v = (W + base * 2.2) / T * (0.72 + 0.28 * z) * rand(0.95, 1.05);
        b.x = -b.w * 1.15 - (i ? rand(0.25, 0.9) * base : 0);      /* the others start behind */
        b.yb = clamp(y0 + (i ? rand(-0.11, 0.11) * H : 0), H * (bandA - 0.06), H * (bandB + 0.04));
        b.vy = 0; b.y = b.yb;
        b.ph = rand(0, 6.283); b.f = rand(1.25, 1.7); b.pace = 1;
        b.amp = 1; b.mode = 'beat'; b.until = rand(1.2, 3.5);
        b.d = 1; b.dT = 1; b.cyc = -1; b.pw = 1; b.fo = rand(0, 0.45);
        b.gp = 0.2; b.gf = -0.16;
        b.wave = rand(5, 13) * z; b.wf2 = rand(0.18, 0.32); b.wp = rand(0, 6.283);
        b.o = 0.22 + 0.32 * z;
        b.el.style.width = b.w + 'px';
        b.el.style.opacity = b.o.toFixed(2);
      });
    };
    /* the wing's height through one beat: 1 = up, -1 = down. The downstroke takes
       42 % of the beat, the upstroke the rest (a bird pushes down fast, recovers slowly) */
    var stroke = function (ph) {
      var u = (ph / 6.283) % 1;
      if (u < 0) u += 1;
      return u < 0.42 ? Math.cos(Math.PI * u / 0.42) : Math.cos(Math.PI + Math.PI * (u - 0.42) / 0.58);
    };
    var setMode = function (b) {
      var r = Math.random();
      b.mode = b.mode !== 'glide' && r < 0.4 ? 'glide' : (r > 0.9 ? 'flutter' : 'beat');
      if (b.mode === 'glide') { b.until = rand(0.7, 2.2); b.gp = rand(0.02, 0.4); b.gf = rand(-0.28, -0.08); }
      else if (b.mode === 'flutter') { b.until = rand(0.5, 1.1); b.f = rand(2.3, 2.9); }
      else { b.until = rand(1.4, 4); b.f = rand(1.2, 1.75); }
    };
    var step = function (b, dt, t) {
      /* beats, quick shallow flutters and glides follow each other at random */
      b.until -= dt;
      if (b.until <= 0) setMode(b);
      var flap = b.mode !== 'glide';
      b.amp += ((flap ? 1 : 0) - b.amp) * Math.min(1, dt * 3.2);
      /* every beat gets its own depth and pace; now and then a deep one */
      var cyc = Math.floor(b.ph / 6.283);
      if (cyc !== b.cyc) {
        b.cyc = cyc;
        b.dT = b.mode === 'flutter' ? rand(0.45, 0.65) : (Math.random() < 0.12 ? rand(1.12, 1.25) : rand(0.72, 1.06));
        b.pace = rand(0.9, 1.12);
      }
      b.d += (b.dT - b.d) * Math.min(1, dt * 7);
      b.ph += 6.283 * b.f * b.pace * dt * (0.35 + 0.65 * Math.max(b.amp, 0.2));
      var pw = stroke(b.ph), pf = stroke(b.ph - b.fo);
      var vel = dt ? (pw - b.pw) / dt : 0;
      b.pw = pw;
      /* climb while beating, sink while gliding, a slow wave on top; held inside the band */
      var lift = b.amp * 14 * b.d - (1 - b.amp) * 12;
      b.vy += ((-lift) - b.vy) * Math.min(1, dt * 1.5);
      b.yb += b.vy * dt * b.z;
      var lo = H * (bandA - 0.08), hi = H * (bandB + 0.06);
      if (b.yb < lo) b.yb += (lo - b.yb) * dt * 2;
      if (b.yb > hi) b.yb += (hi - b.yb) * dt * 2;
      var wave = Math.sin(t * b.wf2 * 6.283 + b.wp) * b.wave;
      var dyw = Math.cos(t * b.wf2 * 6.283 + b.wp) * b.wave * b.wf2 * 6.283;
      b.x += b.v * dt;
      var pitch = clamp(Math.atan2(b.vy * b.z + dyw, b.v) * 57.3, -9, 9) + b.amp * pw * 1.2 * b.d;
      b.el.style.transform = 'translate3d(' + b.x.toFixed(1) + 'px,' + (b.yb + wave).toFixed(1) + 'px,0) rotate(' + pitch.toFixed(2) + 'deg)';
      /* gliding holds the wings out at this glide's height, with a slight tremble */
      var tremble = (1 - b.amp) * Math.sin(t * 9 + b.wp) * 0.035;
      var near = b.amp * (0.1 + 0.9 * pw * b.d) + (1 - b.amp) * (b.gp + tremble);
      var far = b.amp * (0.075 - 0.625 * pf * b.d) + (1 - b.amp) * (b.gf - tremble);
      /* the tips sweep forward on the way down and trail on the way up */
      var sweep = clamp(vel * 0.8 * b.amp, -12, 12);
      b.wn.style.transform = 'skewX(' + sweep.toFixed(2) + 'deg) scaleY(' + clamp(near, -1, 1.2).toFixed(3) + ')';
      b.wf.style.transform = 'translate(22px,-4px) skewX(' + (sweep * 0.7).toFixed(2) + 'deg) scale(0.8,' + clamp(far, -0.8, 0.85).toFixed(3) + ')';
      b.bob.style.transform = 'translateY(' + (b.amp * 3 * pw * b.d).toFixed(2) + 'px)';
      return b.x < W + b.w * 0.2;
    };
    var visible = function () {
      if (document.hidden) return false;
      var host = el.closest('.sent');
      if (host) return host.classList.contains('is-open');
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh()) return false;
      /* a pinned hero under the next sheet: covered once the page has moved a screen */
      return !(el.closest('.hero') && window.scrollY > vh() * 1.05);
    };
    var frame = function (now) {
      raf = 0;
      if (!visible()) { last = 0; return; }
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (wait > 0) {
        wait -= dt;
        if (wait <= 0) launch();
      } else {
        var t = now / 1000, flying = false;
        birds.forEach(function (b) { if (b.on && step(b, dt, t)) flying = true; });
        if (!flying) { birds.forEach(function (b) { b.on = false; b.el.style.visibility = 'hidden'; }); wait = rand(1.2, 5); }
      }
      raf = window.requestAnimationFrame(frame);
    };
    el._wake = function () { if (!raf) raf = window.requestAnimationFrame(frame); };
    birds.forEach(function (b) { b.el.style.visibility = 'hidden'; });
    el._wake();
  }
  var flocks = reduced ? [] : [].slice.call(document.querySelectorAll('.flock'));
  flocks.forEach(initFlock);
  function wakeFlocks() { flocks.forEach(function (f) { if (f._wake) f._wake(); }); }
  document.addEventListener('visibilitychange', wakeFlocks);

  /* ---- Statement: words turn from pencil to ink as the block crosses the screen ---- */
  function updateFill(V) {
    fillEls.forEach(function (el) {
      if (!el._words) return;
      var r = el.getBoundingClientRect();
      if (r.bottom < -V || r.top > 2 * V) return;
      var p = clamp((V * 0.86 - r.top) / (V * 0.5 + r.height), 0, 1);
      var on = Math.round(p * el._words.length);
      if (on === el._on) return;
      el._on = on;
      for (var i = 0; i < el._words.length; i++) el._words[i].classList.toggle('is-on', i < on);
    });
  }

  /* ---- Hero title: the lines drive apart while the next sheet slides over the pinned hero ---- */
  var driveEl = reduced ? null : document.querySelector('[data-drive]');
  var driveVal = -1;
  function updateDrive(V) {
    if (!driveEl) return;
    var v = Math.round(clamp(window.scrollY / V, 0, 1) * 0.11 * window.innerWidth);
    if (v === driveVal) return;
    driveVal = v;
    driveEl.style.setProperty('--drive', v);
  }

  /* ---- Service pages' time line: the fill follows the list up the screen; a stage
     lights up once the fill has reached its node ---- */
  var flowEls = reduced ? [] : [].slice.call(document.querySelectorAll('[data-flow]'));
  flowEls.forEach(function (el) { el.classList.add('is-live'); el._steps = [].slice.call(el.children); el._f = -1; });
  function updateFlow(V) {
    flowEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > V * 1.2 || r.bottom < -V * 0.2) return;
      var across = desktop.matches;
      /* starts when the list's top passes 80% of the screen, complete when its end passes 45% */
      var len = across ? r.height * 0.6 : r.height;
      var f = clamp((V * 0.8 - r.top) / (len + V * 0.35), 0, 1);
      f = Math.round(f * 1000) / 1000;
      if (f === el._f) return;
      el._f = f;
      el.style.setProperty('--flow', f);
      el._steps.forEach(function (st) {
        var at = across ? (st.offsetLeft / r.width) : (st.offsetTop / r.height);
        st.classList.toggle('is-done', f > 0 && f >= at - 0.001);
      });
    });
  }

  /* ---- Promote the scene's layers only while it is within a screen of the viewport ---- */
  function nearScene(V) {
    if (!hs) return;
    var r = hs.getBoundingClientRect();
    var near = r.top < 2 * V && r.bottom > -V;
    if (near !== hs._near) { hs._near = near; hs.classList.toggle('is-near', near); }
  }

  /* ---- One scroll tick for header, scene, fog and the text effects ---- */
  var refreshCursor = null;   /* set by the cursor block on fine pointers */
  var fog = document.querySelector('.fog');
  var noFog = [].slice.call(document.querySelectorAll('[data-nofog]'));
  var noFogCover = [].slice.call(document.querySelectorAll('[data-nofog-cover]'));   /* off while it fills the bottom edge */
  var ticking = false;
  /* the blur band is off wherever something is anchored to the bottom edge */
  function updateFog(V) {
    if (!fog) return;
    var off = noFog.some(function (el) { return el.getBoundingClientRect().top < V - 8; }) ||
      noFogCover.some(function (el) { var r = el.getBoundingClientRect(); return r.top < V && r.bottom > V - 12; });
    fog.classList.toggle('is-off', off);
  }
  function tick() {
    ticking = false;
    if (root.classList.contains('menu-open') || root.classList.contains('mq-open')) return;   /* a pinned body reports scrollY 0 */
    var V = vh();
    if (hsc) updateHs(V);
    nearScene(V);
    if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 8);
    updateFog(V);
    updateFill(V);
    updateDrive(V);
    updateFlow(V);
    updateDock(V);
    wakeFlocks();
    if (refreshCursor) refreshCursor();
  }
  function requestTick() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(tick);
  }
  window.addEventListener('scroll', requestTick, { passive: true });
  if (lenis) lenis.on('scroll', requestTick);

  /* ---- Keyboard focus stays visible (WCAG 2.4.11). Pinned sheets defeat the
     browser's own scroll-into-view: a focused control can sit under the next
     sheet, or below the screen inside a block that is still pinned. ---- */
  var byKey = false;
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab') byKey = true; });
  document.addEventListener('pointerdown', function () { byKey = false; });
  function nudge(dy) {
    var y = window.scrollY + dy;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
  }
  function revealFocus(el, tries) {
    if (!el || !el.isConnected || el.closest('.hdr, .menu, #cc-banner, #cc-modal-overlay')) return;
    var V = window.innerHeight, r = el.getBoundingClientRect(), pad = 24, dy = 0;
    if (!r.height) return;
    if (r.bottom > V - pad) {
      dy = Math.min(r.bottom - V + pad, r.top - M.hdrH - pad);      /* below the screen (a pinned block swallowed the scroll) */
    } else if (r.top < M.hdrH + pad) {
      dy = r.top - M.hdrH - pad;                                    /* under the header */
    } else {
      var hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      var sheet = hit && !el.contains(hit) && !hit.contains(el) ? hit.closest('.s, .hs, .ftr, .pn, .ct') : null;
      if (sheet && !sheet.contains(el)) dy = Math.min(0, sheet.getBoundingClientRect().top - r.bottom - pad);   /* back until the sheet has cleared it */
    }
    if (Math.abs(dy) < 1) return;
    nudge(dy);
    if (tries > 0) window.requestAnimationFrame(function () { revealFocus(el, tries - 1); });
  }
  document.addEventListener('focusin', function (e) {
    if (byKey) window.requestAnimationFrame(function () { revealFocus(e.target, 8); });
  });

  /* ---- Width changes only: remeasure, re-split, re-reserve ---- */
  var lastW = window.innerWidth, resizeT = 0;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(relayout, 120);
  });
  function relayout() {
    measure();
    if (booted) splitAll(false);
    sizeCrate();
    reserveFaq();
    layoutPins();
    layoutHs();
    requestTick();
  }

  /* ---- FAQ: one open at a time; the list reserves the tallest open state ---- */
  var faq = document.querySelector('[data-faq]');
  function reserveFaq() {
    if (!faq) return;
    var closed = 0, tallest = 0;
    faq.querySelectorAll('.faq-item').forEach(function (item) {
      closed += item.querySelector('.faq-item__q').offsetHeight + 1;
      tallest = Math.max(tallest, item.querySelector('.faq-item__answer p').offsetHeight);
    });
    faq.style.minHeight = (closed + tallest + 1) + 'px';
  }
  if (faq) {
    faq.querySelectorAll('.faq-item').forEach(function (item) {
      var btn = item.querySelector('.faq-item__q');
      btn.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        faq.querySelectorAll('.faq-item').forEach(function (other) {
          other.classList.remove('is-open');
          other.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
        });
        if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  /* ---- Gallery (case studies): the row scrolls natively; the buttons step one picture ---- */
  document.querySelectorAll('[data-slider]').forEach(function (box) {
    var vp = box.querySelector('[data-slider-viewport]');
    var prev = box.querySelector('[data-slider-prev]');
    var next = box.querySelector('[data-slider-next]');
    if (!vp || !vp.children.length) return;
    function stops() {
      var base = vp.children[0].offsetLeft;
      return [].map.call(vp.children, function (c) { return c.offsetLeft - base; });
    }
    function go(dir) {
      var pos = stops(), cur = vp.scrollLeft, max = vp.scrollWidth - vp.clientWidth, target = dir > 0 ? max : 0, i;
      if (dir > 0) { for (i = 0; i < pos.length; i++) { if (pos[i] > cur + 2) { target = pos[i]; break; } } }
      else { for (i = pos.length - 1; i >= 0; i--) { if (pos[i] < cur - 2) { target = pos[i]; break; } } }
      vp.scrollTo({ left: Math.min(target, max), behavior: reduced ? 'auto' : 'smooth' });
    }
    function sync() {
      var max = vp.scrollWidth - vp.clientWidth;
      if (prev) prev.disabled = vp.scrollLeft <= 2;
      if (next) next.disabled = vp.scrollLeft >= max - 2;
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    var raf = 0;
    vp.addEventListener('scroll', function () {
      if (raf) return;
      raf = window.requestAnimationFrame(function () { raf = 0; sync(); });
    }, { passive: true });
    window.addEventListener('load', sync);
    window.addEventListener('resize', sync);
    sync();
  });

  /* ---- Tables that scroll sideways on a small screen can be reached and scrolled by keyboard ---- */
  var tables = [].slice.call(document.querySelectorAll('.tbl'));
  function syncTables() {
    tables.forEach(function (t) {
      if (t.hasAttribute('data-fixed-focus')) return;
      if (t.scrollWidth > t.clientWidth + 1) {
        t.setAttribute('tabindex', '0');
        t.setAttribute('role', 'region');
        if (!t.hasAttribute('aria-label')) t.setAttribute('aria-label', root.lang === 'en' ? 'Table, scrolls sideways' : 'Tabelle, seitlich scrollbar');
      } else {
        t.removeAttribute('tabindex');
      }
    });
  }
  if (tables.length) {
    tables.forEach(function (t) { if (t.hasAttribute('tabindex')) t.setAttribute('data-fixed-focus', ''); });
    syncTables();
    window.addEventListener('resize', syncTables);
    window.addEventListener('load', syncTables);
  }

  /* ---- Enquiry as a short quiz (contact page and the enquiry modal): tap an
     answer, add a line, leave a contact. One step is shown at a time; all steps
     share one grid cell, so the panel never changes height. Answers are custom
     radio tiles synced to a hidden input; error lines sit in reserved space.
     Every action gets a confirmation in the reserved line under the steps
     (owner: "positive feedback on every action"); a sent enquiry goes to the
     thank-you page. ---- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var FB = {
    pick: ['Gute Wahl: ', 'Good choice: '],
    noted: ['Danke, das hilft mir bei der Vorbereitung.', 'Thanks, that helps me prepare.'],
    skipped: ['Kein Problem, das klären wir im Gespräch.', "No problem, we'll cover it when we talk."],
    name: ['Freut mich, ', 'Nice to meet you, '],
    email: ['Die E-Mail-Adresse sieht gut aus.', 'That email address looks good.'],
    phone: ['Dann kann ich Sie auch anrufen.', 'Then I can call you too.'],
    ready: ['Alles da. Sie können absenden.', 'All set. You can send it now.'],
    sent: ['Angekommen. Einen Moment …', 'Received. One moment …'],
    note: ['Nachricht', 'Message'],
    fail: ['Senden fehlgeschlagen. Bitte noch einmal versuchen oder an mykhailo@viasmedia.com schreiben.',
      'Sending failed. Please try again or write to mykhailo@viasmedia.com.']
  };
  function t(key) { return FB[key][root.lang === 'en' ? 1 : 0]; }
  function initQuiz(form) {
    var qSteps = [].slice.call(form.querySelectorAll('[data-step]'));
    var qDone = form.querySelector('[data-step-done]');
    var qCount = form.querySelector('[data-quiz-n]');
    var qDots = [].slice.call(form.querySelectorAll('.quiz__meter i'));
    var qStatus = form.querySelector('.form__status');
    var qFb = form.querySelector('[data-quiz-fb]');
    var qSum = form.querySelector('[data-quiz-sum]');
    var qSend = form.querySelector('.quiz__send');
    var qMsg = form.elements.message;
    var qAt = 0, fbT = 0;
    var checks = {
      name: function (v) { return v.length > 1; },
      email: function (v) { return EMAIL_RE.test(v); },
      phone: function (v) { var d = v.replace(/\D/g, ''); return d.length >= 7 && d.length <= 15; }
    };
    /* a confirmation in the reserved line; it fades in afresh each time */
    var say = function (text) {
      if (!qFb) return;
      if (qStatus) qStatus.textContent = '';
      qFb.classList.remove('is-on');
      window.clearTimeout(fbT);
      fbT = window.setTimeout(function () {
        qFb.textContent = text || '';
        if (text) qFb.classList.add('is-on');
      }, text ? 40 : 0);
    };
    var chosen = function () {
      var on = form.querySelector('.tile[aria-checked="true"]');
      return on ? on.textContent.replace(/\s+/g, ' ').trim() : '';
    };
    /* the running summary of what has been given so far */
    var summary = function () {
      if (!qSum) return;
      var parts = [];
      if (chosen()) parts.push(chosen());
      if (qMsg && qMsg.value.trim().length > 2) parts.push(t('note') + ' ✓');
      qSum.textContent = parts.join('  ·  ');
      qSum.classList.toggle('is-on', parts.length > 0);
    };
    /* does the step in view hold an answer? decides between "Überspringen" and "Weiter" */
    var qFilled = function () {
      var step = qSteps[qAt];
      var has = !!(step && (step.querySelector('[aria-checked="true"]') ||
        [].some.call(step.querySelectorAll('input:not([type="hidden"]), textarea'), function (f) { return f.value.trim(); })));
      if (has) form.setAttribute('data-filled', ''); else form.removeAttribute('data-filled');
    };
    var qShow = function (panel, at, focus) {
      qSteps.concat(qDone).forEach(function (p) {
        p.classList.toggle('is-active', p === panel);
        if (p === panel) p.removeAttribute('inert'); else p.setAttribute('inert', '');
      });
      form.setAttribute('data-at', at);
      if (focus) { var h = panel.querySelector('.quiz__q'); if (h) h.focus({ preventScroll: true }); }
    };
    var allValid = function () {
      return checks.name(form.elements.name.value.trim()) && checks.email(form.elements.email.value.trim()) &&
        (!form.elements.phone.value.trim() || checks.phone(form.elements.phone.value.trim()));
    };
    var qGo = function (i, focus) {
      var from = qAt;
      qAt = clamp(i, 0, qSteps.length - 1);
      qShow(qSteps[qAt], String(qAt + 1), focus);
      if (qCount) qCount.textContent = String(qAt + 1);
      qDots.forEach(function (d, k) { d.classList.toggle('is-on', k <= qAt); d.classList.toggle('is-done', k < qAt); });
      qFilled();
      summary();
      /* arriving at the contact step from the note: say what became of the note */
      if (qAt === 2 && from === 1) say(qMsg && qMsg.value.trim() ? t('noted') : t('skipped'));
      else if (qAt === 2 && allValid()) say(t('ready'));
      else if (qAt !== from) say('');
    };
    form._go = qGo;
    /* after a send the form starts again from the first step, empty */
    form._reset = function () {
      form.reset();
      form.querySelectorAll('.tile').forEach(function (o, k) { o.setAttribute('aria-checked', 'false'); o.tabIndex = k ? -1 : 0; });
      form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('is-valid', 'is-invalid'); });
      form.querySelectorAll('[aria-invalid]').forEach(function (i) { i.removeAttribute('aria-invalid'); });
      form.classList.remove('is-sent');
      qSend.disabled = false;
      noted = false;
      qDots.forEach(function (d) { d.classList.remove('is-done'); });
      qAt = 0;
      qGo(0, false);
      say('');
    };
    /* answer tiles: a radio group. Arrows move and choose; a tap also moves on */
    var pick = null;
    form.querySelectorAll('[data-choice]').forEach(function (group) {
      var tiles = [].slice.call(group.querySelectorAll('[role="radio"]'));
      var hidden = group.parentElement.querySelector('input[type="hidden"]');
      pick = function (tile, quiet) {
        tiles.forEach(function (o) { o.setAttribute('aria-checked', String(o === tile)); o.tabIndex = o === tile ? 0 : -1; });
        if (hidden) hidden.value = tile.getAttribute('data-value');
        qFilled();
        summary();
        if (!quiet) say(t('pick') + tile.textContent.replace(/\s+/g, ' ').trim() + '.');
      };
      tiles.forEach(function (tile, i) {
        tile.addEventListener('click', function () {
          pick(tile);
          /* long enough to see the tile fill and read the confirmation */
          window.setTimeout(function () { if (qAt === 0) qGo(1, true); }, reduced ? 0 : 650);
        });
        tile.addEventListener('keydown', function (e) {
          var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var n = tiles[(i + d + tiles.length) % tiles.length];
          pick(n); n.focus();
        });
      });
    });
    /* an opener may bring an answer with it (the price cards) */
    form._pick = function (value) {
      var tile = value && form.querySelector('.tile[data-value="' + value + '"]');
      if (tile && pick) pick(tile);
    };
    form.querySelector('[data-quiz-next]').addEventListener('click', function () { qGo(qAt + 1, true); });
    form.querySelector('[data-quiz-back]').addEventListener('click', function () { qGo(qAt - 1, true); });
    form.addEventListener('input', function () { qFilled(); summary(); });
    var setState = function (input, state) {
      var field = input.closest('.field');
      if (field) { field.classList.toggle('is-invalid', state === 'bad'); field.classList.toggle('is-valid', state === 'ok'); }
      if (state === 'bad') input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    };
    /* a field confirms itself (a gold tick and a line) once it is right; an error only
       shows after leaving the field or on sending */
    var confirmation = function (name, v) {
      if (allValid()) return t('ready');
      return name === 'name' ? t('name') + v.split(/\s+/)[0] + '.' : t(name);
    };
    Object.keys(checks).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      var field = input.closest('.field');
      var judge = function (leaving) {
        var v = input.value.trim();
        var ok = !!v && checks[name](v);
        var was = field.classList.contains('is-valid');
        setState(input, ok ? 'ok' : (leaving && v ? 'bad' : ''));
        if (ok && !was) say(confirmation(name, v));
      };
      input.addEventListener('input', function () { judge(false); });
      input.addEventListener('blur', function () { judge(true); });
    });
    var noted = false;
    if (qMsg) {
      qMsg.addEventListener('input', function () {
        if (!noted && qMsg.value.trim().length >= 12) { noted = true; say(t('noted')); }
      });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (qAt < qSteps.length - 1) { qGo(qAt + 1, true); return; }   /* Enter in an earlier step moves on */
      if (qStatus) qStatus.textContent = '';
      var firstBad = null;
      Object.keys(checks).forEach(function (name) {
        var input = form.elements[name];
        if (!input) return;
        var v = input.value.trim();
        var bad = name === 'phone' ? (v && !checks.phone(v)) : !checks[name](v);
        setState(input, bad ? 'bad' : (v ? 'ok' : ''));
        if (bad && !firstBad) firstBad = input;
      });
      if (firstBad) { say(''); firstBad.focus(); return; }
      form.classList.add('is-sending');
      qSend.disabled = true;
      window.fetch(form.action, { method: 'POST', body: new window.FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!data || !data.success) throw new Error('not sent');
          form.classList.remove('is-sending');
          form.classList.add('is-sent');
          qDots.forEach(function (d) { d.classList.add('is-on', 'is-done'); });
          say(t('sent'));
          /* the confirmation dialog greets by first name and repeats the choice; nothing is kept */
          var info = { name: form.elements.name.value.trim().split(/\s+/)[0], service: chosen() };
          window.setTimeout(function () {
            if (window.viasSent) window.viasSent(info); else qShow(qDone, 'done', true);
            form._reset();
          }, reduced ? 200 : 900);
        })
        .catch(function () {
          form.classList.remove('is-sending');
          say('');
          if (qStatus) qStatus.textContent = t('fail');
          qSend.disabled = false;
        });
    });
    qGo(0, false);
  }
  [].forEach.call(document.querySelectorAll('[data-quiz]'), initQuiz);

  /* ---- The enquiry modal: every button that asks for an enquiry opens it in
     place (the link to contact.html stays as the fallback). Focus stays inside,
     Esc and the scrim close it, the page behind is pinned, and what was entered
     stays when it is closed half way. On the contact page the form is already
     on the page, so the same buttons bring that into view instead. ---- */
  var mq = document.getElementById('enquiry');
  var mqForm = mq ? mq.querySelector('[data-quiz]') : null;
  var pageForm = document.querySelector('.ct__form');
  var mqFrom = null;
  function isOpener(a) {
    return a && a.matches && a.matches('a.btn[href$="contact.html"], a.cta[href$="contact.html"], a[data-pick]');
  }
  function setOutside(off) {
    [document.getElementById('main'), hdr, document.querySelector('.ftr')].forEach(function (el) {
      if (el) el.toggleAttribute('inert', off);
    });
  }
  function openMq(from) {
    if (!mq || mq.classList.contains('is-open')) return;
    mqFrom = from || null;
    if (menu && menu.classList.contains('is-open')) setMenu(false);
    if (from && from.hasAttribute('data-pick') && mqForm && mqForm._pick) mqForm._pick(from.getAttribute('data-pick'));
    lockScroll();
    root.classList.add('mq-open');
    mq.removeAttribute('inert');
    mq.classList.add('is-open');
    setOutside(true);
    window.setTimeout(function () {
      var q = mq.querySelector('.quiz__step.is-active .quiz__q');
      if (q) q.focus({ preventScroll: true });
    }, 60);
  }
  function closeMq() {
    if (!mq || !mq.classList.contains('is-open')) return;
    mq.classList.remove('is-open');
    mq.setAttribute('inert', '');
    root.classList.remove('mq-open');
    setOutside(false);
    unlockScroll();
    if (mqFrom && mqFrom.focus) mqFrom.focus({ preventScroll: true });
  }
  if (mq || pageForm) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!isOpener(a) || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      if (pageForm) {
        if (a.hasAttribute('data-pick') && pageForm._pick) pageForm._pick(a.getAttribute('data-pick'));
        var y = pageForm.getBoundingClientRect().top + window.scrollY - M.hdrH - 16;
        if (lenis) lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
        return;
      }
      openMq(a);
    });
  }
  /* keep keyboard focus inside an open dialog */
  function trapTab(e, box) {
    var f = [].filter.call(box.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'), function (el) {
      return !el.disabled && el.offsetParent !== null && !el.closest('[inert]') && !el.classList.contains('hp') && el.getAttribute('tabindex') !== '-1';
    });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (mq) {
    mq.querySelectorAll('[data-mq-close]').forEach(function (b) { b.addEventListener('click', closeMq); });
    window.addEventListener('pageshow', function (e) { if (e.persisted) closeMq(); });
  }

  /* ---- Sent: the confirmation after an enquiry, always a dialog (owner: "the success page
     should always be a popup modal"). It takes over from the enquiry modal without letting
     the page move, greets by first name and repeats the topic. ---- */
  var sent = document.getElementById('gesendet');
  /* the greeting: by first name when the form left one, and the chosen topic */
  function greetSent(info) {
    var en = root.lang === 'en';
    var title = sent.querySelector('.sent__title'), sum = sent.querySelector('[data-sent-sum]');
    var n = (info && info.name) ? String(info.name).slice(0, 40) : '';
    var thanks = n ? 'Thank you, ' + n + '.' : 'Thank you.';
    title.textContent = en ? thanks : (n ? 'Danke, ' + n + '.' : 'Danke.');
    title.setAttribute('data-en', thanks);
    var topic = info && info.service;
    sum.textContent = topic ? (en ? 'Your topic: ' : 'Ihr Thema: ') + topic : '';
    sum.hidden = !topic;
    return title;
  }
  function openSent(info) {
    if (!sent) return;
    var title = greetSent(info);
    var locked = root.classList.contains('mq-open');
    if (mq && mq.classList.contains('is-open')) { mq.classList.remove('is-open'); mq.setAttribute('inert', ''); }
    if (!locked) lockScroll();
    root.classList.add('mq-open');
    sent.removeAttribute('inert');
    sent.classList.add('is-open');
    setOutside(true);
    wakeFlocks();
    window.setTimeout(function () { title.focus({ preventScroll: true }); }, 60);
  }
  function closeSent() {
    if (!sent || !sent.classList.contains('is-open')) return;
    sent.classList.remove('is-open');
    sent.setAttribute('inert', '');
    root.classList.remove('mq-open');
    setOutside(false);
    unlockScroll();
    if (window.location.hash === '#gesendet') window.history.replaceState(null, '', window.location.pathname + window.location.search);
    if (mqFrom && mqFrom.focus) mqFrom.focus({ preventScroll: true });
  }
  if (sent) {
    window.viasSent = openSent;
    sent.querySelectorAll('[data-sent-close]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); closeSent(); });
    });
    /* arriving from the form without JavaScript in between (its redirect) */
    if (window.location.hash === '#gesendet') openSent(null); else sent.setAttribute('inert', '');
  }
  document.addEventListener('keydown', function (e) {
    var box = sent && sent.classList.contains('is-open') ? sent : (mq && mq.classList.contains('is-open') ? mq : null);
    if (!box) return;
    if (e.key === 'Escape') { e.preventDefault(); if (box === sent) closeSent(); else closeMq(); return; }
    if (e.key === 'Tab') trapTab(e, box);
  });

  /* =====================================================================
     Cursor (fine pointers): a drafting crosshair with guide lines; over a
     labelled target the label takes its place. One element moves per
     frame. The native cursor comes back for keyboard use.
     ===================================================================== */
  if (finePointer) {
    var cur = document.createElement('div');
    cur.className = 'cur';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="cur__pos"><i class="cur__h"></i><i class="cur__v"></i><i class="cur__x"></i></div><b class="cur__tag"></b>';
    document.body.appendChild(cur);
    var cPos = cur.children[0], cTag = cur.children[1];
    var px = 0, py = 0, tx = 0, ty = 0, tagRaf = 0;
    var tagLoop = function () {
      tx += (px - tx) * (reduced ? 1 : 0.22);
      ty += (py - ty) * (reduced ? 1 : 0.22);
      cTag.style.translate = tx.toFixed(1) + 'px ' + ty.toFixed(1) + 'px';
      tagRaf = (Math.abs(px - tx) + Math.abs(py - ty) > 0.3) ? window.requestAnimationFrame(tagLoop) : 0;
    };
    /* what is under the pointer decides the cursor's state; also re-read while
       scrolling, because the page moves under a resting pointer */
    var readTarget = function (t) {
      t = t && t.closest ? t : null;
      var tagged = t && t.closest('[data-cur]');
      cur.classList.toggle('is-link', !!(t && t.closest('a, button, label, [role="button"]')));
      if (tagged) {
        var label = (root.lang === 'en' && tagged.getAttribute('data-cur-en')) || tagged.getAttribute('data-cur');
        if (cTag.textContent !== label) cTag.textContent = label;
      }
      cur.classList.toggle('has-tag', !!tagged);
    };
    refreshCursor = function () {
      if (cur.classList.contains('is-live')) readTarget(document.elementFromPoint(px, py));
    };
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      px = e.clientX; py = e.clientY;
      if (!cur.classList.contains('is-live')) { root.classList.add('has-cur'); cur.classList.add('is-live'); tx = px; ty = py; }
      /* the individual translate property keeps position independent of the
         rotate/scale states set in CSS */
      cPos.style.translate = px + 'px ' + py + 'px';
      if (!tagRaf) tagRaf = window.requestAnimationFrame(tagLoop);
      readTarget(e.target);
    }, { passive: true });
    document.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
    document.documentElement.addEventListener('mouseleave', function () { cur.classList.remove('is-live'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') { root.classList.remove('has-cur'); cur.classList.remove('is-live'); }
    });
  }

  /* ---- Boot (last: everything above is defined) ---- */
  function boot() {
    splitAll(false);
    sizeCrate();
    reserveFaq();
    layoutPins();
    layoutHs();
    startReveals();
    tick();
  }
  /* Line breaks and pinned heights are measured, so they are only right once the
     stylesheets have applied and the title face is really in use. Neither can be
     taken for granted in Safari: a deferred script may run before a stylesheet
     that is not in the cache yet (titles were then measured at the wrong size),
     and the Font Loading API reports a face as loaded before it has arrived (they
     were measured in the fallback face). So both are tested by what they do: every
     stylesheet link has its sheet, and a word set in the title face has a different
     width than in the fallback. Everything is measured the moment both hold. */
  var booted = false, fontT = 0;
  function cssIn() {
    return [].every.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) { return !!l.sheet; });
  }
  function faceActive() {
    var s = document.createElement('span');
    s.style.cssText = 'position:absolute;left:-999em;top:0;font-size:80px;white-space:nowrap;visibility:hidden';
    s.textContent = 'BESbswy 0123';
    document.body.appendChild(s);
    s.style.fontFamily = 'monospace';
    var a = s.offsetWidth;
    s.style.fontFamily = '"Bebas Neue", monospace';
    var b = s.offsetWidth;
    document.body.removeChild(s);
    return a !== b;
  }
  /* measure now: the first time that is the boot, later it is a fresh layout */
  function settle() {
    if (!booted) { booted = true; boot(); return; }
    window.clearTimeout(fontT);
    fontT = window.setTimeout(relayout, 60);
  }
  /* look every 100ms (for at most 15s) until stylesheets and face are in, then measure */
  function watch(tries) {
    if (cssIn() && faceActive()) { settle(); return; }
    if (tries > 0) window.setTimeout(function () { watch(tries - 1); }, 100);
  }
  if (cssIn() && faceActive()) {
    settle();
  } else {
    if (document.fonts && document.fonts.forEach) {
      document.fonts.forEach(function (f) { if (/Bebas Neue|Archivo/.test(f.family)) f.load().catch(function () {}); });
    }
    /* a slow font does not hold the page back for more than 1.2s; a missing stylesheet does */
    window.setTimeout(function () { if (!booted && cssIn()) settle(); }, 1200);
    watch(150);
  }
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', function () { if (booted) settle(); });
  }
  /* everything has arrived (images too): the last word on every measured size */
  window.addEventListener('load', settle);
  /* i18n rewrote the text: split the new copy, keep already-revealed state */
  document.addEventListener('vias:lang', function () {
    if (!booted) return;
    splitAll(true);
    sizeCrate();
    reserveFaq();
    layoutPins();
    layoutHs();
    requestTick();
  });
})();
