---
name: cookie-consent
description: Add a GDPR-compliant granular cookie-consent banner + settings modal to a static site, gating Google Analytics (GA4) behind explicit opt-in. Self-contained vanilla JS + CSS, optional bilingual. Use when adding cookie consent, a GDPR banner, GA4, or any tracking that needs DSGVO/TTDSG consent.
metadata:
  priority: 9
  pathPatterns:
    - '*.html'
    - 'assets/js/consent.js'
    - 'assets/css/consent.css'
  promptSignals:
    phrases:
      - "cookie consent"
      - "cookie banner"
      - "gdpr banner"
      - "add google analytics"
      - "ga4"
      - "gate analytics behind consent"
      - "dsgvo cookies"
retrieval:
  aliases:
    - cookie consent banner
    - gdpr cookie gate
    - ga4 consent
    - analytics opt-in
  intents:
    - add a gdpr cookie consent banner
    - load google analytics only after consent
    - add a cookie settings / revoke control
---

# GDPR Cookie Consent + GA4 Gating

A self-contained, **granular** consent system for static sites: a bottom banner + a settings modal (Necessary always-on + an Analytics toggle), with **Google Analytics 4 loaded only after the user opts in**. Two new files, wired into every page; no framework.

Legal basis it implements: Art. 6 (1)(a) DSGVO + § 25 (1) TTDSG (consent, freely given, withdrawable).

---

## Required information from the user

Ask before writing code:

1. **GA4 measurement ID** (`G-XXXXXXXXXX`). If they don't have it yet, scaffold with a `GA_MEASUREMENT_ID` placeholder in **one** spot.
2. **Privacy-page URL** (e.g. `datenschutz.html`) to link from the banner.
3. **Language(s)** — German-only, or bilingual EN/DE (this site uses `localStorage('vias-lang')` for language).

If wiring many pages, **pair with `bulk-multipage-edit`**. A complete reference implementation lives in the Akkermann Stroy project (`js/cookie-consent.js`, `styles/cookie-consent.css`) — adapt it rather than writing from scratch.

---

## Two files + per-page wiring

### 1 — `assets/js/consent.js` (IIFE, vanilla)

Structure (keep this shape):

```js
(function () {
  'use strict';
  var STORAGE_KEY = 'vias-consent';
  var GA_ID = 'G-XXXXXXXXXX';        // ← the ONE placeholder to swap
  var PRIVACY_URL = 'datenschutz.html';

  function getConsent() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; } }
  function saveConsent(analytics) { localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: analytics, ts: Date.now() })); }

  function loadGA() {                 // injected ONLY on consent — never on load
    if (window._gaLoaded) return; window._gaLoaded = true;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', GA_ID);
  }

  function init() {
    var c = getConsent();
    if (c !== null) { if (c.analytics) loadGA(); return; }   // returning visitor
    // else: inject + show banner, wire Accept all / Decline / Settings
  }
  // Accept → saveConsent(true) + loadGA(); Decline → saveConsent(false); Settings → modal with Analytics toggle

  window.viasCookieConsent = { openSettings: …, revoke: function () { localStorage.removeItem(STORAGE_KEY); } };

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
```

**Non-negotiables:**
- GA loads **only** from the accept/save-with-analytics paths or from `init()` when a stored choice has `analytics: true`. Never on first load, never on decline.
- Expose `window.viasCookieConsent.openSettings()` so a "Cookie settings" control can reopen the modal (consent must be withdrawable).
- The modal's Necessary row is **locked on**; only Analytics toggles.

**Bilingual (if needed):** keep an internal `STRINGS = { en: {…}, de: {…} }` table; pick the language from `localStorage('vias-lang')` (fallback `'en'`) and re-render the visible banner/modal text on `.lang-toggle` clicks (use `setTimeout(fn, 0)` so it runs after the site's own toggle handler updates the stored lang). **Do not** rely on the site's i18n to translate the injected DOM — the on-demand modal is injected after i18n has run.

### 2 — `assets/css/consent.css`

Style the banner (fixed bottom, slide-up), the modal overlay + card, and the toggle switch, using the **project's own design tokens** (read `tokens.css`; map any reference file's `--color-*` names to the local ones). Keep a `cc-` class prefix so nothing collides. Must read well in every palette/theme; keep breakpoints in `rem`.

### 3 — Per-page wiring (use `bulk-multipage-edit`)

On each public page:
- `<head>`: `<link rel="stylesheet" href="assets/css/consent.css">` after the main components stylesheet.
- before `</body>`: `<script src="assets/js/consent.js" defer></script>`.

Skip standalone pages with no shared shell (e.g. login). 

### 4 — Entry point on the privacy page

Put the reopen control on the **Datenschutz/privacy page** (not cluttering the footer): a button in the cookie section calling `viasCookieConsent.openSettings()`, plus a short consent/withdrawal paragraph (Art. 6 (1)(a) DSGVO, § 25 (1) TTDSG).

```html
<button type="button" class="btn btn--outline btn--sm" onclick="window.viasCookieConsent.openSettings()"><span>Cookie-Einstellungen ändern</span></button>
```

---

## Verification

```bash
grep -c "consent.css" page.html      # 1 per wired page
grep -c "consent.js"  page.html      # 1 per wired page
node --check assets/js/consent.js    # valid JS
```

In the browser (Network tab), with `localStorage` cleared:
1. First load → **no** `googletagmanager`/`gtag` request.
2. Accept (or enable Analytics in settings) → `gtag/js?id=…` loads; GA4 Realtime shows the hit.
3. Decline → still nothing loads; choice persists across reload.
4. The privacy-page button reopens the modal and lets the user change/withdraw consent.
