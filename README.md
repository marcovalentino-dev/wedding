# Hinge Interactive Site (Marco Edition)

## File
- `index.html`: layout completo (presentazione + 2 minigiochi + form)
- `styles.css`: grafica colorata, animazioni, responsive
- `app.js`: logica giochi/interazioni + tracking eventi (queue + batch + retry)
- `google-apps-script/Code.gs`: endpoint serverless per log su Google Sheets

## Config attuale
- Spreadsheet collegato: `10PfsptLr7QvG5_QRFogONU6ZFzKaVeCHGUtX6PvucXc`
- Editor progetto Apps Script: `https://script.google.com/home/projects/1dcjiD1K4-EapaxgADNrk6fyKU9Y5Xd8DHsiNK3hSJBrTp-1hzfvBfyIC`

## Cosa manca per attivare i log online
1. Apri il progetto Apps Script e incolla il contenuto aggiornato di `google-apps-script/Code.gs`.
2. Deploy -> New deployment -> Web app.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Copia la URL della Web App che finisce con `/exec`.
6. In `app.js`, imposta `TRACKING_CONFIG.appsScriptWebAppUrl` con quella URL.

## Eventi tracciati
- `page_loaded`
- `journey_started`
- `fact_chip_clicked`
- `green_red_started`
- `green_red_pick`
- `green_red_completed`
- `compatibility_answer`
- `compatibility_completed`
- `about_her_submitted`

## Note tecniche tracking
- I log vengono messi in coda locale (`localStorage`, chiave `hingeLogsQueue`).
- Invio in batch verso Apps Script a ogni evento + tentativo su `beforeunload` con `sendBeacon`.
- Se endpoint non configurato, i log restano in coda locale finche non inserisci la URL `/exec`.
