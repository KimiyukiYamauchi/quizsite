// lib/quizPage.ts
// 問題ページ（一覧・章別）で共通に使う値とヘルパー

// 1 ページに表示する問題数
export const PER_PAGE = 10;

// URL の ?page= をページ番号（1 始まり）にする。数値でなければ 1
export const parsePage = (value: string | undefined) =>
  Math.max(1, Math.floor(Number(value ?? 1)) || 1);
