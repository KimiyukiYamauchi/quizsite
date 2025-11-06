"use client";

import { useState } from "react";
import type { Question } from "@/lib/microcms";
import QuestionCard from "@/components/QuestionCard";
import ResultPanel from "@/components/ResultPanel";
import styles from "@/styles/Quiz.module.css";

type Props = { questions: Question[] };

export default function Quiz({ questions }: Props) {
  const [correct, setCorrect] = useState(0);

  const handleAnswered = (ok: boolean) => {
    if (ok) setCorrect((n) => n + 1);
  };

  const reset = () => {
    setCorrect(0);
    // ページをリロードしたくない場合は、QuestionCard側をkeyで再マウントする等の工夫も可
  };

  return (
    <>
      {questions.map((q) => (
        <QuestionCard key={q.id} q={q} onAnswered={handleAnswered} />
      ))}

      <ResultPanel
        total={questions.length}
        correct={correct}
        onRetry={reset}
      />
    </>
  );
}
