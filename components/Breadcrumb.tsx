import Link from "next/link";
import styles from "./Breadcrumb.module.css";

export type Crumb = {
  label: string;
  href?: string; // 省略した項目（現在ページ）はリンクにしない
};

type Props = {
  items: Crumb[];
};

export default function Breadcrumb({ items }: Props) {
  return (
    <nav className={styles.nav} aria-label="breadcrumb">
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${i}-${item.label}`} className={styles.item}>
              {item.href && !isLast ? (
                <Link className={styles.link} href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
