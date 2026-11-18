// lib/microcms.ts
import { createClient, type MicroCMSQueries } from "microcms-js-sdk";

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
  answerId: AnswerItem[]; // 正解（複数指定で複数正解）
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
    "MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です（.env.local を確認）",
  );
}

export const microcmsClient = createClient({
  serviceDomain: SERVICE_DOMAIN,
  apiKey: API_KEY,
});

// microCMS の取得結果をキャッシュする秒数（Next.js の Data Cache）
// 問題を更新してから最大この秒数でサイトに反映される
const REVALIDATE_SECONDS = 60;
const cacheOptions = { next: { revalidate: REVALIDATE_SECONDS } };

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

  return {
    ...raw,
    choices,
    answerId,
  };
}

// 未指定の値をクエリに含めないユーティリティ
function buildQueries(params: {
  limit?: number;
  offset?: number;
  chapter?: string;
}) {
  const out: MicroCMSQueries = {};
  if (typeof params.limit === "number") out.limit = params.limit;
  if (typeof params.offset === "number") out.offset = params.offset;
  if (typeof params.chapter === "string" && params.chapter.length > 0) {
    // microCMS の filters 構文で chapter による絞り込み
    out.filters = `chapter[equals]${params.chapter}`;
  }
  return out;
}

async function getQuestions(params: {
  endpoint: string;
  limit?: number; // 100まで
  offset?: number; // (page-1)*perPage
  chapter?: string;
}) {
  const { endpoint, limit = 50, offset = 0, chapter } = params;

  // chapter は URL から来る値なので、filters に組み込む前に実在する章か照合する
  // （"[or]..." などを含む値で絞り込み条件を書き換えられるのを防ぐ）
  if (chapter !== undefined) {
    const chapters = await getChapters(endpoint);
    if (!chapters.includes(chapter)) {
      return { contents: [], totalCount: 0, offset, limit };
    }
  }

  try {
    const res = await microcmsClient.get<MicroCMSListResponse<Question>>({
      endpoint,
      queries: buildQueries({ limit, offset, chapter }),
      customRequestInit: cacheOptions,
    });

    return {
      ...res,
      contents: res.contents.map(normalizeQuestion),
    };
  } catch (e) {
    console.error("microCMS GET list failed:", {
      serviceDomain: SERVICE_DOMAIN,
      endpoint,
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
    throw e;
  }
}

export type ChapterSummary = {
  name: string; // 章の名前（例: "第1章 ITの概要と専門用語"）
  count: number; // その章の問題数
};

// 章の一覧を問題数つきで取得（「第2章」が「第10章」より前に来るよう数値を考慮して並べる）
export async function getChapterSummaries(
  endpoint: string,
): Promise<ChapterSummary[]> {
  const counts = new Map<string, number>();
  for (const name of await getChapterNames(endpoint)) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) =>
    a.name.localeCompare(b.name, "ja", { numeric: true }),
  );
}

// エンドポイントに登録されている章の一覧（重複なし）を取得
async function getChapters(endpoint: string): Promise<string[]> {
  return Array.from(new Set(await getChapterNames(endpoint)));
}

// 全問題の chapter を（重複ありのまま）取得
async function getChapterNames(endpoint: string): Promise<string[]> {
  const fetchPage = (offset: number) =>
    microcmsClient.get<MicroCMSListResponse<Pick<Question, "chapter">>>({
      endpoint,
      queries: { fields: "chapter", limit: 100, offset },
      customRequestInit: cacheOptions,
    });

  // 1回で取れるのは100件までなので、残りのページは並列で取得する
  const first = await fetchPage(0);
  const offsets: number[] = [];
  for (let o = 100; o < first.totalCount; o += 100) offsets.push(o);
  const rest = await Promise.all(offsets.map(fetchPage));

  return [first, ...rest]
    .flatMap((res) => res.contents.map((c) => c.chapter ?? ""))
    .filter(Boolean);
}

// 1ページ分だけ取得するヘルパー（perPage は 100 以下）
export async function getQuestionsPage(params: {
  endpoint: string;
  page: number; // 1始まり
  perPage: number; // 100以下
  chapter?: string;
}) {
  const { endpoint, page, perPage, chapter } = params;
  const current = Math.max(1, Math.floor(page) || 1);
  const limit = Math.min(100, Math.max(1, Math.floor(perPage) || 10));
  const offset = (current - 1) * limit;

  const { contents, totalCount } = await getQuestions({
    endpoint,
    limit,
    offset,
    chapter,
  });
  return { items: contents, totalCount, page: current, perPage: limit };
}
