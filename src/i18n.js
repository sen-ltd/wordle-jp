/**
 * UI translations for Wordle JP.
 * The game content itself (hiragana words) is language-agnostic;
 * only the interface labels are translated.
 */

export const TRANSLATIONS = {
  ja: {
    title: 'ワードル JP',
    subtitle: '5文字のひらがなを当てよう',
    modeDaily: '今日の問題',
    modePractice: '練習モード',
    newGame: '新しいゲーム',
    share: '結果をシェア',
    copied: 'コピーしました！',
    stats: '成績',
    close: '閉じる',
    gamesPlayed: 'プレイ数',
    winRate: '勝率',
    currentStreak: '現在の連勝',
    maxStreak: '最高連勝',
    guessDistribution: '予想回数の分布',
    notInList: '単語リストにありません',
    tooShort: '5文字入力してください',
    alreadyGuessed: 'すでに入力した単語です',
    correct: '正解！',
    gameOver: 'ゲームオーバー',
    answer: '答え：',
    nextWordIn: '次の問題まで：',
    darkMode: 'ダークモード',
    lightMode: 'ライトモード',
    howToPlay: '遊び方',
    howToPlayText: [
      '5文字のひらがなを6回以内に当ててください。',
      '各入力後、文字の色が変わります：',
    ],
    colorCorrect: '正しい位置',
    colorPresent: '含まれるが位置が違う',
    colorAbsent: '含まれない',
    enterKey: '確定',
    deleteKey: '削除',
    puzzleNumber: '問題',
    practiceMode: '練習',
  },
  en: {
    title: 'Wordle JP',
    subtitle: 'Guess the 5-hiragana word',
    modeDaily: "Today's puzzle",
    modePractice: 'Practice mode',
    newGame: 'New game',
    share: 'Share result',
    copied: 'Copied!',
    stats: 'Statistics',
    close: 'Close',
    gamesPlayed: 'Played',
    winRate: 'Win %',
    currentStreak: 'Current streak',
    maxStreak: 'Max streak',
    guessDistribution: 'Guess distribution',
    notInList: 'Not in word list',
    tooShort: 'Please enter 5 characters',
    alreadyGuessed: 'Already guessed this word',
    correct: 'Brilliant!',
    gameOver: 'Game over',
    answer: 'Answer: ',
    nextWordIn: 'Next word in: ',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    howToPlay: 'How to play',
    howToPlayText: [
      'Guess the 5-hiragana word in 6 attempts.',
      'After each guess the tiles change colour:',
    ],
    colorCorrect: 'Correct position',
    colorPresent: 'Wrong position',
    colorAbsent: 'Not in word',
    enterKey: 'Enter',
    deleteKey: 'Del',
    puzzleNumber: 'Puzzle',
    practiceMode: 'Practice',
  },
};

/**
 * Get the translation object for the given locale.
 * Falls back to Japanese if the locale is not found.
 *
 * @param {'ja'|'en'} locale
 * @returns {typeof TRANSLATIONS.ja}
 */
export function getT(locale) {
  return TRANSLATIONS[locale] ?? TRANSLATIONS.ja;
}
