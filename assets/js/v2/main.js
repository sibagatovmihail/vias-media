/* =====================================================================
   Vias Media v2 "Bauplan" — page interactions
   contact links · theme · menu sheet · smooth scroll · split text ·
   reveals · project reel · horizontal scene + ink flood · service
   drawings · hero drive / footer converge · fog · FAQ · cursor · ticker
   ===================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  window.viasReady = true;   /* tells the <head> failsafe that this file arrived */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
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
  function jumpTo(y) {
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }

  /* ---- Theme toggle (restored inline in <head>) ---- */
  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-palette') === 'ember-dark' ? 'ember' : 'ember-dark';
      root.setAttribute('data-palette', next);
      try { localStorage.setItem('vias-theme', next); } catch (e) {}
    });
  });

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
    window.matchMedia('(min-width: 62.5rem)').addEventListener('change', function (e) {
      if (e.matches && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* =====================================================================
     Split text. The plain text in the markup is the default; JS wraps
     lines (reveals), words (ink fill) or letters (roll) and redoes it on
     width / language change.
     ===================================================================== */
  function tokenize(el) {
    var out = [], space = false;
    [].forEach.call(el.childNodes, function (n) {
      var cls = n.nodeType === 1 ? (n.getAttribute('class') || '') : '';
      var text = n.textContent || '';
      text.replace(/(\s+)|(\S+)/g, function (m, ws, word) {
        if (ws) { space = true; return m; }
        /* a dash never starts a line: it stays glued to the word before it */
        if (/^[–—-]$/.test(word) && space && out.length && out[out.length - 1].cls === cls) {
          out[out.length - 1].t += ' ' + word;
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
  function splitLines(el) {
    if (el._src == null) el._src = el.innerHTML;
    el.innerHTML = el._src;
    var toks = tokenize(el);
    if (!toks.length) return;
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    /* measure: every word as an inline-block, grouped by its line top */
    el.innerHTML = toks.map(function (t) {
      return (t.sp ? ' ' : '') + '<span class="' + (t.cls ? t.cls + ' ' : '') + 'mw" style="display:inline-block;text-indent:0">' + esc(t.t) + '</span>';
    }).join('');
    var spans = el.querySelectorAll('.mw'), lines = [], lastTop = null;
    [].forEach.call(spans, function (s, i) {
      var top = s.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 4) { lines.push([]); lastTop = top; }
      lines[lines.length - 1].push(toks[i]);
    });
    /* --i staggers the reveal; --dir (-1 / 1) lets lines travel in opposite directions */
    el.innerHTML = lines.map(function (ln, i) {
      ln[0] = { t: ln[0].t, cls: ln[0].cls, sp: false };
      return '<span class="ln" aria-hidden="true" style="--i:' + i + ';--dir:' + (i % 2 ? 1 : -1) + '"><span>' + runs(ln) + '</span></span>';
    }).join('');
    var wide = false;
    [].forEach.call(el.querySelectorAll('.ln'), function (ln) { if (ln.scrollWidth > ln.clientWidth + 1) wide = true; });
    el.classList.toggle('is-loose', wide);
    el.classList.add('is-ready');
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
     Project reel — pinned scene. s = px scrolled inside the tall box.
       0 … EXP          the inset window opens to full bleed
       then per project one leg; the next screenshot wipes in mid-leg
     ===================================================================== */
  var reel = document.querySelector('[data-reel]');
  var scene = null;
  var EXP = 0.6, LEG = 0.62, END = 0.4;
  if (reel && !reduced) {
    var items = [].slice.call(reel.querySelectorAll('.reel__item'));
    scene = {
      stage: reel.querySelector('.reel__stage'),
      frame: reel.querySelector('.reel__frame'),
      items: items,
      n: items.length,
      index: 0
    };
    reel.classList.add('is-scene');
    reel.style.setProperty('--reel-len', (1 + EXP + LEG * (items.length - 1) + END).toFixed(3));
    /* the wipes must never reveal an unloaded image */
    if ('IntersectionObserver' in window) {
      var pre = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        reel.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
        pre.disconnect();
      }, { rootMargin: '100% 0px' });
      pre.observe(reel);
    }
    /* keyboard: focusing a project's link brings that project on stage */
    items.forEach(function (it, k) {
      it.addEventListener('focusin', function () {
        if (k === scene.index) return;
        var top = reel.getBoundingClientRect().top + window.scrollY;
        jumpTo(top + (EXP + LEG * k + 0.05) * vh());
      });
    });
    fillTicker(reel.querySelector('.ticker'));
    scene.tickH = reel.querySelector('.ticker').offsetHeight || 36;
  }
  function setReelIndex(i) {
    if (i === scene.index && scene.items[i].classList.contains('is-active')) return;
    scene.index = i;
    scene.items.forEach(function (it, k) {
      it.classList.toggle('is-in', k <= i);
      it.classList.toggle('is-active', k === i);
    });
  }
  function updateReel(V) {
    var r = reel.getBoundingClientRect();
    var y = r.top;
    var stageH = scene.stage.offsetHeight;
    var bleed = Math.max(0, stageH - V);                 /* see --bleed in home.css */
    var s = clamp(-y, 0, Math.max(0, r.height - stageH));
    var e = smooth(clamp(s / (EXP * V), 0, 1));
    var pad = M.margin * 0.5;
    /* before the pin the window's top edge rides just under the header bar */
    var ct = (1 - e) * Math.max(pad, M.hdrH + pad - Math.max(y, 0));
    var cx = (1 - e) * M.margin;
    var st = scene.frame.style;
    st.setProperty('--ct', ct.toFixed(1) + 'px');
    st.setProperty('--cx', cx.toFixed(1) + 'px');
    st.setProperty('--cb', (cx + (1 - e) * bleed).toFixed(1) + 'px');
    st.setProperty('--zoom', (1 + (1 - e) * 0.07).toFixed(4));
    var tickY = Math.max(ct, e * M.hdrH);
    st.setProperty('--tick-y', tickY.toFixed(1) + 'px');
    /* the screenshot window starts right under the ticker, wherever the ticker is */
    st.setProperty('--bar', (tickY + scene.tickH).toFixed(1) + 'px');
    var idx = clamp(Math.floor((s - EXP * V + LEG * V * 0.5) / (LEG * V)), 0, scene.n - 1);
    setReelIndex(s < EXP * V ? 0 : idx);
    return {
      onMedia: e > 0.72 && y <= 0 && r.bottom >= V - 1,   /* only while pinned */
      covering: y < V * 0.55 && r.bottom > V * 0.8
    };
  }

  /* =====================================================================
     "How I work" — pinned horizontal scene.
       hold → the track pans left until the big word's letter I sits in the
       middle → an ink layer grows out of that I (clip-path) until it covers
       the stage. The Services band below has the same ink ground.
     ===================================================================== */
  var hs = document.querySelector('[data-hs]');
  var hsc = null;
  var HS_HOLD = 0.12, HS_FLOOD = 0.7;
  if (hs && !reduced) {
    hsc = {
      stage: hs.querySelector('.hs__stage'),
      vp: hs.querySelector('.hs__viewport'),
      track: hs.querySelector('.hs__track'),
      flood: hs.querySelector('.hs__flood'),
      word: hs.querySelector('[data-word]'),
      pan: 0, speed: 1.5, x: -1, f: -1
    };
    hs.classList.add('is-scene');
  }
  function wrapWordI() {
    if (!hsc || !hsc.word) return;
    var t = hsc.word.textContent;
    var i = t.search(/i/i);
    hsc.word.innerHTML = i < 0 ? esc(t)
      : esc(t.slice(0, i)) + '<span class="hs__i">' + esc(t.charAt(i)) + '</span>' + esc(t.slice(i + 1));
    hsc.i = hsc.word.querySelector('.hs__i');
  }
  function layoutHs() {
    if (!hsc) return;
    var V = vh();
    hsc.speed = window.innerWidth < 768 ? 1.8 : 1.5;      /* px of pan per px of scroll */
    hsc.track.style.transform = 'none';
    var vw = hsc.vp.clientWidth;
    var end = hsc.track.scrollWidth - vw;
    if (hsc.i) {
      var ir = hsc.i.getBoundingClientRect(), tr = hsc.track.getBoundingClientRect();
      end = Math.min(end, ir.left - tr.left + ir.width / 2 - vw * 0.5);
    }
    hsc.pan = Math.max(0, end);
    hsc.x = -1; hsc.f = -1;
    hs.style.height = Math.round(hsc.stage.offsetHeight + HS_HOLD * V + hsc.pan / hsc.speed + HS_FLOOD * V) + 'px';
  }
  function updateHs(V) {
    var r = hs.getBoundingClientRect();
    var stageH = hsc.stage.offsetHeight;
    var s = clamp(-r.top, 0, Math.max(0, r.height - stageH));
    var x = clamp((s - HS_HOLD * V) * hsc.speed, 0, hsc.pan);
    if (x !== hsc.x) {
      hsc.x = x;
      hsc.track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
    }
    var f = clamp((s - HS_HOLD * V - hsc.pan / hsc.speed) / (HS_FLOOD * V), 0, 1);
    if (f !== hsc.f) {
      hsc.f = f;
      var st = hsc.flood.style;
      if (f <= 0) {
        st.visibility = 'hidden';
      } else {
        /* start inside the stem of the I (same colour, so the start is invisible) */
        var sr = hsc.stage.getBoundingClientRect();
        var ir = hsc.i ? hsc.i.getBoundingClientRect() : { left: sr.left + sr.width / 2, right: sr.left + sr.width / 2, top: sr.top + sr.height / 2, bottom: sr.top + sr.height / 2, width: 0, height: 0 };
        var k = 1 - Math.pow(f, 2.2);
        var t = Math.max(0, (ir.top - sr.top + ir.height * 0.26) * k);
        var b = Math.max(0, (sr.bottom - ir.bottom + ir.height * 0.34) * k);
        var l = Math.max(0, (ir.left - sr.left + ir.width * 0.3) * k);
        var rr = Math.max(0, (sr.right - ir.right + ir.width * 0.3) * k);
        st.clipPath = 'inset(' + t.toFixed(1) + 'px ' + rr.toFixed(1) + 'px ' + b.toFixed(1) + 'px ' + l.toFixed(1) + 'px)';
        st.visibility = 'visible';
      }
    }
    return {
      pinned: r.top <= V * 0.4 && r.bottom >= V * 0.9,
      flooded: f > 0.9 && r.top <= 0 && r.bottom > M.hdrH * 0.5
    };
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
    var svcWide = window.matchMedia('(min-width: 62.5rem)');
    var showSvc = function (i, row) {
      if (!svcPre || !svcWide.matches) return;
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

  /* ---- Hero title: the lines drive apart as the hero scrolls away ---- */
  var driveEl = reduced ? null : document.querySelector('[data-drive]');
  var heroEl = driveEl ? driveEl.closest('section') : null;
  var driveVal = -1;
  function updateDrive() {
    if (!driveEl) return;
    var r = heroEl.getBoundingClientRect();
    if (r.bottom < 0) return;
    var v = Math.round(clamp(-r.top / r.height, 0, 1) * 0.09 * window.innerWidth);
    if (v === driveVal) return;
    driveVal = v;
    driveEl.style.setProperty('--drive', v);
  }

  /* ---- Closing headline: grows and closes in as it comes up the screen ---- */
  var convEls = reduced ? [] : [].slice.call(document.querySelectorAll('[data-converge]'));
  function updateConverge(V) {
    convEls.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();   /* the parent does not scale */
      if (r.top > V * 1.2 || r.bottom < -V * 0.2) return;
      var v = smooth(clamp((V - r.top) / (V * 0.62), 0, 1)).toFixed(3);
      if (v === el._conv) return;
      el._conv = v;
      el.style.setProperty('--conv', v);
    });
  }

  /* ---- Promote a scene's layers only while it is within a screen of the viewport ---- */
  var sceneEls = [reel, hs].filter(Boolean);
  function nearScenes(V) {
    sceneEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var near = r.top < 2 * V && r.bottom > -V;
      if (near !== el._near) { el._near = near; el.classList.toggle('is-near', near); }
    });
  }

  /* ---- One scroll tick for header, scenes, fog and the text effects ---- */
  var refreshCursor = null;   /* set by the cursor block on fine pointers */
  var fog = document.querySelector('.fog');
  var noFog = [].slice.call(document.querySelectorAll('[data-nofog]'));
  var noFogCover = [].slice.call(document.querySelectorAll('[data-nofog-cover]'));   /* off while it fills the bottom edge */
  var inkEls = [].slice.call(document.querySelectorAll('[data-ink]'));
  var ticking = false;
  function underHeader(el) {
    var r = el.getBoundingClientRect();
    return r.top <= M.hdrH * 0.5 && r.bottom > M.hdrH * 0.5;
  }
  function updateHeader(rs, hss) {
    if (!hdr) return;
    var inv = hss.flooded || inkEls.some(underHeader);
    hdr.classList.toggle('is-scrolled', window.scrollY > 8);
    hdr.classList.toggle('is-on-media', rs.onMedia);
    hdr.classList.toggle('is-inv', inv && !rs.onMedia);
  }
  /* the blur band is off wherever something is anchored to the bottom edge */
  function updateFog(rs, hss, V) {
    if (!fog) return;
    var off = rs.covering || hss.pinned ||
      noFog.some(function (el) { return el.getBoundingClientRect().top < V - 8; }) ||
      noFogCover.some(function (el) { var r = el.getBoundingClientRect(); return r.top < V && r.bottom > V - 12; });
    fog.classList.toggle('is-off', off);
  }
  function tick() {
    ticking = false;
    if (root.classList.contains('menu-open')) return;   /* a pinned body reports scrollY 0 */
    var V = vh();
    var rs = scene ? updateReel(V) : { onMedia: false, covering: false };
    var hss = hsc ? updateHs(V) : { pinned: false, flooded: false };
    nearScenes(V);
    updateHeader(rs, hss);
    updateFog(rs, hss, V);
    updateFill(V);
    updateDrive();
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

  /* ---- Width changes only: remeasure, re-split, re-reserve ---- */
  var lastW = window.innerWidth, resizeT = 0;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(function () {
      measure();
      if (booted) splitAll(false);
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

  /* ---- Ticker: repeat the set until it spans the row, then double it for the loop ---- */
  function fillTicker(ticker) {
    if (!ticker) return;
    var track = ticker.querySelector('.ticker__track');
    var set = ticker.querySelector('.ticker__set');
    if (!track || !set || track._filled) return;
    track._filled = true;
    var unit = set.innerHTML, guard = 0;
    while (set.offsetWidth < ticker.offsetWidth && guard++ < 8) set.insertAdjacentHTML('beforeend', unit);
    track.appendChild(set.cloneNode(true));
    track.style.setProperty('--ticker-dur', Math.max(18, set.offsetWidth / 42) + 's');
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
      cur.classList.toggle('is-light', !!(t && t.closest('.reel__frame, .hdr.is-on-media')));
      cur.classList.toggle('is-inv', !!(t && t.closest('.inv, .hdr.is-inv, .hs__flood, .ftr__legal')));
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
    wrapWordI();
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
  /* late layout shifts (images, fonts): the scene lengths depend on real sizes */
  window.addEventListener('load', function () { if (booted) { layoutHs(); requestTick(); } });
  /* i18n rewrote the text: split the new copy, keep already-revealed state */
  document.addEventListener('vias:lang', function () {
    if (!booted) return;
    splitAll(true);
    wrapWordI();
    layoutHs();
    reserveFaq();
    requestTick();
  });
})();
