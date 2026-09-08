# ZugPilot (Arbeitstitel)

Eine Progressive Web App, die deine regelmaessigen Zugverbindungen findet
und mit der Zeit lernt, welche Verbindung du zu welcher Zeit meistens
nimmst.

Dies ist das **MVP**: Destination anlegen, Verbindungen abrufen, Auswahl
protokollieren, daraus lernen.

## Loslegen

```bash
npm install
npm run dev
```

Danach im Browser die angezeigte lokale Adresse oeffnen (Mobilansicht im
Browser-DevTools simulieren, oder direkt vom Handy im gleichen WLAN aufrufen).

Produktions-Build (inkl. Service Worker fuer den Installieren-Button):

```bash
npm run build
npm run preview
```

## Architektur-Entscheidungen (kurz erklaert)

**Vite + React + TypeScript.** Vite ist der Standard-Baukasten fuer
moderne Web-Apps: schneller Dev-Server, einfache Konfiguration, und ein
gutes PWA-Plugin (`vite-plugin-pwa`). React wurde gewaehlt, weil die
Oberflaeche aus klar abgrenzbaren, wiederverwendbaren Bausteinen besteht
(Destinations-Liste, Formular, Verbindungs-Karte) - jeder Baustein ist
eine eigene Datei in `src/components/`.

**Kein Backend.** Alle Daten (Destinationen + Nutzungshistorie) liegen im
`localStorage` des Browsers (`src/storage/localStore.ts`). Das reicht fuer
die erwartete Datenmenge (ein paar Dutzend Destinationen, ein paar hundert
Log-Eintraege) locker aus und ist fuer den Einstieg viel einfacher zu
verstehen als IndexedDB. Der Zugriff ist hinter einem kleinen Modul
versteckt - falls die App spaeter waechst, kann dort auf IndexedDB
umgestellt werden, ohne den Rest der App anzufassen.

**API-Zugriff clientseitig.** `src/api/transport.ts` ruft
`transport.opendata.ch` direkt aus dem Browser auf. Es gibt extra eine
eigene Fehlerklasse (`TransportApiError`), damit die Oberflaeche
unterscheiden kann zwischen "kein Internet" und "Server meldet einen
Fehler" und dem Nutzer eine verstaendliche deutsche Meldung zeigen kann.

**Lernlogik ist eine reine Funktion.** `src/learning/suggest.ts` enthaelt
die ganze "Intelligenz" der App - und zwar bewusst als einfache,
testbare Funktion ohne UI- oder Speicher-Abhaengigkeiten:

1. Beim Auswaehlen einer Verbindung wird geloggt: Destination, Wochentag,
   Uhrzeit des Abrufs (`queryMinuteOfDay`) und Abfahrtszeit der gewaehlten
   Verbindung (`departureMinuteOfDay`).
2. Beim naechsten Oeffnen einer Destination werden vergangene Eintraege
   gesucht, die zum selben Wochentag und einer aehnlichen Uhrzeit passen
   (+/- 90 Minuten Toleranz).
3. Aus mindestens zwei solchen Treffern wird der durchschnittliche
   zeitliche Abstand zwischen "App geoeffnet" und "Verbindung gewaehlt"
   berechnet.
4. Dieser Abstand wird auf die aktuelle Zeit angewendet, und die frisch
   geladene Verbindung, die diesem Zielzeitpunkt am naechsten liegt, wird
   als "Fuer dich empfohlen" hervorgehoben.

Das ist bewusst simpel (kein echtes Machine-Learning-Modell noetig) und
funktioniert trotzdem gut fuer den Anwendungsfall "montags um 7 Uhr nehme
ich meistens den Zug 10 Minuten spaeter".

**Mobile-first, minimalistisches CSS.** Kein UI-Framework, nur
handgeschriebenes CSS (`src/index.css`) mit grossen Tap-Flaechen und einer
auf 480px begrenzten Breite, da die App primaer auf dem Handy kurz vor dem
Losgehen genutzt wird. Hell-/Dunkelmodus wird automatisch ueber
`prefers-color-scheme` unterstuetzt.

## Ordnerstruktur

```
src/
  api/           API-Client fuer transport.opendata.ch
  components/    UI-Bausteine (Liste, Formular, Verbindungs-Karte, ...)
  hooks/         React-Hooks fuer Destinationen, Historie, Verbindungs-Abruf
  learning/      Die Lernlogik (reine Funktion, keine Abhaengigkeiten)
  storage/       localStorage-Zugriff
  utils/         Datums-/Zeit-Hilfsfunktionen
  types.ts       Gemeinsame TypeScript-Typen
scripts/
  generate-icons.mjs   Erzeugt die PWA-Icons als PNG (ohne externe Libs)
```

## Was als Naechstes sinnvoll waere

- Mehrere Zeitfenster pro Destination (z. B. "Hinweg" und "Rueckweg"
  getrennt lernen).
- Auto-Refresh der Verbindungsliste alle 60 Sekunden fuer Echtzeit-Delays.
- Export/Import der lokalen Daten (JSON-Datei), falls das Handy gewechselt wird.
- Umstellung auf IndexedDB, falls die Historie sehr gross wird.
