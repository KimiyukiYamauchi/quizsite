"use client";

import type { ReactNode } from "react";
import Breadcrumb, { type Crumb } from "./Breadcrumb";
import styles from "./StickyHeader.module.css";

type Props = {
  title: string;
  breadcrumbs?: Crumb[]; // タイトルの下に表示するパンくずリスト
  children?: ReactNode; // ページネーションなどを入れる
};

export default function StickyHeader({ title, breadcrumbs, children }: Props) {
  return (
    <div className={styles.sticky}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{title}</h1>
        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
        {children && <div className={styles.tools}>{children}</div>}
      </div>
    </div>
  );
}
