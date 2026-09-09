# ZugPilot (Arbeitstitel)

Eine Progressive Web App, die deine regelmässigen Zugverbindungen findet
und mit der Zeit lernt, welche Verbindung du zu welcher Zeit meistens
nimmst.

Dies ist das **MVP**: Destination anlegen, Verbindungen abrufen, Auswahl
protokollieren, daraus lernen.

## Loslegen

```bash
npm install
npm run dev
```

Danach im Browser die angezeigte lokale Adresse öffnen (Mobilansicht im
Browser-DevTools simulieren, oder direkt vom Handy im gleichen WLAN aufrufen).

Produktions-Build (inkl. Service Worker für den Installieren-Button):

```bash
npm run build
npm run preview
```

## Architektur-Entscheidungen (kurz erklärt)

**Vite + React + TypeScript.** Vite ist der Standard-Baukasten für
moderne Web-Apps: schneller Dev-Server, einfache Konfiguration, und ein
gutes PWA-Plugin (`vite-plugin-pwa`). React wurde gewählt, weil die
Oberfläche aus klar abgrenzbaren, wiederverwendbaren Bausteinen besteht
(Destinations-Liste, Formular, Verbindungs-Karte) - jeder Baustein ist
eine eigene Datei in `src/components/`.

**Kein Backend.** Alle Daten (Destinationen + Nutzungshistorie) liegen im
`localStorage` des Browsers (`src/storage/localStore.ts`). Das reicht für
die erwartete Datenmenge (ein paar Dutzend Destinationen, ein paar hundert
Log-Einträge) locker aus und ist für den Einstieg viel einfacher zu
verstehen als IndexedDB. Der Zugriff ist hinter einem kleinen Modul
versteckt - falls die App später wächst, kann dort auf IndexedDB
umgestellt werden, ohne den Rest der App anzufassen. Optional gibt es
zusätzlich Supabase als Sync-Backend (siehe unten).

**API-Zugriff clientseitig.** `src/api/transport.ts` ruft
`transport.opendata.ch` direkt aus dem Browser auf. Es gibt extra eine
eigene Fehlerklasse (`TransportApiError`), damit die Oberfläche
unterscheiden kann zwischen "kein Internet" und "Server meldet einen
Fehler" und dem Nutzer eine verständliche deutsche Meldung zeigen kann.

**Lernlogik ist eine reine Funktion.** `src/learning/suggest.ts` enthält
die ganze "Intelligenz" der App - und zwar bewusst als einfache,
testbare Funktion ohne UI- oder Speicher-Abhängigkeiten:

1. Beim Auswählen einer Verbindung wird geloggt: Destination, Wochentag,
   Uhrzeit des Abrufs (`queryMinuteOfDay`) und Abfahrtszeit der gewählten
   Verbindung (`departureMinuteOfDay`).
2. Beim nächsten Öffnen einer Destination werden vergangene Einträge
   gesucht, die zum selben Wochentag und einer ähnlichen Uhrzeit passen
   (+/- 90 Minuten Toleranz).
3. Aus mindestens zwei solchen Treffern wird der durchschnittliche
   zeitliche Abstand zwischen "App geöffnet" und "Verbindung gewählt"
   berechnet.
4. Dieser Abstand wird auf die aktuelle Zeit angewendet, und die frisch
   geladene Verbindung, die diesem Zielzeitpunkt am nächsten liegt, wird
   als "Für dich empfohlen" hervorgehoben.

Das ist bewusst simpel (kein echtes Machine-Learning-Modell nötig) und
funktioniert trotzdem gut für den Anwendungsfall "montags um 7 Uhr nehme
ich meistens den Zug 10 Minuten später".

**"Live"-Status ist eine Zeitschätzung, kein GPS.** transport.opendata.ch
liefert keine echte Fahrzeugposition. `src/learning/liveStatus.ts`
schätzt deshalb anhand der (Echtzeit-)Fahrzeiten ab, auf welcher Etappe
eine Verbindung sich gerade befindet und wie weit diese zeitlich schon
fortgeschritten ist (z. B. "Unterwegs · Winterthur → Zürich Oerlikon" mit
Fortschrittsbalken, oder "Umsteigen in ..."). Das ist eine ehrliche
Annäherung, kein Live-Tracking auf einer Karte.

**Mobile-first, ansprechendes UI.** Kein UI-Framework, nur
handgeschriebenes CSS (`src/index.css`) mit der Schriftart Inter,
dezenten Schatten, einem transparenten Header mit Blur-Effekt und
spürbarem Tap-Feedback. Grosse Tap-Flächen, Breite auf 480px begrenzt, da
die App primär auf dem Handy kurz vor dem Losgehen genutzt wird. Hell-/
Dunkelmodus wird automatisch über `prefers-color-scheme` unterstützt.

