// lib/answerStore.ts
// 回答状態を localStorage に保存するストア（クライアント専用）
//
// 保存形式（キーは試験ごと。例: "quizsite:answers:itf"）
//   { [問題ID]: { selected: ["a", "c"], answeredAt: 1700000000000 } }
//
// 正誤は保存せず、表示のたびに最新の正解データから判定する
// （microCMS 側で正解を直したときにも追従できるように）
import { useSyncExternalStore } from "react";

export type AnswerRecord = {
  selected: string[]; // 選んだ選択肢の selectId
  answeredAt: number; // 回答した日時（ミリ秒）
};

export type AnswerRecords = Record<string, AnswerRecord>;

const EMPTY: AnswerRecords = {};

// 試験ごとのストレージキー（basePath "/itf" → "quizsite:answers:itf"）
export const answerStorageKey = (basePath: string) =>
  `quizsite:answers:${basePath.replace(/^\/+/, "")}`;

// 読み込んだ内容をメモリに持つ。useSyncExternalStore は同じ参照を返す必要があるため、
// 書き込み時だけ新しいオブジェクトに差し替える。
// localStorage が使えない環境（プライベートモードなど）でもメモリ上では動く。
const memory = new Map<string, AnswerRecords>();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

// 壊れたデータや古い形式が入っていても落ちないように検証して読み込む
function load(key: string): AnswerRecords {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return EMPTY;
  }
  if (!raw) return EMPTY;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return EMPTY;
    }
    const out: AnswerRecords = {};
    for (const [id, rec] of Object.entries(parsed)) {
      const selected = (rec as Partial<AnswerRecord> | null)?.selected;
      if (
        Array.isArray(selected) &&
        selected.length > 0 &&
        selected.every((s) => typeof s === "string")
      ) {
        const answeredAt = Number((rec as AnswerRecord).answeredAt) || 0;
        out[id] = { selected, answeredAt };
      }
    }
    return out;
  } catch {
    return EMPTY;
  }
}

function read(key: string): AnswerRecords {
  let value = memory.get(key);
  if (!value) {
    value = load(key);
    memory.set(key, value);
  }
  return value;
}

function write(key: string, next: AnswerRecords) {
  memory.set(key, next);
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // 容量超過・保存不可の環境ではメモリ上だけで保持する
  }
  notify();
}

// 別タブで回答したときにも反映する
function handleStorage(e: StorageEvent) {
  if (e.key === null) memory.clear();
  else if (memory.has(e.key)) memory.delete(e.key);
  else return;
  notify();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

// 保存済みの回答を取得するフック
// サーバー描画とハイドレーション中は空として扱い、その後に保存内容で描画し直す
export function useAnswerRecords(key: string): AnswerRecords {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY,
  );
}

export function saveAnswer(
  key: string,
  questionId: string,
  selected: string[],
) {
  write(key, {
    ...read(key),
    [questionId]: { selected, answeredAt: Date.now() },
  });
}

export function clearAnswers(key: string, questionIds: string[]) {
  const next = { ...read(key) };
  for (const id of questionIds) delete next[id];
  write(key, next);
}
