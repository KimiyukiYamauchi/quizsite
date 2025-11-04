"use client";

import { seajQuestions } from "@/data/seaj";
import QuestionCard from "@/components/QuestionCard";
import ResultPanel from "@/components/ResultPanel";
import styles from "@/styles/Quiz.module.css";
import { useState } from "react";

export default function SEAJPage() {
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);

  const handleAnswered = (ok: boolean) => {
    setAnswered((n) => n + 1);
    if (ok) setCorrect((n) => n + 1);
  };

  const reset = () => {
    setCorrect(0);
    setAnswered(0);
  };

  return (
    <main className={styles.wrap}>
      <h1 className={styles.heading}>SEA/J 練習問題</h1>
      {seajQuestions.map((q) => (
        <QuestionCard key={q.id} q={q} onAnswered={handleAnswered} />
      ))}

      <ResultPanel
        total={seajQuestions.length}
        correct={correct}
        onRetry={reset}
      />
    </main>
  );
}
