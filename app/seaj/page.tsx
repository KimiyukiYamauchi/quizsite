import { getSEAJQuestionsPage } from "@/lib/microcms";
import Quiz from "@/components/Quiz";
import Pagination from "@/components/Pagination";
import styles from "@/styles/Quiz.module.css";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { page?: string };
};

const PER_PAGE = 10;

export default async function SEAJPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);

  const { items, totalCount } = await getSEAJQuestionsPage(page, PER_PAGE);

  return (
    <main className={styles.wrap}>
      <h1>SEA/J 検定対策</h1>
      <Pagination total={totalCount} perPage={PER_PAGE} currentPage={page} />
      <Quiz questions={items} />
      <Pagination total={totalCount} perPage={PER_PAGE} currentPage={page} />
    </main>
  );
}
