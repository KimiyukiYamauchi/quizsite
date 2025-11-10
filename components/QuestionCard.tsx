// components/QuestionCard.tsx
"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/lib/microcms";
import styles from "@/components/QuestionCard.module.css";

// a,b,c... の表示順を保証
const bySelectId = (a: { selectId: string }, b: { selectId: string }) =>
  a.selectId.localeCompare(b.selectId);

type Props = {
  question: Question;
  // 例："問題 x / n" 等を任意で表示したい時
  indexLabel?: string;
  // 正解表示モード（自動採点後に解説まで出すかどうか）
  showExplanationAfterSubmit?: boolean;
  // ✅ 追加：採点結果コールバック（正解なら true）
  onAnswered?: (ok: boolean) => void;
};

export default function QuestionCard({
  question,
  indexLabel,
  showExplanationAfterSubmit = true,
  onAnswered,
}: Props) {
  // 小文字化/ソート済みの choices / answers
  const choices = useMemo(
    () => [...(question.choices || [])].sort(bySelectId),
    [question.choices]
  );

  const correctSet = useMemo(() => {
    const set = new Set(
      (question.answerId || []).map((a) => a.answerId.toLowerCase())
    );
    return set;
  }, [question.answerId]);

  // 追加: 単一/複数を判定
  const isMulti = correctSet.size > 1;
  const inputType: "checkbox" | "radio" = isMulti ? "checkbox" : "radio";

  // 変更: トグルの挙動を切り替え
  const toggle = (id: string) => {
    if (isMulti) {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelected(next);
    } else {
      // 単一正解: その1つだけを選択状態にする
      setSelected(new Set([id]));
    }
  };

  // ユーザーの選択状態（複数正解に対応 → Set）
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [version, setVersion] = useState(0);

  const isCorrect = useMemo(() => {
    if (!submitted) return null;

    // 完全一致（サイズも一致）
    if (selected.size !== correctSet.size) return false;
    // 選択と正解の集合が完全一致かどうか
    let ok = true;
    selected.forEach((v) => {
      if (!correctSet.has(v)) ok = false;
    });
    return ok;
  }, [submitted, selected, correctSet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // いまの選択が正解かを即時計算（Setの反復は forEach と Array.from で）
    let okNow = true;
    if (selected.size !== correctSet.size) okNow = false;
    else {
      selected.forEach((v) => {
        if (!correctSet.has(v)) okNow = false;
      });
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    // 内部状態を初期化
    setSelected(new Set());
    setSubmitted(false);
    // ★ サブツリーを再マウントして input/クラス/表示を完全リセット
    setVersion((v) => v + 1);
  };

  return (
    <div className={styles.card}>
      <header className={styles.header}>
        {indexLabel && <span className={styles.index}>{indexLabel}</span>}
        {question.chapter && (
          <span className={styles.chapter}>{question.chapter}</span>
        )}
      </header>

      <h2 className={styles.text}>{question.text}</h2>

      {/* ★ version を key に付ける（フォームまたはその直下のラッパーに） */}
      <form key={version} onSubmit={handleSubmit} className={styles.form}>
        {/* ※ submitted 切替だけでは足りないケースがあるので version を使う */}

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
          {!submitted ? (
            <button type="submit" className={styles.submitBtn}>
              回答する
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetBtn}
            >
              もう一度
            </button>
          )}
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
