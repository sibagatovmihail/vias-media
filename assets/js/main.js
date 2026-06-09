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
    if (input) input.closest('.field') && input.closest('.field').classList.add('field--error');
    if (errorEl) errorEl.hidden = false;
  }
  function clearFieldError(input, errorEl) {
    if (input && input.closest('.field')) input.closest('.field').classList.remove('field--error');
    if (errorEl) errorEl.hidden = true;
  }
  function showSuccessModal() {
    var overlay = document.getElementById('form-success-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
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
    function close() { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); }
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
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
    var options = wrapper.querySelectorAll('.form-select__option');

    function open()  { menu.classList.add('open');    trigger.setAttribute('aria-expanded', 'true'); }
    function close() { menu.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.contains('open') ? close() : open();
    });
    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        options.forEach(function (o) { o.removeAttribute('aria-selected'); });
        opt.setAttribute('aria-selected', 'true');
        valueEl.textContent = opt.textContent;
        valueEl.classList.remove('form-select__value--placeholder');
        hidden.value = opt.getAttribute('data-value');
        close();
      });
    });
    document.addEventListener('click', function (e) { if (!wrapper.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
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
     Reveals the hero <h1> one glyph at a time. Every character is laid out up
     front (each glyph in a <span>, hidden via visibility; spaces stay as text
     so words wrap at the same points), so the line wrapping and centring are
     fixed from the first frame — the title never reflows or jumps as it types.
     The caret is an absolutely-positioned ::after on the current glyph, so it
     adds no layout. i18n captured the English key on load (before this runs);
     we restore a plain text node when done so EN/DE toggles still translate.
     Skipped under reduced motion. */
  function initHeroType() {
    var el = document.querySelector('.hero__title');
    if (!el || el.children.length) return;          // pure-text leaf only
    var full = el.textContent;
    if (prefersReduced || !full.trim()) return;     // a11y: keep full title

    el.textContent = '';
    var glyphs = [];
    for (var c = 0; c < full.length; c++) {
      if (full[c] === ' ') { el.appendChild(document.createTextNode(' ')); continue; }
      var s = document.createElement('span');
      s.className = 'char';
      s.textContent = full[c];
      el.appendChild(s);
      glyphs.push(s);
    }
    el.classList.add('is-typing');

    /* Reveal only once the web font is ready. If glyphs are laid out in the
       fallback font, the final collapse back to plain text (now in the web
       font) shifts the lines slightly — the "jump at the end". Waiting makes
       the typing layout and the final layout use the same font, so they match. */
    function reveal() {
      var i = 0, prev = null;
      (function tick() {
        if (i < glyphs.length) {
          if (prev) prev.classList.remove('cursor');
          glyphs[i].classList.add('typed', 'cursor');
          prev = glyphs[i];
          i++;
          window.setTimeout(tick, 30);
        } else {
          /* Let the caret blink a moment, then collapse back to a plain text
             node — a clean leaf so i18n can translate it on later toggles. */
          window.setTimeout(function () {
            el.classList.remove('is-typing');
            el.textContent = full;
          }, 900);
        }
      })();
    }
    /* Safari/WebKit can resolve `document.fonts.ready` before the exact face
       the title uses has actually finished loading and painted (a long-
       standing WebKit Font Loading API timing bug — invisible on desktop
       Chrome's mobile emulation, which uses Blink). That lets typing start
       (and finish) in the fallback font; when Raveo Display then arrives,
       WebKit repaints with different glyph metrics — the slight jump only
       seen on real iOS Safari. Explicitly requesting that exact face makes
       the wait track its real load state, not the unreliable aggregate. */
    function whenFontReady(cb) {
      if (!(document.fonts && document.fonts.load && document.fonts.ready)) { cb(); return; }
      Promise.all([
        document.fonts.load('700 1em "Raveo Display"').catch(function () {}),
        document.fonts.ready
      ]).then(cb);
    }
    whenFontReady(reveal);
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
