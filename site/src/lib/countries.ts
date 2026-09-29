// Opponent countries for overseas teams. A game with no country is a domestic
// (Japanese) team and gets no flag. Codes are ISO 3166-1 alpha-2, lowercase.

export const COUNTRIES: [code: string, name: string][] = [
  ["kr", "韓国"],
  ["cn", "中国"],
  ["tw", "台湾"],
  ["hk", "香港"],
  ["mo", "マカオ"],
  ["mn", "モンゴル"],
  ["ph", "フィリピン"],
  ["th", "タイ"],
  ["sg", "シンガポール"],
  ["my", "マレーシア"],
  ["id", "インドネシア"],
  ["vn", "ベトナム"],
  ["in", "インド"],
  ["au", "オーストラリア"],
  ["nz", "ニュージーランド"],
  ["us", "アメリカ"],
  ["ca", "カナダ"],
  ["br", "ブラジル"],
  ["fr", "フランス"],
  ["de", "ドイツ"],
  ["nl", "オランダ"],
  ["es", "スペイン"],
  ["it", "イタリア"],
  ["ch", "スイス"],
  ["at", "オーストリア"],
  ["pl", "ポーランド"],
  ["cz", "チェコ"],
  ["hu", "ハンガリー"],
  ["ro", "ルーマニア"],
  ["lt", "リトアニア"],
  ["lv", "ラトビア"],
  ["ee", "エストニア"],
  ["ua", "ウクライナ"],
  ["az", "アゼルバイジャン"],
  ["tr", "トルコ"],
  ["il", "イスラエル"],
];

const NAMES = new Map(COUNTRIES);

export const countryName = (code?: string) => (code ? NAMES.get(code.toLowerCase()) ?? code.toUpperCase() : "");

/** Flag image (4:3 SVG) for a country code, or "" for domestic / unknown. */
export const flagUrl = (code?: string) => (code && /^[a-z]{2}$/i.test(code) ? `https://flagcdn.com/${code.toLowerCase()}.svg` : "");
