---
title: Website-Wartung: Was nach dem Launch wirklich gepflegt werden muss
seo_title: Website-Wartung & Sicherheit — Vias Media
description: Updates, SSL-Zertifikat, Backups, Impressum nach DDG, ein Formular, das still kaputtgeht – was eine Website nach dem Launch braucht und was Sie selbst erledigen können.
date: 2026-09-30
category: Ratgeber
related_case: eagle-air
draft: false
---

Eine Website ist nach dem Launch nicht fertig, sondern in Betrieb. Wie ein Firmenwagen braucht sie keine tägliche Aufmerksamkeit, aber regelmäßige Inspektion — sonst merken Sie ein Problem erst, wenn ein Kunde anruft und fragt, warum Ihre Seite als „Nicht sicher" angezeigt wird. Dieser Artikel erklärt, was Website-Wartung konkret umfasst, warum gerade kleine Websites angegriffen werden, welche Pflichten sich seit 2024 geändert haben und welche Aufgaben Sie ohne Agentur selbst übernehmen können.

## Was umfasst Website-Wartung?

Website-Wartung ist die regelmäßige technische, rechtliche und inhaltliche Pflege einer Website nach dem Launch. Sie besteht aus sechs Bereichen:

1. **Software-Updates** — für das Content-Management-System, Plugins und Themes, sofern die Seite so gebaut ist.
2. **Verschlüsselung** — ein gültiges SSL/TLS-Zertifikat, das sich rechtzeitig erneuert.
3. **Backups** — regelmäßige Sicherungen, die sich im Ernstfall auch zurückspielen lassen.
4. **Überwachung** — Erreichbarkeit, Ladezeit und die Frage, ob das Kontaktformular noch zustellt.
5. **Rechtstexte** — Impressum, Datenschutzerklärung und Cookie-Hinweis passend zur aktuellen Rechtslage.
6. **Inhalte** — Öffnungszeiten, Preise, Leistungen, Referenzen und Ansprechpartner.

Wie viel Aufwand jeder Bereich macht, hängt stark davon ab, wie die Website technisch gebaut ist. Darauf kommt dieser Artikel weiter unten zurück.

## Warum werden gerade kleine Websites gehackt?

Kleine Websites werden nicht gezielt ausgesucht, sondern automatisch gefunden. Angreifer lassen Programme rund um die Uhr das gesamte Netz nach bekannten Sicherheitslücken absuchen. Welcher Betrieb dahintersteht, spielt keine Rolle — entscheidend ist nur, ob eine veraltete Software-Version läuft. Das trifft vor allem Websites auf Basis von WordPress, das laut W3Techs rund **43 Prozent aller Websites** antreibt. Der Sicherheitsdienstleister Patchstack zählte für das Jahr 2024 **7.966 neu entdeckte Sicherheitslücken** im WordPress-Umfeld, davon **96 Prozent in Plugins** und nur eine Handvoll im WordPress-Kern selbst. Eine gehackte Seite verteilt dann etwa Schadsoftware, leitet Besucher auf Betrugsseiten um oder verschickt Spam über Ihren Server. Google warnt Besucher in solchen Fällen mit einem roten Hinweis vor dem Aufruf — für einen lokalen Betrieb ist das ein Vertrauensschaden, der deutlich länger nachwirkt als die technische Reparatur.

## Was ist ein SSL-Zertifikat und warum läuft es ab?

Ein SSL-Zertifikat — genauer: TLS-Zertifikat — verschlüsselt die Verbindung zwischen Besucher und Website und ist am `https://` in der Adresse zu erkennen. Ohne gültiges Zertifikat zeigt Chrome „Nicht sicher" an, Formulare übertragen Daten unverschlüsselt, und Google bewertet die Seite schlechter. Zertifikate kosten heute meist nichts: Anbieter wie Let's Encrypt stellen sie kostenlos aus. Der Knackpunkt ist die **Laufzeit**, denn sie wird schrittweise verkürzt. Das CA/Browser Forum, in dem Browserhersteller und Zertifizierungsstellen die Regeln festlegen, hat im April 2025 folgenden Zeitplan beschlossen:

<div class="tbl" markdown="1">

| Ausgestellt ab | Maximale Laufzeit eines Zertifikats |
|---|---|
| bis 14. März 2026 | 398 Tage |
| 15. März 2026 | 200 Tage |
| 15. März 2027 | 100 Tage |
| 15. März 2029 | 47 Tage |

</div>

Ein Zertifikat einmal im Jahr von Hand zu verlängern, funktioniert damit nicht mehr. Die Erneuerung muss automatisch laufen — und jemand muss bemerken, wenn sie fehlschlägt.

## Wie oft sollte eine Website gesichert werden?

So oft, wie sich die Website ändert — und immer vor jedem Update. Für eine Website, die sich selten ändert, reicht eine wöchentliche Sicherung; ein Onlineshop mit täglichen Bestellungen braucht tägliche Backups. Bewährt hat sich die **3-2-1-Regel**: drei Kopien der Daten, auf zwei unterschiedlichen Speichermedien, davon eine an einem anderen Ort als der Server. Ein Backup, das auf demselben Server liegt wie die Website, ist bei einem Serverausfall oder Angriff wertlos. Genauso wichtig und fast immer vergessen: **das Zurückspielen testen**. Ein Backup, das nie wiederhergestellt wurde, ist nur eine Hoffnung. Einmal im Jahr sollte eine Sicherung probeweise eingespielt werden, um zu prüfen, ob sie vollständig ist.

