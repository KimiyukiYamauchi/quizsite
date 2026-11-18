// app/itf/chapter/[chapter]/page.tsx
import { notFound } from "next/navigation";
import {
  getChapterSummaries,
  getITFQuestionsByChapterPage,
} from "@/lib/microcms";
import ChapterList from "@/components/ChapterList";
import Quiz from "@/components/Quiz";
import Pagination from "@/components/Pagination";
import StickyHeader from "@/components/StickyHeader";
import styles from "@/styles/Quiz.module.css";

type Props = {
  params: Promise<{ chapter: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PER_PAGE = 10;

export default async function ITFChapterPage({ params, searchParams }: Props) {
  const chapter = decodeURIComponent((await params).chapter);
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  const [{ items, totalCount }, chapters] = await Promise.all([
    getITFQuestionsByChapterPage(chapter, page, PER_PAGE),
    getChapterSummaries("itf-questions"),
  ]);

  // 存在しない章・範囲外のページは 404
  if (items.length === 0) notFound();

  return (
    <main className={styles.wrap}>
      <StickyHeader
        title={`ITF+ ${chapter}`}
        breadcrumbs={[
          { label: "TOP", href: "/" },
          { label: "ITF+", href: "/itf" },
          { label: chapter },
        ]}
      >
        <Pagination total={totalCount} perPage={PER_PAGE} currentPage={page} />
      </StickyHeader>
      <ChapterList
        chapters={chapters}
        basePath="/itf"
        currentChapter={chapter}
      />
      <Quiz key={page} questions={items} basePath="/itf" />
    </main>
  );
}
