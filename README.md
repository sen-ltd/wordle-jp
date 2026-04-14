# ワードル JP

日本語版 Wordle。5文字のひらがなを6回以内に当てる。日替わり問題 + 練習モード。

**Japanese Wordle** — guess a 5-hiragana word in 6 attempts. Daily puzzle + practice mode.

🎮 **Demo**: https://sen.ltd/portfolio/wordle-jp/

---

## Features

- **Daily puzzle** — same word for everyone each day (date-seeded, deterministic)
- **Practice mode** — random word, unlimited replays
- **On-screen hiragana keyboard** — full 50音 layout with voiced/semi-voiced rows
- **Color-coded feedback** per tile and keyboard key: 🟩 correct · 🟨 present · ⬜ absent
- **Share result** as emoji grid (copies to clipboard)
- **Statistics** — games played, win rate, current streak, max streak, guess distribution
- **Dark / light theme**
- **Japanese / English UI** (game content stays hiragana)
- Zero dependencies, no build step — pure HTML + CSS + ES modules

## How to play

Enter a 5-character hiragana word and press **確定** (Enter).  
After each guess the tiles flip to reveal:

| Color | Meaning |
|-------|---------|
| 🟩 Green | Character is in the correct position |
| 🟨 Yellow | Character is in the word but wrong position |
| ⬜ Gray | Character is not in the word |

Keyboard keys update to reflect the best status seen so far.

## Getting started

```sh
# Serve locally
npm run serve
# → open http://localhost:8080

# Run tests
npm test
```

No build step required. Works directly in any modern browser.

## Project structure

```
wordle-jp/
├── index.html          # App shell + modals + keyboard markup
├── style.css           # CSS custom properties, animations, responsive layout
├── src/
│   ├── main.js         # DOM, events, game flow, localStorage
│   ├── wordle.js       # Pure logic (checkGuess, daily word, share format)
│   ├── words.js        # 160+ valid 5-hiragana words
│   └── i18n.js         # ja/en UI string translations
├── tests/
│   └── wordle.test.js  # 40 tests using Node.js built-in test runner
└── assets/             # Screenshots and promotional images
```

## Word list

The `src/words.js` file contains 160+ common 5-character hiragana words covering:
- Everyday expressions (こんにちは, ありがとう, ...)
- Food, nature, animals, places, professions
- Adjectives and action phrases

All words pass validation: exactly 5 standard hiragana characters (U+3041–U+3096), no duplicates.

## License

MIT © 2026 [SEN LLC (SEN 合同会社)](https://sen.ltd)

<!-- sen-publish:links -->
## Links

- 🌐 Demo: https://sen.ltd/portfolio/wordle-jp/
- 📝 dev.to: https://dev.to/sendotltd/japanese-wordle-why-duplicate-character-handling-is-trickier-than-it-looks-3gja
<!-- /sen-publish:links -->