**PWA-Updates werden aktiv geprüft.** `src/main.tsx` registriert den
Service Worker selbst (statt den von `vite-plugin-pwa` automatisch
injizierten) und prüft alle 60 Sekunden auf eine neue Version
(`registration.update()`). Ohne das würde eine bereits geöffnete PWA
neue Deploys erst beim nächsten Kaltstart bemerken - bei App-typischer
Nutzung (kurz öffnen, Verbindung schauen, schliessen) kann das sonst
tagelang eine veraltete Version bedeuten.

## Ordnerstruktur

```
src/
  api/           API-Client für transport.opendata.ch
  components/    UI-Bausteine (Liste, Formular, Verbindungs-Karte, Login, ...)
  hooks/         React-Hooks für Auth, Destinationen, Historie, Verbindungs-Abruf, Live-Uhrzeit
  learning/      Lernlogik + Live-Status-Schätzung (reine Funktionen, keine Abhängigkeiten)
  lib/           Supabase-Client (optional, siehe unten)
  storage/       localStorage-Zugriff + Supabase-Zugriff
  utils/         Datums-/Zeit-Hilfsfunktionen
  types.ts       Gemeinsame TypeScript-Typen
scripts/
  generate-icons.mjs   Erzeugt die PWA-Icons als PNG (ohne externe Libs)
supabase/
  schema.sql     Tabellen + Row-Level-Security für die optionale Sync
.github/workflows/
  deploy.yml     Baut die App und deployed sie auf GitHub Pages
```

## Kostenlos hosten: GitHub Pages

Der Workflow `.github/workflows/deploy.yml` baut die App bei jedem Push auf
`main` automatisch und veröffentlicht sie auf GitHub Pages - kostenlos,
ohne externes Konto, direkt aus diesem Repo.

Einmalig einrichten:

1. Im Repo unter **Settings -> Pages** bei "Source" **"GitHub Actions"** auswählen.
2. Falls Supabase genutzt wird (siehe unten): unter **Settings -> Secrets
   and variables -> Actions** die beiden Secrets `VITE_SUPABASE_URL` und
   `VITE_SUPABASE_ANON_KEY` anlegen. Ohne diese Secrets baut die App
   trotzdem, läuft dann aber im rein lokalen Modus (localStorage).
3. Push auf `main` - die App erscheint danach unter
   `https://<username>.github.io/Zugpilot/`.

`vite.config.ts` setzt den Pfad (`base`) automatisch passend: lokal `/`,
im GitHub-Actions-Build (`GH_PAGES=true`) `/Zugpilot/`.

Alternativen ohne eigene Config-Anpassung: **Vercel** oder **Netlify** -
einfach das GitHub-Repo verbinden, beide erkennen Vite/vite-plugin-pwa
automatisch und deployen an die eigene Domain-Wurzel.

## Optional: Supabase-Sync

Standardmässig speichert ZugPilot alles nur lokal im Browser (siehe oben).
Wer die Destinationen und die Lern-Historie **geräteübergreifend**
synchronisieren will (z. B. Handy + Laptop), kann optional Supabase
anschliessen - ohne Supabase-Konfiguration ändert sich am Verhalten der
App nichts.

1. Kostenloses Projekt auf [supabase.com](https://supabase.com) anlegen.
2. Im Supabase-Dashboard unter **SQL Editor** den Inhalt von
   `supabase/schema.sql` ausführen (legt die Tabellen `destinations` und
   `history_entries` inkl. Row-Level-Security an - jede:r sieht nur die
   eigenen Daten).
3. Unter **Project Settings -> API** die **Project URL** und den
   **anon public key** kopieren.
4. Lokal: `.env.example` nach `.env.local` kopieren und beide Werte
   eintragen. Für den GitHub-Pages-Deploy: dieselben Werte als Repository
   Secrets `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` hinterlegen
   (siehe oben).
5. Im Supabase-Dashboard unter **Authentication -> Providers** ist "Email"
   standardmässig aktiv - das reicht für den eingebauten Login per
   Magic-Link (kein Passwort nötig).

Sobald beide Umgebungsvariablen gesetzt sind, zeigt die App vor der
Destinations-Liste einen Login (E-Mail eingeben, Link antippen) und
speichert danach alles in Supabase statt in localStorage
(`src/hooks/useAuth.ts`, `src/storage/supabaseStore.ts`).

## Was als Nächstes sinnvoll wäre

- Mehrere Zeitfenster pro Destination (z. B. "Hinweg" und "Rückweg"
  getrennt lernen).
- Auto-Refresh der Verbindungsliste alle 60 Sekunden für Echtzeit-Delays.
- Realtime-Abgleich zwischen Geräten (Supabase Realtime), statt nur beim
  Öffnen der App neu zu laden.
- Umstellung auf IndexedDB als lokalen Cache, falls die App auch offline
  mit Supabase-Daten arbeiten soll.
