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
import ShuffleControl from "@/components/ShuffleControl";
import { parseShuffleSeed } from "@/lib/shuffle";
import styles from "@/styles/Quiz.module.css";

export type ExamChapterPageProps = {
  params: Promise<{ chapter: string }>;
  searchParams: Promise<{ page?: string; shuffle?: string | string[] }>;
};

type Props = ExamChapterPageProps & { exam: ExamSlug };

export default async function ExamChapterPage({
  exam: slug,
  params,
  searchParams,
}: Props) {
  const exam = getExam(slug);
  const chapter = decodeURIComponent((await params).chapter);
  const query = await searchParams;
  const page = parsePage(query.page);
  const shuffleSeed = parseShuffleSeed(query.shuffle); // ?shuffle= のシード（なければ元の順番）
  const basePath = examPath(exam);
  const chapterPath = `${basePath}/chapter/${encodeURIComponent(chapter)}`;

  const [{ items, totalCount }, chapters] = await Promise.all([
    getQuestionsPage({
      endpoint: exam.endpoint,
      page,
      perPage: PER_PAGE,
      chapter,
      shuffleSeed,
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
        <Pagination
          path={chapterPath}
          query={{ shuffle: shuffleSeed }}
          total={totalCount}
          perPage={PER_PAGE}
          currentPage={page}
        />
      </StickyHeader>
      <ShuffleControl path={chapterPath} seed={shuffleSeed} />
      <ChapterList
        chapters={chapters}
        basePath={basePath}
        currentChapter={chapter}
      />
      <Quiz
        key={`${shuffleSeed}:${page}`} // 並び・ページごとに別コンポーネント扱いにして state を初期化する
        questions={items}
        basePath={basePath}
      />
    </main>
  );
}
