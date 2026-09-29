// Opponent countries for the flag shown after an opponent's name. A game with no
// country gets no flag (a domestic team); pick 日本 for Japanese teams at
// international events. Codes are flagcdn.com codes: ISO 3166-1 alpha-2,
// lowercase, plus the UK home nations (gb-eng, gb-sct, gb-wls, gb-nir).

export const COUNTRY_GROUPS: { region: string; list: [code: string, name: string][] }[] = [
  { region: "日本", list: [["jp", "日本"]] },
  {
    region: "アジア",
    list: [
      ["kr", "韓国"], ["cn", "中国"], ["tw", "台湾"], ["hk", "香港"], ["mo", "マカオ"], ["mn", "モンゴル"],
      ["ph", "フィリピン"], ["th", "タイ"], ["sg", "シンガポール"], ["my", "マレーシア"], ["id", "インドネシア"],
      ["vn", "ベトナム"], ["kh", "カンボジア"], ["mm", "ミャンマー"], ["in", "インド"], ["lk", "スリランカ"],
      ["kz", "カザフスタン"], ["uz", "ウズベキスタン"], ["kg", "キルギス"], ["tj", "タジキスタン"], ["tm", "トルクメニスタン"],
    ],
  },
  {
    region: "中東",
    list: [
      ["ir", "イラン"], ["iq", "イラク"], ["qa", "カタール"], ["sa", "サウジアラビア"], ["ae", "アラブ首長国連邦"],
      ["kw", "クウェート"], ["bh", "バーレーン"], ["om", "オマーン"], ["jo", "ヨルダン"], ["lb", "レバノン"],
      ["sy", "シリア"], ["il", "イスラエル"], ["tr", "トルコ"],
    ],
  },
  {
    region: "オセアニア",
    list: [
      ["au", "オーストラリア"], ["nz", "ニュージーランド"], ["gu", "グアム"], ["fj", "フィジー"], ["pg", "パプアニューギニア"],
      ["ws", "サモア"], ["to", "トンガ"], ["vu", "バヌアツ"], ["nc", "ニューカレドニア"], ["pf", "タヒチ"],
    ],
  },
  {
    region: "ヨーロッパ",
    list: [
      ["gb", "イギリス"], ["gb-eng", "イングランド"], ["gb-sct", "スコットランド"], ["gb-wls", "ウェールズ"], ["gb-nir", "北アイルランド"],
      ["ie", "アイルランド"], ["fr", "フランス"], ["de", "ドイツ"], ["nl", "オランダ"], ["be", "ベルギー"], ["lu", "ルクセンブルク"],
      ["es", "スペイン"], ["pt", "ポルトガル"], ["it", "イタリア"], ["ch", "スイス"], ["at", "オーストリア"], ["ad", "アンドラ"],
      ["dk", "デンマーク"], ["se", "スウェーデン"], ["no", "ノルウェー"], ["fi", "フィンランド"], ["is", "アイスランド"],
      ["pl", "ポーランド"], ["cz", "チェコ"], ["sk", "スロバキア"], ["hu", "ハンガリー"], ["ro", "ルーマニア"], ["bg", "ブルガリア"],
      ["si", "スロベニア"], ["hr", "クロアチア"], ["rs", "セルビア"], ["ba", "ボスニア・ヘルツェゴビナ"], ["me", "モンテネグロ"],
      ["mk", "北マケドニア"], ["al", "アルバニア"], ["gr", "ギリシャ"], ["cy", "キプロス"], ["mt", "マルタ"],
      ["lt", "リトアニア"], ["lv", "ラトビア"], ["ee", "エストニア"], ["ua", "ウクライナ"], ["md", "モルドバ"],
      ["ge", "ジョージア"], ["am", "アルメニア"], ["az", "アゼルバイジャン"],
    ],
  },
  {
    region: "アメリカ",
    list: [
      ["us", "アメリカ"], ["ca", "カナダ"], ["mx", "メキシコ"], ["pr", "プエルトリコ"], ["do", "ドミニカ共和国"],
      ["cu", "キューバ"], ["jm", "ジャマイカ"], ["cr", "コスタリカ"], ["pa", "パナマ"], ["br", "ブラジル"],
      ["ar", "アルゼンチン"], ["cl", "チリ"], ["uy", "ウルグアイ"], ["co", "コロンビア"], ["ve", "ベネズエラ"],
      ["pe", "ペルー"], ["ec", "エクアドル"],
    ],
  },
  {
    region: "アフリカ",
    list: [
      ["mg", "マダガスカル"], ["eg", "エジプト"], ["ma", "モロッコ"], ["tn", "チュニジア"], ["dz", "アルジェリア"],
      ["za", "南アフリカ"], ["ng", "ナイジェリア"], ["sn", "セネガル"], ["ci", "コートジボワール"], ["cm", "カメルーン"],
      ["ke", "ケニア"], ["ug", "ウガンダ"], ["rw", "ルワンダ"], ["ao", "アンゴラ"], ["mz", "モザンビーク"],
      ["ml", "マリ"], ["cd", "コンゴ民主共和国"], ["mu", "モーリシャス"],
    ],
  },
];

/** Flat list (code, name) in picker order. */
export const COUNTRIES: [code: string, name: string][] = COUNTRY_GROUPS.flatMap((g) => g.list);

const NAMES = new Map(COUNTRIES);
const CODE = /^[a-z]{2}(-[a-z]{3})?$/;

export const isCountryCode = (code?: string) => !!code && CODE.test(code.toLowerCase());

export const countryName = (code?: string) => (code ? NAMES.get(code.toLowerCase()) ?? code.toUpperCase() : "");

// The UK home nations are emoji tag sequences (🏴 + tag letters + cancel tag);
// Northern Ireland has no emoji, so it falls back to the Union flag.
const TAG_FLAGS: Record<string, string> = { "gb-eng": "gbeng", "gb-sct": "gbsct", "gb-wls": "gbwls" };

/**
 * Flag as an emoji ("jp" -> 🇯🇵), or "" for domestic / unknown. Rendered with the
 * device's emoji font (Apple's waving flags on iPhone/Mac) — see `.flag-emoji`.
 */
export function flagEmoji(code?: string): string {
  if (!isCountryCode(code)) return "";
  const c = code!.toLowerCase();
  if (TAG_FLAGS[c]) return "\u{1F3F4}" + [...TAG_FLAGS[c]].map((ch) => String.fromCodePoint(0xe0000 + ch.charCodeAt(0))).join("") + "\u{E007F}";
  const cc = c === "gb-nir" ? "gb" : c.slice(0, 2);
  return [...cc.toUpperCase()].map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65)).join("");
}
