import { createClient } from "microcms-js-sdk";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN!;
const apiKey = process.env.MICROCMS_API_KEY!;

export const client = createClient({ serviceDomain, apiKey });

// 既存の型をそのまま使用
export type Choice = { fieldId: string; selectId: string; text: string };
export type Question = {
  id: string; // microCMSのコンテンツIDが入る
  text: string;
  choices: Choice[];
  answerId: string;
  explanation?: string;
};

type ListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

export async function getQuestions(
  endpoint: "itf-questions" | "seaj-questions"
) {
  const res = await client.get<ListResponse<Question>>({
    endpoint,
    queries: {
      // 使うフィールドだけ絞ると軽量＆型も安定
      fields: "id,text,choices,answerId,explanation",
      limit: 100, // 必要に応じてページング
    },
  });

  return res.contents;
}

export const getITFQuestions = () => getQuestions("itf-questions");
export const getSEAJQuestions = () => getQuestions("seaj-questions");
