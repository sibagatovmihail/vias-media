/* =============================================================================
   Vias Media — Google reviews in the testimonials marquee
   -----------------------------------------------------------------------------
   Data comes from /api/reviews: a serverless function that calls the Google
   Places API server-side and is cached on Vercel's CDN for 24 hours. Google is
   queried at most once per day regardless of traffic, no API key reaches the
   browser, and no Maps SDK is loaded.

   Until GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID are set on the Vercel
   project, the hand-written cards already in index.html stay exactly as they
   are — this script only ever replaces them with real Google reviews.
   ============================================================================= */
(function () {
  'use strict';

  var ENDPOINT = '/api/reviews';
  var track = document.querySelector('.testimonials__track');
  var ratingEl = document.getElementById('reviewsRating');
  if (!track) return;

  var QUOTE_SVG = '<div><svg width="20" height="16" viewBox="0 0 20 16" fill="var(--text-muted)" opacity="0.48" aria-hidden="true">'
    + '<path d="M0 16V9.6C0 6.4 0.7 4.1 2.1 2.7C3.5 0.9 5.5 0 8 0V3.2C6.5 3.5 5.4 4.2 4.7 5.3C4.2 6.1 4 7 4 8H8V16H0ZM12 16V9.6C12 6.4 12.7 4.1 14.1 2.7C15.5 0.9 17.5 0 20 0V3.2C18.5 3.5 17.4 4.2 16.7 5.3C16.2 6.1 16 7 16 8H20V16H12Z"/></svg></div>';

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function stars(n) {
    var out = '<span class="testimonial-card__stars" aria-label="' + n + ' von 5 Sternen">';
    for (var i = 1; i <= 5; i++) {
      out += '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">'
        + '<path d="m8 1.333 2.06 4.174 4.607.674-3.334 3.248.787 4.588L8 11.513l-4.12 2.504.787-4.588L1.333 6.18l4.607-.674L8 1.333Z"'
        + ' fill="var(--accent)" opacity="' + (i <= n ? '1' : '0.25') + '"/></svg>';
    }
    return out + '</span>';
  }

  /* Long Google reviews would blow out the fixed card height, so trim on a word
     boundary and keep the full text in the title attribute. */
  function trim(t, max) {
    t = String(t).replace(/\s+/g, ' ').trim();
    return t.length > max ? t.slice(0, max).replace(/\s\S*$/, '') + '…' : t;
  }

  function card(r) {
    return '<figure class="card testimonial-card">'
      + QUOTE_SVG
      + stars(Math.round(r.rating || 5))
      + '<blockquote class="t-body" style="color: var(--text-sec);" title="' + esc(r.text) + '">'
      + esc(trim(r.text, 260)) + '</blockquote>'
      + '<figcaption class="testimonial-card__author">'
      + '<span class="t-body">' + esc(r.author) + '</span>'
      + '<span class="t-small">' + esc(r.relativeTime || 'Google') + '</span>'
      + '</figcaption></figure>';
  }

  function reveal() {
    /* Only ever reveals. The nav link stays put on every page either way —
       hiding it from here would only affect index.html, which is the one page
       this script loads on, and that made the nav differ between pages. */
    var section = document.getElementById('reviews');
    if (section) section.classList.add('is-live');
  }

  function render(d) {
    /* One set; main.js appends the aria-hidden copy for the seamless loop. */
    track.innerHTML = d.reviews.map(card).join('');
    if (window.viasFillMarquee) window.viasFillMarquee(track);
    reveal();

    if (ratingEl && d.rating && d.total) {
      ratingEl.innerHTML = stars(Math.round(d.rating))
        + '<span class="t-small">' + d.rating.toFixed(1) + ' · '
        + d.total + ' Google-Rezensionen</span>';
      ratingEl.hidden = false;
    }
  }

  var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);

  fetch(ENDPOINT, { headers: { accept: 'application/json' },
                    signal: ctrl ? ctrl.signal : undefined })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      clearTimeout(timer);
      if (d && d.ok && d.reviews && d.reviews.length) { render(d); return; }
      /* eslint-disable-next-line no-console */
      console.info('[reviews] Keine Live-Google-Rezensionen — '
        + (d && d.configured === false
            ? 'GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID sind auf dem Server nicht gesetzt'
            : (d && d.reason) || 'unbekannter Grund')
        + '. Die vorhandenen Karten bleiben stehen.');
    })
    .catch(function (e) {
      clearTimeout(timer);
      /* eslint-disable-next-line no-console */
      console.info('[reviews] Abruf von ' + ENDPOINT + ' fehlgeschlagen ('
        + (e && e.name === 'AbortError' ? 'Zeitüberschreitung' : (e && e.message))
        + '). Die vorhandenen Karten bleiben stehen.');
    });
})();
