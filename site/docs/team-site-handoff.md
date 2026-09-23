# チームサイト 引き継ぎ・複製ガイド（FLOWLISH GUNMA → 他チーム）

このサイト（FLOWLISH GUNMA 公式サイト）とほぼ同じ仕組みで、別の 3x3 チーム
（例：上野原サンライズ）のサイトを作るための手順書。**新しいスレッド／別モデル
（Opus 5 等）でこのファイルを最初に読ませれば、ほぼ同品質で立ち上げられる。**

> 引き継ぎの本体は「このコード一式」。新チーム用にコードを複製し、下記チェック
> リストの箇所だけ差し替える。会話メモリはスレッド／プロジェクト単位なので自動
> 引き継ぎされない — 迷ったらこのファイルと実コードを正とする。

---

## 0. 使い方（新スレッドの最初の指示例）

1. このリポジトリ（`Flowlish Gunma Website/`）を丸ごと新チーム用フォルダに複製。
2. 新スレッドで「`docs/team-site-handoff.md` を読んで、上野原サンライズ版として
   §4 のチェックリストに沿って作り替えて」と指示。
3. microCMS・Vercel・ドメインは新規に用意（§3）。

---

## 1. 技術スタック / 構成

- **Next.js 16（App Router, Turbopack）** — `site/` がアプリ本体
- **microCMS** — ヘッドレスCMS（無料枠＝API 5本まで。だから SNS 等は §config にコード直書き）
- **Vercel** — ホスティング（Root Directory = `site`）
- 認証は自前ミドルウェア（`site/src/middleware.ts`）

```
Flowlish Gunma Website/
├─ site/                     # ← Next.js アプリ（デプロイ対象 / Vercel Root）
│  ├─ src/app/               # ページ（App Router）
│  │  ├─ page.tsx            # トップ（Schedule/Banner/News/Roster/Partners）
│  │  ├─ schedule/page.tsx   # 試合日程・結果
│  │  ├─ news/               # ニュース一覧 + [id] 詳細
│  │  ├─ admin/              # 管理画面（match / news / players / login）
│  │  └─ api/admin/          # 管理API（match/news/players/login/logout）
│  ├─ src/components/        # Header/Footer/RosterSection/ScheduleCarousel/IntroOverlay 等
│  ├─ src/lib/               # api.ts / types.ts / config.ts / microcms.ts / adminOptions.ts / rank.ts / admin.ts
│  └─ src/app/globals.css    # デザイントークン & 共通スタイル
├─ assets/sponsor_logos/     # スポンサーロゴ（Partners_<会社名>.png）
├─ docs/                     # 本ドキュメント等
└─ (scratchpad 系スクリプトはセッション外なので都度作り直す)
```

---

## 2. microCMS スキーマ（実装済みの実体）

**重要：microCMS のスキーマ（フィールド定義）は管理APIで追加できない（GET専用。PUT/POST
は 405）。フィールド追加・変更は必ず microCMS の管理画面UIで行う。** 下表どおりに
5つの API（エンドポイント）を作る。API ID・fieldId は完全一致させること（コードが依存）。

### `players`（リスト）
| fieldId | 種別 | 備考 |
|---|---|---|
| number | 数字 | 背番号 |
| nameJa | テキスト | 日本語名（必須運用）|
| nameEn | テキスト | 英語名（大文字表示）|
| position | テキスト | "Guard" / "Guard / Forward" 等 |
| height | テキスト | "170"（cm、単位なし）|
| hometown | テキスト | 出身 |
| nationality | テキスト | "Japan" 等 |
| birthdate | 日時 | **JST深夜0時で保存**（後述gotcha）|
| bio | テキストエリア | 任意 |
| active | 真偽値(boolean) | 現役=true / 過去=false（未設定は現役扱い）|
| photo | 画像 | ロースター用 3:4 |
| photoDetail | 画像 | モーダル用 縦ポートレート（別カット）|
| snsInstagram | テキスト | フルURL。空ならアイコン非表示 |
| snsX | テキスト | フルURL |
| fibaUrl | テキスト | FIBA3x3 個人ページURL |
| order | 数字 | 表示順（小さいほど先）|

