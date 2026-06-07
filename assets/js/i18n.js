/* =====================================================================
   Vias Media — language toggle (EN / DE)
   Default copy in the HTML is English. German is provided here as a
   dictionary; the toggle swaps textContent / placeholders / <title> and
   persists the choice. Original English is cached in WeakMaps (DOM stays clean).
   Header/menu/footer items that carry data-de are swapped via that attribute.
   ===================================================================== */
(function () {
  'use strict';

  var KEY = 'vias-lang';

  /* English → German. Anything not listed simply stays English. */
  var DE = {
    /* Titles */
    'Vias Media — Web Design & Development Agency': 'Vias Media — Agentur für Webdesign & Entwicklung',
    'Services — Vias Media': 'Leistungen — Vias Media',
    'Work — Vias Media': 'Projekte — Vias Media',
    'Contact — Start a Project with Vias Media': 'Kontakt — Projekt starten mit Vias Media',

    /* Global / nav-ish words */
    'Services': 'Leistungen',
    'Work': 'Projekte',
    'Reviews': 'Bewertungen',
    'Contact': 'Kontakt',
    'Company': 'Unternehmen',
    'Connect': 'Verbinden',
    'Privacy': 'Datenschutz',
    'Terms': 'AGB',
    'Get a quote': 'Angebot anfordern',
    'Learn more': 'Mehr erfahren',
    'Developer': 'Entwickler',
    'Web Studio': 'Web Studio',
    'Local Partner': 'Lokaler Partner',
    '5 Star Review Rating': '5-Sterne-Bewertung',

    /* CTAs */
    'Get a free quote': 'Kostenloses Angebot',
    'Free, no-obligation quote — you own everything we build.':
      'Kostenloses, unverbindliches Angebot – die fertige Website gehört ganz Ihnen.',
    'Start a Project': 'Projekt starten',
    'Start a project': 'Projekt starten',
    'See our work': 'Unsere Projekte ansehen',
    'See all work': 'Alle Projekte ansehen',
    'View services': 'Leistungen ansehen',
    'View our services': 'Unsere Leistungen ansehen',
    'Explore all services': 'Alle Leistungen entdecken',
    'Get in touch': 'Kontakt aufnehmen',
    'Free Consultation': 'Kostenlose Beratung',
    'Send enquiry': 'Anfrage senden',
    "Let's Talk!": 'Sprechen wir!',
    'Looking for a digital partner?': 'Auf der Suche nach einem digitalen Partner?',

    /* Hero */
    'Websites that get trades & small businesses more work': 'Websites, die Handwerkern & kleinen Unternehmen mehr Aufträge bringen',
    'Vias Media builds fast, professional websites for new and growing local businesses — with a special focus on trades and Handwerker. Get found on Google, look the part, and turn visitors into booked jobs.':
      'Vias Media baut schnelle, professionelle Websites für neue und wachsende lokale Unternehmen – mit besonderem Fokus auf Handwerker. Werden Sie bei Google gefunden, treten Sie professionell auf und machen Sie aus Besuchern echte Aufträge.',

    /* Why a website (home) */
    "Why it's worth it": 'Warum es sich lohnt',
    'Most customers check you online before they call': 'Die meisten Kunden prüfen Sie online, bevor sie anrufen',
    "If they can't find you — or what they find looks dated — they call the next name on the list. A clear, fast website turns that search into a booked job.":
      'Wenn sie Sie nicht finden – oder das Gefundene veraltet wirkt – rufen sie den nächsten Namen auf der Liste an. Eine klare, schnelle Website macht aus dieser Suche einen festen Auftrag.',
    'Found first': 'Zuerst gefunden',
    'When someone searches your trade and town, you want to be the result they tap — not the competitor who showed up instead.':
      'Wenn jemand nach Ihrem Gewerk und Ort sucht, wollen Sie das Ergebnis sein, das angetippt wird – nicht der Mitbewerber, der stattdessen erschien.',
    'Trusted faster': 'Schneller Vertrauen',
    'A professional site answers "are these people legit?" before you\'ve even spoken — so the enquiries you get are already warm.':
      'Eine professionelle Website beantwortet „sind die seriös?" schon vor dem ersten Gespräch – die Anfragen, die Sie erhalten, sind also bereits vorgewärmt.',
    'Working 24/7': 'Rund um die Uhr aktiv',
    "Your site quotes, reassures, and captures enquiries while you're on the tools or asleep — no missed calls, no lost jobs.":
      'Ihre Website informiert, überzeugt und sammelt Anfragen, während Sie arbeiten oder schlafen – keine verpassten Anrufe, keine verlorenen Aufträge.',

    /* Features */
    'Why Vias Media': 'Warum Vias Media',
    'Built for how local businesses really work': 'Gemacht für die Art, wie lokale Unternehmen wirklich arbeiten',
    'We design and build websites for tradespeople and small businesses — focused on getting you found, earning trust, and turning clicks into calls.':
      'Wir gestalten und bauen Websites für Handwerker und kleine Unternehmen – mit Fokus darauf, gefunden zu werden, Vertrauen zu schaffen und aus Klicks Anrufe zu machen.',
    'Pixel-perfect design': 'Pixelgenaues Design',
    'Every pixel serves a purpose. We craft interfaces that look beautiful and convert visitors into customers.':
      'Jedes Pixel hat einen Zweck. Wir gestalten Oberflächen, die schön aussehen und Besucher zu Kunden machen.',
    'Reliable development': 'Zuverlässige Entwicklung',
    'Clean, accessible code built to scale. Performance, reliability, and web standards at the core.':
      'Sauberer, barrierefreier Code, der mitwächst. Performance, Zuverlässigkeit und Webstandards im Kern.',
    'True partnership': 'Echte Partnerschaft',
    "We work as an extension of your team — whether it's a single project or long-term growth support.":
      'Wir arbeiten als Erweiterung Ihres Teams – ob einzelnes Projekt oder langfristige Wachstumsbegleitung.',
    'Results-driven': 'Ergebnisorientiert',
    'Data-led optimization that drives organic traffic, qualified leads, and measurable growth.':
      'Datenbasierte Optimierung für organischen Traffic, qualifizierte Leads und messbares Wachstum.',
    'Built to be found': 'Gefunden werden',
    'Local SEO so nearby customers find you first when they search for what you do.':
      'Lokales SEO, damit Kunden in Ihrer Nähe Sie zuerst finden, wenn sie nach Ihren Leistungen suchen.',
    'Fast on every phone': 'Schnell auf jedem Handy',
    'Built to load instantly on mobile, where most local searches actually happen.':
      'Gebaut, um auf dem Smartphone sofort zu laden – wo die meisten lokalen Suchanfragen stattfinden.',
    'Support that sticks around': 'Support, der bleibt',
    "We're here after launch with updates, fixes, and the advice to keep growing.":
      'Wir sind auch nach dem Launch da – mit Updates, Korrekturen und Rat fürs weitere Wachstum.',

    /* Services */
    'How we help your business grow': 'Wie wir Ihrem Unternehmen beim Wachsen helfen',
    'From full builds to ongoing optimization, we cover everything needed to launch, grow, and scale your digital presence.':
      'Von der kompletten Umsetzung bis zur laufenden Optimierung decken wir alles ab, um Ihre digitale Präsenz zu starten, auszubauen und zu skalieren.',
    'Web Design': 'Webdesign',
    'Conversion-focused websites designed to capture your brand and engage your audience.':
      'Conversion-orientierte Websites, die Ihre Marke einfangen und Ihr Publikum begeistern.',
    'Web Development': 'Webentwicklung',
    'Development': 'Entwicklung',
    'Robust, accessible front-end and full-stack development built for real-world performance.':
      'Robuste, barrierefreie Front-End- und Full-Stack-Entwicklung für echte Performance.',
    'SEO Optimization': 'SEO-Optimierung',
    'Search-first strategies to help your site rank higher and attract qualified organic traffic.':
      'Such-orientierte Strategien, damit Ihre Website besser rankt und qualifizierten organischen Traffic gewinnt.',
    'Digital Consulting': 'Digitale Beratung',
    'Consulting': 'Beratung',
    'Strategic guidance on technology, user experience, and sustainable digital growth.':
      'Strategische Beratung zu Technologie, Nutzererlebnis und nachhaltigem digitalem Wachstum.',
    'Accessibility Audits': 'Barrierefreiheits-Audits',
    'Accessibility Audit': 'Barrierefreiheits-Audit',
    'Accessibility': 'Barrierefreiheit',
    'Ensure your site meets WCAG standards and provides an inclusive experience for every user.':
      'Stellen Sie sicher, dass Ihre Website WCAG-Standards erfüllt und ein inklusives Erlebnis für alle bietet.',
    'Ongoing Support': 'Laufender Support',
    'Support': 'Support',
    'Retainers and continuous optimization to keep your site improving month after month.':
      'Retainer und kontinuierliche Optimierung, damit sich Ihre Website Monat für Monat verbessert.',
    'Everything you need to grow online': 'Alles, was Sie für Ihr Online-Wachstum brauchen',
    'We combine thoughtful web design, robust development, and local SEO to help small businesses and tradespeople win more work — from brand-new ventures to established local names.':
      'Wir verbinden durchdachtes Webdesign, robuste Entwicklung und lokales SEO, damit kleine Unternehmen und Handwerker mehr Aufträge gewinnen – vom brandneuen Betrieb bis zum etablierten lokalen Namen.',

    /* Process (services page) */
    'How we work': 'So arbeiten wir',
    'A clear route from idea to launch': 'Ein klarer Kurs von der Idee bis zum Launch',
    "Like charting a course, we move in deliberate stages — so you always know where the project is and what's next.":
      'Wie beim Setzen eines Kurses gehen wir in bewussten Etappen vor – damit Sie stets wissen, wo das Projekt steht und was als Nächstes kommt.',
    'Discover': 'Entdecken',
    'We learn your business, audience, and goals, then map the scope and success metrics.':
      'Wir lernen Ihr Unternehmen, Ihre Zielgruppe und Ihre Ziele kennen und definieren Umfang und Erfolgskennzahlen.',
    'Design': 'Gestalten',
    'Wireframes and high-fidelity design focused on clarity, brand, and conversion.':
      'Wireframes und hochwertiges Design mit Fokus auf Klarheit, Marke und Conversion.',
    'Build': 'Entwickeln',
    'Accessible, performant development with progress you can review at every milestone.':
      'Barrierefreie, performante Entwicklung mit Fortschritt, den Sie bei jedem Meilenstein prüfen können.',
    'Grow': 'Wachsen',
    'Launch, measure, and optimize — turning traffic into qualified, lasting leads.':
      'Launchen, messen und optimieren – Traffic wird zu qualifizierten, dauerhaften Leads.',
    "Let's build something that works.": 'Lassen Sie uns etwas bauen, das funktioniert.',

    /* Work / portfolio */
    'Our latest projects': 'Unsere neuesten Projekte',
    "A selection of websites we've built for tradespeople and local businesses — each focused on getting found and winning more work.":
      'Eine Auswahl an Websites, die wir für Handwerker und lokale Unternehmen gebaut haben – jede mit Fokus darauf, gefunden zu werden und mehr Aufträge zu gewinnen.',
    'Eagle Air HVAC Website Redesign': 'Eagle Air HVAC Website-Relaunch',
    'A faster, cleaner site that turned a dated brochure into a lead engine for a regional HVAC company.':
      'Eine schnellere, klarere Website, die aus einer veralteten Broschüre eine Lead-Maschine für ein regionales HLK-Unternehmen machte.',
    'Inquiries since launch': 'Anfragen seit Launch',
    'Lighthouse performance': 'Lighthouse-Performance',
    'Akkerman Stroy Digital Presence': 'Akkerman Stroy Digitale Präsenz',
    'A search-first rebuild that put a growing construction firm on the map for the queries that matter.':
      'Ein such-orientierter Neuaufbau, der ein wachsendes Bauunternehmen für die relevanten Suchanfragen sichtbar machte.',
    'Organic traffic': 'Organischer Traffic',
    'For target keywords': 'Für Ziel-Keywords',
    'Bloom Studio Portfolio': 'Bloom Studio Portfolio',
    "An inclusive, WCAG-compliant portfolio that opened a creative studio's work to a wider audience.":
      'Ein inklusives, WCAG-konformes Portfolio, das die Arbeit eines Kreativstudios einem breiteren Publikum öffnete.',
    'WCAG conformance': 'WCAG-Konformität',
    'Time on site': 'Verweildauer',
    'Northline Digital Rebrand': 'Northline Digital Rebranding',
    'A full rebrand and build that gave an agency a confident, conversion-ready presence.':
      'Ein komplettes Rebranding samt Umsetzung, das einer Agentur einen selbstbewussten, conversion-starken Auftritt verlieh.',
    'Design to launch': 'Design bis Launch',
    'Qualified leads': 'Qualifizierte Leads',
    'Branding': 'Branding',
    'See all work': 'Alle Projekte ansehen',
    'Your project next': 'Ihr Projekt als Nächstes',
    'Ready to be our next success story?': 'Bereit, unsere nächste Erfolgsgeschichte zu werden?',

    /* Testimonials */
    'Backed by real experience': 'Auf echter Erfahrung gebaut',
    'Real results. Real businesses.': 'Echte Ergebnisse. Echte Unternehmen.',
    'Vias Media completely transformed our online presence. The new site is faster, cleaner, and our inquiries have doubled since launch.':
      'Vias Media hat unsere Online-Präsenz komplett verwandelt. Die neue Website ist schneller, klarer und unsere Anfragen haben sich seit dem Launch verdoppelt.',
    'Director — Eagle Air HVAC': 'Geschäftsführer — Eagle Air HVAC',
    'Professional, responsive, and detail-oriented. They delivered exactly what we needed and were always available for questions.':
      'Professionell, reaktionsschnell und detailorientiert. Sie lieferten genau das, was wir brauchten, und waren immer für Fragen erreichbar.',
    'Marketing — Akkerman Stroy': 'Marketing — Akkerman Stroy',
    'The accessibility improvements they made opened our business to a whole new audience. Highly recommended.':
      'Die Verbesserungen bei der Barrierefreiheit öffneten unser Geschäft für ein völlig neues Publikum. Sehr zu empfehlen.',
    'Founder — Bloom Studio': 'Gründerin — Bloom Studio',
    "Our SEO rankings improved significantly within three months of working together. They know exactly what they're doing.":
      'Unsere SEO-Rankings verbesserten sich innerhalb von drei Monaten deutlich. Sie wissen genau, was sie tun.',
    'MD — Sterling Properties': 'Geschäftsführer — Sterling Properties',

    /* Final CTA + footer */
    'Ready when you are': 'Bereit, wenn Sie es sind',
    'Ready to win more local customers?': 'Bereit für mehr lokale Kunden?',
    'Built for trades & small businesses.': 'Für Handwerker & kleine Unternehmen gemacht.',
    '© 2026 Vias Media. All rights reserved.': '© 2026 Vias Media. Alle Rechte vorbehalten.',

    /* Contact page */
    "Let's chart your next move": 'Planen wir Ihren nächsten Schritt',
    "Tell us a little about your project and we'll get back to you within one business day with clear next steps.":
      'Erzählen Sie uns kurz von Ihrem Projekt und wir melden uns innerhalb eines Werktags mit klaren nächsten Schritten.',
    'What happens next': 'Was als Nächstes passiert',
    'Prefer to talk now?': 'Lieber direkt sprechen?',
    'Call us': 'Anrufen',
    'Call': 'Anrufen',
    'A line or two is fine — or just say hi and we\'ll take it from there…':
      'Ein, zwei Sätze genügen – oder sagen Sie einfach Hallo, den Rest klären wir.',
    'We review your brief': 'Wir prüfen Ihre Anfrage',
    'A real person reads it — no autoresponders.': 'Ein echter Mensch liest sie – keine Autoresponder.',
    'A free consultation call': 'Ein kostenloses Beratungsgespräch',
    'We talk goals, scope, and timeline.': 'Wir besprechen Ziele, Umfang und Zeitplan.',
    'A clear proposal': 'Ein klares Angebot',
    'Fixed scope, timeline, and pricing.': 'Fester Umfang, Zeitplan und Preis.',
    'Prefer email?': 'Lieber per E-Mail?',
    'Name': 'Name',
    'Email': 'E-Mail',
    'Phone': 'Telefon',
    'What do you need?': 'Was brauchen Sie?',
    'Project details': 'Projektdetails',
    'Not sure yet': 'Noch unsicher',
    'Select a service…': 'Leistung auswählen…',
    'Please enter a valid email address.': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    'Please enter a valid phone number.': 'Bitte geben Sie eine gültige Telefonnummer ein.',
    'Enquiry sent!': 'Anfrage gesendet!',
    "Thanks — we'll be in touch within one business day.": 'Danke – wir melden uns innerhalb eines Werktags.',
    'Got it': 'Verstanden',

    /* Placeholders */
    'Your full name': 'Ihr vollständiger Name',
    'Company (optional)': 'Unternehmen (optional)',
    'Phone (optional)': 'Telefon (optional)',
    'Tell us about your project, goals, and timeline…': 'Erzählen Sie uns von Ihrem Projekt, Ihren Zielen und dem Zeitplan…'
  };

  function norm(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  var enText = new WeakMap();   // element -> original English textContent
  var enHtml = new WeakMap();   // element -> original English innerHTML (data-de-html)
  var enPh = new WeakMap();     // element -> original English placeholder
  var enTitle = document.title;

  var LEAF_SEL = 'h1,h2,h3,h4,h5,h6,p,span,a,li,button,blockquote,figcaption,label,option';
  var current = 'en';

  function apply(lang) {
    var de = (lang === 'de');
    document.documentElement.lang = de ? 'de' : 'en';

    /* 1 — explicit data-de elements (header, nav, mobile menu) */
    document.querySelectorAll('[data-de]').forEach(function (el) {
      if (!enText.has(el)) enText.set(el, el.textContent);
      el.textContent = de ? el.getAttribute('data-de') : enText.get(el);
    });

    /* 1b — rich elements that keep inline markup (e.g. <span class="em">
       emphasis). Swap innerHTML so the markup survives in both languages. */
    document.querySelectorAll('[data-de-html]').forEach(function (el) {
      if (!enHtml.has(el)) enHtml.set(el, el.innerHTML);
      el.innerHTML = de ? el.getAttribute('data-de-html') : enHtml.get(el);
    });

    /* 2 — leaf text via dictionary */
    document.querySelectorAll(LEAF_SEL).forEach(function (el) {
      if (el.hasAttribute('data-de')) return;   // handled above
      if (el.closest('[data-de-html]')) return; // inside a rich-markup element
      if (el.children.length) return;           // leaf only
      var key = enText.has(el) ? enText.get(el) : norm(el.textContent);
      if (!Object.prototype.hasOwnProperty.call(DE, key)) return;
      if (!enText.has(el)) enText.set(el, key);
      el.textContent = de ? DE[key] : enText.get(el);
    });

    /* 3 — input / textarea placeholders */
    document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(function (el) {
      var key = enPh.has(el) ? enPh.get(el) : el.getAttribute('placeholder');
      if (!Object.prototype.hasOwnProperty.call(DE, key)) return;
      if (!enPh.has(el)) enPh.set(el, key);
      el.setAttribute('placeholder', de ? DE[key] : enPh.get(el));
    });

    /* 4 — document title */
    document.title = (de && DE[enTitle]) ? DE[enTitle] : enTitle;

    /* 5 — toggle display (current first, other second) — every .lang-toggle
       (navbar + the one packed into the hamburger overlay) stays in sync */
    document.querySelectorAll('.lang-toggle').forEach(function (toggle) {
      var cur = toggle.querySelector('.lang-cur');
      var alt = toggle.querySelector('.lang-alt');
      if (cur) cur.textContent = de ? 'DE' : 'EN';
      if (alt) alt.textContent = de ? 'EN' : 'DE';
    });

    current = lang;
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  /* Init — use the saved choice if present; otherwise auto-detect from the
     browser's preferred languages (German speakers land in German on the
     first visit). The manual toggle always overrides and is then persisted. */
  function detectLang() {
    try {
      var langs = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || navigator.userLanguage || 'en'];
      for (var i = 0; i < langs.length; i++) {
        if (/^de\b/i.test(langs[i])) return 'de';
        if (/^en\b/i.test(langs[i])) return 'en';
      }
    } catch (e) {}
    return 'en';
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var initial = saved === 'de' || saved === 'en' ? saved : detectLang();
  apply(initial);

  document.querySelectorAll('.lang-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      apply(current === 'en' ? 'de' : 'en');
    });
  });
})();
