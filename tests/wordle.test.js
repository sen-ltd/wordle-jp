import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  checkGuess,
  isValidGuess,
  getDailyWord,
  getRandomWord,
  formatShareResult,
  getKeyStatuses,
  MAX_ATTEMPTS,
  WORD_LENGTH,
} from '../src/wordle.js';
import { WORD_LIST } from '../src/words.js';

// ── constants ─────────────────────────────────────────────────────────────────

describe('constants', () => {
  it('MAX_ATTEMPTS is 6', () => {
    assert.equal(MAX_ATTEMPTS, 6);
  });

  it('WORD_LENGTH is 5', () => {
    assert.equal(WORD_LENGTH, 5);
  });
});

// ── checkGuess ────────────────────────────────────────────────────────────────

describe('checkGuess', () => {
  it('all correct', () => {
    const result = checkGuess('さくらんぼ', 'さくらんぼ');
    assert.equal(result.length, 5);
    assert.ok(result.every(c => c.status === 'correct'));
    assert.equal(result[0].char, 'さ');
  });

  it('all absent', () => {
    const result = checkGuess('あいうえお', 'さくらんぼ');
    assert.ok(result.every(c => c.status === 'absent'));
  });

  it('all present', () => {
    // Anagram: same chars, all in wrong positions
    // answer: あいうえお  guess: おえういあ
    const result = checkGuess('おえういあ', 'あいうえお');
    // positions: お≠あ, え≠い, う=う ← correct, い≠え, あ≠お
    // pos 2 (う) should be correct, others present
    assert.equal(result[2].status, 'correct'); // う is in pos 2 in both
    // others should be present
    assert.equal(result[0].status, 'present'); // お is in answer but pos 4
    assert.equal(result[1].status, 'present'); // え is in answer but pos 3
    assert.equal(result[3].status, 'present'); // い is in answer but pos 1
    assert.equal(result[4].status, 'present'); // あ is in answer but pos 0
  });

  it('mixed correct, present, absent', () => {
    // answer: さくらんぼ  guess: さいらのか
    // さ(0): correct  い(1): absent  ら(2): correct  の(3): absent  か(4): absent
    const result = checkGuess('さいらのか', 'さくらんぼ');
    assert.equal(result[0].status, 'correct');  // さ
    assert.equal(result[1].status, 'absent');   // い
    assert.equal(result[2].status, 'correct');  // ら
    assert.equal(result[3].status, 'absent');   // の
    assert.equal(result[4].status, 'absent');   // か
  });

  it('duplicate in guess but single in answer — only first match marked', () => {
    // answer: さくらんぼ (one さ)  guess: さださなさ (three さ)
    // position 0: さ exact match → correct
    // position 2: さ (answer char at 2 is ら) → さ not in remaining answer → absent
    // position 4: さ → absent
    // Build guess with さ at positions 0, 2, 4
    const result = checkGuess('さださなさ', 'さくらんぼ');
    assert.equal(result[0].char, 'さ');
    assert.equal(result[0].status, 'correct');
    assert.equal(result[2].char, 'さ');
    assert.equal(result[2].status, 'absent'); // used up by correct match at pos 0
    assert.equal(result[4].char, 'さ');
    assert.equal(result[4].status, 'absent');
  });

  it('duplicate in answer — two present matches', () => {
    // answer: ああああああ... we use a custom 5-char word with repeats
    // answer: ああいいう  guess: あああああ
    // pos 0: あ=あ correct; pos 1: あ=あ correct; pos 2: あ≠い → remaining あ in answer: 0 → absent
    // pos 3: あ≠い → absent; pos 4: あ≠う → absent
    const result = checkGuess('あああああ', 'ああいいう');
    assert.equal(result[0].status, 'correct');
    assert.equal(result[1].status, 'correct');
    assert.equal(result[2].status, 'absent');
    assert.equal(result[3].status, 'absent');
    assert.equal(result[4].status, 'absent');
  });

  it('duplicate in answer — excess guess chars are absent', () => {
    // answer: あいうあい  guess: ああああい
    // Pass 1 exact: pos 0 (あ=あ)→correct, pos 3 (あ=あ)→correct, pos 4 (い=い)→correct
    //   remaining answer freq after pass 1: { い:1, う:1 }  (pos 1 and 2 unmatched)
    // Pass 2 for non-correct:
    //   pos 1: char=あ, freq[あ] is 0 → absent
    //   pos 2: char=あ, freq[あ] is 0 → absent
    const result = checkGuess('ああああい', 'あいうあい');
    assert.equal(result[0].status, 'correct');  // あ pos 0 exact
    assert.equal(result[1].status, 'absent');   // あ — answer's あ already matched by correct slots
    assert.equal(result[2].status, 'absent');   // あ — same
    assert.equal(result[3].status, 'correct');  // あ pos 3 exact
    assert.equal(result[4].status, 'correct');  // い pos 4 exact
  });

  it('returns array of length WORD_LENGTH', () => {
    const result = checkGuess('こんにちは', 'さようなら');
    assert.equal(result.length, WORD_LENGTH);
  });

  it('each result item has char and status', () => {
    const result = checkGuess('こんにちは', 'こんにちは');
    for (const item of result) {
      assert.ok('char' in item, 'missing char');
      assert.ok('status' in item, 'missing status');
      assert.ok(['correct', 'present', 'absent'].includes(item.status));
    }
  });
});

