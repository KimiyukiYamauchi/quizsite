import { getITFQuestions, debugFetchList } from "@/lib/microcms";
import Quiz from "@/components/Quiz";
import styles from "@/styles/Quiz.module.css";

export const revalidate = 0; // ISR無効
export const dynamic = "force-dynamic";

export default async function ITFPage() {
  // 比較テスト
  // await debugFetchList("itf-questions", 1);

  const { contents: questions } = await getITFQuestions(50);
  // console.log("ITF questions loaded:", questions.length);

  return (
    <main className={styles.wrap}>
      <h1 className={styles.heading}>ITF+ 練習問題</h1>
      <Quiz questions={questions} />
    </main>
  );
}
