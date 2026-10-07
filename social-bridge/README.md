# Scraper social locale di Slax

Dopo aver eseguito `setup.cmd`, fai doppio clic su `start-scraper.cmd` nella cartella `Desktop\slaxthemefinal\social-bridge`. Lascia aperta la finestra mentre usi le statistiche social. In Slax apri Impostazioni → Social Tracker, attiva lo scraper e premi **Verifica connessione**.

Il servizio ascolta solo su `127.0.0.1:5191`. Per Instagram accedi nel browser che contiene Slax: l'estensione usa la sessione di quel browser per la richiesta locale. Non copiare manualmente il cookie e non inserirlo nel repository. TikTok può rifiutare gli accessi automatici; Slax mostra lo stato effettivo.

Per avviarlo direttamente da questa cartella sorgente, esegui `npm ci` una volta e poi `npm start`. Ferma il servizio chiudendo la finestra o premendo Ctrl+C.
