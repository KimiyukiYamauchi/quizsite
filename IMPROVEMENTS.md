# quizsite 改善点・機能追加チェックリスト

## 優先度：高（機能・UX）

- [x] **章を選ぶ一覧を追加する**（PR #10）
  - `/itf`・`/seaj` と章ページに、問題数つきの章一覧を表示
- [x] **回答状態を保存する**
  - `localStorage` に試験ごと（itf / seaj）の「問題 ID → 選んだ選択肢」を保存し、再読み込みやページ移動後も回答済みとして表示する
  - 保存した記録は、間違えた問題の解き直しや章ごとの進み具合の表示にも使える
- [x] **結果表示を分かりやすくする**
  - 回答中は「回答済み ◯ / 10 問（正解・不正解の内訳）」と進み具合のバー、未回答の問題へのリンクを表示
  - 全問回答したら「正答数と点数」を強調して表示
- [x] **エラー・読み込み中・404 の画面を用意する**
  - `error.tsx`（microCMS の障害時など。「もう一度読み込む」で再取得）
  - `loading.tsx`（問題ページの形に合わせたスケルトン画面）
  - `not-found.tsx`（TOP・ITF+・SEA/J へのリンクつき）
  - ストリーミングで返すため、存在しない章や `?page=999` は HTTP 200 + `noindex` で 404 の画面を表示する（Next.js の仕様）

- [x] **カッコを含む章のページが表示されない（不具合）**
  - `第10章 暗号技術(暗号)`、`第11章 電子署名(完全性を保証する技術)`、`第12章 公開鍵基盤(PKI)` の章ページが 404 になっていた
  - microCMS の `filters` に `chapter[equals]第10章 暗号技術(暗号)` のようにカッコを含む値を渡すと、0 件が返るのが原因
  - 章の一覧用に取得している全問題の `id` と `chapter` から、その章の問題 ID を割り出して `ids` で取得するようにした

## 優先度：中（設計・保守性）

- [x] **ITF+ と SEA/J のページを共通化する**
  - 検定ごとの設定を `lib/exams.ts` にまとめ、ページの中身を `app/_exam/` の 2 ファイルに共通化
  - `app/itf`・`app/seaj` は検定名を渡すだけの数行のファイルにした
    （`app/[exam]` にすると、本番で `/abc` のような存在しない URL も HTTP 200 になるため。今は HTTP 404）
  - `lib/microcms.ts` の `getITF…` / `getSEAJ…` ラッパーは削除
- [x] **使われていないコードを削除する**
  - [x] `lib/microcms.ts` の `debugFetchList`、`getQuestionDetail`
  - [x] `lib/microcms.ts` の `getITFQuestions`、`getSEAJQuestions`（共通化で削除）
  - [x] `lib/microcms.ts` のコメントアウトした `console.log` と、使われていない `q`（検索）引数
  - [x] `app/itf/page.tsx` のデバッグ呼び出しのコメント（共通化で削除）
  - [x] `app/page.module.css`、`public/vercel.svg`、`public/next.svg`（create-next-app の雛形の残り）
  - [x] `app/globals.css` の雛形の CSS 変数（`--primary-glow` など）
  - [x] `styles/Quiz.module.css` の `.wrap` 以外のクラスと、`QuestionCard.module.css` の `.chapter`
- [x] **API キーの保護を確実にする**
  - `lib/microcms.ts` に `import "server-only"` を追加（クライアントコンポーネントから import するとビルドエラー）
  - 問題データの型を `lib/types.ts` に分け、クライアントコンポーネントは `lib/microcms.ts` を参照しないようにした
- [x] **不要な `"use client"` を外す**
  - [x] `StickyHeader.tsx`（状態を持たない）
  - [x] `Pagination.tsx`（パスを props で受け取り、`usePathname` / `useSearchParams` を使わないようにした）
  - 残りの `Quiz`・`QuestionCard`・`ResultPanel`・`DocumentTitle`・`error.tsx` は、状態やイベント処理を使うので必要
- [ ] **依存パッケージを整理する**
  - [ ] `ts-node` を削除する（どこでも使われていない）
  - [ ] `dotenv` を `devDependencies` に移す（scripts でしか使っていない）

## 優先度：低（細かい品質）

- [ ] **`QuestionCard.tsx` を整理する**
  - [x] `<button onClick={handleSubmit}>` と `<form onSubmit>` で同じ処理を二重に登録している → `onClick` は外して `type="submit"` にする
  - [x] `toggle` を `useState` より後ろに移す
  - [x] `correctSet` での小文字化をやめる（`normalizeQuestion` で済んでいる）
  - [ ] 正解が 0 件の問題（どう答えても正解にならない）をデータ側で検証する
- [ ] **ページネーションの「前へ／次へ」を直す**
  - 最初・最後のページでは `aria-disabled` を付けているが、リンクとしては押せる → `<span>` にする
- [ ] **アクセシビリティ・SEO を改善する**
  - [ ] `aria-label="breadcrumb"` と `"pagination"` を日本語にする
  - [ ] `generateMetadata` でページごとのタイトルを付ける（例：「ITF+ 第1章 | 検定対策」）
- [ ] **ダークモードで読みにくくならないようにする**
  - モジュール CSS が `#555` や `#e5e7eb` のように色を直接書いている → CSS 変数にまとめる
- [ ] **採点をサーバー側で行うか検討する**
  - 今は正解データがブラウザに送られている（練習用なら問題ないが、模試として使うなら Server Action で採点する）
- [ ] **テストを追加する**
  - `normalizeQuestion`、`isSameSet`、ページ番号の計算などの単体テスト（Vitest など）
- [ ] **CI を用意する**
  - GitHub Actions で lint・型チェック・ビルドを実行する

## 機能追加のアイデア

- [ ] 問題や選択肢の順番をシャッフルする
- [ ] 間違えた問題だけを解き直すモード（「回答状態を保存する」が前提）
- [ ] 試験本番のように、制限時間付きで最後にまとめて採点するモード
- [ ] 問題文の検索（microCMS の `q` クエリを `lib/microcms.ts` の `buildQueries` に足せば実現できる）
- [ ] 章ごとの進み具合（正答率）を章一覧に表示する
