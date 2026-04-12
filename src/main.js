/**
 * Wordle JP — main entry point.
 * Handles DOM rendering, event binding, and game flow.
 */

import { WORD_LIST } from './words.js';
import {
  MAX_ATTEMPTS,
  WORD_LENGTH,
  checkGuess,
  isValidGuess,
  getDailyWord,
  getRandomWord,
  formatShareResult,
  getKeyStatuses,
} from './wordle.js';
import { getT } from './i18n.js';

// ── State ─────────────────────────────────────────────────────────────────────

const state = {
  answer: '',
  guesses: [],          // Array of result rows from checkGuess
  currentInput: [],     // Array of chars for the current row
  gameStatus: 'playing', // 'playing' | 'won' | 'lost'
  mode: 'daily',        // 'daily' | 'practice'
  locale: 'ja',
  darkMode: false,
  stats: loadStats(),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadStats() {
  try {
    const raw = localStorage.getItem('wordle-jp-stats');
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
}

function saveStats() {
  try {
    localStorage.setItem('wordle-jp-stats', JSON.stringify(state.stats));
  } catch (_) { /* ignore */ }
}

function loadDailyState() {
  try {
    const raw = localStorage.getItem('wordle-jp-daily');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) { return null; }
}

function saveDailyState() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('wordle-jp-daily', JSON.stringify({
      date: today,
      answer: state.answer,
      guesses: state.guesses,
      gameStatus: state.gameStatus,
    }));
  } catch (_) { /* ignore */ }
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getPuzzleNumber() {
  const epoch = new Date('2026-01-01');
  const today = new Date(getTodayString());
  return Math.floor((today - epoch) / 86400000) + 1;
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initGame(mode) {
  state.mode = mode;
  state.guesses = [];
  state.currentInput = [];
  state.gameStatus = 'playing';

  if (mode === 'daily') {
    const today = getTodayString();
    const saved = loadDailyState();
    if (saved && saved.date === today) {
      // Restore today's game
      state.answer = saved.answer;
      state.guesses = saved.guesses;
      state.gameStatus = saved.gameStatus;
    } else {
      state.answer = getDailyWord(today, WORD_LIST);
    }
  } else {
    state.answer = getRandomWord(WORD_LIST);
  }

  renderAll();
}

// ── Keyboard input ─────────────────────────────────────────────────────────────

function handleChar(char) {
  if (state.gameStatus !== 'playing') return;
  if (state.currentInput.length >= WORD_LENGTH) return;
  state.currentInput.push(char);
  renderCurrentRow();
}

function handleDelete() {
  if (state.gameStatus !== 'playing') return;
  if (state.currentInput.length === 0) return;
  state.currentInput.pop();
  renderCurrentRow();
}

function handleEnter() {
  if (state.gameStatus !== 'playing') return;

  const t = getT(state.locale);
  const guess = state.currentInput.join('');

  if (guess.length < WORD_LENGTH) {
    showToast(t.tooShort);
    shakeCurrentRow();
    return;
  }

  if (!isValidGuess(guess, WORD_LIST)) {
    showToast(t.notInList);
    shakeCurrentRow();
    return;
  }

  const result = checkGuess(guess, state.answer);
  state.guesses.push(result);
  state.currentInput = [];

  const won = result.every(cell => cell.status === 'correct');
  const lost = !won && state.guesses.length >= MAX_ATTEMPTS;

  if (won || lost) {
    state.gameStatus = won ? 'won' : 'lost';
    updateStats(won, state.guesses.length);
  }

  if (state.mode === 'daily') {
    saveDailyState();
  }

  renderAll();

  if (won) {
    const messages = ['すごい！', '素晴らしい！', 'やった！', '正解！', '完璧！', 'よくできました！'];
    const msg = messages[Math.min(state.guesses.length - 1, messages.length - 1)];
    setTimeout(() => {
      showToast(msg);
      setTimeout(() => showStatsModal(), 1800);
    }, 400);
  } else if (lost) {
    setTimeout(() => {
      const t = getT(state.locale);
      showToast(`${t.answer}${state.answer}`, 3000);
      setTimeout(() => showStatsModal(), 2200);
    }, 400);
  }
}

function updateStats(won, attempts) {
  state.stats.played++;
  if (won) {
    state.stats.won++;
    state.stats.currentStreak++;
    state.stats.maxStreak = Math.max(state.stats.maxStreak, state.stats.currentStreak);
    state.stats.distribution[attempts] = (state.stats.distribution[attempts] ?? 0) + 1;
  } else {
    state.stats.currentStreak = 0;
  }
  saveStats();
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function renderAll() {
  renderGrid();
  renderKeyboard();
  renderModeIndicator();
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  for (let rowIndex = 0; rowIndex < MAX_ATTEMPTS; rowIndex++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    rowEl.dataset.row = rowIndex;

    const isCurrentRow = rowIndex === state.guesses.length && state.gameStatus === 'playing';
    const isCompletedRow = rowIndex < state.guesses.length;

    for (let col = 0; col < WORD_LENGTH; col++) {
      const tile = document.createElement('div');
      tile.className = 'tile';

      if (isCompletedRow) {
        const cell = state.guesses[rowIndex][col];
        tile.textContent = cell.char;
        tile.dataset.status = cell.status;
        tile.style.animationDelay = `${col * 80}ms`;
        tile.classList.add('flip');
      } else if (isCurrentRow && col < state.currentInput.length) {
        tile.textContent = state.currentInput[col];
        tile.classList.add('filled');
      }

      rowEl.appendChild(tile);
    }

    grid.appendChild(rowEl);
  }
}

function renderCurrentRow() {
  const rowIndex = state.guesses.length;
  const rowEl = document.querySelector(`.row[data-row="${rowIndex}"]`);
  if (!rowEl) return;

  const tiles = rowEl.querySelectorAll('.tile');
  tiles.forEach((tile, col) => {
    tile.textContent = state.currentInput[col] ?? '';
    tile.classList.toggle('filled', col < state.currentInput.length);
    tile.classList.remove('pop');
    if (col < state.currentInput.length) {
      // Trigger pop animation
      void tile.offsetWidth; // reflow
      tile.classList.add('pop');
    }
  });
}

function renderKeyboard() {
  const keyStatuses = getKeyStatuses(state.guesses);
  const keys = document.querySelectorAll('.key[data-char]');
  keys.forEach(key => {
    const ch = key.dataset.char;
    const status = keyStatuses[ch];
    key.dataset.status = status ?? '';
  });
}

function renderModeIndicator() {
  const t = getT(state.locale);
  const el = document.getElementById('mode-indicator');
  if (!el) return;
  if (state.mode === 'daily') {
    el.textContent = `${t.puzzleNumber} #${getPuzzleNumber()}`;
  } else {
    el.textContent = t.practiceMode;
  }
}

function shakeCurrentRow() {
  const rowIndex = state.guesses.length;
  const rowEl = document.querySelector(`.row[data-row="${rowIndex}"]`);
  if (!rowEl) return;
  rowEl.classList.remove('shake');
  void rowEl.offsetWidth;
  rowEl.classList.add('shake');
  rowEl.addEventListener('animationend', () => rowEl.classList.remove('shake'), { once: true });
}

// ── Toast ─────────────────────────────────────────────────────────────────────

let toastTimer = null;

function showToast(message, duration = 1500) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), duration);
}

