const TRACKING_CONFIG = {
  // IMPORTANTE: qui va la URL Web App di Apps Script (deve finire con /exec), non il link editor /home/projects
  appsScriptWebAppUrl: 'https://script.google.com/macros/s/AKfycbxwPQak8frck_htAfAhhgfczQRNRoWJrYhHI9de22UekGcdoU6u-9KeYtN1PTpBFxzJ5w/exec',
  spreadsheetId: '10PfsptLr7QvG5_QRFogONU6ZFzKaVeCHGUtX6PvucXc',
  projectEditorUrl: 'https://script.google.com/macros/s/AKfycbxwPQak8frck_htAfAhhgfczQRNRoWJrYhHI9de22UekGcdoU6u-9KeYtN1PTpBFxzJ5w/exec'
};

const SESSION_ID = crypto.randomUUID();
const VISITOR_ID_KEY = 'hingeVisitorId';
const LOG_STORAGE_KEY = 'hingeLogsQueue';

const greenRedStatements = [
  'Ti porto il caffè a letto ☕',
  'Ricordo il tuo ordine preferito 🍕',
  'Condivido il mio dessert 🍰',
  'Ruberei le tue patatine 🍟',
  "Metto l'ananas sulla pizza 🍍",
  'Guardo meme invece di dormire 😂',
  'Parlo con i cani per strada 🐶',
  'Faccio discorsi motivazionali sotto la doccia 🎤',
  'Mi emoziono per le offerte del supermercato 🛒',
  'Ti farei ridere anche nei giorni no',
  'Ti guarderei come si guarda Netflix il venerdi sera',
  'Potrei diventare la tua decisione discutibile preferita 😂'
];

const compatibilityQuestions = [
  {
    q: 'Weekend ideale?',
    options: [
      { label: 'Giro random + aperitivo', score: 3 },
      { label: 'Divano, serie, cibo', score: 2 },
      { label: 'Avventura folle non pianificata', score: 4 }
    ]
  },
  {
    q: 'Meme in chat:',
    options: [
      { label: 'Sono il mio linguaggio d\'amore', score: 4 },
      { label: 'Solo nei momenti giusti', score: 2 },
      { label: 'Preferisco vocali epici', score: 3 }
    ]
  },
  {
    q: 'Se litighiamo per la pizza?',
    options: [
      { label: 'Facciamo meta e meta', score: 4 },
      { label: 'Ti convinco io con argomentazioni forti', score: 2 },
      { label: 'Ordiniamo due pizze e basta', score: 3 }
    ]
  }
];

const state = {
  green: 0,
  red: 0,
  gameIndex: 0,
  quizIndex: 0,
  quizScore: 0
};

const el = {
  startJourney: document.getElementById('startJourney'),
  experience: document.getElementById('experience'),
  revealCards: document.querySelectorAll('.reveal'),
  gameIntro: document.getElementById('gameIntro'),
  gamePlay: document.getElementById('gamePlay'),
  gameResult: document.getElementById('gameResult'),
  startGame: document.getElementById('startGame'),
  statementCard: document.getElementById('statementCard'),
  greenBtn: document.getElementById('greenBtn'),
  redBtn: document.getElementById('redBtn'),
  greenCount: document.getElementById('greenCount'),
  redCount: document.getElementById('redCount'),
  cardProgress: document.getElementById('cardProgress'),
  resultTitle: document.getElementById('resultTitle'),
  resultText: document.getElementById('resultText'),
  replayGame: document.getElementById('replayGame'),
  quizArea: document.getElementById('quizArea'),
  quizQuestion: document.getElementById('quizQuestion'),
  quizOptions: document.getElementById('quizOptions'),
  quizResult: document.getElementById('quizResult'),
  quizResultTitle: document.getElementById('quizResultTitle'),
  quizResultText: document.getElementById('quizResultText'),
  restartQuiz: document.getElementById('restartQuiz'),
  aboutHerForm: document.getElementById('aboutHerForm'),
  formStatus: document.getElementById('formStatus'),
  burstTemplate: document.getElementById('burstTemplate')
};

function stamp() {
  return new Date().toISOString();
}

function getVisitorId() {
  let existing = '';
  try {
    existing = localStorage.getItem(VISITOR_ID_KEY) || '';
  } catch (_) {
    existing = '';
  }

  if (existing) return existing;

  const created = crypto.randomUUID();
  try {
    localStorage.setItem(VISITOR_ID_KEY, created);
  } catch (_) {
    // Non-blocking if storage is unavailable.
  }
  return created;
}

