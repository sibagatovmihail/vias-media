/* =====================================================================
   Vias Media v2 "Bauplan" — page interactions
   contact links · menu sheet · smooth scroll · split text + hero fit ·
   reveals · horizontal scene + masked-word zoom · service drawings ·
   hero drive / footer converge · fog · FAQ · cursor
   (The project stack and the pricing reveal are CSS only: home.css.)
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

  /* ---- Contact details (mirrors assets/js/main.js until the old file is retired) ---- */
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
        return !!(node.closest && node.closest('#cc-modal-overlay, #cc-banner, .menu'));
      }
    });
  }

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
    if (lenis) { lenis.start(); lenis.scrollTo(lockY, { immediate: true, force: true }); }
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
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
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
        out.push({ t: word, cls: cls, sp: space && out.length > 0 });
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
  function splitLines(el) {
    if (el._src == null) el._src = el.innerHTML;
    el.innerHTML = el._src;
    el.style.fontSize = '';
    var toks = tokenize(el);
    if (!toks.length) return;
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var mode = el.getAttribute('data-lines');
    var forced = mode === 'mark' ? markLines(toks) : (mode === 'dash' && desktop.matches) ? dashLines(toks) : null;
    var lines = forced || measuredLines(el, toks);
    /* --i staggers the reveal; --dir (-1 / 1) lets lines travel in opposite directions */
    el.innerHTML = lines.map(function (ln, i) {
      ln[0] = { t: ln[0].t, cls: ln[0].cls, sp: false };
      return '<span class="ln" aria-hidden="true" style="--i:' + i + ';--dir:' + (i % 2 ? 1 : -1) + '"><span>' + runs(ln) + '</span></span>';
    }).join('');
    if (forced && el.hasAttribute('data-fit')) fitLines(el);
    var wide = false;
    [].forEach.call(el.querySelectorAll('.ln'), function (ln) { if (ln.scrollWidth > ln.clientWidth + 1) wide = true; });
    el.classList.toggle('is-loose', wide);
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
  /* letter roll (header links): the link keeps its name for assistive tech */
  function splitRoll(el) {
    var text = (el._txt != null ? el._txt : el.textContent).replace(/\s+/g, ' ').trim();
    el._txt = text;
    var link = el.closest('a, button');
    if (link) link.setAttribute('aria-label', text);
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = text.split('').map(function (c, i) {
      var ch = c === ' ' ? ' ' : c;
      return '<span class="ch" data-c="' + esc(ch) + '" style="--c:' + i + '">' + esc(ch) + '</span>';
    }).join('');
    el.classList.add('is-split');
  }
  var lineEls = [].slice.call(document.querySelectorAll('[data-split]'));
  var fillEls = reduced ? [] : [].slice.call(document.querySelectorAll('[data-fill]'));
  var rollEls = (reduced || !finePointer) ? [] : [].slice.call(document.querySelectorAll('[data-roll]'));
  function splitAll(fresh) {
    lineEls.forEach(function (el) { if (fresh) el._src = null; splitLines(el); });
    fillEls.forEach(function (el) { if (fresh) el._src = null; splitWords(el); });
    if (fresh) rollEls.forEach(function (el) { el._txt = null; });
    rollEls.forEach(splitRoll);
  }

  /* ---- Reveals: hidden only while JS is alive; <head> carries a no-JS-file failsafe ---- */
  var rvEls = [].slice.call(document.querySelectorAll('.rv, .rv-lines'));
  var io = null;
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
  var HS_HOLD = 0.12, HS_SLIDE = 0.55, HS_ZOOM = 1.15;
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
      vp: hs.querySelector('.hs__viewport'),
      track: hs.querySelector('.hs__track'),
      mask: hs.querySelector('.hs__mask'),
      svg: hs.querySelector('.hs__svg'),
      word: hs.querySelector('#hs-word'),
      img: hs.querySelector('#hs-img'),
      fade: hs.querySelector('.hs__mask-fade'),
      pan: 0, speed: 1.5, x: -1, c: -1, z: -1, geo: null
    };
    hs.classList.add('is-scene');
  }
  /* size the SVG to the stage, set the word, and work out the zoom geometry */
  function layoutMask() {
    var W = hsc.stage.clientWidth, H = vh();
    var m = MASK_WORDS[root.lang === 'en' ? 'en' : 'de'];
    hsc.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + hsc.stage.clientHeight);
    hsc.word.setAttribute('d', m.d);
    var s = Math.min(0.9 * W / m.w, 0.6 * H / m.h);      /* px per font unit: fits the width, caps at most 60 % of the height */
    var stem = (m.f[1] - m.f[0]) * s;
    hsc.geo = {
      s: s,
      x0: (W - m.w * s) / 2, y0: (H - m.h * s) / 2,      /* the word's top left corner at rest */
      cx: W / 2, cy: H / 2,                              /* its centre */
      fx: (W - m.w * s) / 2 + (m.f[0] + m.f[1]) / 2 * s, /* the middle of the I: where the zoom ends up */
      kmax: 1.15 * Math.max(W / stem, hsc.stage.clientHeight / (m.h * s))
    };
    if (!hsc.img.getAttribute('href')) {
      hsc.img.setAttribute('href', 'assets/img/v2/' + (W < 820 ? 'sparks-1100.webp' : 'sparks-1920.webp'));
    }
  }
  function layoutHs() {
    if (!hsc) return;
    var V = vh();
    hsc.speed = window.innerWidth < 768 ? 1.8 : 1.5;      /* px of pan per px of scroll */
    hsc.track.style.transform = 'none';
    hsc.pan = Math.max(0, hsc.track.scrollWidth - hsc.vp.clientWidth);
    layoutMask();
    hsc.x = -1; hsc.c = -1; hsc.z = -1;
    hs.style.height = Math.round(hsc.stage.offsetHeight + (HS_HOLD + HS_SLIDE + HS_ZOOM) * V + hsc.pan / hsc.speed) + 'px';
  }
  function setZoom(z) {
    var g = hsc.geo;
    if (!g) return;
    var k = Math.pow(g.kmax, z);                          /* exponential: the zoom feels even */
    /* the fixed point travels from the word's centre to the middle of the I early on */
    var ax = g.cx + (g.fx - g.cx) * smooth(clamp(z / 0.3, 0, 1));
    hsc.word.setAttribute('transform', 'translate(' + (g.cx + k * (g.x0 - ax)).toFixed(2) + ' ' + (g.cy + k * (g.y0 - g.cy)).toFixed(2) + ') scale(' + (k * g.s).toFixed(5) + ')');
    /* at the very end the clip is dropped: the photograph is simply the screen */
    if (z >= 0.985) hsc.img.removeAttribute('clip-path'); else hsc.img.setAttribute('clip-path', 'url(#hs-clip)');
    hsc.fade.style.opacity = clamp((z - 0.6) / 0.4, 0, 1).toFixed(3);
  }
  function updateHs(V) {
    var r = hs.getBoundingClientRect();
    var stageH = hsc.stage.offsetHeight;
    var s = clamp(-r.top, 0, Math.max(0, r.height - stageH));
    var panLen = hsc.pan / hsc.speed;
    var c = smooth(clamp((s - HS_HOLD * V - panLen) / (HS_SLIDE * V), 0, 1));       /* sheet slides in */
    var z = clamp((s - HS_HOLD * V - panLen - HS_SLIDE * V) / (HS_ZOOM * V), 0, 1); /* zoom */
    /* the panels keep moving a little while the sheet comes in, so nothing stops dead */
    var x = clamp((s - HS_HOLD * V) * hsc.speed, 0, hsc.pan) + c * hsc.vp.clientWidth * 0.3;
    if (x !== hsc.x) { hsc.x = x; hsc.track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)'; }
    if (c !== hsc.c) { hsc.c = c; hsc.mask.style.transform = 'translate3d(' + ((1 - c) * 100).toFixed(2) + '%,0,0)'; }
    if (z !== hsc.z) { hsc.z = z; setZoom(z); }
    return { pinned: r.top <= V * 0.4 && r.bottom >= V * 0.9 };
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

  /* ---- Projects (laptops): each screenshot glides up through its backdrop. The
     stack itself is CSS; this only reads four boxes and moves four frames. ---- */
  var casesEl = reduced ? null : document.querySelector('.cases');
  var caseEls = casesEl ? [].slice.call(casesEl.querySelectorAll('.case')) : [];
  /* a card taller than the screen pins with its bottom edge on the screen's, so
     its text is read before the next card covers it */
  function layoutCases() {
    var V = vh();
    caseEls.forEach(function (el) { el.style.top = Math.min(0, V - el.offsetHeight) + 'px'; });
  }
  function updateCases(V) {
    if (!casesEl || !desktop.matches) return;
    var box = casesEl.getBoundingClientRect();
    if (box.top > V || box.bottom < 0) return;
    var tops = caseEls.map(function (el) { return el.getBoundingClientRect().top; });
    caseEls.forEach(function (el, i) {
      /* 1 while it comes in, 0 when it is pinned, -1 once the next one has covered it */
      var p = tops[i] > 0 ? tops[i] / V : (i + 1 < tops.length ? clamp(tops[i + 1] / V, 0, 1) - 1 : tops[i] / V);
      var y = Math.round(clamp(p, -1, 1) * 0.14 * V);
      if (y === el._cy) return;
      el._cy = y;
      el.style.setProperty('--cy', y);
    });
  }

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

  /* ---- Hero title: the lines drive apart while the projects slide over the pinned hero ---- */
  var driveEl = reduced ? null : document.querySelector('[data-drive]');
  var driveVal = -1;
  function updateDrive(V) {
    if (!driveEl) return;
    var v = Math.round(clamp(window.scrollY / V, 0, 1) * 0.11 * window.innerWidth);
    if (v === driveVal) return;
    driveVal = v;
    driveEl.style.setProperty('--drive', v);
  }

  /* ---- Closing headline: its lines come in from the sides and meet ---- */
  var convEls = reduced ? [] : [].slice.call(document.querySelectorAll('[data-converge]'));
  function updateConverge(V) {
    convEls.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();   /* the parent does not move */
      if (r.top > V * 1.2 || r.bottom < -V * 0.2) return;
      var t = clamp((V - r.top) / (V * 0.55), 0, 1);
      var v = (1 - Math.pow(1 - t, 3)).toFixed(3);        /* ease out: fast in, settles gently */
      if (v === el._conv) return;
      el._conv = v;
      el.style.setProperty('--conv', v);
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
    if (root.classList.contains('menu-open')) return;   /* a pinned body reports scrollY 0 */
    var V = vh();
    if (hsc) updateHs(V);
    nearScene(V);
    if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 8);
    updateFog(V);
    updateFill(V);
    updateDrive(V);
    updateCases(V);
    updateConverge(V);
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
      var sheet = hit && !el.contains(hit) && !hit.contains(el) ? hit.closest('.case, .cases__intro, .s, .hs, .ftr, .reel-more') : null;
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
    resizeT = window.setTimeout(function () {
      measure();
      if (booted) splitAll(false);
      layoutCases();
      layoutHs();
      reserveFaq();
      requestTick();
    }, 120);
  });

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
    layoutCases();
    layoutHs();
    startReveals();
    reserveFaq();
    tick();
  }
  /* wait for the display face so line breaks are measured with the real widths (capped) */
  var booted = false;
  function bootOnce() { if (booted) return; booted = true; boot(); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(bootOnce);
    window.setTimeout(bootOnce, 1200);
  } else {
    bootOnce();
  }
  /* late layout shifts (images, fonts): the scene length depends on real sizes */
  window.addEventListener('load', function () { if (booted) { layoutCases(); layoutHs(); requestTick(); } });
  /* i18n rewrote the text: split the new copy, keep already-revealed state */
  document.addEventListener('vias:lang', function () {
    if (!booted) return;
    splitAll(true);
    layoutCases();
    layoutHs();
    reserveFaq();
    requestTick();
  });
})();
