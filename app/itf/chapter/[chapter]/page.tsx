// app/itf/chapter/[chapter]/page.tsx
import { notFound } from "next/navigation";
import { getITFQuestionsByChapterPage } from "@/lib/microcms";
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

  const { items, totalCount } = await getITFQuestionsByChapterPage(
    chapter,
    page,
    PER_PAGE
  );

  // 存在しない章・範囲外のページは 404
  if (items.length === 0) notFound();

  return (
    <main className={styles.wrap}>
      <StickyHeader title={`ITF+ ${chapter}`}>
        <Pagination total={totalCount} perPage={PER_PAGE} currentPage={page} />
      </StickyHeader>
      <Quiz key={page} questions={items} basePath="/itf" />
    </main>
  );
}
