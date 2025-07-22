# Panama

Panama ist ein Projekt, das jungen Menschen mit wenig Geld ermöglichen soll Europa mit dem Zug zu bereisen. Es entstand aus einer Idee im Rahmen der Generation Europa 2025 (https://www.dfjw.org/programme-aus-und-fortbildungen/generation-europa/jahrgang-2025).

Die hier implementierten Features stellen einen Prototypen dar, der Teil einer Machbarkeitsuntersuchung für das Projekt und im Modul "Cloud Computing" der FH Südwestfalen als Teil einer Prüfungsleistung eingereicht wurde. 

Der Prototyp ist unter https://panama-27c1c.web.app/ zu erreichen.

## Features

- Webseite mit kurzer Erklärung des Programms
- Registrierung und Login über Email
- Profil für eingeloggte User
- Bewerbungen erstellen, zwischenspeichern, weiterbearbeiten und veröffentlichen
- Bewerbungsübersicht inkl. Filter, Sortierung und Fortschrittsbalken
- Unterstützen-Button zur (fiktiven) Abgabe von Spenden

## Weitere geplante/mögliche Features

- Schnittstelle zu Paypal und Interrail
- Benachrichtig bei Zielerreichung
- Übersicht der eigenen Spenden für Funder
- Upload eines Reiseberichtes nach der Reise
- Übersicht über die Reiseberichte

## Tech Stack

- Frontend: HTML, CSS, JavaScript 
- Backend: JavaScript, Firestore Rules
- Datenbank: Firestore
- Hosting: Firebase Hosting

## Lokale Entwicklung
```
# Projekt clonen
git clone https://github.com/plaufer/Panama.git

# eigenes Firebase-Projekt erstellen
1. Gehe zu https://console.firebase.google.com
2. Erstelle ein neues Projekt und folge den Anweisungen
3. Aktiviere Firestore, Hosting und Authentication
4. Füge deine Firebase Konfigurationsdaten (apiKey, authDomain, projectId, storageBucket, messagingSenderId,
    appId, measurementId) in firebase-config.js ein

# Firebase CLI installieren
nmp install -g firebase-tools

# Firebase-Projekt verknüpfen
firebase login

# Initialisierung: Wähle dabei Firestore, Hosting und Authentication bei den Firebase Features
firebase init

# Deployment (optional)
firebase deploy
```