// ── Stats Modal ───────────────────────────────────────────────────────────────

function showStatsModal() {
  const t = getT(state.locale);
  const modal = document.getElementById('stats-modal');
  const s = state.stats;
  const winPct = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;

  document.getElementById('stat-played').textContent = s.played;
  document.getElementById('stat-winpct').textContent = winPct;
  document.getElementById('stat-streak').textContent = s.currentStreak;
  document.getElementById('stat-maxstreak').textContent = s.maxStreak;

  // Distribution bars
  const distContainer = document.getElementById('distribution');
  distContainer.innerHTML = '';
  const maxVal = Math.max(1, ...Object.values(s.distribution));
  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    const count = s.distribution[i] ?? 0;
    const row = document.createElement('div');
    row.className = 'dist-row';
    const label = document.createElement('span');
    label.className = 'dist-label';
    label.textContent = i;
    const bar = document.createElement('div');
    bar.className = 'dist-bar';
    const isCurrentGuess = state.gameStatus === 'won' && state.guesses.length === i;
    if (isCurrentGuess) bar.classList.add('current');
    bar.style.width = `${Math.max(7, Math.round((count / maxVal) * 100))}%`;
    const countEl = document.createElement('span');
    countEl.className = 'dist-count';
    countEl.textContent = count;
    bar.appendChild(countEl);
    row.appendChild(label);
    row.appendChild(bar);
    distContainer.appendChild(row);
  }

  // Share button
  const shareBtn = document.getElementById('share-btn');
  if (state.gameStatus !== 'playing') {
    shareBtn.style.display = '';
    shareBtn.onclick = handleShare;
  } else {
    shareBtn.style.display = 'none';
  }

  modal.classList.add('open');
}

