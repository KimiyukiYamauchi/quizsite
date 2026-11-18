// lib/types.ts
// 問題データの型。クライアントコンポーネントからも使うので、
// サーバー専用の lib/microcms.ts とは分けている

export type ChoiceItem = {
  fieldId?: string; // "choices"
  selectId: string; // a / b / c ...
  text: string;
};

export type AnswerItem = {
  fieldId?: string; // "answerId"
  answerId: string; // a / b / c ...
};

export type Question = {
  id: string;
  chapter?: string;
  text: string;
  choices: ChoiceItem[];
  answerId: AnswerItem[]; // 正解（複数指定で複数正解）
  explanation?: string;
  // microCMSメタ
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  revisedAt?: string;
};

export type ChapterSummary = {
  name: string; // 章の名前（例: "第1章 ITの概要と専門用語"）
  count: number; // その章の問題数
};
