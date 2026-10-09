# quizsite

ITF+ と SEA/J の練習問題を解くことができる Web サイトのソースコードです。\
デモサイト: https://quizsite-beta.vercel.app/

## 📌 サイトの説明

- ITF+（CompTIA IT Fundamentals）
- SEA/J（Security Education Alliance / Japan）のセキュリティ基礎コース

の模擬問題に挑戦できる問題練習サイトです。

## 🚀 主な機能

- ITF+／SEA/J それぞれの問題練習が可能
- 問題を解いてスコアを確認できる
- 章ごとの問題にアクセスできる
- 1 ページに 10 問で、ページネーション対応
- 複数正解の問題にも対応（正解が複数ある問題はチェックボックスで回答）

## 🗺 ページ構成

| ページ                    | 内容                       |
| :------------------------ | :------------------------- |
| `/`                       | トップページ               |
| `/itf`                    | ITF+ 問題ページ            |
| `/itf/chapter/[chapter]`  | ITF+ の各章ごとの練習問題  |
| `/seaj`                   | SEA/J 問題ページ           |
| `/seaj/chapter/[chapter]` | SEA/J の各章ごとの練習問題 |

範囲外のページ（`?page=999` など）や存在しない章は 404 になります。

## 📁 ディレクトリ構成

### app

- `layout.tsx` --- 全ページ共通レイアウト
- `page.tsx` --- トップページ

#### app/itf

- `page.tsx` --- ITF+ の問題ページ
- `chapter/[chapter]/page.tsx` --- ITF+ の章ごとの問題ページ

#### app/seaj

- `page.tsx` --- SEA/J の問題ページ
- `chapter/[chapter]/page.tsx` --- SEA/J の章ごとの問題ページ

### components

- `Quiz` --- クイズ全体コンポーネント
- `QuestionCard` --- 問題表示コンポーネント
- `ResultPanel` --- 正解数表示
- `Pagination` --- ページ送り
- `StickyHeader` --- 問題ヘッダー

### lib/microcms

- microCMS API から問題データを取得

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

## 📦 使用技術

- Next.js 16（App Router）
- React 19
- TypeScript
- CSS Modules
- microCMS
- Vercel
