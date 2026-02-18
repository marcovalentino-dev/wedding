# Hinge Interactive Site (Marco Edition)

## File
- `index.html`: layout completo (presentazione + 2 minigiochi + form)
- `styles.css`: grafica colorata, animazioni, responsive
- `app.js`: logica giochi/interazioni + tracking eventi
- `google-apps-script/Code.gs`: endpoint serverless per log su Google Sheets

## Setup rapido log su Google
1. Crea un Google Sheet nuovo (es: `Hinge Logs`).
2. Copia l'ID del foglio dall'URL.
3. Apri https://script.google.com e crea un progetto Apps Script.
4. Incolla il contenuto di `google-apps-script/Code.gs`.
5. Sostituisci `INCOLLA_SPREADSHEET_ID` con l'ID del tuo sheet.
6. Deploy -> New deployment -> Web app.
7. Execute as: `Me`.
8. Who has access: `Anyone`.
9. Copia la Web App URL.
10. In `app.js`, sostituisci `INCOLLA_QUI_LA_TUA_WEB_APP_URL` con quella URL.

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

## Note
- Se la URL Apps Script non e configurata, i log restano comunque in `localStorage` (`hingeLogs`) come backup.
- Il sito e statico: puoi pubblicarlo su Netlify, Vercel, GitHub Pages o hostarlo ovunque.
