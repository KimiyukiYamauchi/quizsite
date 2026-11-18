// app/error.tsx
// ページの表示中にエラーが起きたとき（microCMS に接続できない など）に表示する
"use client"; // エラー画面はクライアントコンポーネントである必要がある

import { useEffect } from "react";
import Link from "next/link";
import DocumentTitle from "@/components/DocumentTitle";
import styles from "@/styles/Status.module.css";

type Props = {
  error: unknown;
  retry: () => void; // ページのデータを取得し直して描画し直す
};

export default function ErrorPage({ error, retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // サーバー側のエラーは本番では中身が隠され、ログと照合するための識別子（digest）だけが届く
  const digest =
    error instanceof Error && "digest" in error
      ? String((error as Error & { digest?: string }).digest ?? "")
      : "";

  return (
    <main className={styles.wrap}>
      <DocumentTitle title="エラーが発生しました | 検定対策" />
      <h1 className={styles.title}>問題を読み込めませんでした</h1>
      <p className={styles.desc}>
        一時的な通信エラーの可能性があります。
        <br />
        しばらくしてから、もう一度お試しください。
      </p>
      {digest && <p className={styles.digest}>エラーID：{digest}</p>}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={() => retry()}
        >
          もう一度読み込む
        </button>
        <Link className={styles.secondary} href="/">
          TOP へ戻る
        </Link>
      </div>
    </main>
  );
}
