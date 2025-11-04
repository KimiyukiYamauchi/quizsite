"use client";

import styles from "@/styles/Quiz.module.css";

type Props = {
  total: number;
  correct: number;
  onRetry: () => void;
};

export default function ResultPanel({ total, correct, onRetry }: Props) {
  const score = Math.round((correct / total) * 100);
  return (
    <div className={styles.result}>
      <p>
        正答数：{correct} / {total}（{score}点）
      </p>
      <button className={styles.retry} onClick={onRetry}>
        もう一度チャレンジ
      </button>
    </div>
  );
}
