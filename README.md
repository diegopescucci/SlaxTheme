# SlaxTheme

SlaxTheme è un'estensione per browser (Chrome, Brave, Firefox) che personalizza la pagina Nuova Scheda con widget, statistiche e integrazioni musicali/social.

---

## 🚀 Come scaricare da GitHub

1. Premi sul pulsante verde **Code** in alto a destra in questa pagina.
2. Clicca su **Download ZIP**.
3. Estrai l'archivio ZIP sul tuo computer.

---

## 🌐 Installazione nei Browser

### Google Chrome & Brave

1. Apri la pagina delle estensioni digitando nella barra degli indirizzi:
   - Su Chrome: `chrome://extensions`
   - Su Brave: `brave://extensions`
2. Attiva la spunta **Modalità sviluppatore** (Developer mode) in alto a destra.
3. Clicca sul pulsante **Carica estensione non pacchettizzata** (Load unpacked).
4. Seleziona la cartella `Chrome-Brave` presente nell'archivio estratto.
5. Apri una nuova scheda per vedere Slax in azione!

### Mozilla Firefox

1. Apri `about:debugging#/runtime/this-firefox` nella barra degli indirizzi.
2. Premi **Carica componente aggiuntivo temporaneo...**.
3. Seleziona il file `Firefox/manifest.json`.
4. Apri una nuova scheda. *(Nota: Firefox rimuove i componenti temporanei alla chiusura del browser)*.

---

## ⚙️ Funzionalità e Configurazioni

### 🎵 Integrazione Spotify
1. In Slax, apri **Impostazioni** → **Musica**.
2. Segui la guida per creare un'app su [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
3. Registra il **Redirect URI** esatto mostrato da Slax nel pannello impostazioni.
4. Incolla il tuo **Client ID** e autorizza l'accesso (non serve Client Secret).

### 📊 Instagram e TikTok (Social Tracker)
Per recuperare i dati follower in tempo reale tramite lo scraper locale opzionale:
1. In Slax, vai su **Impostazioni** → **Social Tracker** e inserisci i tuoi username.
2. Apri la cartella `social-bridge` e fai doppio clic su `start-scraper.cmd` (oppure esegui `npm install` e `npm start`).
3. Lascia aperta la finestra del terminale.
4. Torna in Slax e premi **Verifica connessione**.

> **Privacy & Sicurezza**: Lo scraper gira esclusivamente in locale su `127.0.0.1:5191`. Nessuna password, token o credenziale personale viene salvata o inviata a server esterni.
