import Link from "next/link";
import { buildHref } from "@/lib/quizPage";
import styles from "./Pagination.module.css";

type Props = {
  path: string; // リンク先のパス（例: "/itf"、"/itf/chapter/..."）。?page= はこのコンポーネントが付ける
  query?: Record<string, string | undefined>; // ページを移っても残したいクエリ（例: { q: "暗号", shuffle: "k3x9qa" }）
  total: number; // 全件数
  perPage?: number; // 1ページの件数（デフォ10）
  currentPage: number; // 現在ページ(1始まり)
};

// サーバーコンポーネント（パスはページから受け取るので、ブラウザ側の処理は不要）
export default function Pagination({
  path,
  query = {},
  total,
  perPage = 10,
  currentPage,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const clamp = (v: number) => Math.min(Math.max(1, v), totalPages);

  // 1ページ目は ?page= を付けない
  const makeHref = (page: number) =>
    buildHref(path, { ...query, page: page > 1 ? String(page) : undefined });

  // ページ番号を適度に絞る（先頭/末尾＋前後2ページ）
  const pages: number[] = [];
  const add = (p: number) => {
    if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p);
  };
  add(1);
  add(2);
  add(currentPage - 2);
  add(currentPage - 1);
  add(currentPage);
  add(currentPage + 1);
  add(currentPage + 2);
  add(totalPages - 1);
  add(totalPages);
  pages.sort((a, b) => a - b);

  return (
    <nav className={styles.nav} aria-label="pagination">
      <Link
        className={styles.btn}
        href={makeHref(clamp(currentPage - 1))}
        aria-disabled={currentPage <= 1}
      >
        ← 前へ
      </Link>

      <ul className={styles.pages}>
        {pages.map((p, i) => {
          // 省略のドットを入れる
          const prev = pages[i - 1];
          const needDots = prev && p - prev > 1;
          return (
            <li key={p} className={styles.item}>
              {needDots && <span className={styles.dots}>…</span>}
              <Link
                href={makeHref(p)}
                className={`${styles.page} ${
                  p === currentPage ? styles.active : ""
                }`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        className={styles.btn}
        href={makeHref(clamp(currentPage + 1))}
        aria-disabled={currentPage >= totalPages}
      >
        次へ →
      </Link>
    </nav>
  );
}
