// lib/microcms.ts
// microCMS から問題データを取得する（サーバー専用）
// API キーを扱うので、クライアントコンポーネントから import するとビルドエラーにする
import "server-only";
import { createClient, type MicroCMSQueries } from "microcms-js-sdk";
// 型は lib/types.ts に置いている（クライアントコンポーネントからも使うため）
import type { ChapterSummary, Question } from "@/lib/types";

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

// 問題を取得して正規化する（失敗したらログを出して投げ直す）
async function fetchQuestions(endpoint: string, queries: MicroCMSQueries) {
  try {
    const res = await microcmsClient.get<MicroCMSListResponse<Question>>({
      endpoint,
      queries,
      customRequestInit: cacheOptions,
    });
    return {
      items: res.contents.map(normalizeQuestion),
      totalCount: res.totalCount,
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

// 条件に合うものを 100 件ずつ全件取得する（1 回で取れるのは 100 件まで。残りは並列で取得）
async function fetchAll<T>(
  endpoint: string,
  queries: MicroCMSQueries,
): Promise<T[]> {
  const fetchPage = (offset: number) =>
    microcmsClient.get<MicroCMSListResponse<T>>({
      endpoint,
      queries: { ...queries, limit: 100, offset },
      customRequestInit: cacheOptions,
    });

  const first = await fetchPage(0);
  const offsets: number[] = [];
  for (let o = 100; o < (first.totalCount ?? 0); o += 100) offsets.push(o);
  const rest = await Promise.all(offsets.map(fetchPage));
  return [first, ...rest].flatMap((res) => res.contents ?? []);
}

type IndexItem = Pick<Question, "id" | "chapter">;

// 全問題の id と chapter を、問題一覧と同じ並び順で取得する
// （章の一覧・問題数の集計と、章・検索語での絞り込みに使う）
function getQuestionIndex(endpoint: string): Promise<IndexItem[]> {
  return fetchAll<IndexItem>(endpoint, { fields: "id,chapter" });
}

// 検索語を含む問題の id を全件取得する
// （microCMS の q は問題文・選択肢・解説・章名のどれかに含まれるものを返す。
//   並び順は limit によって変わるので、ここでは集合としてだけ使う）
async function searchIds(endpoint: string, word: string): Promise<Set<string>> {
  try {
    const items = await fetchAll<Pick<Question, "id">>(endpoint, {
      q: word,
      fields: "id",
    });
    return new Set(items.map((c) => c.id));
  } catch (e) {
    // "<script>" や "../../" を含む語などは microCMS の入口で止められ、JSON 以外が返ってくる。
    // その語に当てはまる問題はないものとして扱う（microCMS 自体が止まっているときは、
    // 一緒に取得している全問題の一覧が失敗するので、エラー画面になる）
    console.warn("microCMS search failed:", {
      endpoint,
      word,
      message: e instanceof Error ? e.message : String(e),
    });
    return new Set();
  }
}

// 章の一覧を問題数つきで取得（「第2章」が「第10章」より前に来るよう数値を考慮して並べる）
export async function getChapterSummaries(
  endpoint: string,
): Promise<ChapterSummary[]> {
  const counts = new Map<string, number>();
  for (const { chapter } of await getQuestionIndex(endpoint)) {
    if (chapter) counts.set(chapter, (counts.get(chapter) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) =>
    a.name.localeCompare(b.name, "ja", { numeric: true }),
  );
}

// id の一覧（問題一覧と同じ並び順）から 1 ページ分を ids 指定で取得する
async function getPageByIds(
  endpoint: string,
  ids: string[],
  offset: number,
  limit: number,
) {
  const pageIds = ids.slice(offset, offset + limit);
  if (pageIds.length === 0) return [];

  const { items } = await fetchQuestions(endpoint, {
    ids: pageIds.join(","),
    limit: pageIds.length,
  });
  // 返ってくる順番に頼らず、問題一覧と同じ並び順にそろえる
  const order = new Map(pageIds.map((id, i) => [id, i]));
  return items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

// 1ページ分だけ取得するヘルパー（perPage は 100 以下）
export async function getQuestionsPage(params: {
  endpoint: string;
  page: number; // 1始まり
  perPage: number; // 100以下
  chapter?: string; // 章で絞り込む
  words?: string[]; // 検索語（複数ならすべてを含む問題＝AND 検索）
}) {
  const { endpoint, page, perPage, chapter, words = [] } = params;
  const current = Math.max(1, Math.floor(page) || 1);
  const limit = Math.min(100, Math.max(1, Math.floor(perPage) || 10));
  const offset = (current - 1) * limit;
  const result = (items: Question[], totalCount: number) => ({
    items,
    totalCount,
    page: current,
    perPage: limit,
  });

  // 章も検索語も指定なし: microCMS に offset / limit をそのまま渡す
  if (chapter === undefined && words.length === 0) {
    const { items, totalCount } = await fetchQuestions(endpoint, {
      limit,
      offset,
    });
    return result(items, totalCount ?? 0);
  }

  // それ以外は、全問題の並び（問題一覧と同じ順）から条件に合う id を取り出し、ids で取得する
  // - 章: microCMS の filters（chapter[equals]...）は、章の名前にカッコが含まれると
  //   0 件になってしまうため使わない
  // - 検索語: microCMS の q はスペースを含めて 1 つの語として扱うので、語ごとに検索して
  //   すべての語に当てはまるものを残す（AND 検索）。q を付けると並び順が limit によって
  //   変わるので、並び順は全問題の並びにそろえる
  const [index, ...wordSets] = await Promise.all([
    getQuestionIndex(endpoint),
    ...words.map((w) => searchIds(endpoint, w)),
  ]);
  const ids = index
    .filter((c) => chapter === undefined || c.chapter === chapter)
    .filter((c) => wordSets.every((set) => set.has(c.id)))
    .map((c) => c.id);

  return result(await getPageByIds(endpoint, ids, offset, limit), ids.length);
}