const VISITOR_ID = getVisitorId();

function isWebAppUrlConfigured() {
  return Boolean(
    TRACKING_CONFIG.appsScriptWebAppUrl &&
    TRACKING_CONFIG.appsScriptWebAppUrl.includes('/exec')
  );
}

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function writeQueue(queue) {
  try {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(queue));
  } catch (_) {
    // Non-blocking in private mode.
  }
}

function enqueueLog(event) {
  const queue = readQueue();
  queue.push(event);
  writeQueue(queue);
}

async function flushLogs() {
  if (!isWebAppUrlConfigured()) return;

  const queue = readQueue();
  if (!queue.length) return;

  try {
    await fetch(TRACKING_CONFIG.appsScriptWebAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        mode: 'batch',
        events: queue
      })
    });

    writeQueue([]);
  } catch (_) {
    // Keep queue for next retry.
  }
}

async function logEvent(type, payload = {}) {
  const event = {
    eventId: crypto.randomUUID(),
    sessionId: SESSION_ID,
    visitorId: VISITOR_ID,
    timestamp: stamp(),
    type,
    payload,
    url: window.location.href,
    userAgent: navigator.userAgent,
    spreadsheetIdHint: TRACKING_CONFIG.spreadsheetId
  };

  enqueueLog(event);
  await flushLogs();
}

function flushWithBeacon() {
  if (!isWebAppUrlConfigured()) return;

  const queue = readQueue();
  if (!queue.length || !navigator.sendBeacon) return;

  const blob = new Blob(
    [JSON.stringify({ mode: 'batch', events: queue, source: 'beacon' })],
    { type: 'text/plain;charset=utf-8' }
  );

  const ok = navigator.sendBeacon(TRACKING_CONFIG.appsScriptWebAppUrl, blob);
  if (ok) writeQueue([]);
}

function showBurst(x, y) {
  const node = el.burstTemplate.content.firstElementChild.cloneNode(true);
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 760);
}

function revealWithStagger() {
  el.revealCards.forEach((card, i) => {
    setTimeout(() => card.classList.add('visible'), 120 * i);
  });
}

function updateScoreBoard() {
  el.greenCount.textContent = state.green;
  el.redCount.textContent = state.red;
  el.cardProgress.textContent = `${Math.min(state.gameIndex + 1, greenRedStatements.length)}/${greenRedStatements.length}`;
}

function renderCurrentStatement() {
  el.statementCard.textContent = greenRedStatements[state.gameIndex];
  el.statementCard.classList.remove('shake');
  void el.statementCard.offsetWidth;
  el.statementCard.classList.add('shake');
}

function finalizeGame() {
  el.gamePlay.classList.add('hidden');
  el.gameResult.classList.remove('hidden');

  const delta = state.green - state.red;
  if (delta >= 4) {
    el.resultTitle.textContent = 'Compatibilita pericolosamente alta 😏';
    el.resultText.textContent = 'Dovremmo probabilmente uscire.';
  } else if (delta <= -3) {
    el.resultTitle.textContent = 'Mi trovi sospetto...';
    el.resultText.textContent = 'Ma tipo affascinante sospetto o "chiama aiuto"? 😂';
  } else {
    el.resultTitle.textContent = 'Sei confusa. Perfetto 😌';
    el.resultText.textContent = 'E esattamente l\'effetto che faccio.';
  }

  logEvent('green_red_completed', { green: state.green, red: state.red, delta });
}

function handleGreenRedPick(choice, clickEvent) {
  if (choice === 'green') state.green += 1;
  if (choice === 'red') state.red += 1;

  const statement = greenRedStatements[state.gameIndex];
  logEvent('green_red_pick', { statement, choice, index: state.gameIndex });

  if (clickEvent) showBurst(clickEvent.clientX, clickEvent.clientY);

  state.gameIndex += 1;
  updateScoreBoard();

  if (state.gameIndex >= greenRedStatements.length) {
    finalizeGame();
    return;
  }

  renderCurrentStatement();
}

function resetGreenRedGame() {
  state.green = 0;
  state.red = 0;
  state.gameIndex = 0;
  el.gameResult.classList.add('hidden');
  el.gamePlay.classList.add('hidden');
  el.gameIntro.classList.remove('hidden');
  updateScoreBoard();
  renderCurrentStatement();
}

