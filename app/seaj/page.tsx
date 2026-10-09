import { notFound } from "next/navigation";
import { getSEAJQuestionsPage } from "@/lib/microcms";
import Quiz from "@/components/Quiz";
import Pagination from "@/components/Pagination";
import StickyHeader from "@/components/StickyHeader";
import styles from "@/styles/Quiz.module.css";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

const PER_PAGE = 10;

export default async function SEAJPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  const { items, totalCount } = await getSEAJQuestionsPage(page, PER_PAGE);

  // 範囲外のページ（?page=999 など）は 404
  if (page > 1 && items.length === 0) notFound();

  return (
    <main className={styles.wrap}>
      <StickyHeader
        title="SEA/J 検定対策"
        breadcrumbs={[{ label: "TOP", href: "/" }, { label: "SEA/J" }]}
      >
        <Pagination total={totalCount} perPage={PER_PAGE} currentPage={page} />
      </StickyHeader>
      <Quiz
        key={page} // 🔴 これがポイント：ページごとに別コンポーネント扱い
        questions={items}
        basePath="/seaj"
      />
      {/* <Pagination total={totalCount} perPage={PER_PAGE} currentPage={page} /> */}
    </main>
  );
}
