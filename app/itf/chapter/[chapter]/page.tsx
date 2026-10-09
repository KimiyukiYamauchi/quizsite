// app/itf/chapter/[chapter]/page.tsx
import { notFound } from "next/navigation";
import Quiz from "@/components/Quiz";
import { getITFQuestionsByChapter } from "@/lib/microcms";

type Props = {
  params: Promise<{ chapter: string }>;
};

export const revalidate = 60;

export default async function ITFChapterPage({ params }: Props) {
  const chapter = decodeURIComponent((await params).chapter);

  const { contents } = await getITFQuestionsByChapter(chapter, 100);

  // 存在しない章は 404
  if (contents.length === 0) notFound();

  return (
    <main>
      <h1>ITF+ {chapter} の問題</h1>
      <Quiz questions={contents} basePath="/itf" />
    </main>
  );
}
