// app/seaj/chapter/[chapter]/page.tsx
// 中身は app/_exam/ExamChapterPage.tsx（検定の設定は lib/exams.ts）
import ExamChapterPage, {
  type ExamChapterPageProps,
} from "@/app/_exam/ExamChapterPage";

export default function Page(props: ExamChapterPageProps) {
  return <ExamChapterPage exam="seaj" {...props} />;
}