// ── isValidGuess ──────────────────────────────────────────────────────────────

describe('isValidGuess', () => {
  it('returns true for 5-char string without word list', () => {
    assert.ok(isValidGuess('あいうえお'));
  });

  it('returns false for too-short string', () => {
    assert.equal(isValidGuess('あいう'), false);
  });

  it('returns false for too-long string', () => {
    assert.equal(isValidGuess('あいうえおか'), false);
  });

  it('returns false for empty string', () => {
    assert.equal(isValidGuess(''), false);
  });

  it('returns false for null', () => {
    assert.equal(isValidGuess(null), false);
  });

  it('returns true when word is in list', () => {
    const word = WORD_LIST[0];
    assert.ok(isValidGuess(word, WORD_LIST));
  });

  it('returns false when word not in list', () => {
    assert.equal(isValidGuess('あいうえお', WORD_LIST), false);
  });
});

// ── getDailyWord ──────────────────────────────────────────────────────────────

describe('getDailyWord', () => {
  it('returns a word from the list', () => {
    const word = getDailyWord('2026-01-01', WORD_LIST);
    assert.ok(WORD_LIST.includes(word), `"${word}" not in WORD_LIST`);
  });

  it('is deterministic for the same date', () => {
    const date = '2026-04-13';
    const w1 = getDailyWord(date, WORD_LIST);
    const w2 = getDailyWord(date, WORD_LIST);
    assert.equal(w1, w2);
  });

  it('returns different words for different dates (most of the time)', () => {
    const dates = ['2026-01-01', '2026-02-14', '2026-06-15', '2026-12-31'];
    const words = dates.map(d => getDailyWord(d, WORD_LIST));
    // At least 2 distinct words among the 4 dates
    const unique = new Set(words);
    assert.ok(unique.size >= 2, `All same word: ${[...unique]}`);
  });

  it('accepts a Date object', () => {
    const date = new Date('2026-04-13');
    const word = getDailyWord(date, WORD_LIST);
    assert.ok(WORD_LIST.includes(word));
  });

  it('produces valid word for every day in a month', () => {
    for (let day = 1; day <= 28; day++) {
      const date = `2026-03-${String(day).padStart(2, '0')}`;
      const word = getDailyWord(date, WORD_LIST);
      assert.ok(WORD_LIST.includes(word), `Invalid word for ${date}: ${word}`);
    }
  });
});

// ── getRandomWord ─────────────────────────────────────────────────────────────

describe('getRandomWord', () => {
  it('returns a word in the list', () => {
    const word = getRandomWord(WORD_LIST);
    assert.ok(WORD_LIST.includes(word));
  });

  it('returns a 5-character word', () => {
    const word = getRandomWord(WORD_LIST);
    assert.equal(word.length, 5);
  });
});

// ── formatShareResult ─────────────────────────────────────────────────────────

