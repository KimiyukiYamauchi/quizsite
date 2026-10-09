"use client";

import { useState } from "react";
import type { Question } from "@/lib/microcms";
import QuestionCard from "@/components/QuestionCard";
import ResultPanel from "@/components/ResultPanel";

type Props = {
  questions: Question[];
  basePath: string; // ★ 追加：ITFなら "/itf", SEAJなら "/seaj"
};

export default function Quiz({ questions, basePath }: Props) {
  const [correct, setCorrect] = useState(0);

  // "もう一度" で ++ し、QuestionCard の key を変えて再マウント（state を初期化）
  const [cycle, setCycle] = useState(0);

  const handleAnswered = (ok: boolean) => {
    if (ok) setCorrect((n) => n + 1);
  };

  const handleRetry = () => {
    // 完全リセット（新しい挑戦として再計測）
    setCorrect(0);
    setCycle((c) => c + 1); // ← 各 QuestionCard を再マウント
  };

  return (
    <>
      {questions.map((q, i) => (
        <QuestionCard
          key={`${q.id}-${cycle}`} // cycle が変わると再マウントされ state が初期化される
          question={q} // 問題データ
          indexLabel={`Q${i + 1}`} // 任意の番号ラベル
          onAnswered={handleAnswered} // ✅ 採点結果を受け取る
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
