import { getITFQuestions } from "@/lib/microcms";
import Quiz from "@/components/Quiz";
import styles from "@/styles/Quiz.module.css";

export const revalidate = 60; // ISR: 60秒ごとに再取得（必要に応じて調整）

export default async function ITFPage() {
  const questions = await getITFQuestions();

  return (
    <main className={styles.wrap}>
      <h1 className={styles.heading}>ITF+ 練習問題</h1>
      <Quiz questions={questions} />
    </main>
  );
}
