// lib/grading.ts
// 採点ロジック（QuestionCard と Quiz の両方で使う）
import type { Question } from "@/lib/types";

// 正解の selectId の集合
export const correctAnswerSet = (question: Question) =>
  new Set((question.answerId || []).map((a) => a.answerId));

// 選択と正解の集合が完全一致かどうか
export const isSameSet = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && Array.from(a).every((v) => b.has(v));

export const isCorrectAnswer = (
  question: Question,
  selected: Iterable<string>,
) => isSameSet(new Set(selected), correctAnswerSet(question));
