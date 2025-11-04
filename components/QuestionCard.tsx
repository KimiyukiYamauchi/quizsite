"use client";

import { useState } from "react";
import styles from "@/styles/Quiz.module.css";

export type Choice = { id: string; text: string };
export type Question = {
  id: string;
  text: string;
  choices: Choice[];
  answerId: string;
  explanation?: string;
};

type Props = {
  q: Question;
  onAnswered: (correct: boolean) => void;
};

export default function QuestionCard({ q, onAnswered }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const handleSubmit = () => {
    if (selected == null) return;
    const correct = selected === q.answerId;
    setLocked(true);
    onAnswered(correct);
  };

  return (
    <div className={styles.card}>
      <p className={styles.question}>{q.text}</p>
      <ul className={styles.choices}>
        {q.choices.map((c) => {
          const isSelected = selected === c.id;
          const isCorrect = locked && c.id === q.answerId;
          const isWrong = locked && isSelected && c.id !== q.answerId;

          return (
            <li key={c.id}>
              <label
                className={[
                  styles.choice,
                  isSelected ? styles.selected : "",
                  isCorrect ? styles.correct : "",
                  isWrong ? styles.wrong : "",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={c.id}
                  disabled={locked}
                  onChange={() => setSelected(c.id)}
                />
                <span>{c.text}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {!locked ? (
        <button
          className={styles.submit}
          onClick={handleSubmit}
          disabled={selected == null}
        >
          回答する
        </button>
      ) : (
        q.explanation && (
          <div className={styles.explain}>
            <strong>解説：</strong>
            <p>{q.explanation}</p>
          </div>
        )
      )}
    </div>
  );
}
