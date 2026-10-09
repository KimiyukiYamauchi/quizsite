// app/seaj/chapter/[chapter]/page.tsx
import { notFound } from "next/navigation";
import Quiz from "@/components/Quiz";
import { getSEAJQuestionsByChapter } from "@/lib/microcms";

type Props = {
  params: { chapter: string };
};

export const revalidate = 60;

export default async function SEAJChapterPage({ params }: Props) {
  const chapter = decodeURIComponent(params.chapter);

  const { contents } = await getSEAJQuestionsByChapter(chapter, 100);

  // 存在しない章は 404
  if (contents.length === 0) notFound();

  return (
    <main>
      <h1>SEA/J {chapter} の問題</h1>
      <Quiz questions={contents} basePath="/seaj" />
    </main>
  );
}
