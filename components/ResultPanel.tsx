"use client";

import styles from "./ResultPanel.module.css";

export type UnansweredItem = {
  label: string; // 例: "Q4"
  href: string; // 問題カードへのページ内リンク（例: "#q-xxxx"）
};

type Props = {
  total: number; // このページの問題数
  answered: number; // 回答済みの問題数
  correct: number; // 正解した問題数
  unanswered: UnansweredItem[]; // 未回答の問題（ページ内リンク用）
  onRetry: () => void;
};

export default function ResultPanel({
  total,
  answered,
  correct,
  unanswered,
  onRetry,
}: Props) {
  const finished = total > 0 && answered >= total;
  const wrong = answered - correct;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <section
      className={`${styles.panel} ${finished ? styles.finished : ""}`}
      aria-label="このページの結果"
    >
      <div className={styles.row}>
        {/* 回答の状況が変わったらスクリーンリーダーにも読み上げる */}
        <div className={styles.status} aria-live="polite">
          {finished ? (
            <p className={styles.summary}>
              全問回答しました！ 正答数{" "}
              <strong>
                {correct} / {total}
              </strong>
              <span className={styles.score}>（{score}点）</span>
            </p>
          ) : (
            <p className={styles.summary}>
              回答済み{" "}
              <strong>
                {answered} / {total}
              </strong>{" "}
              問
              {answered > 0 && (
                <span className={styles.detail}>
                  （正解 {correct}・不正解 {wrong}）
                </span>
              )}
            </p>
          )}
        </div>

        <button
          type="button"
          className={styles.retry}
          onClick={onRetry}
          disabled={answered === 0}
        >
          もう一度チャレンジ
        </button>
      </div>

      {!finished && (
        <>
          <div
            className={styles.bar}
            role="progressbar"
            aria-label="回答の進み具合"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={answered}
          >
            <div className={styles.barFill} style={{ width: `${progress}%` }} />
          </div>

          {answered > 0 && unanswered.length > 0 && (
            <p className={styles.unanswered}>
              未回答：
              {unanswered.map((u) => (
                <a key={u.href} className={styles.jump} href={u.href}>
                  {u.label}
                </a>
              ))}
            </p>
          )}
        </>
      )}
    </section>
  );
}
