import "dotenv/config";
import { createClient } from "microcms-js-sdk";
import { seajQuestions } from "../data/seaj"; // パスは調整してください

type Choice = { id: string; text: string };
type Question = {
  id?: string;
  text: string;
  choices: Choice[];
  answerId: string;
  explanation?: string;
};

const endpoint = "seaj-questions";
const CHOICE_ID_FIELD = "selectId" as const; // microCMSのリピータフィールドに合わせる

const domain = process.env.MICROCMS_SERVICE_DOMAIN!;
const apiKey = process.env.MICROCMS_API_KEY!;

const client = createClient({
  serviceDomain: domain,
  apiKey,
});

async function upsertQuestion(q: Question, index: number) {
  const contentId = q.id || `seaj-${index + 1}`;
  const content = {
    text: q.text,
    choices: q.choices.map((c) => ({
      [CHOICE_ID_FIELD]: c.id,
      text: c.text,
    })),
    answerId: q.answerId,
    explanation: q.explanation ?? "",
  };

  const baseUrl = `https://${domain}.microcms.io/api/v1/${endpoint}/${contentId}`;

  // 1. 既存確認
  let exists = false;
  try {
    await client.get({ endpoint, contentId });
    exists = true;
  } catch {
    exists = false;
  }

  // 2. 作成 or 更新
  const method = exists ? "PATCH" : "PUT";
  const res = await fetch(baseUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": apiKey,
    },
    body: JSON.stringify(content),
  });

  if (!res.ok) {
    console.error(`❌ ${method} failed: ${contentId}`, await res.text());
    return;
  }

  console.log(`${exists ? "UPDATE" : "CREATE"}: ${contentId}`);

  // 3. 公開（publish）
  const publishUrl = `${baseUrl}/publish`;
  const publishRes = await fetch(publishUrl, {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": apiKey,
    },
  });

  if (!publishRes.ok) {
    console.error(`⚠️ publish failed: ${contentId}`, await publishRes.text());
  } else {
    console.log(`✅ PUBLISH: ${contentId}`);
  }
}

async function main() {
  console.log(`Total: ${seajQuestions.length}`);
  for (let i = 0; i < seajQuestions.length; i++) {
    await upsertQuestion(seajQuestions[i], i);
  }
  console.log("Seed completed ✅");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
