// app/not-found.tsx
// 存在しないページ・存在しない章・範囲外のページ（?page=999 など）で表示する 404 ページ
import type { Metadata } from "next";
import Link from "next/link";
import DocumentTitle from "@/components/DocumentTitle";
import styles from "@/styles/Status.module.css";

const TITLE = "ページが見つかりません | 検定対策";

export const metadata: Metadata = { title: TITLE };

export default function NotFound() {
  return (
    <main className={styles.wrap}>
      <DocumentTitle title={TITLE} />
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>ページが見つかりません</h1>
      <p className={styles.desc}>
        お探しのページは存在しないか、移動した可能性があります。
        <br />
        章の名前やページ番号が正しいか確認してください。
      </p>
      <div className={styles.actions}>
        <Link className={styles.primary} href="/">
          TOP へ戻る
        </Link>
        <Link className={styles.secondary} href="/itf">
          ITF+ の問題へ
        </Link>
        <Link className={styles.secondary} href="/seaj">
          SEA/J の問題へ
        </Link>
      </div>
    </main>
  );
}
