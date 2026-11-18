import Link from "next/link";
import { EXAMS, examPath } from "@/lib/exams";
import styles from "@/styles/Home.module.css";

export default function Page() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>検定対策トップ</h1>
      <p className={styles.desc}>
        {EXAMS.length}種類の検定から選んで演習できます。
      </p>
      <div className={styles.grid}>
        {EXAMS.map((exam) => (
          <section key={exam.slug} className={styles.card}>
            <h2>{exam.fullName}</h2>
            <p className={styles.desc}>{exam.description}</p>
            <Link className={styles.link} href={examPath(exam)}>
              {exam.name} の問題へ
            </Link>
          </section>
        ))}
      </div>
    </main>
  );
}