describe('formatShareResult', () => {
  const sampleGuesses = [
    [
      { char: 'あ', status: 'absent' },
      { char: 'い', status: 'present' },
      { char: 'う', status: 'correct' },
      { char: 'え', status: 'absent' },
      { char: 'お', status: 'absent' },
    ],
    [
      { char: 'さ', status: 'correct' },
      { char: 'く', status: 'correct' },
      { char: 'ら', status: 'correct' },
      { char: 'ん', status: 'correct' },
      { char: 'ぼ', status: 'correct' },
    ],
  ];

  it('contains puzzle number header when provided', () => {
    const result = formatShareResult(sampleGuesses, true, 6, 42);
    assert.ok(result.includes('#42'), `Expected #42 in "${result}"`);
  });

  it('shows practice label when no puzzle number', () => {
    const result = formatShareResult(sampleGuesses, true, 6, null);
    assert.ok(result.includes('練習'), `Expected 練習 in "${result}"`);
  });

  it('shows score as attempts/maxAttempts when won', () => {
    const result = formatShareResult(sampleGuesses, true, 6, 1);
    assert.ok(result.includes('2/6'), `Expected 2/6 in "${result}"`);
  });

  it('shows X/maxAttempts when lost', () => {
    const result = formatShareResult(sampleGuesses, false, 6, 1);
    assert.ok(result.includes('X/6'), `Expected X/6 in "${result}"`);
  });

  it('contains correct emoji for each status', () => {
    const result = formatShareResult(sampleGuesses, true, 6, 1);
    assert.ok(result.includes('🟩'), 'missing 🟩');
    assert.ok(result.includes('🟨'), 'missing 🟨');
    assert.ok(result.includes('⬜'), 'missing ⬜');
  });

  it('has correct number of emoji rows', () => {
    const result = formatShareResult(sampleGuesses, true, 6, 1);
    const lines = result.split('\n');
    // 1 header line + 2 emoji rows = 3 lines
    assert.equal(lines.length, 3);
  });

  it('each emoji row has exactly 5 emoji', () => {
    const result = formatShareResult(sampleGuesses, true, 6, 1);
    const emojiRows = result.split('\n').slice(1);
    for (const row of emojiRows) {
      // Count emoji characters
      const emojis = [...row.matchAll(/🟩|🟨|⬜/g)];
      assert.equal(emojis.length, WORD_LENGTH, `Row "${row}" has ${emojis.length} emoji`);
    }
  });
});

// ── getKeyStatuses ────────────────────────────────────────────────────────────

describe('getKeyStatuses', () => {
  it('returns correct statuses for all guessed chars', () => {
    const guesses = [
      [
        { char: 'あ', status: 'correct' },
        { char: 'い', status: 'present' },
        { char: 'う', status: 'absent' },
        { char: 'え', status: 'absent' },
        { char: 'お', status: 'absent' },
      ],
    ];
    const statuses = getKeyStatuses(guesses);
    assert.equal(statuses['あ'], 'correct');
    assert.equal(statuses['い'], 'present');
    assert.equal(statuses['う'], 'absent');
  });

  it('upgrades status from present to correct', () => {
    const guesses = [
      [{ char: 'あ', status: 'present' }, ...Array(4).fill({ char: 'い', status: 'absent' })],
      [{ char: 'あ', status: 'correct' }, ...Array(4).fill({ char: 'う', status: 'absent' })],
    ];
    const statuses = getKeyStatuses(guesses);
    assert.equal(statuses['あ'], 'correct');
  });

  it('does not downgrade correct to present', () => {
    const guesses = [
      [{ char: 'あ', status: 'correct' }, ...Array(4).fill({ char: 'い', status: 'absent' })],
      [{ char: 'あ', status: 'present' }, ...Array(4).fill({ char: 'う', status: 'absent' })],
    ];
    const statuses = getKeyStatuses(guesses);
    assert.equal(statuses['あ'], 'correct');
  });

  it('returns empty object for no guesses', () => {
    const statuses = getKeyStatuses([]);
    assert.deepEqual(statuses, {});
  });
});

// ── WORD_LIST ─────────────────────────────────────────────────────────────────

describe('WORD_LIST', () => {
  it('has at least 100 words', () => {
    assert.ok(WORD_LIST.length >= 100, `Only ${WORD_LIST.length} words`);
  });

  it('all words are exactly 5 characters', () => {
    const invalid = WORD_LIST.filter(w => w.length !== 5);
    assert.deepEqual(invalid, []);
  });

  it('all words contain only standard hiragana', () => {
    const hiraganaRe = /^[\u3041-\u3096]{5}$/;
    const invalid = WORD_LIST.filter(w => !hiraganaRe.test(w));
    assert.deepEqual(invalid, []);
  });

  it('has no duplicates', () => {
    const unique = new Set(WORD_LIST);
    assert.equal(unique.size, WORD_LIST.length);
  });
});
