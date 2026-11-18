"use client";

import { useEffect } from "react";

// ブラウザのタブのタイトルを差し替える
// ストリーミング中に notFound() やエラーになった場合、metadata の title は反映されず、
// 後から届くレイアウト側のタイトルで上書きされるため、この画面を表示している間は差し替え直す
export default function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [title]);

  return null;
}
