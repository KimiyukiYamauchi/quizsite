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

type ChapterIndexItem = Required<Pick<Question, "id" | "chapter">>;

// 全問題の id と chapter を、問題一覧と同じ並び順で取得する
// （章の一覧・問題数の集計と、章ごとのページの絞り込みに使う）
async function getChapterIndex(endpoint: string): Promise<ChapterIndexItem[]> {
  const fetchPage = (offset: number) =>
    microcmsClient.get<MicroCMSListResponse<Pick<Question, "id" | "chapter">>>({
      endpoint,
      queries: { fields: "id,chapter", limit: 100, offset },
      customRequestInit: cacheOptions,
    });

  // 1回で取れるのは100件までなので、残りのページは並列で取得する
  const first = await fetchPage(0);
  const offsets: number[] = [];
  for (let o = 100; o < first.totalCount; o += 100) offsets.push(o);
  const rest = await Promise.all(offsets.map(fetchPage));

  return [first, ...rest]
    .flatMap((res) => res.contents)
    .filter((c): c is ChapterIndexItem => Boolean(c.chapter));
}

// 章の一覧を問題数つきで取得（「第2章」が「第10章」より前に来るよう数値を考慮して並べる）
export async function getChapterSummaries(
  endpoint: string,
): Promise<ChapterSummary[]> {
  const counts = new Map<string, number>();
  for (const { chapter } of await getChapterIndex(endpoint)) {
    counts.set(chapter, (counts.get(chapter) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) =>
    a.name.localeCompare(b.name, "ja", { numeric: true }),
  );
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

  // 章の指定なし: そのまま offset / limit で取得
  if (chapter === undefined) {
    const { items, totalCount } = await fetchQuestions(endpoint, {
      limit,
      offset,
    });
    return { items, totalCount, page: current, perPage: limit };
  }

  // 章の指定あり: 全問題の id と chapter から、この章の問題 id を割り出して ids で取得する。
  // microCMS の filters（chapter[equals]...）は、章の名前にカッコが含まれると
  // 0 件になってしまうため使わない（URL から来た値を filters に入れずに済む利点もある）
  const ids = (await getChapterIndex(endpoint))
    .filter((c) => c.chapter === chapter)
    .map((c) => c.id);
  const pageIds = ids.slice(offset, offset + limit);
  if (pageIds.length === 0) {
    return { items: [], totalCount: ids.length, page: current, perPage: limit };
  }

  const { items: fetched } = await fetchQuestions(endpoint, {
    ids: pageIds.join(","),
    limit: pageIds.length,
  });
  // 返ってくる順番に頼らず、問題一覧と同じ並び順にそろえる
  const order = new Map(pageIds.map((id, i) => [id, i]));
  const items = fetched.sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );
  return { items, totalCount: ids.length, page: current, perPage: limit };
}
