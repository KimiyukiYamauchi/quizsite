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
  const [answered, setAnswered] = useState(0);

  // 子へ渡す「リセット合図」。"もう一度" で ++ して各子の useEffect を起動
  const [cycle, setCycle] = useState(0);

  const handleAnswered = (ok: boolean) => {
    setAnswered((n) => n + 1);
    if (ok) setCorrect((n) => n + 1);
  };

  const handleRetry = () => {
    // 完全リセット（新しい挑戦として再計測）
    setCorrect(0);
    setAnswered(0);
    setCycle((c) => c + 1); // ← 各 QuestionCard を内部的に初期化
  };

  return (
    <>
      {questions.map((q, i) => (
        <QuestionCard
          key={q.id} // 再マウントは不要。stateリセットは cycle で行う
          question={q} // 問題データ
          indexLabel={`Q${i + 1}`} // 任意の番号ラベル
          onAnswered={handleAnswered} // ✅ 採点結果を受け取る
          cycle={cycle} // ← リセット合図
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
