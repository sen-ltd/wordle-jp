/**
 * Pure Wordle logic for Wordle JP.
 * No DOM dependencies — safe to use in tests and browser alike.
 */

export const MAX_ATTEMPTS = 6;
export const WORD_LENGTH = 5;

/**
 * Check a guess against the answer.
 * Returns an array of WORD_LENGTH objects: { char, status }
 * status values: 'correct' | 'present' | 'absent'
 *
 * Duplicate-character handling:
 *  1. First pass: mark exact matches as 'correct'.
 *  2. Build a frequency map of remaining (unmatched) answer characters.
 *  3. Second pass: for non-correct guess chars, mark 'present' if the char
 *     still has remaining frequency, then decrement. Otherwise 'absent'.
 *
 * @param {string} guess  - 5-character hiragana guess
 * @param {string} answer - 5-character hiragana answer
 * @returns {{ char: string, status: 'correct'|'present'|'absent' }[]}
 */
export function checkGuess(guess, answer) {
  const result = Array.from({ length: WORD_LENGTH }, (_, i) => ({
    char: guess[i],
    status: 'absent',
  }));

  // Frequency map of answer chars not yet matched by a 'correct' slot
  const answerFreq = {};

  // Pass 1: mark correct positions
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i].status = 'correct';
    } else {
      answerFreq[answer[i]] = (answerFreq[answer[i]] ?? 0) + 1;
    }
  }

  // Pass 2: mark present / absent for non-correct slots
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i].status === 'correct') continue;
    const ch = guess[i];
    if (answerFreq[ch] > 0) {
      result[i].status = 'present';
      answerFreq[ch]--;
    }
    // else remains 'absent'
  }

  return result;
}

/**
 * Validate that a guess is eligible to be submitted.
 * Accepts: exactly WORD_LENGTH characters.
 * Optionally checks against a word list (if provided).
 *
 * @param {string}   guess    - candidate guess
 * @param {string[]|null} wordList - optional list of valid words (null = length-only check)
 * @returns {boolean}
 */
export function isValidGuess(guess, wordList = null) {
  if (!guess || guess.length !== WORD_LENGTH) return false;
  if (wordList !== null) return wordList.includes(guess);
  return true;
}

/**
 * Deterministic daily word selection based on a date string.
 * Same date always returns the same word.
 *
 * @param {Date|string} date     - Date object or ISO date string (YYYY-MM-DD)
 * @param {string[]}    wordList
 * @returns {string}
 */
export function getDailyWord(date, wordList) {
  const dateStr = date instanceof Date
    ? date.toISOString().slice(0, 10)
    : String(date).slice(0, 10);

  // Simple djb2-style hash of the date string
  let hash = 5381;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) + hash) ^ dateStr.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }

  return wordList[hash % wordList.length];
}

/**
 * Pick a random word from the list.
 *
 * @param {string[]} wordList
 * @returns {string}
 */
export function getRandomWord(wordList) {
  return wordList[Math.floor(Math.random() * wordList.length)];
}

/**
 * Format the game result as a shareable emoji grid string.
 *
 * @param {Array<Array<{char:string,status:string}>>} guesses - completed guess rows
 * @param {boolean} won
 * @param {number}  maxAttempts
 * @param {number|null} puzzleNumber - null for practice mode
 * @returns {string}
 */
export function formatShareResult(guesses, won, maxAttempts = MAX_ATTEMPTS, puzzleNumber = null) {
  const scoreStr = won ? `${guesses.length}/${maxAttempts}` : `X/${maxAttempts}`;
  const header = puzzleNumber !== null
    ? `Wordle JP #${puzzleNumber} ${scoreStr}`
    : `Wordle JP (練習) ${scoreStr}`;

  const emojiMap = {
    correct: '🟩',
    present: '🟨',
    absent: '⬜',
  };

  const grid = guesses
    .map(row => row.map(cell => emojiMap[cell.status]).join(''))
    .join('\n');

  return `${header}\n${grid}`;
}

/**
 * Compute keyboard key statuses from completed guesses.
 * A key's final status is the "best" it has ever received:
 *   correct > present > absent > (untouched)
 *
 * @param {Array<Array<{char:string,status:string}>>} guesses
 * @returns {Object.<string, 'correct'|'present'|'absent'>}
 */
export function getKeyStatuses(guesses) {
  const priority = { correct: 3, present: 2, absent: 1 };
  const statuses = {};

  for (const row of guesses) {
    for (const { char, status } of row) {
      const current = statuses[char];
      if (!current || priority[status] > priority[current]) {
        statuses[char] = status;
      }
    }
  }

  return statuses;
}
