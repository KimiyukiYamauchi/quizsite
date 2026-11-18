# quizsite

ITF+ と SEA/J の練習問題を解くことができる Web サイトのソースコードです。\
デモサイト: https://quizsite-beta.vercel.app/

## 📌 サイトの説明

- ITF+（CompTIA IT Fundamentals）
- SEA/J（Security Education Alliance / Japan）のセキュリティ基礎コース

の模擬問題に挑戦できる問題練習サイトです。

## 🚀 主な機能

- ITF+／SEA/J それぞれの問題練習が可能
- 回答すると、その場で正誤と解説を表示
- 画面下の結果パネルで回答の進み具合（回答済み ◯ / 10 問、正解・不正解の数）を確認でき、未回答の問題へ移動できる。全問回答すると正答数と点数を表示
- 章の一覧（問題数つき）から章ごとの問題を選んで解ける
- 1 ページに 10 問で、ページネーション対応
- 回答はブラウザ（localStorage）に保存され、再読み込みやページ移動後も残る（「もう一度チャレンジ」でそのページの回答をリセット）
- 複数正解の問題にも対応（正解が複数ある問題はチェックボックスで回答）
- 読み込み中・エラー・404 の専用画面

## 🗺 ページ構成

| ページ                    | 内容                       |
| :------------------------ | :------------------------- |
| `/`                       | トップページ               |
| `/itf`                    | ITF+ 問題ページ            |
| `/itf/chapter/[chapter]`  | ITF+ の各章ごとの練習問題  |
| `/seaj`                   | SEA/J 問題ページ           |
| `/seaj/chapter/[chapter]` | SEA/J の各章ごとの練習問題 |

範囲外のページ（`?page=999` など）や存在しない章は「ページが見つかりません」の画面になります。\
（読み込み中の画面を出すためにページをストリーミングで返しているので、存在しない章などは HTTP ステータスが 200 のまま 404 の画面を表示します。検索エンジン向けには `noindex` が自動で付きます）

## 📁 ディレクトリ構成

### app

- `layout.tsx` --- 全ページ共通レイアウト
- `page.tsx` --- トップページ
- `loading.tsx` --- 読み込み中のスケルトン画面
- `error.tsx` --- エラー画面（microCMS に接続できないときなど）
- `not-found.tsx` --- 404 画面

#### app/_exam（問題ページの中身。ITF+ / SEA/J で共通）

- `ExamPage.tsx` --- 検定ごとの問題ページ
- `ExamChapterPage.tsx` --- 検定ごと・章ごとの問題ページ
- `_` で始まるフォルダはページとして公開されない

#### app/itf, app/seaj

- `page.tsx`、`chapter/[chapter]/page.tsx` --- 検定名を指定して `app/_exam` のページを表示するだけのファイル

### components

- `Quiz` --- クイズ全体（回答の保存・正答数の集計）
- `QuestionCard` --- 1 問分の表示と回答
- `ResultPanel` --- 画面下の結果パネル（進み具合・未回答の問題へのリンク・点数）
- `ChapterList` --- 章の一覧（章ごとのページへのリンク）
- `Pagination` --- ページ送り
- `StickyHeader` --- 画面上部に固定するヘッダー（タイトル・パンくず・ページ送り）
- `Breadcrumb` --- パンくずリスト
- `DocumentTitle` --- ブラウザのタブのタイトルを差し替える（404・エラー画面で使用）

### lib

- `microcms.ts` --- microCMS API から問題データ・章の一覧を取得
- `exams.ts` --- 検定ごとの設定（URL・表示名・トップページの説明・microCMS のエンドポイント）
- `quizPage.ts` --- 問題ページで共通の値（1 ページの問題数、`?page=` の読み取り）
- `answerStore.ts` --- 回答状態を localStorage に保存・読み込み
- `grading.ts` --- 採点ロジック（正解との一致判定）

### styles

