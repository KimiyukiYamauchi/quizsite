// app/itf/chapter/[chapter]/page.tsx
import Quiz from "@/components/Quiz";
import { getITFQuestionsByChapter } from "@/lib/microcms";

type Props = {
  params: { chapter: string };
};

export const revalidate = 60;

export default async function ITFChapterPage({ params }: Props) {
  const chapter = decodeURIComponent(params.chapter);

  const { contents } = await getITFQuestionsByChapter(chapter, 100);

  return (
    <main>
      <h1>ITF+ {chapter} の問題</h1>
      <Quiz questions={contents} basePath="/itf" />
    </main>
  );
}