## Welche rechtlichen Änderungen betreffen meine Website?

Seit dem **14. Mai 2024** ist das Telemediengesetz (TMG) durch das **Digitale-Dienste-Gesetz (DDG)** ersetzt, und das TTDSG heißt seitdem **TDDDG**. Viele Impressen verweisen trotzdem noch auf „§ 5 TMG" — ein Gesetz, das es nicht mehr gibt. Das ist ein kleiner Fehler, zeigt aber jedem aufmerksamen Besucher und Mitbewerber, dass die Seite nicht gepflegt wird. Weitere typische Auslöser für eine Aktualisierung der Rechtstexte:

- **Ein neuer Dienst wird eingebunden** — Google Maps, ein Terminbuchungstool, ein Video, eine Schriftart von einem fremden Server. Jeder davon gehört in die Datenschutzerklärung und braucht oft eine Einwilligung.
- **Die Firmendaten ändern sich** — Adresse, Rechtsform, Telefonnummer, Umsatzsteuer-ID.
- **Neue Pflichten** wie das Barrierefreiheitsstärkungsgesetz, das seit Juni 2025 für Onlineshops und Buchungssysteme gilt.

Die DSGVO verlangt in Art. 32 außerdem technische Schutzmaßnahmen „unter Berücksichtigung des Stands der Technik". Eine Website mit jahrelang ungepatchter Software erfüllt das kaum.

## Welche Wartungsaufgaben kann ich selbst übernehmen?

Mehr, als die meisten denken. Die folgende Übersicht zeigt, was wie oft anfällt und was ohne Fachwissen machbar ist:

<div class="tbl" markdown="1">

| Aufgabe | Wie oft | Selbst machbar? |
|---|---|---|
| Kontaktformular testen (Anfrage an sich selbst) | monatlich | ja |
| Öffnungszeiten, Preise, Urlaub prüfen | monatlich | ja |
| Impressum und Datenschutz auf Aktualität prüfen | halbjährlich | teilweise |
| Software- und Plugin-Updates | wöchentlich bis monatlich | eher nicht |
| Backups anlegen und Wiederherstellung testen | wöchentlich / jährlich | eher nicht |
| Zertifikat, Erreichbarkeit und Ladezeit überwachen | laufend, automatisch | nein |

</div>

Der wichtigste Punkt steht ganz oben: **Kontaktformulare gehen still kaputt.** Ein geändertes E-Mail-Passwort, eine volle Mailbox oder ein abgelaufener Formulardienst — und Anfragen landen wochenlang im Nichts, ohne Fehlermeldung. Schicken Sie sich einmal im Monat selbst eine Anfrage. Das dauert eine Minute und ist die wirksamste Wartung überhaupt.

## Warum brauchen manche Websites weniger Wartung als andere?

Weil der Wartungsaufwand vor allem von der Technik abhängt, auf der eine Website läuft. Eine Website auf Basis eines Content-Management-Systems besteht aus Datenbank, Login-Bereich, Theme und oft zwanzig oder mehr Plugins — jedes davon ein Bauteil, das Updates braucht und eine mögliche Lücke ist. Eine **statische Website** besteht dagegen aus fertigen HTML-Dateien: Es gibt keine Datenbank, die angegriffen werden kann, keinen Login, der erraten werden kann, und keine Plugins, die veralten. Die größte Gruppe der Sicherheitslücken aus dem Abschnitt oben entfällt damit vollständig. Vias Media baut jede Website auf diese Weise von Hand, gehostet auf Servern in Deutschland. Wartungsfrei ist auch eine statische Website nicht: Domain, Zertifikat, Formular, Rechtstexte und Inhalte bleiben. Aber aus einer wöchentlichen Update-Pflicht wird eine überschaubare Pflege, die sich planen lässt.

## Was kostet Website-Wartung?

Am Markt werden Wartungspakete für kleine Websites meist zwischen etwa **30 und 150 Euro im Monat** angeboten, abhängig davon, ob nur technische Updates oder auch Inhaltsänderungen und Support enthalten sind. Bei CMS-Websites mit vielen Plugins ist ein solches Paket kaum verzichtbar, weil die Updates nicht warten. Bei Vias Media ist die Betreuung **optional**: Die Website gehört Ihnen und läuft auch ohne Vertrag weiter. Wer Betreuung möchte, bekommt Updates, Überwachung, Inhaltsänderungen und einen festen Ansprechpartner direkt in Neubrandenburg, der Ihre Website kennt. Die meisten Kunden starten mit einer kleinen Betreuung für die ersten sechs Monate nach dem Launch und entscheiden dann neu. Beim Heizungs- und Klimabetrieb **Eagle Air HVAC** läuft die Seite seit dem Relaunch mit einem Lighthouse-Wert von **98 von 100** — ohne einziges Plugin. Wenn Sie wissen möchten, in welchem Zustand Ihre aktuelle Website ist, melden Sie sich für einen kostenlosen Website-Check. Ich prüfe Zertifikat, Formular, Rechtstexte und Ladezeit und sage Ihnen, was davon wirklich dringend ist.
