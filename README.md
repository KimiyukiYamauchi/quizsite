# quizsite

ITF と SAE/J の練習問題を解くことができる Web
サイトのソースコードです。\
デモサイト: https://quizsite-beta.vercel.app/

## 📌 機能

このリポジトリは、

- ITF（IT Fundamentals）
- SAE/J（Software Engineering Associate/Japan）

の模擬問題に挑戦できる問題練習サイトです。\
Next.js と React を使って構築されています。

## 🚀 主な機能

- 問題を解いてスコアを確認できる
- ITF／SAE/J それぞれのカテゴリで練習可能
- 問題ごとに分かれた章にアクセスできる
- 問題の正解数を表示・管理
- ページネーション対応

## 🗺 ページ構成

| ページ                    | 内容                       |
| :------------------------ | :------------------------- |
| `/`                       | トップページ               |
| `/itf`                    | ITF 問題ページ             |
| `/itf/chapter/[chapter]`  | ITF の各章ごとの練習問題   |
| `/seaj`                   | SAE/J 問題ページ           |
| `/seaj/chapter/[chapter]` | SAE/J の各章ごとの練習問題 |

## 📁 ディレクトリ構成

### app

- `layout.tsx` --- 全ページ共通レイアウト
- `page.tsx` --- トップページ

#### app/itf

- `page.tsx` --- itfのページ

#### app/seaj

- `page.tsx` --- SAE/J のページ

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

```bash
git clone https://github.com/KimiyukiYamauchi/quizsite.git
cd quizsite
npm install
npm run dev
```

ブラウザで以下にアクセス:

    http://localhost:3000

## 📦 使用技術

- Next.js
- React
- TypeScript
- CSS Modules
- microCMS
- Vercel
