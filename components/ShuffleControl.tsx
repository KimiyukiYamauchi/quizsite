import Link from "next/link";
import { buildHref } from "@/lib/quizPage";
import { newShuffleSeed } from "@/lib/shuffle";
import styles from "./ShuffleControl.module.css";

type Props = {
  path: string; // 今のページのパス（例: "/itf"、"/itf/chapter/..."）
  query?: Record<string, string | undefined>; // 残したいクエリ（例: 検索語 { q: "暗号" }）
  seed?: string; // 今のシャッフルのシード（なければシャッフルしていない）
};

// 問題のシャッフルを切り替えるリンク。切り替えたら 1 ページ目に戻る（選択肢の順番は変えない）
export default function ShuffleControl({ path, query = {}, seed }: Props) {
  const shuffleHref = buildHref(path, { ...query, shuffle: newShuffleSeed() });

  if (!seed) {
    return (
      <p className={styles.box}>
        <Link className={styles.link} href={shuffleHref}>
          問題をシャッフルする
        </Link>
      </p>
    );
  }

  return (
    <p className={`${styles.box} ${styles.on}`}>
      <span className={styles.status}>
        シャッフル中：問題の順番を入れ替えています
      </span>
      <Link className={styles.link} href={shuffleHref}>
        並べ直す
      </Link>
      <Link className={styles.link} href={buildHref(path, query)}>
        元の順番に戻す
      </Link>
    </p>
  );
}
