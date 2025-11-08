// scripts/ping-microcms.cjs
const fs = require("fs");
const path = require("path");

// 1) .env.local を優先して読み込む（なければ .env）
const envLocal = path.resolve(process.cwd(), ".env.local");
const envDefault = path.resolve(process.cwd(), ".env");
const dotenvPath = fs.existsSync(envLocal)
  ? envLocal
  : fs.existsSync(envDefault)
  ? envDefault
  : null;
if (dotenvPath) {
  console.log(`[dotenv] load ${path.basename(dotenvPath)}`);
  require("dotenv").config({ path: dotenvPath });
} else {
  console.warn(
    "[dotenv] .env.local / .env が見つかりません。環境変数を直接設定してください。"
  );
}

const { createClient } = require("microcms-js-sdk");

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;

// 2) 無ければ即エラー内容を分かりやすく表示
if (!SERVICE_DOMAIN || !API_KEY) {
  console.error("❌ 環境変数が未設定です。以下を確認してください：");
  console.error(
    "  MICROCMS_SERVICE_DOMAIN=（例）y0d48d6wjt  ※ドメイン名の“サブドメイン”だけ"
  );
  console.error("  MICROCMS_API_KEY=（Delivery API Key / Read用）");
  console.error(
    "  - プロジェクト直下の .env.local か .env に保存してください。"
  );
  process.exit(1);
}

const client = createClient({
  serviceDomain: SERVICE_DOMAIN,
  apiKey: API_KEY,
});

(async () => {
  for (const ep of ["itf-questions", "seaj-questions"]) {
    try {
      const res = await client.get({ endpoint: ep, queries: { limit: 1 } });
      console.log(`${ep}: OK (${res.totalCount}件)`);
    } catch (err) {
      console.error(`${ep}: NG`, err.message);
    }
  }
})();
