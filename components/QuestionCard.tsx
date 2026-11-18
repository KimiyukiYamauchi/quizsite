// components/QuestionCard.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import type { AnswerRecord } from "@/lib/answerStore";
import { correctAnswerSet, isSameSet } from "@/lib/grading";
import styles from "@/components/QuestionCard.module.css";

// a,b,c... の表示順を保証
const bySelectId = (a: { selectId: string }, b: { selectId: string }) =>
  a.selectId.localeCompare(b.selectId);

type Props = {
  question: Question;
  // 例："問題 x / n" 等を任意で表示したい時
  indexLabel?: string;
  // カードに付ける id（ページ内リンクの飛び先）
  anchorId?: string;
  // 正解表示モード（自動採点後に解説まで出すかどうか）
  showExplanationAfterSubmit?: boolean;
  // 保存済みの回答（あれば回答済みとして表示する）
  saved?: AnswerRecord;
  // 回答したときに選んだ選択肢を渡す（保存・採点は親で行う）
  onAnswered: (selected: string[]) => void;
  basePath: string; // 検定のパス（"/itf", "/seaj"）。lib/exams.ts の examPath()
};

export default function QuestionCard({
  question,
  indexLabel,
  anchorId,
  showExplanationAfterSubmit = true,
  saved,
  onAnswered,
  basePath,
}: Props) {
  // 小文字化/ソート済みの choices / answers
  const choices = useMemo(
    () => [...(question.choices || [])].sort(bySelectId),
    [question.choices],
  );

  const correctSet = useMemo(() => correctAnswerSet(question), [question]);

  // 追加: 単一/複数を判定
  const isMulti = correctSet.size > 1;
  const inputType: "checkbox" | "radio" = isMulti ? "checkbox" : "radio";

  // 回答前の選択状態（複数正解に対応 → Set）
  const [draft, setDraft] = useState<Set<string>>(new Set());

  // 保存済みの回答があれば、それを回答済みとして表示する
  const submitted = saved !== undefined;
  const selected = useMemo(
    () => (saved ? new Set(saved.selected) : draft),
    [saved, draft],
  );

  const isCorrect = submitted ? isSameSet(selected, correctSet) : null;

  // 変更: トグルの挙動を切り替え
  const toggle = (id: string) => {
    if (isMulti) {
      const next = new Set(draft);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setDraft(next);
    } else {
      // 単一正解: その1つだけを選択状態にする
      setDraft(new Set([id]));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // すでに回答済み・未選択なら何もしない（多重カウント防止）
    if (submitted || draft.size === 0) return;

    onAnswered(Array.from(draft).sort());
  };

  return (
    <div id={anchorId} className={styles.card}>
      <header className={styles.header}>
        {indexLabel && <span className={styles.index}>{indexLabel}</span>}
        {question.chapter && (
          <Link
            href={`${basePath}/chapter/${encodeURIComponent(
              question.chapter!,
            )}`}
          >
            {question.chapter}
          </Link>
        )}
      </header>

      <h2 className={styles.text}>{question.text}</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <ul className={styles.choices}>
          {choices.map((c) => {
            const checked = selected.has(c.selectId);
            const isAnswer = correctSet.has(c.selectId);

            // 採点後の色付け（任意）
            const choiceClass = [
              styles.choice,
              submitted && isAnswer ? styles.correct : "",
              submitted && checked && !isAnswer ? styles.wrong : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={c.selectId} className={choiceClass}>
                <label className={styles.choiceLabel}>
                  <input
                    type={inputType} // ★ 自動切替
                    name={question.id} // ★ ラジオ時は同一グループ
                    className={styles.checkbox}
                    checked={checked}
                    onChange={() => toggle(c.selectId)}
                    disabled={submitted}
                  />
                  <span className={styles.choiceId}>
                    {c.selectId.toUpperCase()}.
                  </span>
                  <span className={styles.choiceText}>{c.text}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          {/* ラベルは常に「回答する」。回答後は disabled */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitted || selected.size === 0}
          >
            回答する
          </button>
        </div>
      </form>

      {/* 採点結果 */}
      {submitted && (
        <div className={styles.result}>
          {isCorrect ? (
            <p className={styles.resultCorrect}>正解！</p>
          ) : (
            <p className={styles.resultWrong}>
              不正解。正解は{" "}
              {Array.from(correctSet)
                .sort()
                .map((x) => x.toUpperCase())
                .join(", ")}
              です。
            </p>
          )}

          {/* 解説 */}
          {showExplanationAfterSubmit && question.explanation && (
            <div className={styles.explanation}>
              <h3>解説</h3>
              <p>{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
