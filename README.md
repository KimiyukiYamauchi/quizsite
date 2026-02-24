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

---

## 📁 ディレクトリ構成

### app

- /app/layout.tsx => レイアウト
- /app/page.tsx => ページ定義
- /styles/Home.module.css => トップページのスタイル

### ITF のページ

- /app/itf/page.tsx => ページ定義
- /styles/Quiz.module.css => ITF、SAE/J 共通のスタイル

### SAE/J のページ

- /app/seaj/page.tsx => ページ定義
- /styles/Quiz.module.css => ITF、SAE/J 共通のスタイル

### コンポーネント

- /components/Quiz => ITF、SAE/J 共通の問題ページコンポーネント
- /components/QuestionCard  
  => Quiz コンポーネントから使用される、一問一答のコンポーネント
- /components/QuestionCard.module.css => QuestionCard のスタイル

### microCMS アクセス

- /lib/microcms => microCMS から問題データを取得
