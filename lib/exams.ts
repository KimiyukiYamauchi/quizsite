// lib/exams.ts
// 検定ごとの設定。
// 検定を増やすときは EXAMS に 1 件追加し、app/<slug>/page.tsx と
// app/<slug>/chapter/[chapter]/page.tsx を既存の検定と同じ形で作る（中身は数行）
export type Exam = {
  slug: string; // URL の先頭（/itf, /seaj）。回答の保存キーにも使うので変更しないこと
  name: string; // 短い表示名（パンくず・章ページのタイトル）
  title: string; // 問題ページのタイトル
  fullName: string; // トップページのカード見出し
  description: string; // トップページのカード説明
  endpoint: string; // microCMS の API エンドポイント
};

export const EXAMS = [
  {
    slug: "itf",
    name: "ITF+",
    title: "ITF+ 検定対策",
    fullName: "ITF+（CompTIA IT Fundamentals）",
    description:
      "基本的なコンピューティングとITインフラストラクチャのスキルと知識",
    endpoint: "itf-questions",
  },
  {
    slug: "seaj",
    name: "SEA/J",
    title: "SEA/J 検定対策",
    fullName: "SEA/J（セキュリティ 基礎コース）",
    description: "情報セキュリティについて全ての基礎レベルの知識",
    endpoint: "seaj-questions",
  },
] as const satisfies readonly Exam[];

// EXAMS に登録した検定の slug（"itf" | "seaj"）
export type ExamSlug = (typeof EXAMS)[number]["slug"];

export function getExam(slug: ExamSlug): Exam {
  const exam = EXAMS.find((e) => e.slug === slug);
  if (!exam) throw new Error(`未登録の検定です: ${slug}`);
  return exam;
}

// 問題ページのパス（例: "/itf"）。QuestionCard・ChapterList・Quiz の basePath に渡す
export const examPath = (exam: Exam) => `/${exam.slug}`;