### `matches`（リスト）
| fieldId | 種別 | 備考 |
|---|---|---|
| league | テキスト | "3x3.EXE PREMIER" 等 |
| round | テキスト | "2024 ROUND.3"（**年号prefixは保存時に自動付与**）|
| date | 日時 | シーズン判定・並び替えに使用 |
| dateLabel | テキスト | 表示用（空なら date から自動 "2024.8.4"）|
| venue | テキスト | 会場 |
| status | テキスト | "予定" / "結果" |
| resultBadge | テキスト | "優勝"/"6位" 等（表示時に英語序数へ変換：1st/6th）|
| scores | テキストエリア | **試合ごとの JSON 文字列**（下記）|
| memo | テキストエリア | 備考（イレギュラー情報）|
| entryPlayers | 複数コンテンツ参照 → `players` | 出場選手（`depth:2` で展開）|
| eventUrl | テキスト | 大会公式サイト |
| fibaEventUrl | テキスト | FIBA3x3 イベントページ |
| liveUrl | テキスト | ライブ配信 |

`scores` の中身（管理画面が生成）:
```json
{"games":[
  {"phase":"GROUP-A","opp":"SANJO BEATERS.EXE","score":"W-0","result":"WO-Win"},
  {"phase":"準決勝","opp":"SAKU REGION.EXE","score":"21-7","result":"Win"}
]}
```
`result` は `Win`/`Lose`/`WO-Win`(不戦勝)/`WO-Lose`(不戦敗)。フェーズ表示グループは
`Qualifying Draw`（QD-*）→ 予選ラウンド（予選/GROUP系）→ 決勝トーナメント の順。

### `news`（リスト）
| fieldId | 種別 | 備考 |
|---|---|---|
| title | テキスト | |
| publishedDate | 日時 | 表示・降順ソート |
| categories | 複数選択(またはテキスト複数) | `adminOptions.ts` の NEWS_CATEGORIES |
| thumbnail | 画像 | 任意・16:9 |
| body | テキストエリア | HTML可（`<` を含めばHTMLとして描画）|

### `partners`（リスト）
| fieldId | 種別 | 備考 |
|---|---|---|
| name | テキスト | |
| logo | 画像 | 無い企業は自動非表示 |
| url | テキスト | 企業サイト |
| tier | テキスト | BLACK/PLATINUM/GOLD/SILVER/BRONZE/ORANGE/PARTNER/SUPPLY |
| order | 数字 | 全体の並び順 |

### `banners`（リスト）
| fieldId | 種別 | 備考 |
|---|---|---|
| image | 画像 | トップのニュースカルーセル |
| linkUrl | テキスト | |
| title | テキスト | |
| order | 数字 | |

---

## 3. 環境変数 / インフラ

`.env.local`（Vercel の Environment Variables にも同じものを設定）:
```
MICROCMS_SERVICE_DOMAIN=<新チームのサービスドメイン>
MICROCMS_API_KEY=<コンテンツ読み書き + メディア権限を持つキー>
ADMIN_PASSWORD=<管理画面の共有パスワード>
SITE_PASSWORD=<公開前サイトのBasic認証パス（launch時に不要）>
```
- microCMS APIキーは **コンテンツGET/POST/PATCH + メディアのGET/POST** を有効化。
- Vercel: プロジェクト作成時 **Root Directory = `site`**。
- ミドルウェア（`site/src/middleware.ts`）：`/admin` はどの環境でもパス認証。公開サイトは
  「localhost=開放 / *.vercel.app=公開 / 独自ドメイン=Basic認証（fail-closed）」。**ローンチ時に
  公開サイトのゲートを削除**して全公開にする。
- DNS（独自ドメイン）：A `@`→Vercel、CNAME `www`→Vercel、MX等は既存を保持。

---

## 4. 新チーム用リブランド・チェックリスト

複製後、ここだけ差し替えれば別チームサイトになる：

1. **チーム名／ロゴ**：`site/public/logo.svg`、`site/public/icons.svg`、Header/Footer の alt・文言、
   `<title>`（`site/src/app/layout.tsx`）。
2. **ブランドカラー**：`site/src/app/globals.css` の `--orange` 等トークン、`page.tsx`/各所の
   `ORANGE = "#EE651C"` `INK = "#141414"` 定数（FLOWLISHはオレンジ。上野原サンライズは日の出＝
   別カラーに）。
