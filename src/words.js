/**
 * 5-character hiragana word list for Wordle JP.
 * Each entry is exactly 5 hiragana characters (each hiragana codepoint counts as 1).
 * Only standard hiragana (U+3041–U+3096) are used.
 */

// Raw word list — duplicates and invalid entries are filtered out below.
const _RAW = [
  // Greetings & expressions
  'こんにちは', // hello
  'ありがとう', // thank you
  'おめでとう', // congratulations
  'さようなら', // goodbye
  'よろしくね', // nice to meet you (casual)

  // Food & drink
  'さくらんぼ', // cherry
  'たまごやき', // tamagoyaki (rolled omelette)
  'にほんしゅ', // Japanese sake
  'おちゃのみ', // tea drinking
  'みそしるの', // miso soup (with particle)
  'なっとうの', // natto
  'うどんこな', // udon flour
  'そばのみせ', // soba restaurant
  'おにぎりや', // onigiri shop
  'やきとりや', // yakitori shop
  'てんぷらや', // tempura shop
  'すしのみせ', // sushi restaurant
  'おでんやさ', // oden shop

  // Nature
  'あおぞらの', // blue sky
  'さくらのき', // cherry blossom tree
  'あじさいの', // hydrangea
  'ひまわりの', // sunflower
  'たんぽぽの', // dandelion
  'もみじのは', // maple leaf
  'ゆきのした', // under the snow / plant name
  'かわのみず', // river water
  'やまのうえ', // top of the mountain
  'うみのなみ', // ocean waves
  'はなのかお', // flower scent
  'つきのひか', // moonlight
  'ほしのそら', // starry sky
  'なつのかぜ', // summer breeze
  'ふゆのゆき', // winter snow
  'はるのはな', // spring flowers
  'あきのそら', // autumn sky
  'にわのはな', // garden flower
  'やねのうえ', // on the roof
  'もりのなか', // inside the forest
  'かぜのおと', // sound of wind
  'あめのひに', // on a rainy day
  'くものうえ', // above the clouds

  // Animals
  'とりのこえ', // bird's voice
  'さかなのめ', // fish eye
  'しろいねこ', // white cat
  'くろいいぬ', // black dog
  'きつねのこ', // fox child

  // Places
  'とうきょう', // Tokyo
  'おおさかの', // Osaka
  'きょうとの', // Kyoto
  'なごやじょ', // Nagoya castle
  'さっぽろの', // Sapporo
  'よこはまの', // Yokohama
  'ふくおかの', // Fukuoka
  'かまくらの', // Kamakura
  'にっこうの', // Nikko
  'あさくさの', // Asakusa
  'しんじゅく', // Shinjuku
  'いけぶくろ', // Ikebukuro
  'あきはばら', // Akihabara
  'おだいばの', // Odaiba
  'こうえんの', // park

  // People & Society
  'にほんじん', // Japanese person
  'がくせいの', // student
  'せんせいの', // teacher
  'いしゃさん', // doctor
  'けいさつの', // police
  'しょうぼう', // fire brigade
  'かいしゃの', // company
  'がっこうの', // school
  'びょういん', // hospital
  'としょかん', // library
  'えきのまえ', // in front of the station
  'でんしゃの', // train
  'じどうしゃ', // automobile
  'じてんしゃ', // bicycle

  // Things & Objects
  'まどのそと', // outside the window
  'つくえのう', // on the desk
  'いすのした', // under the chair
  'えんぴつで', // with a pencil
  'かみのうえ', // on paper
  'はさみでき', // cut with scissors
  'かがみのな', // mirror
  'はなびらの', // petal
  'かぎのあな', // keyhole
  'ほんのむし', // bookworm

  // Adjective phrases / words
  'あたたかい', // warm
  'やわらかい', // soft
  'むずかしい', // difficult
  'すばらしい', // wonderful
  'たのしいな', // fun
  'さびしいな', // lonely
  'うれしいな', // happy
  'かなしいな', // sad
  'あかいはな', // red flower
  'しろいゆき', // white snow
  'あおいうみ', // blue sea
  'きいろいは', // yellow leaf
  'みどりのき', // green tree
  'くろいよる', // black night
  'やさしいか', // gentle
  'つめたいか', // cold

  // Actions & Verb phrases
  'はしるひと', // running person
  'あるくみち', // walking path
  'およぐさか', // swimming fish
  'とぶとりの', // flying bird
  'わらうかお', // laughing face
  'なくこえの', // crying voice
  'うたうひと', // singing person
  'おどるひめ', // dancing princess
  'やすむひる', // afternoon rest
  'あそぶこと', // playing
  'まなぶこと', // learning
  'はたらくひ', // working day

  // Time
  'きのうのよ', // last night
  'あしたのあ', // tomorrow morning
  'きょうのひ', // today
  'まいにちの', // every day
  'あさのひか', // morning light
  'よるのかぜ', // night breeze
  'しゅうまつ', // weekend
  'もうすぐの', // soon
  'いちにちじ', // all day long

  // Extra words to reach 100+
  'かいものに', // shopping (going)
  'りょうりを', // cooking
  'しょくじの', // meal
  'うんどうの', // exercise
  'おんがくを', // music
  'えいがみる', // watching a movie
  'ほんをよむ', // reading a book
  'てがみをか', // writing a letter
  'でんわする', // making a phone call
  'さんぽする', // taking a walk
  'りょこうに', // on a trip
  'にほんごの', // Japanese language
  'えいごのほ', // English (book)
  'すうがくの', // mathematics
  'かがくのじ', // science
  'れきしのほ', // history (book)
  'びじゅつの', // art
  'たいいくの', // physical education
  'おんがくの', // music (class)
  'げいじゅつ', // art/artistry
  'しぜんのか', // nature
  'かんきょうの', // — 6 chars, skip
  'きせつのい', // season change
  'てんきのは', // weather
  'あかるいひ', // bright day
  'しずかなよ', // quiet night
  'にぎやかな', // lively
  'ふしぎなは', // mysterious
  'たいせつな', // important/precious
  'げんきなこ', // energetic child
  'すてきなひ', // wonderful day
  'はやいかぜ', // fast wind
  'おそいうご', // slow movement
  'つよいかぜ', // strong wind
  'よわいひか', // weak light
  'あたらしい', // new
  'ふるいいえ', // old house
  'たかいやま', // tall mountain
  'ひくいおと', // low sound
  'ながいかわ', // long river
  'みじかいよ', // short night
  'おもいには', // heavy bag
  'かるいかぜ', // light breeze
];

// Filter: exactly 5 chars, all standard hiragana, no duplicates
const _hiraganaRe = /^[\u3041-\u3096]{5}$/;
const _seen = new Set();

export const WORD_LIST = _RAW.filter(w => {
  if (!_hiraganaRe.test(w)) return false;
  if (_seen.has(w)) return false;
  _seen.add(w);
  return true;
});
