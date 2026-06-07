/* =====================================================================
   Vias Media — Cookie consent (GDPR / DSGVO + TTDSG)
   Granular banner + settings modal. GA4 (gtag.js) loads ONLY after
   explicit analytics opt-in. Bilingual (EN/DE) via internal string
   table — re-renders live on .lang-toggle clicks (does not rely on
   i18n.js, since this markup is injected after i18n has run).
   Public API: window.viasCookieConsent = { openSettings, revoke }
   ===================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'vias-consent';
  var LANG_KEY = 'vias-lang';
  var GA_ID = 'G-SG2CEGV9XV';
  var PRIVACY_URL = 'datenschutz.html';

  /* ── Strings (EN natural copy / DE reuses Akkermann's DSGVO copy) ── */

  var STRINGS = {
    en: {
      bannerTitle: 'This website uses cookies',
      bannerBody: 'We use technically necessary cookies as well as — with your consent — analytics cookies (Google Analytics) to understand how our website is used. The legal basis is Art. 6(1)(a) GDPR, § 25(1) TTDSG. Your consent is voluntary and can be withdrawn at any time. Details in our <a href="' + PRIVACY_URL + '" class="cc-link">Privacy Policy</a>.',
      settings: 'Settings',
      decline: 'Decline',
      acceptAll: 'Accept all',
      modalTitle: 'Cookie settings',
      modalClose: 'Close',
      necessaryName: 'Necessary',
      necessaryDesc: 'Enable core functionality such as page navigation. The website cannot function properly without these cookies.',
      alwaysActive: 'Always active',
      analyticsName: 'Analytics (Google Analytics)',
      analyticsDesc: 'Help us understand how visitors interact with the website. IP addresses are anonymised. Provider: Google Ireland Ltd. More in our <a href="' + PRIVACY_URL + '" class="cc-link">Privacy Policy</a>.',
      analyticsLabel: 'Analytics cookies',
      save: 'Save selection',
      ariaBanner: 'Cookie settings',
      ariaModal: 'Manage cookie settings'
    },
    de: {
      bannerTitle: 'Diese Website verwendet Cookies',
      bannerBody: 'Wir setzen technisch notwendige Cookies sowie — mit Ihrer Einwilligung — Analyse-Cookies (Google Analytics) ein, um die Nutzung unserer Website zu verstehen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TTDSG. Ihre Einwilligung ist freiwillig und jederzeit widerrufbar. Details in der <a href="' + PRIVACY_URL + '" class="cc-link">Datenschutzerklärung</a>.',
      settings: 'Einstellungen',
      decline: 'Ablehnen',
      acceptAll: 'Alle akzeptieren',
      modalTitle: 'Cookie-Einstellungen',
      modalClose: 'Schließen',
      necessaryName: 'Notwendig',
      necessaryDesc: 'Ermöglichen grundlegende Funktionen wie Seitennavigation. Ohne diese Cookies kann die Website nicht richtig funktionieren.',
      alwaysActive: 'Immer aktiv',
      analyticsName: 'Analyse (Google Analytics)',
      analyticsDesc: 'Helfen uns zu verstehen, wie Besucher mit der Website interagieren. IP-Adressen werden anonymisiert. Anbieter: Google Ireland Ltd. Mehr in der <a href="' + PRIVACY_URL + '" class="cc-link">Datenschutzerklärung</a>.',
      analyticsLabel: 'Analyse-Cookies',
      save: 'Auswahl speichern',
      ariaBanner: 'Cookie-Einstellungen',
      ariaModal: 'Cookie-Einstellungen verwalten'
    }
  };

  function lang() {
    try {
      var l = localStorage.getItem(LANG_KEY);
      return (l === 'de') ? 'de' : 'en';
    } catch (e) { return 'en'; }
  }

  function t() { return STRINGS[lang()]; }

  /* ── Consent state ─────────────────────────────────────── */

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }

  function saveConsent(analytics) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: analytics, ts: Date.now() }));
  }

  /* ── Google Analytics loader (gated — never loads without consent) ── */

  function loadGA() {
    if (window._gaLoaded) return;
    window._gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  /* ── Render ────────────────────────────────────────────── */

  function createBanner() {
    var s = t();
    var el = document.createElement('div');
    el.id = 'cc-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-label', s.ariaBanner);
    el.innerHTML =
      '<div class="cc-inner">' +
        '<div class="cc-text">' +
          '<p class="cc-title">' + s.bannerTitle + '</p>' +
          '<p class="cc-body">' + s.bannerBody + '</p>' +
        '</div>' +
        '<div class="cc-actions">' +
          '<button class="cc-btn cc-btn--ghost" id="cc-settings-btn">' + s.settings + '</button>' +
          '<button class="cc-btn cc-btn--outline" id="cc-decline-btn">' + s.decline + '</button>' +
          '<button class="cc-btn cc-btn--accent" id="cc-accept-btn">' + s.acceptAll + '</button>' +
        '</div>' +
      '</div>';
    return el;
  }

  function createModal() {
    var s = t();
    var el = document.createElement('div');
    el.id = 'cc-modal-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', s.ariaModal);
    el.innerHTML =
      '<div class="cc-modal">' +
        '<div class="cc-modal__header">' +
          '<p class="cc-modal__title">' + s.modalTitle + '</p>' +
          '<button class="cc-modal__close" id="cc-modal-close" aria-label="' + s.modalClose + '">' +
            '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="cc-modal__body">' +
          '<div class="cc-category">' +
            '<div class="cc-category__info">' +
              '<p class="cc-category__name">' + s.necessaryName + '</p>' +
              '<p class="cc-category__desc">' + s.necessaryDesc + '</p>' +
            '</div>' +
            '<div class="cc-toggle cc-toggle--locked" aria-label="' + s.alwaysActive + '"><span class="cc-toggle__label">' + s.alwaysActive + '</span></div>' +
          '</div>' +
          '<div class="cc-category">' +
            '<div class="cc-category__info">' +
              '<p class="cc-category__name">' + s.analyticsName + '</p>' +
              '<p class="cc-category__desc">' + s.analyticsDesc + '</p>' +
            '</div>' +
            '<label class="cc-toggle" aria-label="' + s.analyticsLabel + '">' +
              '<input type="checkbox" id="cc-analytics-toggle" class="cc-toggle__input">' +
              '<span class="cc-toggle__track"><span class="cc-toggle__thumb"></span></span>' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<div class="cc-modal__footer">' +
          '<button class="cc-btn cc-btn--outline" id="cc-save-btn">' + s.save + '</button>' +
          '<button class="cc-btn cc-btn--accent" id="cc-accept-all-btn">' + s.acceptAll + '</button>' +
        '</div>' +
      '</div>';
    return el;
  }

  /* ── Live re-render on language switch ─────────────────── */

  function refreshTexts() {
    var s = t();

    var banner = document.getElementById('cc-banner');
    if (banner) {
      banner.setAttribute('aria-label', s.ariaBanner);
      var title = banner.querySelector('.cc-title');
      var body = banner.querySelector('.cc-body');
      var settingsBtn = banner.querySelector('#cc-settings-btn');
      var declineBtn = banner.querySelector('#cc-decline-btn');
      var acceptBtn = banner.querySelector('#cc-accept-btn');
      if (title) title.textContent = s.bannerTitle;
      if (body) body.innerHTML = s.bannerBody;
      if (settingsBtn) settingsBtn.textContent = s.settings;
      if (declineBtn) declineBtn.textContent = s.decline;
      if (acceptBtn) acceptBtn.textContent = s.acceptAll;
    }

    var overlay = document.getElementById('cc-modal-overlay');
    if (overlay) {
      overlay.setAttribute('aria-label', s.ariaModal);
      var mTitle = overlay.querySelector('.cc-modal__title');
      var mClose = overlay.querySelector('#cc-modal-close');
      var names = overlay.querySelectorAll('.cc-category__name');
      var descs = overlay.querySelectorAll('.cc-category__desc');
      var lockedLabel = overlay.querySelector('.cc-toggle--locked .cc-toggle__label');
      var lockedWrap = overlay.querySelector('.cc-toggle--locked');
      var analyticsLabelWrap = overlay.querySelector('label.cc-toggle');
      var saveBtn = overlay.querySelector('#cc-save-btn');
      var acceptAllBtn = overlay.querySelector('#cc-accept-all-btn');

      if (mTitle) mTitle.textContent = s.modalTitle;
      if (mClose) mClose.setAttribute('aria-label', s.modalClose);
      if (names[0]) names[0].textContent = s.necessaryName;
      if (descs[0]) descs[0].innerHTML = s.necessaryDesc;
      if (names[1]) names[1].textContent = s.analyticsName;
      if (descs[1]) descs[1].innerHTML = s.analyticsDesc;
      if (lockedLabel) lockedLabel.textContent = s.alwaysActive;
      if (lockedWrap) lockedWrap.setAttribute('aria-label', s.alwaysActive);
      if (analyticsLabelWrap) analyticsLabelWrap.setAttribute('aria-label', s.analyticsLabel);
      if (saveBtn) saveBtn.textContent = s.save;
      if (acceptAllBtn) acceptAllBtn.textContent = s.acceptAll;
    }
  }

  /* ── Logic ─────────────────────────────────────────────── */

  function hideBanner(banner) {
    banner.classList.add('cc-banner--hidden');
    setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 400);
  }

  function showModal(banner) {
    if (document.getElementById('cc-modal-overlay')) return;

    var overlay = createModal();
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('cc-modal-overlay--visible'); });

    var analyticsToggle = overlay.querySelector('#cc-analytics-toggle');
    var consent = getConsent();
    if (consent && consent.analytics) analyticsToggle.checked = true;

    overlay.querySelector('#cc-modal-close').addEventListener('click', function () { closeModal(overlay); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(overlay); });

    overlay.querySelector('#cc-save-btn').addEventListener('click', function () {
      var allow = analyticsToggle.checked;
      saveConsent(allow);
      if (allow) loadGA();
      closeModal(overlay);
      if (banner) hideBanner(banner);
    });

    overlay.querySelector('#cc-accept-all-btn').addEventListener('click', function () {
      saveConsent(true);
      loadGA();
      closeModal(overlay);
      if (banner) hideBanner(banner);
    });
  }

  function closeModal(overlay) {
    overlay.classList.remove('cc-modal-overlay--visible');
    setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
  }

  /* ── Init ──────────────────────────────────────────────── */

  function init() {
    var consent = getConsent();

    if (consent !== null) {
      if (consent.analytics) loadGA();
      return;
    }

    var banner = createBanner();
    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add('cc-banner--visible'); });

    banner.querySelector('#cc-accept-btn').addEventListener('click', function () {
      saveConsent(true);
      loadGA();
      hideBanner(banner);
    });

    banner.querySelector('#cc-decline-btn').addEventListener('click', function () {
      saveConsent(false);
      hideBanner(banner);
    });

    banner.querySelector('#cc-settings-btn').addEventListener('click', function () {
      showModal(banner);
    });
  }

  /* Re-render visible banner/modal copy live when the user switches language. */
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.lang-toggle')) {
      setTimeout(refreshTexts, 0);
    }
  });

  /* ── Public API ────────────────────────────────────────── */

  window.viasCookieConsent = {
    openSettings: function () {
      var existingBanner = document.getElementById('cc-banner');
      showModal(existingBanner || null);
    },
    revoke: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