3. **SNS / ファンクラブURL**：`site/src/lib/config.ts`（`siteConfig`）。
4. **3x3.EXE チームID**：シーズンごとに異なる（§6）。新チームのIDを調べ直す。
5. **microCMS**：新サービスを作り §2 のスキーマを再現、環境変数を差し替え。
6. **Vercel / ドメイン**：新プロジェクト・新ドメイン。
7. **データ投入**：選手・スポンサー・過去成績（§6のパイプライン）を新チーム分で。
8. **ファビコン・OGP**：`site/public/` と metadata。

---

## 5. ハマりどころ（gotchas）— 必読

- **microCMS スキーマはUIでしか変えられない**（APIは GET のみ）。フィールド追加を頼まれたら
  UIでの追加手順を案内し、コード側（`types.ts` 等）を合わせる。
- **管理API（`*.microcms-management.io`）は Cloudflare 配下**で、既定の UA（Python-urllib /
  server undici）を **403（error code 1010）** で弾く。メディアアップロード時はブラウザ風の
  `User-Agent` ヘッダを付ける。→ `site/src/app/api/admin/players`・`.../news` で実装済み。
  権限エラーと誤認しやすいので注意。
- **生年月日は JST 深夜0時で保存**（例 `1988-03-09T15:00:00Z`＝JST 3/10）。読み書きは JST 変換
  （フォームの `bdVal` と API の `T00:00:00+09:00`）。UTC のまま扱うと1日ズレる。
- **3x3.EXE のチームIDはシーズンごとに変わる**。ジャージ番号も年で別人に再利用される →
  出場選手は **番号でなく名前でマッチング**。
- **順位表示は英語序数**（`lib/rank.ts`：優勝→1st, 6位→6th）。
- **microCMS の number 型はユニークではない**。
- **無料枠 API 5本**（players/matches/news/partners/banners）。設定系はコード（`config.ts`）に置く。
- **NFC/NFD**：macOS のファイル名は NFD（濁点分解）、PDF等は NFC。突合前に
  `unicodedata.normalize("NFC")`。

---

## 6. 3x3.EXE データパイプライン（過去成績の収集）

- チーム別ページはシーズンごとに ID が変わる（FLOWLISH例: 2026=918 / 2025=807 / 2024=747）。
  **新チームのシーズン別IDを調べ直す**。上野原サンライズは既存データに `UENOHARA SUNRISE.EXE`
  として対戦相手で登場しているので参照可。
- 結果ページのパース要素：H1 の "Round.N"、"開催日｜YYYY/M/D"、"会場｜"＋"住所｜"、
  試合は result-phase-label / result-team-left,right（n=ID）/ left-score,right-score、
  出場は result-player-roster の "#NN 氏名"。**最終順位はHTMLに無い** → WebFetch で取得。
- conference パラメータ：2025/2026 は `&conference=women's japan`、2024アーカイブは
  `?conference=women's japan`（表記ゆれあり）。
- スクリプトはスクラッチパッド（セッション外）で都度作成。日本語 heredoc はエンコーディング
  問題が出るのでファイルに `# coding: utf-8` を付けて書く。

---

## 7. 管理画面（/admin）— 非技術者向け

- 共有パスワード（`ADMIN_PASSWORD`）でログイン。
- `/admin/match`：試合の新規/編集（フェーズ・スコア・不戦勝/敗・出場選手・各種URL・備考）。
- `/admin/news`：お知らせの新規/編集（画像アップロード付き）。
- `/admin/players`：選手の新規/編集（写真2種・SNS・現役/過去トグル）。
- いずれも「既存一覧から選んで編集」or「＋新規」。画像は microCMS メディアへ自動アップロード。

---

## 8. 実装の要点（参照先）

- トップ：`site/src/app/page.tsx`（Schedule カルーセル＝左揃え＋右フルブリード、ファンクラブ
  バナー、News、Roster、Partners＝8段ランク・幅%パディングで逆転防止）。
- カルーセル：`site/src/components/ScheduleCarousel.tsx`（PCは矢印＋ドット、モバイルはドットのみ）。
- 選手モーダル：`site/src/components/RosterSection.tsx`。
- 試合結果：`site/src/app/schedule/page.tsx`（シーズン別、フェーズ3グループ、不戦勝/敗、順位序数）。
- デザイン：`globals.css`。フォントは Barlow 系（重すぎる字面は 900→800 に調整済み）。

---

以上。まず §4 のチェックリスト、次に §5 の gotcha を押さえれば、大きな地雷は踏まない。
