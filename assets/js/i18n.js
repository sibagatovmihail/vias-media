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
    /* Titles (homepage title/description are German-default in the HTML now,
       localized via data-en in i18n's title/meta handler — not via this dict) */
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
    'A clean, fast site that shows your work and makes getting a quote obvious.':
      'Eine klare, schnelle Website, die Ihre Arbeit zeigt und den Weg zur Anfrage offensichtlich macht.',
    'Web Development': 'Webentwicklung',
    'Development': 'Entwicklung',
    'Hand-built, accessible code that loads fast on every phone.':
      'Handgebauter, barrierefreier Code, der auf jedem Smartphone schnell lädt.',
    'SEO Optimization': 'SEO-Optimierung',
    'Local SEO so you show up when nearby customers search your trade and town.':
      'Lokales SEO, damit Sie erscheinen, wenn Kunden in der Nähe nach Ihrem Gewerk und Ort suchen.',
    'Digital Consulting': 'Digitale Beratung',
    'Consulting': 'Beratung',
    'Straight answers on what your business needs online and what it\'ll cost.':
      'Klare Antworten, was Ihr Betrieb online wirklich braucht und was es kostet.',
    'Accessibility Audits': 'Barrierefreiheits-Audits',
    'Accessibility Audit': 'Barrierefreiheits-Audit',
    'Accessibility': 'Barrierefreiheit',
    'We test your site against WCAG so every customer can use it and you stay compliant.':
      'Wir prüfen Ihre Website nach WCAG, damit jeder Kunde sie nutzen kann und Sie rechtssicher bleiben.',
    'Ongoing Support': 'Laufender Support',
    'Support': 'Support',
    'Updates, fixes, and small improvements every month after launch.':
      'Updates, Fehlerbehebungen und kleine Verbesserungen jeden Monat nach dem Launch.',
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
    'Luxe Bouquets Online Store': 'Luxe Bouquets Online-Shop',
    "A florist's store rebuilt around its photography and a date-picked checkout — beautiful, and built to sell.":
      'Ein Floristik-Shop, neu gebaut rund um die Fotografie und einen Checkout mit Wunsch-Lieferdatum — schön und zum Verkaufen gemacht.',
    'Online orders': 'Online-Bestellungen',
    'Avg. order value': 'Ø Bestellwert',
    'Safari Online Clothing Shop': 'Safari Online-Modeshop',
    'A fast, mobile-first fashion storefront with a single-page checkout that turns browsers into buyers.':
      'Ein schneller, mobil-first gebauter Mode-Shop mit Ein-Seiten-Checkout, der aus Besuchern Käufer macht.',
    'Conversion rate': 'Conversion-Rate',
    'Cart abandonment': 'Kaufabbrüche',
    'E-commerce': 'E-Commerce',
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
    'Our new shop looks as good as our flowers — and customers actually order online now instead of just calling.':
      'Unser neuer Shop sieht so gut aus wie unsere Blumen — und Kund:innen bestellen jetzt online, statt nur anzurufen.',
    'Founder — Luxe Bouquets': 'Gründerin — Luxe Bouquets',
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
    'Tell us about your project, goals, and timeline…': 'Erzählen Sie uns von Ihrem Projekt, Ihren Zielen und dem Zeitplan…',

    /* ===== Case-study pages (work-*.html) ===== */
    /* Page titles */
    'Eagle Air HVAC Website Redesign — Vias Media': 'Eagle Air HVAC Website-Relaunch — Vias Media',
    'Akkerman Stroy Digital Presence — Vias Media': 'Akkerman Stroy Digitale Präsenz — Vias Media',
    'Luxe Bouquets Online Store — Vias Media': 'Luxe Bouquets Online-Shop — Vias Media',
    'Safari Online Clothing Shop — Vias Media': 'Safari Online-Modeshop — Vias Media',

    /* Shared scaffold labels */
    'Web Design & Development': 'Webdesign & Entwicklung',
    'Web Design & SEO': 'Webdesign & SEO',
    'Web Design & E-commerce': 'Webdesign & E-Commerce',
    'Overview': 'Überblick',
    'The challenge': 'Die Herausforderung',
    'Our approach': 'Unser Vorgehen',
    'A closer look': 'Genauer hingeschaut',
    'The results': 'Die Ergebnisse',
    '← Previous': '← Zurück',
    'Next →': 'Weiter →',

    /* Meta + facts */
    'Role': 'Rolle',
    'Sector': 'Branche',
    'Year': 'Jahr',
    'Client': 'Kunde',
    'Timeline': 'Zeitrahmen',
    'Platform': 'Plattform',
    'Markets': 'Regionen',
    'Design & Build': 'Design & Umsetzung',
    'Heating & Cooling': 'Heizung & Klima',
    'Design & SEO': 'Design & SEO',
    'Construction': 'Bau',
    'Florist': 'Floristik',
    'Fashion Retail': 'Modehandel',
    'Fashion retail': 'Modehandel',
    'Design, Development': 'Design, Entwicklung',
    'Web Design, SEO': 'Webdesign, SEO',
    'Web Design, E-commerce': 'Webdesign, E-Commerce',
    '3 weeks': '3 Wochen',
    '4 weeks': '4 Wochen',
    '5 weeks': '5 Wochen',
    'Hand-coded static': 'Handcodiert, statisch',

    /* Stat labels */
    'Load time on 4G': 'Ladezeit im 4G-Netz',
    'Service-area pages': 'Seiten je Einzugsgebiet',
    'Delivery option': 'Lieferoption',
    'Load time': 'Ladezeit',

    /* Eagle Air */
    "A dated brochure, rebuilt into a lead engine that loads in under a second — and turns Sarasota's hot-day panic searches into booked visits.":
      'Eine veraltete Broschüren-Website, neu gebaut zur Lead-Maschine, die in unter einer Sekunde lädt — und aus Panik-Suchen an heißen Tagen in Sarasota gebuchte Termine macht.',
    'A team that shows up fast — with a site to match': 'Ein Team, das schnell zur Stelle ist — mit einer Website, die mithält',
    "Eagle Air are Sarasota's trusted HVAC crew: same-day repairs, flat-rate pricing, fifteen years on the tools. But their old website didn't say any of that quickly. It was a five-year-old template — heavy, slow, and hard to use on a phone, which is exactly where a homeowner with a dead AC starts looking.":
      'Eagle Air ist Sarasotas vertraute HLK-Crew: Reparatur am selben Tag, Festpreise, fünfzehn Jahre Erfahrung. Doch ihre alte Website sagte all das nicht schnell genug. Sie war eine fünf Jahre alte Vorlage — schwer, langsam und am Handy kaum bedienbar, genau dort, wo Hausbesitzer mit defekter Klimaanlage zu suchen beginnen.',
    'We rebuilt it around a single job: make it obvious that Eagle Air can help, and make booking a visit one tap away.':
      'Wir haben sie um eine einzige Aufgabe herum neu gebaut: klar zu machen, dass Eagle Air helfen kann — und einen Termin nur einen Fingertipp entfernt.',
    'Slow, and invisible where it mattered': 'Langsam und unsichtbar, wo es zählte',
    "The old site took over four seconds to load on 4G and buried the phone number. Prospective customers couldn't tell what Eagle Air did or how to reach them — so on a 35° afternoon, they tapped the next result instead.":
      'Die alte Seite lud im 4G-Netz über vier Sekunden und versteckte die Telefonnummer. Interessenten erkannten weder, was Eagle Air macht, noch wie man sie erreicht — und tippten an einem 35-°C-Nachmittag einfach auf das nächste Ergebnis.',
    'Strip it back to one job': 'Auf eine Aufgabe reduziert',
    'Mobile-first rebuild': 'Neubau mobile-first',
    'Hand-coded from scratch, designed for the phone first — the page does one thing: get a quote.':
      'Von Grund auf handcodiert, fürs Handy zuerst gestaltet — die Seite tut eine Sache: ein Angebot einholen.',
    'Booking always in reach': 'Buchen immer griffbereit',
    'The phone number and a "Book a visit" button stay within thumb reach on every screen.':
      'Telefonnummer und ein „Termin buchen"-Button bleiben auf jedem Bildschirm in Daumenreichweite.',
    'Tuned for speed': 'Auf Tempo getrimmt',
    'Compressed imagery, lazy loading, and trimmed third-party scripts to hit a 98 Lighthouse score.':
      'Komprimierte Bilder, Lazy Loading und reduzierte Drittanbieter-Skripte für einen Lighthouse-Wert von 98.',
    'Built for speed': 'Auf Tempo gebaut',
    'Fast enough to win the click': 'Schnell genug für den Klick',
    'On mobile, every second of load time costs customers. We measured relentlessly and shipped a site that loads in under a second on a normal phone connection.':
      'Am Handy kostet jede Sekunde Ladezeit Kunden. Wir haben unermüdlich gemessen und eine Seite ausgeliefert, die bei normaler Mobilverbindung in unter einer Sekunde lädt.',
    'Down from 4.2 seconds on the old site': 'Vorher 4,2 Sekunden auf der alten Seite',
    'Across every screen': 'Auf jedem Bildschirm',
    'A site that pays for itself': 'Eine Website, die sich auszahlt',

    /* Akkerman Stroy */
    'A search-first rebuild that put a growing construction firm on the map for the queries that matter — across Mecklenburg-Vorpommern and Berlin.':
      'Ein such-orientierter Neubau, der ein wachsendes Bauunternehmen für die relevanten Suchanfragen sichtbar machte — in Mecklenburg-Vorpommern und Berlin.',
    'Real craft that nobody could find': 'Echtes Handwerk, das niemand fand',
    'Akkerman Stroy do meticulous work — Trockenbau, flooring, tiling, full renovations — for clients across Mecklenburg-Vorpommern and Berlin. Their reputation travelled by word of mouth, but online they were almost invisible: competitors ranked for every local search while their own name barely surfaced.':
      'Akkerman Stroy arbeitet akribisch — Trockenbau, Bodenverlegung, Fliesen, Komplettsanierungen — für Kunden in Mecklenburg-Vorpommern und Berlin. Ihr Ruf verbreitete sich mündlich, online aber waren sie fast unsichtbar: Mitbewerber rankten für jede lokale Suche, während ihr eigener Name kaum auftauchte.',
    'We rebuilt the site around how people actually search for a Handwerker — by trade and by town — so the right customers find Akkerman first.':
      'Wir haben die Seite darum herum gebaut, wie Menschen wirklich nach einem Handwerker suchen — nach Gewerk und nach Ort — damit die richtigen Kunden Akkerman zuerst finden.',
    'Invisible to the people searching for them': 'Unsichtbar für die, die sie suchten',
    'There was no structure for Google to index and nothing aimed at the towns Akkerman serve. A firm with a waiting list of happy clients was losing new ones to whoever showed up first.':
      'Es gab keine Struktur, die Google indexieren konnte, und nichts, was auf die Orte zugeschnitten war, die Akkerman bedient. Ein Betrieb mit Warteliste zufriedener Kunden verlor neue an die, die zuerst auftauchten.',
    'Build for the search, not the slideshow': 'Für die Suche gebaut, nicht für die Bildershow',
    'Search-first structure': 'Such-orientierte Struktur',
    'One clear page per service and service area, so every local query has a page to land on.':
      'Eine klare Seite je Leistung und Einzugsgebiet, damit jede lokale Suche eine Landeseite hat.',
    'Local content & markup': 'Lokale Inhalte & Markup',
    'Wrote real landing copy and added schema, a sitemap, and clean metadata Google can read.':
      'Echte Landing-Texte geschrieben und Schema, Sitemap sowie saubere Metadaten ergänzt, die Google lesen kann.',
    'Earned the rankings': 'Rankings verdient',
    'Tuned page speed and mobile usability, then tracked positions weekly and refined.':
      'Ladezeit und mobile Bedienbarkeit optimiert, dann wöchentlich die Positionen verfolgt und nachgeschärft.',
    'Found first': 'Zuerst gefunden',
    'From nowhere to number one': 'Vom Nichts auf Platz eins',
    'Within months, Akkerman ranked top for their core trades in the regions they serve — and the organic traffic climbed steadily with it.':
      'Binnen Monaten rankte Akkerman für seine Kerngewerke in den bedienten Regionen ganz oben — und der organische Traffic stieg stetig mit.',
    'Google — local search': 'Google — lokale Suche',
    'Organic traffic — 6 months': 'Organischer Traffic — 6 Monate',
    'Seen by the right people': 'Von den Richtigen gesehen',

    /* Luxe Bouquets */
    "A florist's shop window, brought online — where the bouquets sell themselves and ordering for a specific day takes about a minute.":
      'Das Schaufenster einer Floristin, online gebracht — wo die Sträuße sich selbst verkaufen und das Bestellen für einen bestimmten Tag etwa eine Minute dauert.',
    'Flowers worth photographing, finally online': 'Blumen, die ein Foto wert sind — endlich online',
    "Luxe Bouquets is a modern floral studio: fresh and dried arrangements, plants, and gifts, delivered across the city. Their flowers were beautiful — their website wasn't doing them justice.":
      'Luxe Bouquets ist ein modernes Floristik-Studio: frische und getrocknete Gestecke, Pflanzen und Geschenke, in der ganzen Stadt geliefert. Ihre Blumen waren wunderschön — ihre Website wurde ihnen nicht gerecht.',
    'We rebuilt the store around the photography and around the one thing customers want: to choose something lovely and have it arrive on the right day.':
      'Wir haben den Shop um die Fotografie herum neu gebaut — und um das eine, was Kunden wollen: etwas Schönes auswählen und es am richtigen Tag erhalten.',
    'Small photos, clunky orders': 'Kleine Fotos, umständliche Bestellung',
    "The old site showed dull, small images and offered only a fiddly enquiry form — with no way to buy for a specific delivery date. Customers rang up to order, or quietly didn't order at all.":
      'Die alte Seite zeigte matte, kleine Bilder und bot nur ein umständliches Anfrageformular — ohne Möglichkeit, für ein bestimmtes Lieferdatum zu kaufen. Kunden riefen zum Bestellen an oder bestellten still gar nicht.',
    'Let the flowers do the selling': 'Die Blumen verkaufen lassen',
    'Photography-led layout': 'Fotografie-geführtes Layout',
    'Full-bleed seasonal collections that feel like a print catalogue — and still load fast.':
      'Randlose Saison-Kollektionen, die sich wie ein Printkatalog anfühlen — und trotzdem schnell laden.',
    'Reassuring checkout': 'Checkout, der Sicherheit gibt',
    'A simple, calm checkout with a delivery date you pick yourself.':
      'Ein einfacher, ruhiger Checkout mit selbst gewähltem Lieferdatum.',
    'Order-for-today clarity': 'Klarheit fürs Bestellen heute',
    'Made buying obvious on every screen, designed mobile-first.':
      'Das Kaufen auf jedem Bildschirm offensichtlich gemacht, mobile-first gestaltet.',
    'Made to buy': 'Zum Kaufen gemacht',
    'From browsing to bought in a tap': 'Vom Stöbern zum Kauf mit einem Tipp',
    'Every arrangement is one tap from the cart, with delivery you can schedule — so admiring a bouquet turns straight into an order.':
      'Jedes Gesteck ist einen Tipp vom Warenkorb entfernt, mit planbarer Lieferung — so wird aus dem Bewundern eines Straußes direkt eine Bestellung.',
    'Product — ready to order': 'Produkt — sofort bestellbar',
    'Seasonal Bouquet': 'Saison-Strauß',
    'Add to cart': 'In den Warenkorb',
    'Same-day delivery': 'Lieferung am selben Tag',
    'A catalogue you can shop': 'Ein Katalog zum Einkaufen',
    'More orders, bigger baskets': 'Mehr Bestellungen, größere Warenkörbe',
    'Same-day': 'Taggleich',
    'Our website finally looks as good as our flowers — and people order from it now instead of just calling.':
      'Unsere Website sieht endlich so gut aus wie unsere Blumen — und die Leute bestellen jetzt darüber, statt nur anzurufen.',

    /* Safari */
    'An online clothing store built to browse fast and check out faster — a premium feel that holds up on the phone, where most of the shopping happens.':
      'Ein Online-Modeshop, gebaut für schnelles Stöbern und noch schnelleren Checkout — ein Premium-Gefühl, das am Handy hält, wo der Großteil des Einkaufs passiert.',
    'A storefront that feels as good as it looks': 'Ein Shop, der sich so gut anfühlt, wie er aussieht',
    "Safari sells clothes, shoes, and accessories online with a bold, confident brand. The look was there — the shopping experience wasn't keeping up, especially on mobile.":
      'Safari verkauft Kleidung, Schuhe und Accessoires online mit einer mutigen, selbstbewussten Marke. Der Look war da — das Einkaufserlebnis hielt nicht mit, vor allem mobil.',
    'We rebuilt the storefront to be fast to browse and effortless to buy from, end to end.':
      'Wir haben den Shop neu gebaut: schnell zu durchstöbern und mühelos zu kaufen, von Anfang bis Ende.',
    'Slow to browse, easy to abandon': 'Langsam beim Stöbern, leicht zum Abbrechen',
    'The old shop was fiddly on a phone — endless scrolling, a confusing cart, and a checkout that lost people halfway. Most visitors browsed on mobile and left without buying.':
      'Der alte Shop war am Handy umständlich — endloses Scrollen, ein verwirrender Warenkorb und ein Checkout, der die Leute auf halbem Weg verlor. Die meisten Besucher stöberten mobil und gingen, ohne zu kaufen.',
    'Make browsing and buying effortless': 'Stöbern und Kaufen mühelos machen',
    'Fast, filterable storefront': 'Schneller, filterbarer Shop',
    'Rebuilt mobile-first so collections load instantly and filter without a reload.':
      'Mobile-first neu gebaut, damit Kollektionen sofort laden und ohne Neuladen filtern.',
    'Single-page checkout': 'Ein-Seiten-Checkout',
    'Collapsed the cart and checkout into one calm, fast step.':
      'Warenkorb und Checkout zu einem ruhigen, schnellen Schritt zusammengefasst.',
    'Instant-feel imagery': 'Bilder, die sofort wirken',
    'Tuned product photography and load speed so browsing never stalls.':
      'Produktfotografie und Ladegeschwindigkeit optimiert, damit das Stöbern nie stockt.',
    'Built to convert': 'Auf Conversion gebaut',
    'Fewer steps, more sales': 'Weniger Schritte, mehr Verkäufe',
    'A single-page checkout removed the friction that lost customers — so more of the people browsing actually finish buying.':
      'Ein Ein-Seiten-Checkout beseitigte die Reibung, die Kunden verlor — so schließen mehr der Stöbernden den Kauf tatsächlich ab.',
    'Checkout — one page': 'Checkout — eine Seite',
    'Bag': 'Warenkorb',
    'Details': 'Daten',
    'Pay': 'Zahlen',
    'after the single-page checkout went live': 'nachdem der Ein-Seiten-Checkout live ging',
    'Shop it on any screen': 'Auf jedem Bildschirm shoppen',
    'Browsing that turns into buying': 'Stöbern, das zum Kauf wird',
    'Sales jumped the month we launched. The new shop is fast, it looks premium, and customers actually finish checking out now.':
      'Die Verkäufe sprangen im Launch-Monat nach oben. Der neue Shop ist schnell, wirkt edel, und Kunden schließen den Checkout jetzt wirklich ab.',
    'Owner — Safari': 'Inhaber — Safari',

    /* ===== Bilingual completeness (audit follow-up) ===== */

    /* FAQ (home) */
    'Questions, answered': 'Fragen, beantwortet',
    'How much does a website cost?': 'Was kostet eine Website?',
    "Every project is priced individually. After a free consultation where we discuss your goals, scope, and requirements, we send you a clear fixed quote — no hourly guesswork, no surprises.":
      'Jedes Projekt wird individuell kalkuliert. Nach einem kostenlosen Beratungsgespräch zu Zielen, Umfang und Anforderungen erhalten Sie ein klares Festpreisangebot — keine Stundenschätzungen, keine Überraschungen.',
    'How long does a project take?': 'Wie lange dauert ein Projekt?',
    'Most small-business sites launch in 2–4 weeks. The exact timeline depends on scope and how quickly we get your content and feedback; we map it out together at the start.':
      'Die meisten Websites für kleine Unternehmen gehen in 2–4 Wochen live. Der genaue Zeitplan hängt vom Umfang ab und davon, wie schnell wir Inhalte und Feedback erhalten; wir planen ihn gemeinsam zu Beginn.',
    'What do I need to get started?': 'Was brauche ich für den Start?',
    "Just your goals and any branding you already have (logo, photos, text). Don't have those yet? We'll guide you through it — many clients start from scratch.":
      'Nur Ihre Ziele und vorhandenes Branding (Logo, Fotos, Texte). Noch nichts davon? Wir begleiten Sie Schritt für Schritt — viele Kunden starten bei null.',
    'Do you work with trades and new local businesses?': 'Arbeiten Sie mit Handwerkern und neuen lokalen Unternehmen?',
    "Yes — that's our focus. We help tradespeople, Handwerker, and growing local businesses get found on Google and turn visitors into booked jobs.":
      'Ja — genau das ist unser Schwerpunkt. Wir helfen Handwerkern und wachsenden lokalen Unternehmen, bei Google gefunden zu werden und aus Besuchern Aufträge zu machen.',
    'What happens after launch?': 'Was passiert nach dem Launch?',
    "We don't disappear. We offer ongoing support, updates, and optimization so your site keeps performing month after month.":
      'Wir verschwinden nicht. Wir bieten laufende Betreuung, Updates und Optimierung, damit Ihre Seite Monat für Monat performt.',
    'Will my site be found on Google?': 'Wird meine Seite bei Google gefunden?',
    'Local SEO is built into every project, so nearby customers find you first when they search for what you do.':
      'Lokales SEO ist in jedem Projekt enthalten, damit Kunden in der Nähe Sie zuerst finden, wenn sie nach Ihrem Angebot suchen.',

    /* services.html — service-card descriptions */
    'Conversion-focused websites designed to capture your brand and engage your audience.':
      'Conversion-orientierte Websites, die Ihre Marke einfangen und Ihr Publikum begeistern.',
    'Robust, accessible front-end and full-stack development built for real-world performance.':
      'Robuste, barrierefreie Front-End- und Full-Stack-Entwicklung, gebaut für echte Performance.',
    'Search-first strategies to help your site rank higher and attract qualified organic traffic.':
      'Search-First-Strategien, damit Ihre Seite höher rankt und qualifizierten organischen Traffic gewinnt.',
    'Strategic guidance on technology, user experience, and sustainable digital growth.':
      'Strategische Beratung zu Technologie, Nutzererlebnis und nachhaltigem digitalem Wachstum.',
    'Ensure your site meets WCAG standards and provides an inclusive experience for every user.':
      'Stellt sicher, dass Ihre Seite WCAG-Standards erfüllt und allen Nutzern ein inklusives Erlebnis bietet.',
    'Retainers and continuous optimization to keep your site improving month after month.':
      'Betreuung und laufende Optimierung, damit Ihre Seite Monat für Monat besser wird.',

    /* case studies — CTA + attributions (comma form, exactly as rendered) */
    'Visit the site': 'Zur Website',
    'Director, Eagle Air HVAC': 'Geschäftsführer, Eagle Air HVAC',
    'Owner, Safari': 'Inhaber, Safari',
    'Marketing team, Akkerman Stroy': 'Marketing-Team, Akkerman Stroy',
    'Founder, Luxe Bouquets': 'Gründerin, Luxe Bouquets',

    /* case studies — testimonials (curly-quoted exactly as rendered) */
    '“Vias Media completely transformed our online presence. The new site is faster, cleaner, and our inquiries have doubled since launch.”':
      '„Vias Media hat unseren Online-Auftritt komplett verändert. Die neue Seite ist schneller, klarer — und unsere Anfragen haben sich seit dem Launch verdoppelt.“',
    '“Sales jumped the month we launched. The new shop is fast, it looks premium, and customers actually finish checking out now.”':
      '„Im Launch-Monat sind die Verkäufe sprunghaft gestiegen. Der neue Shop ist schnell, wirkt edel — und Kunden schließen den Checkout jetzt wirklich ab.“',
    '“Professional, responsive, and detail-oriented. They delivered exactly what we needed.”':
      '„Professionell, reaktionsschnell und detailverliebt. Sie haben genau das geliefert, was wir brauchten.“',
    '“Our website finally looks as good as our flowers, and people order from it now instead of just calling.”':
      '„Unsere Website sieht endlich so gut aus wie unsere Blumen — und die Leute bestellen jetzt darüber, statt nur anzurufen.“',

    /* footer / legal misc */
    'SEO': 'SEO',
    'Legal': 'Rechtliches',

    /* contact form — select placeholder + validation messages */
    'Select a service…': 'Leistung wählen…',
    'Please enter a valid email address.': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    'Please enter a valid phone number.': 'Bitte geben Sie eine gültige Telefonnummer ein.',

    /* meta descriptions — swapped via the meta-description handler in apply()
       (the homepage description is German-default in the HTML and localized via data-en) */
    'Web design, development, local SEO, consulting, accessibility audits, and ongoing support — everything a small business or tradesperson needs to get online and get noticed.':
      'Webdesign, Entwicklung, lokales SEO, Beratung, Barrierefreiheits-Audits und laufende Betreuung — alles, was kleine Unternehmen und Handwerker brauchen, um online sichtbar zu werden.',
    'Selected web design and development projects by Vias Media — case studies with real, measurable results.':
      'Ausgewählte Webdesign- und Entwicklungsprojekte von Vias Media — Fallstudien mit echten, messbaren Ergebnissen.',
    'Tell us about your project. Vias Media replies within one business day — web design, development, SEO, and ongoing support for ambitious brands.':
      'Erzählen Sie uns von Ihrem Projekt. Vias Media antwortet innerhalb eines Werktags — Webdesign, Entwicklung, SEO und laufende Betreuung für ambitionierte Marken.',
    'Case study: how Vias Media rebuilt a dated HVAC brochure site into a fast, mobile-first lead engine — 2× inquiries and a 98 Lighthouse score.':
      'Fallstudie: Wie Vias Media eine veraltete HLK-Broschürenseite in eine schnelle, mobile-first Lead-Maschine verwandelt hat — 2× Anfragen und 98 Lighthouse-Punkte.',
    'Case study: how Vias Media rebuilt a fashion storefront mobile-first with a single-page checkout — +38% conversion and 45% less cart abandonment.':
      'Fallstudie: Wie Vias Media einen Mode-Onlineshop mobile-first mit Single-Page-Checkout neu gebaut hat — +38 % Conversion und 45 % weniger Kaufabbrüche.',
    'Case study: how Vias Media gave a regional construction firm a search-first website that ranks #1 locally — and lifted organic traffic 140%.':
      'Fallstudie: Wie Vias Media einem regionalen Bauunternehmen eine suchorientierte Website gab, die lokal auf Platz 1 rankt — und den organischen Traffic um 140 % steigerte.',
    "Case study: how Vias Media rebuilt a florist's online store around its photography and a date-picked checkout — lifting online orders 85%.":
      'Fallstudie: Wie Vias Media den Onlineshop eines Floristen rund um seine Fotografie und einen Termin-Checkout neu gebaut hat — 85 % mehr Online-Bestellungen.'
  };

  function norm(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  var enText = new WeakMap();   // element -> original English textContent
  var enHtml = new WeakMap();   // element -> original English innerHTML (data-de-html)
  var enPh = new WeakMap();     // element -> original English placeholder
  /* Title + <meta description> localize two ways:
     - English-source pages: the static value is English; German comes from the DE dict.
     - German-default pages (e.g. the homepage, so German SERP snippets are correct):
       the static value is German and the English equivalent rides on a data-en attribute.
       There German is the durable default — it only switches to English when the visitor
       *explicitly* picks EN, so crawlers and first visits keep the German title/snippet. */
  var titleEl = document.querySelector('title');
  var srcTitle = document.title;                                       // static source value
  var enTitleAttr = titleEl ? titleEl.getAttribute('data-en') : null;  // English override (de-default pages)
  var metaDescEl = document.querySelector('meta[name="description"]');
  var srcMetaDesc = metaDescEl ? metaDescEl.getAttribute('content') : null;
  var enMetaDescAttr = metaDescEl ? metaDescEl.getAttribute('data-en') : null;

  var LEAF_SEL = 'h1,h2,h3,h4,h5,h6,p,span,a,li,button,blockquote,figcaption,label,option';
  var current = 'en';

  function apply(lang, explicit) {
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

    /* 1c — German-source leaves: the markup is German by default and the
       English original rides on data-en (German-default pages, e.g. the
       homepage). Mirror image of section 1 above. */
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.tagName === 'TITLE' || el.tagName === 'META') return; // titles/meta handled in 4/4b
      if (!enText.has(el)) enText.set(el, el.textContent);         // cache the German original
      el.textContent = de ? enText.get(el) : el.getAttribute('data-en');
    });

    /* 1d — German-source rich leaves: German innerHTML by default, English in data-en-html */
    document.querySelectorAll('[data-en-html]').forEach(function (el) {
      if (!enHtml.has(el)) enHtml.set(el, el.innerHTML);
      el.innerHTML = de ? enHtml.get(el) : el.getAttribute('data-en-html');
    });

    /* 2 — leaf text via dictionary */
    document.querySelectorAll(LEAF_SEL).forEach(function (el) {
      if (el.hasAttribute('data-de') || el.hasAttribute('data-en')) return;     // handled above
      if (el.closest('[data-de-html]') || el.closest('[data-en-html]')) return; // inside a rich element
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
    if (enTitleAttr) {
      /* German-default page: German is the durable default; show English only on an
         explicit EN choice (keeps the German title for crawlers and first visits). */
      document.title = (de || !explicit) ? srcTitle : enTitleAttr;
    } else {
      document.title = (de && DE[srcTitle]) ? DE[srcTitle] : srcTitle;
    }

    /* 4b — meta description (for SERP snippets) */
    if (metaDescEl) {
      if (enMetaDescAttr) {
        metaDescEl.setAttribute('content', (de || !explicit) ? srcMetaDesc : enMetaDescAttr);
      } else if (srcMetaDesc !== null) {
        metaDescEl.setAttribute('content',
          (de && Object.prototype.hasOwnProperty.call(DE, srcMetaDesc)) ? DE[srcMetaDesc] : srcMetaDesc);
      }
    }

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

  /* Init — German is the site's default language; English is an opt-in
     translation toggle. Everyone (and rendering crawlers) starts in German;
     we only switch to English when the visitor explicitly chooses it. That
     choice is persisted and overrides the German default on later visits. */
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var explicitChoice = (saved === 'de' || saved === 'en');
  var initial = explicitChoice ? saved : 'de';
  apply(initial, explicitChoice);

  document.querySelectorAll('.lang-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      apply(current === 'en' ? 'de' : 'en', true);
    });
  });
})();
