"use client";

import { useState } from "react";
import type { Question } from "@/lib/microcms";
import {
  answerStorageKey,
  clearAnswers,
  saveAnswer,
  useAnswerRecords,
} from "@/lib/answerStore";
import { isCorrectAnswer } from "@/lib/grading";
import QuestionCard from "@/components/QuestionCard";
import ResultPanel from "@/components/ResultPanel";

type Props = {
  questions: Question[];
  basePath: string; // ★ 追加：ITFなら "/itf", SEAJなら "/seaj"
};

export default function Quiz({ questions, basePath }: Props) {
  // 回答は試験ごとに localStorage へ保存する（章ページと一覧ページで共有）
  const storageKey = answerStorageKey(basePath);
  const records = useAnswerRecords(storageKey);

  // "もう一度" で ++ し、QuestionCard の key を変えて再マウント（未回答の選択も初期化）
  const [cycle, setCycle] = useState(0);

  // 正答数は保存済みの回答から毎回数え直す
  const correct = questions.filter((q) => {
    const rec = records[q.id];
    return rec !== undefined && isCorrectAnswer(q, rec.selected);
  }).length;

  const handleAnswered = (questionId: string, selected: string[]) => {
    saveAnswer(storageKey, questionId, selected);
  };

  const handleRetry = () => {
    const answered = questions.some((q) => records[q.id]);
    if (
      answered &&
      !window.confirm("このページの回答をリセットして、もう一度解きますか？")
    ) {
      return;
    }
    // このページに表示している問題の回答だけを消す（他のページの記録は残す）
    clearAnswers(
      storageKey,
      questions.map((q) => q.id),
    );
    setCycle((c) => c + 1);
  };

  return (
    <>
      {questions.map((q, i) => (
        <QuestionCard
          key={`${q.id}-${cycle}`} // cycle が変わると再マウントされ state が初期化される
          question={q} // 問題データ
          indexLabel={`Q${i + 1}`} // 任意の番号ラベル
          saved={records[q.id]} // 保存済みの回答（あれば回答済みとして表示）
          onAnswered={(selected) => handleAnswered(q.id, selected)}
          basePath={basePath} // ★ QuestionCard へ渡す
        />
      ))}

      <ResultPanel
        total={questions.length}
        correct={correct}
        onRetry={handleRetry}
      />
    </>
  );
}
