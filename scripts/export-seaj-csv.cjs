// scripts/export-seaj-csv.cjs
// data/seaj.ts -> CSV（microCMSインポート用）
// 前提: 事前に `npx tsc data/seaj.ts --module commonjs --target es2020 --outDir dist` 済み

const fs = require("fs");
const path = require("path");

// ===== 設定（必要に応じて変更可） =====
// リピータ「choices」の“内側”がカスタムフィールドID "choice"
const CUSTOM_FIELD_ID = process.env.CUSTOM_FIELD_ID || "choice";
// 選択肢のIDのフィールド名（スキーマに合わせる）: selectId or id
const CHOICE_ID_FIELD_IN_TS = process.env.CHOICE_ID_FIELD_IN_TS || "selectId";
// explanation 列を出力するか
const INCLUDE_EXPLANATION = process.env.INCLUDE_EXPLANATION !== "false";

// ===== 入力読み込み（dist/data/seaj.js） =====
const inputJs = path.resolve(process.cwd(), "dist/seaj.js");
if (!fs.existsSync(inputJs)) {
  console.error(
    "❌ dist/data/seaj.js が見つかりません。先に次を実行してください："
  );
  console.error(
    "   npx tsc data/seaj.ts --module commonjs --target es2020 --outDir dist"
  );
  process.exit(1);
}
const mod = require(inputJs);
const seajQuestions = mod.seajQuestions || mod.default || mod;
if (!Array.isArray(seajQuestions)) {
  console.error(
    "❌ seajQuestions が配列ではありません。data/seaj.ts のエクスポートをご確認ください。"
  );
  process.exit(1);
}

// CSV 出力先
const outDir = path.resolve(process.cwd(), "exports");
const outFile = path.join(outDir, "seaj-import.csv");
fs.mkdirSync(outDir, { recursive: true });

// CSVエスケープ（ダブルクォート2重化 & フィールド全体をダブルクォートで囲む）
function csvEscape(val) {
  const s = String(val ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

// choices(Choice[]) -> JSON配列文字列（CSVセル用）
function buildChoicesCell(choices) {
  const arr = (choices || []).map((c) => {
    const selectId =
      CHOICE_ID_FIELD_IN_TS in c
        ? c[CHOICE_ID_FIELD_IN_TS]
        : "id" in c
        ? c.id
        : ""; // 念のためフォールバック
    return {
      fieldId: CUSTOM_FIELD_ID,
      selectId: selectId,
      text: c.text ?? "",
    };
  });
  return JSON.stringify(arr);
}

// ヘッダ（microCMSサンプルCSVに近い文言）
const headerContentId =
  "コンテンツID\n※空欄で構いません。特定の値を設定したい場合に入力してください。";

// 実際のフィールドはスキーマに合わせて（ここでは text / choices / answerId / explanation）
const headers = [headerContentId, "text", "choices", "answerId"];
if (INCLUDE_EXPLANATION) headers.push("explanation");

// 1行目（ヘッダ）
const lines = [headers.map(csvEscape).join(",")];

// データ行
seajQuestions.forEach((q, i) => {
  const contentId = ""; // ← 空欄（自動採番）
  const text = q.text ?? "";
  const choicesCell = buildChoicesCell(q.choices || []);
  const answerId = q.answerId ?? "";
  const exp = q.explanation ?? "";

  const row = [
    csvEscape(contentId),
    csvEscape(text),
    csvEscape(choicesCell), // JSON文字列をCSVセルに入れるのでエスケープ必須
    csvEscape(answerId),
  ];
  if (INCLUDE_EXPLANATION) row.push(csvEscape(exp));

  lines.push(row.join(","));
});

// 保存（UTF-8 / BOMなし）
fs.writeFileSync(outFile, lines.join("\n"), { encoding: "utf8" });

console.log(`✅ CSVを書き出しました: ${outFile}`);
console.log(
  "microCMS > 対象API(seaj-questions) > インポートして追加 からアップロードしてください。"
);
console.log(
  `choices は [{"fieldId":"${CUSTOM_FIELD_ID}","selectId":"…","text":"…"}] 形式で出力しています。`
);
