// lib/microcms.ts
import { createClient } from "microcms-js-sdk";

// ==== 型定義（複数正解対応） ====
export type ChoiceItem = {
  fieldId?: string; // "choices"
  selectId: string; // a / b / c ...
  text: string;
};

export type AnswerItem = {
  fieldId?: string; // "answerId"
  answerId: string; // a / b / c ...
};

export type Question = {
  id: string;
  chapter?: string;
  text: string;
  choices: ChoiceItem[];
  // ★複数正解（リピータ）
  answerId: AnswerItem[];
  explanation?: string;
  // microCMSメタ
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  revisedAt?: string;
};

export type MicroCMSListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;

if (!SERVICE_DOMAIN || !API_KEY) {
  throw new Error(
    "MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です（.env.local を確認）"
  );
}

export const microcmsClient = createClient({
  serviceDomain: SERVICE_DOMAIN,
  apiKey: API_KEY,
});

// ==== 正規化ユーティリティ ====
const toLowerLetter = (s: string) => (s || "").trim().toLowerCase();

function normalizeQuestion(raw: Question): Question {
  // choices の selectId を小文字化
  const choices = (raw.choices || []).map((c) => ({
    ...c,
    selectId: toLowerLetter(c.selectId),
  }));

  // answerId（複数）を小文字化＆重複排除
  const seen = new Set<string>();
  const answerId = (raw.answerId || [])
    .map((a) => ({ ...a, answerId: toLowerLetter(a.answerId) }))
    .filter((a) => a.answerId && !seen.has(a.answerId) && seen.add(a.answerId));

  // console.log("Normalized question:", {
  //   id: raw.id,
  //   choices,
  //   answerId,
  // });

  return {
    ...raw,
    choices,
    answerId,
  };
}

// ==== 取得関数（一覧・詳細など必要に応じて） ====
// endpoint 例： "seaj-questions" / "itf-questions"
export async function getQuestions(params: {
  endpoint: string;
  limit?: number;
  offset?: number;
  q?: string; // フリーワード検索が有効なら
}) {
  // console.log("Fetching questions from microCMS:", params);
  const { endpoint, limit = 50, offset = 0, q } = params;

  // ❗undefined を弾く
  const queries: Record<string, any> = { limit, offset };
  if (typeof q === "string" && q.length > 0) {
    queries.q = q;
  }

  try {
    const res = await microcmsClient.get<MicroCMSListResponse<Question>>({
      endpoint,
      queries,
      // SDKは customRequestInit を受け取れる：Nextのfetch相当のオプションを渡せる
      customRequestInit: { cache: "no-store" as RequestCache },
    });

    // ★ ここで実ログ
    // console.log(
    //   "[microcms] serviceDomain=",
    //   process.env.MICROCMS_SERVICE_DOMAIN,
    //   " endpoint=",
    //   endpoint,
    //   " totalCount=",
    //   res.totalCount,
    //   " contents.length=",
    //   res.contents?.length
    // );

    return { ...res, contents: res.contents.map(normalizeQuestion) };
  } catch (e: any) {
    // ここで原因特定しやすいよう詳細を吐く
    console.error("microCMS GET list failed:", {
      serviceDomain: SERVICE_DOMAIN,
      endpoint,
      message: e?.message,
      stack: e?.stack,
    });
    throw e;
  }
}

export async function getQuestionDetail(params: {
  endpoint: string;
  contentId: string;
}) {
  const { endpoint, contentId } = params;
  try {
    const q = await microcmsClient.get<Question>({
      endpoint,
      contentId,
      customRequestInit: { cache: "no-store" as RequestCache },
    });
    return normalizeQuestion(q);
  } catch (e: any) {
    console.error("microCMS GET detail failed:", {
      serviceDomain: SERVICE_DOMAIN,
      endpoint,
      contentId,
      message: e?.message,
    });
    throw e;
  }
}

// ===========================
// ITF+, SEAJ 向けラッパー
// ===========================

// ITF+ 検定問題一覧を取得
export async function getITFQuestions(limit = 50) {
  return await getQuestions({
    endpoint: "itf-questions",
    limit,
  });
}

// SEAJ 検定問題一覧を取得
export async function getSEAJQuestions(limit = 50) {
  return await getQuestions({
    endpoint: "seaj-questions",
    limit,
  });
}

// lib/microcms.ts に試験関数を追加（不要になったら削除OK）
export async function debugFetchList(endpoint: string, limit = 1) {
  const domain = process.env.MICROCMS_SERVICE_DOMAIN!;
  const key = process.env.MICROCMS_API_KEY!;
  const url = `https://${domain}.microcms.io/api/v1/${endpoint}?limit=${limit}`;

  const res = await fetch(url, {
    headers: { "X-MICROCMS-API-KEY": key },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const json = (await res.json()) as MicroCMSListResponse<Question>;
  console.log(
    "[debugFetchList]",
    endpoint,
    "totalCount=",
    json.totalCount,
    "len=",
    json.contents?.length
  );
  return json;
}
