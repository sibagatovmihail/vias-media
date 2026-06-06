/* =====================================================================
   Vias Media — site interactions
   header spacer · topbar scroll-collapse · mobile menu · parallax · reveal
   ===================================================================== */
(function () {
  'use strict';

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
    if (wasScrolled) header.classList.add('scrolled');
    if (spacer) spacer.style.height = h + 'px';
    root.style.setProperty('--header-height', h / 16 + 'rem');
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
    setHamburger(true);
    /* On the full-height phone menu, lock the page scroll behind it. */
    if (fullMQ.matches) document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!navbar) return;
    navbar.classList.remove('nav-open');
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

    var requiredText = ['contact-name', 'contact-message']
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
  function initWhySlider() {
    var vp = document.querySelector('[data-why-viewport]');
    if (!vp || !vp.children.length) return;
    var prev = document.querySelector('[data-why-prev]');
    var next = document.querySelector('[data-why-next]');
    var controls = document.querySelector('[data-why-controls]');

    function step() {
      /* Advance by exactly one card (its width + the flex gap). */
      var s = window.getComputedStyle(vp);
      var gap = parseFloat(s.columnGap || s.gap) || 0;
      return vp.children[0].getBoundingClientRect().width + gap;
    }
    function update() {
      var max = vp.scrollWidth - vp.clientWidth;
      if (controls) controls.hidden = max <= 2;          /* nothing to scroll */
      if (prev) prev.disabled = vp.scrollLeft <= 2;
      if (next) next.disabled = vp.scrollLeft >= max - 2;
    }
    if (prev) prev.addEventListener('click', function () { vp.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { vp.scrollBy({ left: step(), behavior: 'smooth' }); });

    var raf;
    vp.addEventListener('scroll', function () {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
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
  initWhySlider();
  initFaq();
  requestParallax();
})();
