import Link from "next/link";
import styles from "@/styles/Home.module.css";

export default function Page() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>検定対策トップ</h1>
      <p className={styles.desc}>
        2種類の検定から選んで演習できます。問題は随時拡張可能です。
      </p>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>ITF+（CompTIA IT Fundamentals）</h2>
          <p className={styles.desc}>
            基本的なコンピューティングとITインフラストラクチャのスキルと知識
          </p>
          <Link className={styles.link} href="/itf">
            ITF+ の問題へ
          </Link>
        </section>

        <section className={styles.card}>
          <h2>SEA/J（セキュリティ 基礎コース）</h2>
          <p className={styles.desc}>
            情報セキュリティについて全ての基礎レベルの知識
          </p>
          <Link className={styles.link} href="/seaj">
            SEA/J の問題へ
          </Link>
        </section>
      </div>
    </main>
  );
}
