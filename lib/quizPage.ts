// lib/quizPage.ts
// 問題ページ（一覧・章別）で共通に使う値とヘルパー

// 1 ページに表示する問題数
export const PER_PAGE = 10;

// URL の ?page= をページ番号（1 始まり）にする。数値でなければ 1
export const parsePage = (value: string | undefined) =>
  Math.max(1, Math.floor(Number(value ?? 1)) || 1);

// 検索語の上限（長すぎる・多すぎる語で microCMS に大量のリクエストを送らないため）
export const SEARCH_MAX_LENGTH = 50;
const SEARCH_MAX_WORDS = 5;

// URL の ?q= を検索語にする。全角スペースも区切りとして扱い、空なら検索しない
export function parseSearch(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const query = (raw ?? "")
    .replace(/\s+/g, " ") // 全角スペース・改行なども半角スペース 1 つにそろえる
    .trim()
    .slice(0, SEARCH_MAX_LENGTH);
  const words = Array.from(new Set(query.split(" ").filter(Boolean))).slice(
    0,
    SEARCH_MAX_WORDS,
  );
  return { query, words };
}
