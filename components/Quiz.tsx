"use client";

import { useState } from "react";
import type { Question } from "@/lib/microcms";
import QuestionCard from "@/components/QuestionCard";
import ResultPanel from "@/components/ResultPanel";

type Props = { questions: Question[] };

export default function Quiz({ questions }: Props) {
  const [correct, setCorrect] = useState(0);

  const handleAnswered = (ok: boolean) => {
    if (ok) setCorrect((n) => n + 1);
  };

  const reset = () => {
    setCorrect(0);
    // 必要であれば、QuestionCard 側に key を振って再マウントする方式にもできます
    // 例）map時に key={`${q.id}-${refreshKey}`} のように
  };

  return (
    <>
      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          question={q} // 問題データ
          indexLabel={`Q${i + 1}`} // 任意の番号ラベル
          onAnswered={handleAnswered} // ✅ 採点結果を受け取る
        />
      ))}

      <ResultPanel total={questions.length} correct={correct} onRetry={reset} />
    </>
  );
}
