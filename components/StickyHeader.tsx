"use client";

import type { ReactNode } from "react";
import styles from "./StickyHeader.module.css";

type Props = {
  title: string;
  children?: ReactNode; // ページネーションなどを入れる
};

export default function StickyHeader({ title, children }: Props) {
  return (
    <div className={styles.sticky}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{title}</h1>
        {children && <div className={styles.tools}>{children}</div>}
      </div>
    </div>
  );
}
