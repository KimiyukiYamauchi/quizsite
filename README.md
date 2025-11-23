# quizsite

ITF と SAE/J の問題練習 Web サイトのソース

## 機能

ITF と SAE/J の模擬問題のサイト

## ページ構成

### トップページ

ITF と SAE/J の模擬問題それぞれのページへのリンク

### ITF のページ

SAE/J の模擬問題のページ

### SAE/J のページ

SAE/J の模擬問題のページ

## ディレクトリ構成

### トップページ

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

- /components/Quiz => 問題ページのコンポーネント
- /components/QuestionCard  
  => Quiz コンポーネントから使用される、一問一答のコンポーネント
- /components/QuestionCard.module.css => QuestionCard のスタイル
- /components/ResultPanel.tsx => 正解数を表示するパネルのコンポーネント
- /components/Pagination.tsx => ページネーションのコンポーネント
- /components/Pagination.module.css => Pagination のスタイル
- /components/StickyHeader.tsx => 問題ページのヘッダーのコンポーネント
- /components/StickyHeader.module.css => StickyHeader のスタイル

### microCMS アクセス

- /lib/microcms => microCMS から問題データを取得

### その他

- /scripts/json_to_microcms_csv.py => json ファイルを microCMS にインポートするため csv ファイルに変換する
- /scripts/ping-microcms.cjs => MicroCMS への接続確認スクリプト

