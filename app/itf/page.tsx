// app/itf/page.tsx
// 中身は app/_exam/ExamPage.tsx（検定の設定は lib/exams.ts）
import ExamPage, { type ExamPageProps } from "@/app/_exam/ExamPage";

export default function Page(props: ExamPageProps) {
  return <ExamPage exam="itf" {...props} />;
}
