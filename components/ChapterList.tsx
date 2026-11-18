import Link from "next/link";
import type { ChapterSummary } from "@/lib/types";
import styles from "./ChapterList.module.css";

type Props = {
  chapters: ChapterSummary[];
  basePath: string; // 検定のパス（"/itf", "/seaj"）。lib/exams.ts の examPath()
  currentChapter?: string; // 章ページで表示中の章（強調表示する）
  defaultOpen?: boolean; // 最初から開いておくか
};

export default function ChapterList({
  chapters,
  basePath,
  currentChapter,
  defaultOpen = false,
}: Props) {
  if (chapters.length === 0) return null;

  return (
    <details className={styles.box} open={defaultOpen}>
      <summary className={styles.summary}>
        章を選ぶ（全{chapters.length}章）
      </summary>
      <nav aria-label="章の一覧">
        <ul className={styles.list}>
          {chapters.map((c) => {
            const isCurrent = c.name === currentChapter;
            return (
              <li key={c.name}>
                <Link
                  className={`${styles.link} ${isCurrent ? styles.current : ""}`}
                  href={`${basePath}/chapter/${encodeURIComponent(c.name)}`}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  <span className={styles.name}>{c.name}</span>
                  <span className={styles.count}>{c.count}問</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </details>
  );
}
