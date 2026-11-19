// app/_exam/ExamPage.tsx
// 検定ごとの問題ページ（/itf, /seaj）の中身。app/<slug>/page.tsx から検定を指定して使う
// （app/_exam のように "_" で始まるフォルダはページとして公開されない）
import { notFound } from "next/navigation";
import { getChapterSummaries, getQuestionsPage } from "@/lib/microcms";
import { examPath, getExam, type ExamSlug } from "@/lib/exams";
import { parsePage, PER_PAGE } from "@/lib/quizPage";
import ChapterList from "@/components/ChapterList";
import Quiz from "@/components/Quiz";
import Pagination from "@/components/Pagination";
import StickyHeader from "@/components/StickyHeader";
import styles from "@/styles/Quiz.module.css";

export type ExamPageProps = {
  searchParams: Promise<{ page?: string }>;
};

type Props = ExamPageProps & { exam: ExamSlug };

export default async function ExamPage({ exam: slug, searchParams }: Props) {
  const exam = getExam(slug);
  const page = parsePage((await searchParams).page);
  const basePath = examPath(exam);

  const [{ items, totalCount }, chapters] = await Promise.all([
    getQuestionsPage({ endpoint: exam.endpoint, page, perPage: PER_PAGE }),
    getChapterSummaries(exam.endpoint),
  ]);

  // 範囲外のページ（?page=999 など）は 404
  if (page > 1 && items.length === 0) notFound();

  return (
    <main className={styles.wrap}>
      <StickyHeader
        title={exam.title}
        breadcrumbs={[{ label: "TOP", href: "/" }, { label: exam.name }]}
      >
        <Pagination
          path={basePath}
          total={totalCount}
          perPage={PER_PAGE}
          currentPage={page}
        />
      </StickyHeader>
      <ChapterList
        chapters={chapters}
        basePath={basePath}
        defaultOpen={page === 1}
      />
      <Quiz
        key={page} // ページごとに別コンポーネント扱いにして state を初期化する
        questions={items}
        basePath={basePath}
      />
    </main>
  );
}
