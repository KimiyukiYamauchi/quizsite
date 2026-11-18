// app/loading.tsx
// 問題データを読み込んでいる間に表示するスケルトン画面
import styles from "@/styles/Loading.module.css";

const CARD_COUNT = 3;

export default function Loading() {
  return (
    <main className={styles.wrap} aria-busy="true">
      <p className={styles.srOnly} role="status">
        問題を読み込んでいます…
      </p>
      <div aria-hidden="true">
        <div className={styles.header}>
          <div className={`${styles.block} ${styles.titleLine}`} />
          <div className={`${styles.block} ${styles.shortLine}`} />
        </div>
        {Array.from({ length: CARD_COUNT }, (_, i) => (
          <div key={i} className={styles.card}>
            <div className={`${styles.block} ${styles.label}`} />
            <div className={`${styles.block} ${styles.line}`} />
            <div className={`${styles.block} ${styles.lineShort}`} />
            <div className={`${styles.block} ${styles.choice}`} />
            <div className={`${styles.block} ${styles.choice}`} />
            <div className={`${styles.block} ${styles.choice}`} />
            <div className={`${styles.block} ${styles.choice}`} />
          </div>
        ))}
      </div>
    </main>
  );
}
