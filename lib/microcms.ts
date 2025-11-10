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

// q を undefined で送らないユーティリティ
function buildQueries(params: { limit?: number; offset?: number; q?: string }) {
  const out: Record<string, any> = {};
  if (typeof params.limit === "number") out.limit = params.limit;
  if (typeof params.offset === "number") out.offset = params.offset;
  if (typeof params.q === "string" && params.q.length > 0) out.q = params.q;
  return out;
}

export async function getQuestions(params: {
  endpoint: string;
  limit?: number; // 100まで
  offset?: number; // (page-1)*perPage
  q?: string;
}) {
  const { endpoint, limit = 50, offset = 0, q } = params;

  try {
    const res = await microcmsClient.get<MicroCMSListResponse<Question>>({
      endpoint,
      queries: buildQueries({ limit, offset, q }),
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

    return {
      ...res,
      contents: res.contents.map(normalizeQuestion),
    };
  } catch (e: any) {
    console.error("microCMS GET list failed:", {
      serviceDomain: SERVICE_DOMAIN,
      endpoint,
      message: e?.message,
      stack: e?.stack,
    });
    throw e;
  }
}

// 1ページ分だけ取得するヘルパー（perPageは100以下にしてね）
export async function getQuestionsPage(params: {
  endpoint: string;
  page: number; // 1始まり
  perPage: number; // 100以下
  q?: string;
}) {
  const { endpoint, page, perPage, q } = params;
  const current = Math.max(1, Math.floor(page) || 1);
  const limit = Math.min(100, Math.max(1, Math.floor(perPage) || 10));
  const offset = (current - 1) * limit;

  const { contents, totalCount } = await getQuestions({
    endpoint,
    limit,
    offset,
    q,
  });
  return { items: contents, totalCount, page: current, perPage: limit };
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
export async function getITFQuestionsPage(page: number, perPage = 10) {
  return getQuestionsPage({ endpoint: "itf-questions", page, perPage });
}

// SEAJ 検定問題一覧を取得
export async function getSEAJQuestions(limit = 50) {
  return await getQuestions({
    endpoint: "seaj-questions",
    limit,
  });
}
export async function getSEAJQuestionsPage(page: number, perPage = 10) {
  return getQuestionsPage({ endpoint: "seaj-questions", page, perPage });
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
