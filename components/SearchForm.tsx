import Form from "next/form";
import Link from "next/link";
import { SEARCH_MAX_LENGTH } from "@/lib/quizPage";
import styles from "./SearchForm.module.css";

type Props = {
  action: string; // 検索先のパス（例: "/itf"）。?q= を付けて移動する
  defaultValue?: string; // 今の検索語
};

// 問題の検索フォーム（next/form なので、ページを読み込み直さずに移動する）
export default function SearchForm({ action, defaultValue = "" }: Props) {
  return (
    <Form action={action} className={styles.form} role="search">
      <input
        // 検索語が変わったら（「検索をやめる」で戻ったときなど）入力欄を作り直して表示をそろえる
        key={defaultValue}
        type="search"
        name="q"
        className={styles.input}
        defaultValue={defaultValue}
        maxLength={SEARCH_MAX_LENGTH}
        placeholder="キーワードで問題を検索（例: 暗号 公開鍵）"
        aria-label="問題を検索するキーワード"
      />
      <button type="submit" className={styles.button}>
        検索
      </button>
      {defaultValue && (
        <Link href={action} className={styles.clear}>
          検索をやめる
        </Link>
      )}
    </Form>
  );
}
