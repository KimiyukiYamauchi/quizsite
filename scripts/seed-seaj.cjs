// scripts/seed-seaj.cjs
// CommonJS + dotenv + fetch で microCMS へ一括投入（作成/更新→公開）

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// .env.local 優先で読む（なければ .env）
const envLocal = path.resolve(process.cwd(), ".env.local");
const envFile = fs.existsSync(envLocal)
  ? envLocal
  : path.resolve(process.cwd(), ".env");
dotenv.config({ path: envFile });

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;
const ENDPOINT = process.env.ENDPOINT_SEAJ || "seaj-questions";
const CHOICE_ID_FIELD = process.env.CHOICE_ID_FIELD || "selectId";

// 必須チェック
if (!SERVICE_DOMAIN || !API_KEY) {
  console.error(
    "❌ 環境変数 MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が読み込めていません。"
  );
  console.error(
    "   .env.local（または .env）に設定し、このスクリプトから dotenv で読ませてください。"
  );
  process.exit(1);
}

// seajQuestions を dist から読み込む（手順3でビルドしたもの）
let seajQuestions;
try {
  const dataModule = require(path.resolve(process.cwd(), "dist/seaj.js"));
  seajQuestions = dataModule.seajQuestions || dataModule.default || dataModule;
  if (!Array.isArray(seajQuestions))
    throw new Error("seajQuestions が配列ではありません。");
} catch (e) {
  console.error(
    "❌ dist/seaj.js の読み込みに失敗しました。先に次を実行してください："
  );
  console.error(
    "   npx tsc data/seaj.ts --module commonjs --target es2020 --outDir dist"
  );
  console.error(e);
  process.exit(1);
}

const apiBase = `https://${SERVICE_DOMAIN}.microcms.io/api/v1/${ENDPOINT}`;

// microCMS に投げる前に、seaj.ts の Choice {id,text} → {selectId,text} にマッピング
function toPayload(q) {
  return {
    text: q.text,
    choices: (q.choices || []).map((c) => ({
      [CHOICE_ID_FIELD]: c.id, // selectId などスキーマに合わせる
      text: c.text,
    })),
    answerId: q.answerId,
    explanation: q.explanation ?? "",
  };
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) {
    // エラーメッセージをそのまま出す
    throw new Error(`HTTP ${res.status} ${res.statusText}\n${text}`);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

// エンドポイント疎通確認（List取得）
async function preflight() {
  const url = `${apiBase}?limit=1`;
  console.log(`PRECHECK: GET ${url}`);
  await fetchJSON(url, {
    method: "GET",
    headers: { "X-MICROCMS-API-KEY": API_KEY },
  });
}

async function existsContent(contentId) {
  const url = `${apiBase}/${encodeURIComponent(contentId)}`;
  try {
    await fetchJSON(url, {
      method: "GET",
      headers: { "X-MICROCMS-API-KEY": API_KEY },
    });
    return true;
  } catch {
    return false;
  }
}

function buildContentId(q, index) {
  if (q.id) return q.id; // seaj.ts で id を持っていればそれを採用
  const base =
    (q.text || "")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-ぁ-んァ-ン一-龠]/g, "")
      .slice(0, 24) || `q${index + 1}`;
  return `seaj-${base}-${index + 1}`.toLowerCase();
}

async function upsertAndPublish(q, index) {
  const contentId = buildContentId(q, index);
  const body = JSON.stringify(toPayload(q));

  const detailUrl = `${apiBase}/${encodeURIComponent(contentId)}`;
  const createUrl = `${apiBase}?contentId=${encodeURIComponent(contentId)}`;
  const publishUrl = `${detailUrl}/publish`;

  const has = await existsContent(contentId);

  if (!has) {
    // 作成: POST /:endpoint?contentId=...
    console.log(`CREATE URL: POST ${createUrl}`);
    const res = await fetchJSON(createUrl, {
      method: "POST",
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `CREATE FAILED (${contentId}) HTTP ${res.status} ${res.statusText}\n${text}`
      );
    }
    console.log(`CREATE: ${contentId}`);
  } else {
    // 更新: PATCH /:endpoint/:contentId
    console.log(`UPDATE URL: PATCH ${detailUrl}`);
    const res = await fetchJSON(detailUrl, {
      method: "PATCH",
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `UPDATE FAILED (${contentId}) HTTP ${res.status} ${res.statusText}\n${text}`
      );
    }
    console.log(`UPDATE: ${contentId}`);
  }

  // 公開
  console.log(`PUBLISH URL: POST ${publishUrl}`);
  const pub = await fetch(publishUrl, {
    method: "POST",
    headers: { "X-MICROCMS-API-KEY": API_KEY },
  });
  const pubText = await pub.text();
  if (!pub.ok) {
    throw new Error(
      `PUBLISH FAILED (${contentId}) HTTP ${pub.status} ${pub.statusText}\n${pubText}`
    );
  }
  console.log(`PUBLISH: ${contentId}`);
}

(async () => {
  console.log(`Service: ${SERVICE_DOMAIN}, Endpoint: ${ENDPOINT}`);
  console.log(`Items: ${seajQuestions.length}`);

  // 事前チェック（エンドポイントIDやキー種別のミス検知）
  await preflight();

  for (let i = 0; i < seajQuestions.length; i++) {
    await upsertAndPublish(seajQuestions[i], i);
  }
  console.log("✅ seed finished");
})().catch((e) => {
  console.error("❌ seed failed");
  console.error(e);
  process.exit(1);
});
