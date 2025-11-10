import { getITFQuestionsPage } from "@/lib/microcms";
import Quiz from "@/components/Quiz";
import Pagination from "@/components/Pagination";
import StickyHeader from "@/components/StickyHeader";
import styles from "@/styles/Quiz.module.css";

export const revalidate = 0; // ISR無効
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { page?: string };
};

const PER_PAGE = 10;

export default async function ITFPage({ searchParams }: PageProps) {
  // 比較テスト
  // await debugFetchList("itf-questions", 1);

  const current = Math.max(1, Number(searchParams?.page ?? 1) || 1);

  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);

  // ← ここが offset/limit を使う呼び出し
  const { items, totalCount } = await getITFQuestionsPage(page, PER_PAGE);

  return (
    <main className={styles.wrap}>
      <StickyHeader title="ITF+ 検定対策">
        <Pagination total={totalCount} perPage={PER_PAGE} currentPage={page} />
      </StickyHeader>
      <Quiz questions={items} />
      <Pagination total={totalCount} perPage={PER_PAGE} currentPage={current} />
    </main>
  );
}