function renderQuizQuestion() {
  const current = compatibilityQuestions[state.quizIndex];
  el.quizQuestion.textContent = current.q;
  el.quizOptions.innerHTML = '';

  current.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = option.label;
    btn.addEventListener('click', () => {
      state.quizScore += option.score;
      logEvent('compatibility_answer', {
        question: current.q,
        answer: option.label,
        answerIndex: idx,
        score: option.score
      });

      state.quizIndex += 1;
      if (state.quizIndex >= compatibilityQuestions.length) {
        finalizeQuiz();
      } else {
        renderQuizQuestion();
      }
    });
    el.quizOptions.appendChild(btn);
  });
}

function finalizeQuiz() {
  el.quizArea.classList.add('hidden');
  el.quizResult.classList.remove('hidden');

  if (state.quizScore >= 10) {
    el.quizResultTitle.textContent = 'Match meter: altissimo 💘';
    el.quizResultText.textContent = 'Energia da coppia che litiga su Netflix ma ride sempre.';
  } else if (state.quizScore >= 7) {
    el.quizResultTitle.textContent = 'Match meter: promettente ✨';
    el.quizResultText.textContent = 'Potremmo diventare una combo molto pericolosa (in senso buono).';
  } else {
    el.quizResultTitle.textContent = 'Match meter: caotico ma intrigante 🌪️';
    el.quizResultText.textContent = 'Hai gusti complessi, io rispetto e rilancio con ironia.';
  }

  logEvent('compatibility_completed', {
    score: state.quizScore,
    maxScore: 12
  });
}

function resetQuiz() {
  state.quizIndex = 0;
  state.quizScore = 0;
  el.quizResult.classList.add('hidden');
  el.quizArea.classList.remove('hidden');
  renderQuizQuestion();
}

el.startJourney.addEventListener('click', (ev) => {
  el.startJourney.classList.add('hidden');
  el.experience.classList.remove('hidden');
  revealWithStagger();
  showBurst(ev.clientX, ev.clientY);
  logEvent('journey_started');
});

el.startGame.addEventListener('click', (ev) => {
  el.gameIntro.classList.add('hidden');
  el.gamePlay.classList.remove('hidden');
  renderCurrentStatement();
  updateScoreBoard();
  showBurst(ev.clientX, ev.clientY);
  logEvent('green_red_started');
});

el.greenBtn.addEventListener('click', (ev) => handleGreenRedPick('green', ev));
el.redBtn.addEventListener('click', (ev) => handleGreenRedPick('red', ev));
el.replayGame.addEventListener('click', () => {
  logEvent('green_red_replay_clicked');
  resetGreenRedGame();
});

el.restartQuiz.addEventListener('click', () => {
  logEvent('compatibility_restarted');
  resetQuiz();
});

for (const chip of document.querySelectorAll('.log-click')) {
  chip.addEventListener('click', (ev) => {
    const tag = chip.dataset.tag || 'chip_unknown';
    chip.style.transform = 'scale(1.05)';
    setTimeout(() => {
      chip.style.transform = '';
    }, 180);
    showBurst(ev.clientX, ev.clientY);
    logEvent('fact_chip_clicked', { tag, text: chip.textContent?.trim() || '' });
  });
}

el.aboutHerForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const data = {
    message: document.getElementById('herMessage').value.trim(),
    funFact: document.getElementById('herFunFact').value.trim(),
    contact: document.getElementById('herContact').value.trim()
  };

  if (!data.message) {
    el.formStatus.textContent = 'Scrivi almeno una cosa su di te 😄';
    return;
  }

  await logEvent('about_her_submitted', data);
  el.formStatus.textContent = 'Messaggio inviato ✅';
  el.aboutHerForm.reset();
});

window.addEventListener('beforeunload', flushWithBeacon);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushWithBeacon();
});

window.addEventListener('load', () => {
  if (!isWebAppUrlConfigured()) {
    console.warn('Tracking remoto disattivato: imposta TRACKING_CONFIG.appsScriptWebAppUrl con la URL /exec della Web App.');
  }

  logEvent('page_loaded', {
    projectEditorUrl: TRACKING_CONFIG.projectEditorUrl,
    spreadsheetId: TRACKING_CONFIG.spreadsheetId
  });

  resetGreenRedGame();
  resetQuiz();

  setTimeout(() => {
    flushLogs();
  }, 1200);
});
