// app/_exam/ExamChapterPage.tsx
// 検定ごと・章ごとの問題ページ（/itf/chapter/第1章... など）の中身。
// app/<slug>/chapter/[chapter]/page.tsx から検定を指定して使う
import { notFound } from "next/navigation";
import { getChapterSummaries, getQuestionsPage } from "@/lib/microcms";
import { examPath, getExam, type ExamSlug } from "@/lib/exams";
import { parsePage, PER_PAGE } from "@/lib/quizPage";
import ChapterList from "@/components/ChapterList";
import Quiz from "@/components/Quiz";
import Pagination from "@/components/Pagination";
import StickyHeader from "@/components/StickyHeader";
import styles from "@/styles/Quiz.module.css";

export type ExamChapterPageProps = {
  params: Promise<{ chapter: string }>;
  searchParams: Promise<{ page?: string }>;
};

type Props = ExamChapterPageProps & { exam: ExamSlug };

export default async function ExamChapterPage({
  exam: slug,
  params,
  searchParams,
}: Props) {
  const exam = getExam(slug);
  const chapter = decodeURIComponent((await params).chapter);
  const page = parsePage((await searchParams).page);
  const basePath = examPath(exam);

  const [{ items, totalCount }, chapters] = await Promise.all([
    getQuestionsPage({
      endpoint: exam.endpoint,
      page,
      perPage: PER_PAGE,
      chapter,
    }),
    getChapterSummaries(exam.endpoint),
  ]);

  // 存在しない章・範囲外のページは 404
  if (items.length === 0) notFound();

  return (
    <main className={styles.wrap}>
      <StickyHeader
        title={`${exam.name} ${chapter}`}
        breadcrumbs={[
          { label: "TOP", href: "/" },
          { label: exam.name, href: basePath },
          { label: chapter },
        ]}
      >
        <Pagination total={totalCount} perPage={PER_PAGE} currentPage={page} />
      </StickyHeader>
      <ChapterList
        chapters={chapters}
        basePath={basePath}
        currentChapter={chapter}
      />
      <Quiz key={page} questions={items} basePath={basePath} />
    </main>
  );
}
