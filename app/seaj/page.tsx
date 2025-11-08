import { getSEAJQuestions } from "@/lib/microcms";
import Quiz from "@/components/Quiz";
import styles from "@/styles/Quiz.module.css";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function SEAJPage() {
  const { contents: questions } = await getSEAJQuestions(50);

  return (
    <main className={styles.wrap}>
      <h1 className={styles.heading}>SEA/J 練習問題</h1>
      <Quiz questions={questions} />
    </main>
  );
}
