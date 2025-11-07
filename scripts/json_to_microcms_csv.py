#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
import csv
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

# ===== 設定 =====
# choices（繰り返し）内のカスタムフィールドID
CUSTOM_FIELD_ID = "choice"

# ===== ユーティリティ =====
def as_list(x: Any) -> List[Any]:
    return x if isinstance(x, list) else [x]

def pick_first(d: Dict[str, Any], keys: List[str], default: Optional[Any] = None) -> Any:
    if not isinstance(d, dict):
        return default
    for k in keys:
        if k in d and d[k] not in (None, ""):
            return d[k]
    return default

def to_choice_text_list(raw_choices: Any) -> List[str]:
    """
    入力の choices を「選択肢テキスト配列」に正規化する。
    - ["A","B",...] -> そのまま
    - [{"text":"A"},{"label":"B"}, ...] -> text/label/value/option/name のいずれかから抽出
    - dict で上記が見つからなければJSON文字列化
    """
    out: List[str] = []
    choices = raw_choices or []
    if not isinstance(choices, list):
        choices = [choices]
    for item in choices:
        if isinstance(item, dict):
            val = pick_first(item, ["text", "label", "value", "option", "name"])
            if val is None:
                val = json.dumps(item, ensure_ascii=False)
            out.append(str(val))
        else:
            out.append(str(item))
    return out

def to_choices_cell(choice_texts: List[str], field_id: str = CUSTOM_FIELD_ID) -> str:
    letters = "abcdefghijklmnopqrstuvwxyz"
    arr = []
    for i, txt in enumerate(choice_texts):
        arr.append({"fieldId": field_id, "selectId": letters[i], "text": txt})
    return json.dumps(arr, ensure_ascii=False)

def detect_answer_id(answer_raw: Any, choice_texts: List[str]) -> str:
    """
    正解を a/b/c... に変換する。
    - "a"/"A" など → そのまま
    - "1"/2 など番号 → a/b/...
    - 本文一致 → その位置を a/b/...
    - list の場合は先頭を採用（単一正解用）
    - dict {id:"b"}/{index:2}/{text:"本文"} なども対応
    """
    if isinstance(answer_raw, list) and answer_raw:
        answer_raw = answer_raw[0]

    letters = "abcdefghijklmnopqrstuvwxyz"
    n = len(choice_texts)

    # 文字列
    if isinstance(answer_raw, str):
        s = answer_raw.strip()
        # a/b/c...
        if len(s) == 1 and s.lower() in letters[:n]:
            return s.lower()
        # "1","2"...
        if s.isdigit():
            idx = int(s) - 1
            if 0 <= idx < n:
                return letters[idx]
        # 本文一致
        for i, txt in enumerate(choice_texts):
            if s == txt:
                return letters[i]

    # 数値
    if isinstance(answer_raw, (int, float)):
        for idx in (int(answer_raw), int(answer_raw) - 1):  # 1始/0始どちらも試す
            if 0 <= idx < n:
                return letters[idx]

    # dict
    if isinstance(answer_raw, dict):
        if "id" in answer_raw and isinstance(answer_raw["id"], str):
            return detect_answer_id(answer_raw["id"], choice_texts)
        if "index" in answer_raw and isinstance(answer_raw["index"], (int, float, str)):
            return detect_answer_id(answer_raw["index"], choice_texts)
        if "text" in answer_raw and isinstance(answer_raw["text"], str):
            return detect_answer_id(answer_raw["text"], choice_texts)

    # 不明なら a
    return "a"

def convert(records: List[Dict[str, Any]]) -> List[List[str]]:
    """
    入力JSON配列 → microCMS CSV行の配列に変換
    ヘッダは別で出力するので、ここはデータ行のみ返す。
    """
    rows: List[List[str]] = []
    for item in records:
        # 章（なければ空）
        chapter = pick_first(item, ["chapter", "category", "section"]) or ""
        # 問題文
        text = pick_first(item, ["text", "question", "prompt", "title"]) or ""
        # 選択肢（→テキスト配列→JSON文字列）
        raw_choices = pick_first(item, ["choices", "options", "answers", "selections"], [])
        choice_texts = to_choice_text_list(raw_choices)
        choices_cell = to_choices_cell(choice_texts, field_id=CUSTOM_FIELD_ID)
        # 正解 → a/b/c...
        answer_raw = pick_first(item, ["answerId", "answer", "correct", "correctAnswer", "solution", "index"])
        answer_id = detect_answer_id(answer_raw, choice_texts)
        # 解説
        explanation = pick_first(item, ["explanation", "reason", "commentary", "hint"]) or ""

        # 1列目の「コンテンツID」は空欄（自動採番）
        row = ["", str(chapter), str(text), choices_cell, str(answer_id), str(explanation)]
        rows.append(row)
    return rows

def main():
    if len(sys.argv) < 3:
        print("Usage: python json_to_microcms_csv.py <input_json> <output_csv>")
        sys.exit(1)

    in_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])

    data = json.loads(in_path.read_text(encoding="utf-8"))
    records = as_list(data)

    rows = convert(records)

    # microCMSの指定ヘッダ
    headers = [
        "コンテンツID※空欄で構いません。特定の値を設定したい場合に入力してください。",
        "chapter",
        "text",
        "choices",
        "answerId",
        "explanation",
    ]

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"✅ Wrote: {out_path}")

if __name__ == "__main__":
    main()
