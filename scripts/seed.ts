import { client } from "@/lib/microcms";
import { itfQuestions } from "@/data/itf";
import { seajQuestions } from "@/data/seaj";

async function seed(
  endpoint: "itf-questions" | "seaj-questions",
  items: any[]
) {
  for (const q of items) {
    // microCMSのコンテンツ作成
    await client.create({
      endpoint,
      content: {
        text: q.text,
        choices: q.choices, // [{id, text}]
        answerId: q.answerId,
        explanation: q.explanation ?? "",
      },
    });
  }
}

async function main() {
  // await seed("itf-questions", itfQuestions);
  await seed("seaj-questions", seajQuestions);
  console.log("seed done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
