/* =====================================================================
   Vias Media v2 "Bauplan" — page interactions
   contact links · theme · menu sheet · smooth scroll · split text ·
   reveals · project reel (pinned scene) · fog · FAQ · cursor · ticker
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
     lines (reveals) or words (ink fill) and redoes it on width / language.
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
          out[out.length - 1].t += '\u00a0' + word;
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
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
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
    el.innerHTML = lines.map(function (ln, i) {
      ln[0] = { t: ln[0].t, cls: ln[0].cls, sp: false };
      return '<span class="ln" aria-hidden="true" style="--i:' + i + '"><span>' + runs(ln) + '</span></span>';
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
  }
  var lineEls = [].slice.call(document.querySelectorAll('[data-split]'));
  var fillEls = reduced ? [] : [].slice.call(document.querySelectorAll('[data-fill]'));
  function splitAll(fresh) {
    lineEls.forEach(function (el) { if (fresh) el._src = null; splitLines(el); });
    fillEls.forEach(function (el) { if (fresh) el._src = null; splitWords(el); });
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

  /* ---- One scroll tick for header, reel, fog and the statement ---- */
  var refreshCursor = null;   /* set by the cursor block on fine pointers */
  var fog = document.querySelector('.fog');
  var noFog = [].slice.call(document.querySelectorAll('[data-nofog]'));
  var ticking = false;
  function tick() {
    ticking = false;
    if (root.classList.contains('menu-open')) return;   /* a pinned body reports scrollY 0 */
    var V = vh();
    var state = scene ? updateReel(V) : { onMedia: false, covering: false };
    if (hdr) {
      hdr.classList.toggle('is-scrolled', window.scrollY > 8);
      hdr.classList.toggle('is-on-media', state.onMedia);
    }
    if (fog) {
      var off = state.covering;
      for (var i = 0; i < noFog.length && !off; i++) {
        off = noFog[i].getBoundingClientRect().top < V - 8;
      }
      fog.classList.toggle('is-off', off);
    }
    updateFill(V);
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
     Cursor (fine pointers): a drafting crosshair with guide lines and a
     label. The native cursor comes back for keyboard use.
     ===================================================================== */
  if (finePointer) {
    var cur = document.createElement('div');
    cur.className = 'cur';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<i class="cur__h"></i><i class="cur__v"></i><i class="cur__x"></i><b class="cur__tag"></b>';
    document.body.appendChild(cur);
    var cH = cur.children[0], cV = cur.children[1], cX = cur.children[2], cTag = cur.children[3];
    var px = 0, py = 0, tx = 0, ty = 0, tagRaf = 0;
    function tagLoop() {
      tx += (px - tx) * (reduced ? 1 : 0.2);
      ty += (py - ty) * (reduced ? 1 : 0.2);
      cTag.style.translate = tx.toFixed(1) + 'px ' + ty.toFixed(1) + 'px';
      tagRaf = (Math.abs(px - tx) + Math.abs(py - ty) > 0.3) ? window.requestAnimationFrame(tagLoop) : 0;
    }
    /* what is under the pointer decides the cursor's state; also re-read while
       scrolling, because the page moves under a resting pointer */
    function readTarget(t) {
      t = t && t.closest ? t : null;
      var link = t && t.closest('a, button, label, [role="button"]');
      var tagged = t && t.closest('[data-cur]');
      cur.classList.toggle('is-link', !!link);
      if (tagged) {
        var label = (root.lang === 'en' && tagged.getAttribute('data-cur-en')) || tagged.getAttribute('data-cur');
        if (cTag.textContent !== label) cTag.textContent = label;
      }
      cur.classList.toggle('has-tag', !!tagged);
    }
    refreshCursor = function () {
      if (cur.classList.contains('is-live')) readTarget(document.elementFromPoint(px, py));
    };
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      px = e.clientX; py = e.clientY;
      root.classList.add('has-cur');
      cur.classList.add('is-live');
      /* the individual translate property keeps position independent of the
         rotate/scale states set in CSS */
      cH.style.translate = '0 ' + py + 'px';
      cV.style.translate = px + 'px 0';
      cX.style.translate = px + 'px ' + py + 'px';
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
  /* i18n rewrote the text: split the new copy, keep already-revealed state */
  document.addEventListener('vias:lang', function () {
    if (!booted) return;
    splitAll(true);
    reserveFaq();
    requestTick();
  });
})();
