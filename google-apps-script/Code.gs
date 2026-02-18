const SPREADSHEET_ID = '10PfsptLr7QvG5_QRFogONU6ZFzKaVeCHGUtX6PvucXc';
const SHEET_NAME = 'Logs';

function doGet() {
  return jsonOutput({
    ok: true,
    message: 'Tracking endpoint attivo',
    spreadsheetId: SPREADSHEET_ID,
    sheetName: SHEET_NAME,
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    const payload = parseRequestBody(e);
    const events = normalizeEvents(payload);

    if (!events.length) {
      return jsonOutput({ ok: false, error: 'Nessun evento ricevuto' });
    }

    const sheet = getOrCreateSheet_();
    ensureHeader_(sheet);

    const now = new Date();
    const rows = events.map(function (event) {
      return [
        now,
        event.timestamp || '',
        event.eventId || '',
        event.sessionId || '',
        event.visitorId || '',
        event.type || '',
        JSON.stringify(event.payload || {}),
        event.url || '',
        event.userAgent || '',
        event.spreadsheetIdHint || ''
      ];
    });

    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

    return jsonOutput({
      ok: true,
      inserted: rows.length,
      sheetName: SHEET_NAME
    });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}

function parseRequestBody(e) {
  if (!e || !e.postData || !e.postData.contents) return {};

  const raw = e.postData.contents;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return { raw: raw };
  }
}

function normalizeEvents(payload) {
  if (!payload) return [];

  if (payload.mode === 'batch' && Array.isArray(payload.events)) {
    return payload.events.filter(Boolean);
  }

  if (Array.isArray(payload.events)) {
    return payload.events.filter(Boolean);
  }

  if (payload.type || payload.eventId || payload.sessionId) {
    return [payload];
  }

  return [];
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const existing = ss.getSheetByName(SHEET_NAME);
  if (existing) return existing;
  return ss.insertSheet(SHEET_NAME);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;

  sheet.appendRow([
    'timestamp_server',
    'timestamp_client',
    'event_id',
    'session_id',
    'visitor_id',
    'event_type',
    'payload_json',
    'url',
    'user_agent',
    'spreadsheet_hint'
  ]);
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
