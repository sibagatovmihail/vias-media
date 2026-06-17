/* =====================================================================
   Vias Media — site interactions
   header spacer · topbar scroll-collapse · mobile menu · parallax · reveal
   ===================================================================== */
(function () {
  'use strict';

  /* ---- Contact details — SINGLE SOURCE OF TRUTH ----------------------
     Everything on the site (hero buttons, contact page, sticky mobile bar)
     reads from here.
       phoneHref  — full international number, digits + leading + only.
       phoneText  — how the number is shown to visitors.
       whatsapp   — number for wa.me, country code + number, NO + or spaces.
       waMessage  — pre-filled WhatsApp message (helps the hesitant owner start). */
  var CONTACT = {
    phoneHref: '+4916095761094',
    phoneText: '+49 160 95761094',
    whatsapp:  '4916095761094',
    waMessage: 'Hi Vias Media — I got your card and would like a free quote for my website.'
  };
  function wireContactLinks() {
    var tel = 'tel:' + CONTACT.phoneHref.replace(/[^\d+]/g, '');
    var wa  = 'https://wa.me/' + CONTACT.whatsapp.replace(/\D/g, '') +
              '?text=' + encodeURIComponent(CONTACT.waMessage);
    document.querySelectorAll('[data-contact="call"]').forEach(function (el) {
      el.setAttribute('href', tel);
      var t = el.querySelector('[data-contact-text]');
      if (t) t.textContent = CONTACT.phoneText;
    });
    document.querySelectorAll('[data-contact="whatsapp"]').forEach(function (el) {
      el.setAttribute('href', wa);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
  }
  wireContactLinks();

  var root = document.documentElement;
  var header = document.getElementById('header');
  var spacer = document.getElementById('header-spacer');
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- syncHeaderHeight(): reserve space for the fixed header ----
     Sets the spacer height + --header-height to the FULL (expanded) header.
     Called ONLY on load + width-resize — never on scroll — so collapsing the
     topbar is purely visual and never reflows the page (no scroll jump).
     We temporarily remove .scrolled so we always measure the full height. */
  function syncHeaderHeight() {
    if (!header) return;
    var wasScrolled = header.classList.contains('scrolled');
    if (wasScrolled) header.classList.remove('scrolled');
    var h = header.offsetHeight;
    /* Expanded topbar height — collapsed away on scroll. The full-height phone
       menu adds this back when .scrolled so it fills the space the topbar vacated. */
    var topbar = header.querySelector('.topbar');
    var topbarH = topbar ? topbar.offsetHeight : 0;
    if (wasScrolled) header.classList.add('scrolled');
    if (spacer) spacer.style.height = h + 'px';
    root.style.setProperty('--header-height', h / 16 + 'rem');
    root.style.setProperty('--topbar-height', topbarH / 16 + 'rem');
  }

  /* ---- Scroll: toggle collapsed state (visual only) + parallax ---- */
  var lastScrolled = null;
  function onScroll() {
    if (header) {
      var scrolled = window.scrollY > 50;
      if (scrolled !== lastScrolled) {
        header.classList.toggle('scrolled', scrolled);
        lastScrolled = scrolled;
      }
    }
    requestParallax();
    requestShots();
  }

  /* ---- Menu ----
     The hamburger (≤999px) toggles the accordion that unfolds inside the navbar
     card. On phones (≤767px) the accordion is full-height and the page scroll
     is locked. The hamburger morphs bars⇄X in place. */
  var hamburger = document.getElementById('hamburger');
  var navbar = document.querySelector('.navbar');
  var navDrop = document.getElementById('navDrop');
  var fullMQ = window.matchMedia('(max-width: 47.9375rem)');

  function setHamburger(open) {
    if (!hamburger) return;
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function openMenu() {
    if (!navbar) return;
    navbar.classList.add('nav-open');
    document.body.classList.add('nav-open-lock');
    setHamburger(true);
    /* On the full-height phone menu, lock the page scroll behind it. */
    if (fullMQ.matches) document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!navbar) return;
    navbar.classList.remove('nav-open');
    document.body.classList.remove('nav-open-lock');
    setHamburger(false);
    document.body.style.overflow = '';
  }
  function toggleMenu() {
    if (navbar && navbar.classList.contains('nav-open')) { closeMenu(); } else { openMenu(); }
  }

  if (hamburger) hamburger.addEventListener('click', toggleMenu);
  if (navDrop) {
    navDrop.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---- Dark-mode toggle (persists to localStorage; restored inline in <head>) ---- */
  function setTheme(t) {
    document.documentElement.setAttribute('data-palette', t);
    try { localStorage.setItem('vias-theme', t); } catch (e) {}
  }
  [].slice.call(document.querySelectorAll('.theme-toggle')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-palette');
      setTheme(cur === 'ember-dark' ? 'ember' : 'ember-dark');
    });
  });

  /* ---- Parallax (transform-only, rAF-throttled) ---- */
  var parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking = false;
  function applyParallax() {
    ticking = false;
    var y = window.scrollY;
    for (var i = 0; i < parallaxEls.length; i++) {
      var el = parallaxEls[i];
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
      el.style.transform = 'translate3d(0,' + (-y * speed).toFixed(1) + 'px,0)';
    }
  }
  function requestParallax() {
    if (prefersReduced || !parallaxEls.length) return;
    if (!ticking) { ticking = true; window.requestAnimationFrame(applyParallax); }
  }

  /* ---- Screenshot device parallax (case pages) ----
     The plain [data-parallax] above translates by absolute scrollY, correct
     only near the top of the page. Device frames sit mid-page, so this drives
     them by their position RELATIVE TO THE VIEWPORT instead: each frame drifts
     gently as it crosses the screen, giving the desktop + phone layers depth.
     Subtle by design (speed ≈ 0.04–0.08 of the element's own height). Disabled
     under reduced motion — the frames then sit perfectly still. */
  var shotEls = [].slice.call(document.querySelectorAll('[data-shot-parallax]'));
  var shotTicking = false;
  function applyShots() {
    shotTicking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < shotEls.length; i++) {
      var el = shotEls[i];
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;        /* off-screen — skip */
      var speed = parseFloat(el.getAttribute('data-shot-parallax')) || 0;
      /* progress: -1 entering from the bottom → +1 leaving past the top */
      var progress = ((vh - r.top) / (vh + r.height)) * 2 - 1;
      el.style.transform = 'translate3d(0,' + (-progress * el.offsetHeight * speed).toFixed(1) + 'px,0)';
    }
  }
  function requestShots() {
    if (prefersReduced || !shotEls.length) return;
    if (!shotTicking) { shotTicking = true; window.requestAnimationFrame(applyShots); }
  }

  /* ---- Reveal-on-scroll ---- */
  function initReveal() {
    var els = [].slice.call(document.querySelectorAll('.reveal'));
    if (prefersReduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Contact form: validation + Web3Forms AJAX + success modal ---- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var contactForm = document.getElementById('contact-form');

  function showFieldError(input, errorEl) {
    if (input) {
      if (input.closest('.field')) input.closest('.field').classList.add('field--error');
      input.setAttribute('aria-invalid', 'true');   /* announce invalid state to AT */
    }
    if (errorEl) errorEl.hidden = false;              /* role="alert" -> announced on reveal */
  }
  function clearFieldError(input, errorEl) {
    if (input) {
      if (input.closest('.field')) input.closest('.field').classList.remove('field--error');
      input.removeAttribute('aria-invalid');
    }
    if (errorEl) errorEl.hidden = true;
  }
  var lastFocusedBeforeModal = null;
  function showSuccessModal() {
    var overlay = document.getElementById('form-success-overlay');
    if (!overlay) return;
    lastFocusedBeforeModal = document.activeElement;   /* restore on close */
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    var closeBtn = document.getElementById('form-success-close');
    if (closeBtn) closeBtn.focus();                    /* move focus into the dialog */
  }
  function handleFormSubmit(e) {
    e.preventDefault();

    /* Name is the only hard-required text field — the project-details textarea
       is optional so a hesitant owner can send a one-line enquiry. */
    var requiredText = ['contact-name']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (requiredText.some(function (el) { return !el.value.trim(); })) return;

    var email = document.getElementById('contact-email');
    var emailErr = document.getElementById('contact-email-error');
    var emailOk = email && email.value.trim() && EMAIL_RE.test(email.value.trim());
    if (!emailOk) showFieldError(email, emailErr); else clearFieldError(email, emailErr);

    var phone = document.getElementById('contact-phone');
    var phoneErr = document.getElementById('contact-phone-error');
    var phoneOk = true;
    if (phone && phone.value.trim()) {
      var digits = phone.value.replace(/\D/g, '');
      phoneOk = digits.length >= 7 && digits.length <= 15;
    }
    if (!phoneOk) showFieldError(phone, phoneErr); else clearFieldError(phone, phoneErr);

    if (!emailOk || !phoneOk) return;

    var submitBtn = contactForm.querySelector('button[type="submit"]');
    var label = submitBtn.querySelector('span');
    var original = label.textContent;
    label.textContent = 'Sending…';
    submitBtn.disabled = true;

    fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success) { contactForm.reset(); showSuccessModal(); }
      })
      .catch(function () { /* silent */ })
      .then(function () { label.textContent = original; submitBtn.disabled = false; });
  }
  function initSuccessModal() {
    var overlay = document.getElementById('form-success-overlay');
    var closeBtn = document.getElementById('form-success-close');
    if (!overlay) return;
    function close() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      if (lastFocusedBeforeModal && lastFocusedBeforeModal.focus) lastFocusedBeforeModal.focus();
    }
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') { close(); return; }
      /* Single-control dialog: keep Tab focus on the close button (focus trap). */
      if (e.key === 'Tab' && closeBtn) { e.preventDefault(); closeBtn.focus(); }
    });
  }
  /* ---- Custom service dropdown (replaces native <select>) ---- */
  function initFormSelect_serviceSelect() {
    var wrapper = document.getElementById('service-select');
    if (!wrapper) return;
    var trigger = wrapper.querySelector('.form-select__trigger');
    var menu    = wrapper.querySelector('.form-select__menu');
    var valueEl = wrapper.querySelector('.form-select__value');
    var hidden  = wrapper.querySelector('input[type="hidden"]');
    var options = Array.prototype.slice.call(wrapper.querySelectorAll('.form-select__option'));
    var activeIndex = -1;

    function isOpen() { return menu.classList.contains('open'); }
    function setActive(i) {
      if (i < 0) i = options.length - 1;
      if (i >= options.length) i = 0;
      activeIndex = i;
      options.forEach(function (o, idx) { o.classList.toggle('is-active', idx === i); });
      menu.setAttribute('aria-activedescendant', options[i].id);
      if (options[i].scrollIntoView) options[i].scrollIntoView({ block: 'nearest' });
    }
    function selectedIndex() {
      for (var i = 0; i < options.length; i++) {
        if (options[i].getAttribute('aria-selected') === 'true') return i;
      }
      return -1;
    }
    function open() {
      menu.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      var sel = selectedIndex();
      setActive(sel >= 0 ? sel : 0);
      menu.focus();
    }
    function close(returnFocus) {
      menu.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      menu.removeAttribute('aria-activedescendant');
      options.forEach(function (o) { o.classList.remove('is-active'); });
      if (returnFocus) trigger.focus();
    }
    function choose(opt) {
      options.forEach(function (o) { o.setAttribute('aria-selected', 'false'); });
      opt.setAttribute('aria-selected', 'true');
      valueEl.textContent = opt.textContent;
      valueEl.classList.remove('form-select__value--placeholder');
      hidden.value = opt.getAttribute('data-value');
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen() ? close(false) : open();
    });
    /* Open from the keyboard (button Enter/Space already fire click, so guard) */
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!isOpen()) open(); }
    });
    options.forEach(function (opt) {
      opt.addEventListener('click', function () { choose(opt); close(true); });
      opt.addEventListener('mousemove', function () {
        var idx = options.indexOf(opt);
        if (idx !== activeIndex) setActive(idx);
      });
    });
    menu.addEventListener('keydown', function (e) {
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); setActive(activeIndex + 1); break;
        case 'ArrowUp':   e.preventDefault(); setActive(activeIndex - 1); break;
        case 'Home':      e.preventDefault(); setActive(0); break;
        case 'End':       e.preventDefault(); setActive(options.length - 1); break;
        case 'Enter':
        case ' ':         e.preventDefault(); if (activeIndex >= 0) { choose(options[activeIndex]); close(true); } break;
        case 'Escape':    e.preventDefault(); close(true); break;
        case 'Tab':       close(false); break;
      }
    });
    document.addEventListener('click', function (e) { if (!wrapper.contains(e.target)) close(false); });
  }
  initFormSelect_serviceSelect();

  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
    var emailInput = document.getElementById('contact-email');
    var emailErr2 = document.getElementById('contact-email-error');
    if (emailInput) emailInput.addEventListener('input', function () { clearFieldError(emailInput, emailErr2); });
    var phoneInput = document.getElementById('contact-phone');
    var phoneErr2 = document.getElementById('contact-phone-error');
    if (phoneInput) phoneInput.addEventListener('input', function () { clearFieldError(phoneInput, phoneErr2); });
  }
  initSuccessModal();

  /* ---- Why-us carousel: full-bleed snap scroll; arrows live in the head ---- */
  function initSliders() {
    /* Generic snap-scroll slider engine: looks up viewport/prev/next/controls
       by a shared `data-slider="<name>"` value, since the arrow controls live
       in the section head, not inside the slider element itself. */
    document.querySelectorAll('[data-slider]').forEach(function (root) {
      var name = root.getAttribute('data-slider');
      function find(attr) { return document.querySelector('[' + attr + '="' + name + '"]'); }
      var vp = find('data-slider-viewport');
      if (!vp || !vp.children.length) return;
      var prev = find('data-slider-prev');
      var next = find('data-slider-next');
      var controls = find('data-slider-controls');

      /* Resting scrollLeft for each slide, so it lines up at the snap start.
         Reads each child's real position instead of assuming a fixed card width,
         so it works for equal-width cards (homepage) AND variable-width slides
         (case-study gallery: wide laptop frame, narrow phone frame) alike. */
      function positions() {
        var base = vp.children[0].offsetLeft;
        return [].map.call(vp.children, function (c) { return c.offsetLeft - base; });
      }
      /* Scroll to the next/previous slide relative to where we are now, so one
         slide advances per click no matter how wide it is. */
      function go(dir) {
        var pos = positions(), cur = vp.scrollLeft, target = null, i;
        if (dir > 0) {
          for (i = 0; i < pos.length; i++) { if (pos[i] > cur + 2) { target = pos[i]; break; } }
          if (target === null) target = pos[pos.length - 1];
        } else {
          for (i = pos.length - 1; i >= 0; i--) { if (pos[i] < cur - 2) { target = pos[i]; break; } }
          if (target === null) target = 0;
        }
        vp.scrollTo({ left: target, behavior: 'smooth' });
      }
      function update() {
        var max = vp.scrollWidth - vp.clientWidth;
        if (controls) controls.hidden = max <= 2;          /* nothing to scroll */
        if (prev) prev.disabled = vp.scrollLeft <= 2;
        if (next) next.disabled = vp.scrollLeft >= max - 2;
      }
      if (prev) prev.addEventListener('click', function () { go(-1); });
      if (next) next.addEventListener('click', function () { go(1); });

      var raf;
      vp.addEventListener('scroll', function () {
        if (raf) window.cancelAnimationFrame(raf);
        raf = window.requestAnimationFrame(update);
      }, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* ---- FAQ accordion: click a question to expand; opening one closes others ---- */
  function initFaq() {
    var items = [].slice.call(document.querySelectorAll('.faq-item'));
    if (!items.length) return;
    items.forEach(function (item) {
      var btn = item.querySelector('.faq-item__q');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');
        items.forEach(function (other) {
          other.classList.remove('is-open');
          var b = other.querySelector('.faq-item__q');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---- Hero title typing animation ----
     Reveals the hero <h1> one glyph at a time. The hard part is keeping the
     wrapping identical from the first frame to the last: per-glyph spans defeat
     `text-wrap: balance` (Safari only re-balances once the content stops
     mutating, so the finished title would re-wrap — "direkt" jumping to the
     next line at the end). So we first read the browser's BALANCED line breaks
     off the static title with a Range (no DOM mutation), then rebuild the title
     with those breaks LOCKED in as <br>, each glyph a <span> hidden via
     visibility. Hard breaks can't be re-flowed, so the layout is balanced AND
     fixed for good. The caret is an absolutely-positioned ::after on the
     current glyph, so it adds no layout. Spans are kept after typing (never
     collapsed back to a text node) so the resting layout equals the final
     frame. i18n captured the English key on load (before this runs) and
     translates by replacing el.textContent wholesale on a toggle. Skipped
     under reduced motion. */
  function initHeroType() {
    var el = document.querySelector('.hero__title');
    if (!el || el.children.length) return;          // pure-text leaf only
    var full = el.textContent;
    if (prefersReduced || !full.trim()) return;     // a11y: keep full title

    /* Read how the browser balanced the (still static) title: walk it char by
       char with a Range and group by vertical position. No DOM mutation, so we
       capture the real balanced break points to lock in. */
    function balancedLines() {
      var node = el.firstChild;
      if (!node || node.nodeType !== 3) return [full];
      var range = document.createRange();
      var lines = [], cur = '', top0 = null;
      for (var i = 0; i < full.length; i++) {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        var rs = range.getClientRects();
        var r = rs.length ? rs[rs.length - 1] : null;
        if (r && r.height) {
          if (top0 === null) top0 = r.top;
          else if (r.top > top0 + 1) { lines.push(cur); cur = ''; top0 = r.top; }
        }
        cur += full.charAt(i);
      }
      if (cur) lines.push(cur);
      return lines
        .map(function (l) { return l.replace(/^\s+|\s+$/g, ''); })  // drop the soft-wrap spaces at line edges
        .filter(function (l) { return l.length; });
    }

    /* Rebuild: a <br> between each balanced line, every glyph in its own .char
       span (spaces stay text nodes). Returns the glyphs in type order. */
    function build(lines) {
      el.textContent = '';
      var glyphs = [];
      for (var li = 0; li < lines.length; li++) {
        if (li > 0) el.appendChild(document.createElement('br'));
        var line = lines[li];
        for (var c = 0; c < line.length; c++) {
          if (line.charAt(c) === ' ') { el.appendChild(document.createTextNode(' ')); continue; }
          var s = document.createElement('span');
          s.className = 'char';
          s.textContent = line.charAt(c);
          el.appendChild(s);
          glyphs.push(s);
        }
      }
      return glyphs;
    }

    function reveal(glyphs) {
      var i = 0, prev = null;
      (function tick() {
        if (i < glyphs.length) {
          /* If the title's text was swapped out from under us — e.g. the user
             toggled EN/DE while typing — our spans are detached. Stop quietly
             so we never write the stale language back over the new one. */
          if (!glyphs[i].isConnected) return;
          if (prev) prev.classList.remove('cursor');
          glyphs[i].classList.add('typed', 'cursor');
          prev = glyphs[i];
          i++;
          window.setTimeout(tick, 30);
        } else {
          /* Let the caret blink a moment, then drop it — keep the spans exactly
             as laid out (no collapse) so the resting state is the final frame. */
          window.setTimeout(function () {
            if (!glyphs.length || !glyphs[0].isConnected) return;  // text replaced meanwhile — leave it
            if (prev) prev.classList.remove('cursor');
            el.classList.remove('is-typing');
          }, 900);
        }
      })();
    }

    /* Wait for the EXACT face the title paints in before measuring AND typing.
       .hero__title is .t-xl → font-weight 800 → raveo-display-extrabold.woff2
       (a *different* file from the 700 bold face); the weight is read from
       computed style so it can't drift from the CSS, and the visible text is
       passed so the *subset* face's actual glyphs are confirmed loaded. The
       face is also <link rel=preload>ed, so this is near-instant on a cold
       load. Measuring only after it resolves (and after two frames, so
       text-wrap:balance has settled) means the breaks we lock in are the real,
       balanced, web-font breaks — not the fallback's. */
    function whenFontReady(cb) {
      if (!(document.fonts && document.fonts.load && document.fonts.ready)) { cb(); return; }
      var weight = '800';
      try { weight = window.getComputedStyle(el).fontWeight || '800'; } catch (e) {}
      Promise.all([
        document.fonts.load(weight + ' 1em "Raveo Display"', full).catch(function () {}),
        document.fonts.ready
      ]).then(function () {
        window.requestAnimationFrame(function () { window.requestAnimationFrame(cb); });
      });
    }

    /* Hide the un-typed title (it stays laid out, so it can still be measured)
       until the font is ready; then lock the balanced breaks in and type. */
    el.style.visibility = 'hidden';
    whenFontReady(function () {
      var glyphs = build(balancedLines());
      el.classList.add('is-typing');
      el.style.visibility = '';
      reveal(glyphs);
    });
  }

  /* ---- Wire up ---- */
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Resize: only re-measure when WIDTH changes. iOS Safari fires resize on
     scroll as the address bar shows/hides (height changes, width doesn't) —
     guarding on width keeps the spacer from updating mid-scroll. */
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    closeMenu();
    syncHeaderHeight();
  });
  window.addEventListener('load', syncHeaderHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncHeaderHeight);
  }
  syncHeaderHeight();
  onScroll();
  initReveal();
  initSliders();
  initFaq();
  initHeroType();
  requestParallax();
  requestShots();
})();
