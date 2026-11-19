// app/_exam/ExamPage.tsx
// 検定ごとの問題ページ（/itf, /seaj）の中身。app/<slug>/page.tsx から検定を指定して使う
// （app/_exam のように "_" で始まるフォルダはページとして公開されない）
import { notFound } from "next/navigation";
import { getChapterSummaries, getQuestionsPage } from "@/lib/microcms";
import { examPath, getExam, type ExamSlug } from "@/lib/exams";
import { parsePage, parseSearch, PER_PAGE } from "@/lib/quizPage";
import ChapterList from "@/components/ChapterList";
import SearchForm from "@/components/SearchForm";
import Quiz from "@/components/Quiz";
import Pagination from "@/components/Pagination";
import StickyHeader from "@/components/StickyHeader";
import styles from "@/styles/Quiz.module.css";

export type ExamPageProps = {
  searchParams: Promise<{ page?: string; q?: string | string[] }>;
};

type Props = ExamPageProps & { exam: ExamSlug };

export default async function ExamPage({ exam: slug, searchParams }: Props) {
  const exam = getExam(slug);
  const params = await searchParams;
  const page = parsePage(params.page);
  const { query, words } = parseSearch(params.q); // ?q= の検索語（なければ空）
  const searching = words.length > 0;
  const basePath = examPath(exam);

  const [{ items, totalCount }, chapters] = await Promise.all([
    getQuestionsPage({
      endpoint: exam.endpoint,
      page,
      perPage: PER_PAGE,
      words,
    }),
    getChapterSummaries(exam.endpoint),
  ]);

  // 範囲外のページ（?page=999 など）は 404
  if (page > 1 && items.length === 0) notFound();

  return (
    <main className={styles.wrap}>
      <StickyHeader
        title={searching ? `${exam.name}「${query}」の検索結果` : exam.title}
        breadcrumbs={
          searching
            ? [
                { label: "TOP", href: "/" },
                { label: exam.name, href: basePath },
                { label: "検索" },
              ]
            : [{ label: "TOP", href: "/" }, { label: exam.name }]
        }
      >
        {totalCount > 0 && (
          <Pagination
            path={basePath}
            query={searching ? { q: query } : undefined}
            total={totalCount}
            perPage={PER_PAGE}
            currentPage={page}
          />
        )}
      </StickyHeader>
      <SearchForm action={basePath} defaultValue={searching ? query : ""} />
      {searching && totalCount > 0 && (
        <p className={styles.searchInfo}>
          「{query}」を含む問題：{totalCount} 件
          {words.length > 1 && "（すべてのキーワードを含む問題）"}
        </p>
      )}
      <ChapterList
        chapters={chapters}
        basePath={basePath}
        defaultOpen={page === 1 && !searching}
      />
      {items.length > 0 ? (
        <Quiz
          key={`${query}:${page}`} // 検索語・ページごとに別コンポーネント扱いにして state を初期化する
          questions={items}
          basePath={basePath}
        />
      ) : (
        <p className={styles.empty}>
          {searching ? (
            <>
              「{query}」を含む問題は見つかりませんでした。
              <br />
              キーワードを短くしたり、別のことばで試してください。
            </>
          ) : (
            "問題がまだ登録されていません。"
          )}
        </p>
      )}
    </main>
  );
}
