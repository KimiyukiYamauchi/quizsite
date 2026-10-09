import { notFound } from "next/navigation";
import { getITFQuestionsPage } from "@/lib/microcms";
import Quiz from "@/components/Quiz";
import Pagination from "@/components/Pagination";
import StickyHeader from "@/components/StickyHeader";
import styles from "@/styles/Quiz.module.css";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

const PER_PAGE = 10;

export default async function ITFPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  // 比較テスト
  // await debugFetchList("itf-questions", 1);

  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  // ← ここが offset/limit を使う呼び出し
  const { items, totalCount } = await getITFQuestionsPage(page, PER_PAGE);

  // 範囲外のページ（?page=999 など）は 404
  if (page > 1 && items.length === 0) notFound();

  return (
    <main className={styles.wrap}>
      <StickyHeader title="ITF+ 検定対策">
        <Pagination total={totalCount} perPage={PER_PAGE} currentPage={page} />
      </StickyHeader>
      <Quiz
        key={page} // 🔴 これがポイント：ページごとに別コンポーネント扱い
        questions={items}
        basePath="/itf"
      />
      {/* <Pagination total={totalCount} perPage={PER_PAGE} currentPage={current} /> */}
    </main>
  );
}