- `Home.module.css` --- トップページ
- `Quiz.module.css` --- 問題ページ全体
- `Loading.module.css` --- 読み込み中の画面
- `Status.module.css` --- エラー・404 画面
- 各コンポーネントのスタイルは `components/` に同じ名前で置いている

### scripts

- `json_to_microcms_csv.py` --- JSON → CSV 変換
- `ping-microcms.cjs` --- microCMS 接続確認

## 🛠 開発環境のセットアップ

### 必要なもの

- Node.js 20.9 以上
- microCMS のアカウントと、問題データを登録した API（[microCMS の API 構成](#-microcms-の-api-構成) を参照）

### 1. リポジトリの取得と依存パッケージのインストール

```bash
git clone https://github.com/KimiyukiYamauchi/quizsite.git
cd quizsite
npm install
```

### 2. 環境変数の設定

プロジェクト直下に `.env.local` を作成し、microCMS の接続情報を設定します。

```bash
MICROCMS_SERVICE_DOMAIN=xxxxxxxx
MICROCMS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

| 変数名                    | 内容                                                                      |
| :------------------------ | :------------------------------------------------------------------------ |
| `MICROCMS_SERVICE_DOMAIN` | サービスドメイン（`https://xxxxxxxx.microcms.io` の `xxxxxxxx` の部分）    |
| `MICROCMS_API_KEY`        | microCMS 管理画面の「API キー」で発行したキー（GET 権限があれば OK）       |

- `.env.local` は `.gitignore` 済みです。API キーはコミットしないでください。
- 未設定のまま起動すると、`MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です` というエラーになります。
- Vercel にデプロイする場合は、Project Settings → Environment Variables に同じ 2 つを登録してください。

接続できるかどうかは、次のコマンドで確認できます。

```bash
node scripts/ping-microcms.cjs
# itf-questions: OK (xx件)
# seaj-questions: OK (xx件)
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで以下にアクセス:

    http://localhost:3000

### その他のコマンド

| コマンド        | 内容                       |
| :-------------- | :------------------------- |
| `npm run build` | 本番用ビルド               |
| `npm run start` | ビルド結果でサーバーを起動 |
| `npm run lint`  | ESLint によるコードチェック |

## 🗂 microCMS の API 構成

リスト形式の API を 2 つ使います。

| エンドポイント   | 内容           |
| :--------------- | :------------- |
| `itf-questions`  | ITF+ の問題    |
| `seaj-questions` | SEA/J の問題   |

どちらも同じフィールド構成です。

| フィールド ID | 種類                 | 内容                                                  |
| :------------ | :------------------- | :---------------------------------------------------- |
| `chapter`     | テキスト             | 章の名前（章ごとのページの絞り込みに使用）            |
| `text`        | テキスト             | 問題文                                                |
| `choices`     | 繰り返し             | 選択肢。各要素は `selectId`（a, b, c…）と `text`      |
| `answerId`    | 繰り返し             | 正解。各要素は `answerId`（a, b, c…）。複数指定で複数正解 |
| `explanation` | テキスト             | 解説（回答後に表示）                                  |

問題データを JSON で用意している場合は、`scripts/json_to_microcms_csv.py` で microCMS の CSV インポート用ファイルに変換できます。

```bash
python scripts/json_to_microcms_csv.py <input_json> <output_csv>
```

## ➕ 検定を追加するには

1. microCMS に問題の API を作る（上と同じフィールド構成）
2. `lib/exams.ts` の `EXAMS` に 1 件追加する（トップページ・404 画面のリンクは自動で増える）
3. `app/itf` をコピーして `app/<slug>` を作り、2 つの `page.tsx` の `exam="itf"` を新しい slug に変える
4. 接続確認に使う場合は、`scripts/ping-microcms.cjs` のエンドポイントの一覧にも追加する

## 📦 使用技術

- Next.js 16（App Router）
- React 19
- TypeScript
- CSS Modules
- microCMS
- Vercel

## 📝 改善点

今後の改善点・機能追加のアイデアは [IMPROVEMENTS.md](IMPROVEMENTS.md) にチェックリストでまとめています。