function hideStatsModal() {
  document.getElementById('stats-modal').classList.remove('open');
}

async function handleShare() {
  const t = getT(state.locale);
  const puzzleNum = state.mode === 'daily' ? getPuzzleNumber() : null;
  const text = formatShareResult(state.guesses, state.gameStatus === 'won', MAX_ATTEMPTS, puzzleNum);
  try {
    await navigator.clipboard.writeText(text);
    showToast(t.copied);
  } catch (_) {
    // Fallback: show in a prompt
    window.prompt('コピーしてください:', text);
  }
}

// ── How-to-play Modal ─────────────────────────────────────────────────────────

function showHowToPlay() {
  document.getElementById('howto-modal').classList.add('open');
}

function hideHowToPlay() {
  document.getElementById('howto-modal').classList.remove('open');
}

// ── Event Binding ─────────────────────────────────────────────────────────────

function bindEvents() {
  // Physical keyboard
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key;
    if (key === 'Enter') { handleEnter(); return; }
    if (key === 'Backspace') { handleDelete(); return; }
    // Detect hiragana input (typed via IME or direct key)
    if (/^[\u3041-\u3096]$/.test(key)) { handleChar(key); }
  });

  // On-screen keyboard (delegated)
  document.getElementById('keyboard').addEventListener('click', e => {
    const key = e.target.closest('.key');
    if (!key) return;
    const action = key.dataset.action;
    const ch = key.dataset.char;
    if (action === 'enter') { handleEnter(); }
    else if (action === 'delete') { handleDelete(); }
    else if (ch) { handleChar(ch); }
  });

  // Mode switcher
  document.getElementById('btn-daily').addEventListener('click', () => initGame('daily'));
  document.getElementById('btn-practice').addEventListener('click', () => initGame('practice'));

  // Stats button
  document.getElementById('btn-stats').addEventListener('click', showStatsModal);
  document.getElementById('stats-close').addEventListener('click', hideStatsModal);
  document.getElementById('stats-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) hideStatsModal();
  });

  // How to play
  document.getElementById('btn-howto').addEventListener('click', showHowToPlay);
  document.getElementById('howto-close').addEventListener('click', hideHowToPlay);
  document.getElementById('howto-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) hideHowToPlay();
  });

  // Language toggle
  document.getElementById('btn-lang').addEventListener('click', () => {
    state.locale = state.locale === 'ja' ? 'en' : 'ja';
    applyLocale();
  });

  // Dark mode toggle
  document.getElementById('btn-theme').addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    document.documentElement.classList.toggle('dark', state.darkMode);
    document.getElementById('btn-theme').textContent = state.darkMode ? '☀️' : '🌙';
  });
}

function applyLocale() {
  const t = getT(state.locale);
  document.getElementById('btn-lang').textContent = state.locale === 'ja' ? 'EN' : 'JP';
  document.getElementById('btn-daily').textContent = t.modeDaily;
  document.getElementById('btn-practice').textContent = t.modePractice;
  document.getElementById('btn-stats').title = t.stats;
  document.getElementById('btn-howto').title = t.howToPlay;

  // Update stat labels
  const labelMap = {
    'label-played': 'gamesPlayed',
    'label-winpct': 'winRate',
    'label-streak': 'currentStreak',
    'label-maxstreak': 'maxStreak',
  };
  for (const [id, key] of Object.entries(labelMap)) {
    const el = document.getElementById(id);
    if (el) el.textContent = t[key];
  }

  document.getElementById('share-btn').textContent = t.share;
  document.getElementById('stats-title').textContent = t.stats;
  document.getElementById('howto-title').textContent = t.howToPlay;
  document.getElementById('dist-title').textContent = t.guessDistribution;

  renderModeIndicator();
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

function bootstrap() {
  bindEvents();
  applyLocale();
  initGame('daily');
}

document.addEventListener('DOMContentLoaded', bootstrap);
