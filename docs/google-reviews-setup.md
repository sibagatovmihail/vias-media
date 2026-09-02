# Google-Rezensionen auf viasmedia.com verbinden

Der Bewertungsbereich (`#reviews`) ist live und zeigt aktuell die handgeschriebenen
Karten aus `index.html`. Sobald die zwei Umgebungsvariablen gesetzt sind, ersetzt
`assets/js/reviews.js` sie automatisch durch echte Google-Rezensionen und blendet
die Sternebewertung unter der Überschrift ein. Kein Deploy nötig — nur die Variablen
setzen und einmal neu deployen.

## Voraussetzung: ein Google-Unternehmensprofil

Vias Media hat noch keins. Ohne Profil gibt es keine Place ID und keine Rezensionen.
Anlegen unter https://business.google.com — Adresse Robert-Koch-Str. 15, 17036
Neubrandenburg, Kategorie „Webdesigner". Die Verifizierung dauert meist ein paar Tage.

## 1. Place ID holen

https://developers.google.com/maps/documentation/places/web-service/place-id
→ Firmennamen eingeben → die ID beginnt mit `ChIJ...`

## 2. API-Key erstellen

1. https://console.cloud.google.com → Projekt anlegen (oder vorhandenes wählen)
2. **Abrechnung aktivieren.** Ohne aktive Abrechnung liefert die API gar nichts —
   genau daran ist die Integration bei Akkerman Stroy gescheitert.
3. **APIs & Dienste → Bibliothek** → **Places API (New)** aktivieren
4. **Anmeldedaten → API-Schlüssel erstellen**
5. Den Schlüssel einschränken: **API-Einschränkungen → Places API (New)**.
   Eine HTTP-Referrer-Einschränkung ist hier *nicht* nötig und wäre sogar falsch —
   der Schlüssel wird serverseitig benutzt, nicht im Browser. Optional stattdessen
   eine IP-Einschränkung.

## 3. Variablen bei Vercel setzen

Projekt `vias-media` → **Settings → Environment Variables**, für Production
(und Preview, wenn gewünscht):

| Name | Wert |
|---|---|
| `GOOGLE_PLACES_API_KEY` | der Schlüssel aus Schritt 2 |
| `GOOGLE_PLACE_ID` | die `ChIJ...`-ID aus Schritt 1 |
| `GOOGLE_REVIEWS_LANG` | optional, Standard `de` |

Danach **Redeploy** (Deployments → ⋯ → Redeploy). Umgebungsvariablen greifen erst
im nächsten Deployment.

## 4. Prüfen

```bash
curl -s https://viasmedia.com/api/reviews | head -c 300
```

- `{"ok":true,...}` → fertig, die Karten auf der Startseite kommen jetzt von Google
- `{"ok":false,"configured":false}` → Variablen fehlen oder es wurde nicht neu deployt
- `{"ok":false,...,"reason":"..."}` → die Meldung nennt den Grund (Abrechnung, API
  nicht aktiviert, falsche Place ID)

## Kosten / Kontingent

`api/reviews.js` setzt `Cache-Control: s-maxage=86400`. Vercels CDN liefert die
Antwort 24 Stunden lang aus, ohne die Funktion erneut auszuführen — Google wird also
**höchstens einmal pro Tag** angefragt, egal wie viele Besucher die Seite hat. Das
sind rund **30 Anfragen im Monat** statt einer pro Seitenaufruf.

`stale-while-revalidate=604800` sorgt dafür, dass bei einem Ausfall (Abrechnung,
Kontingent, Google-Störung) bis zu eine Woche lang die letzte gute Antwort weiter
ausgeliefert wird. Fehlerantworten werden mit `no-store` zurückgegeben und landen
nie im Cache.

Trotzdem im Cloud-Projekt ein **Budget-Alarm** einrichten — das ist die Warnung,
falls die Abrechnung irgendwann ausläuft.

## Wenn keine Live-Daten kommen

`assets/js/reviews.js` fasst die vorhandenen Karten dann nicht an und schreibt den
Grund in die Browser-Konsole. Die Seite sieht also nie kaputt aus.
