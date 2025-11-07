#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
import csv
from pathlib import Path
from typing import Any, Dict, List, Optional

# ====== スキーマ設定（必要に応じて変更可） ======
CHOICE_CUSTOM_FIELD_ID = "choice"     # 選択肢 繰り返し（内側）のカスタムフィールドID
ANSWER_CUSTOM_FIELD_ID = "answerId"   # 正解   繰り返し（内側）のカスタムフィールドID
CHOICE_ID_KEY_IN_INPUT = ["selectId", "id"]  # 入力JSONの選択肢IDフィールド候補

# ====== ユーティリティ ======
def as_list(x: Any) -> List[Any]:
    return x if isinstance(x, list) else [x]

def pick_first(d: Dict[str, Any], keys: List[str], default: Optional[Any] = None) -> Any:
    if not isinstance(d, dict):
        return default
    for k in keys:
        if k in d and d[k] not in (None, ""):
            return d[k]
    return default

def extract_choice_texts(raw_choices: Any) -> List[str]:
    """choices をテキスト配列に正規化"""
    out: List[str] = []
    arr = raw_choices if isinstance(raw_choices, list) else [raw_choices]
    for ch in (arr or []):
        if isinstance(ch, dict):
            txt = pick_first(ch, ["text", "label", "value", "option", "name"])
            if txt is None:
                txt = json.dumps(ch, ensure_ascii=False)
            out.append(str(txt))
        else:
            out.append(str(ch))
    return out

def build_choices_cell(choice_texts: List[str]) -> str:
    """choices 列（JSON配列文字列）を作成：fieldId: choice, selectId: a,b,c..."""
    letters = "abcdefghijklmnopqrstuvwxyz"
    items = []
    for i, txt in enumerate(choice_texts):
        items.append({
            "fieldId": CHOICE_CUSTOM_FIELD_ID,
            "selectId": letters[i],
            "text": txt,
        })
    return json.dumps(items, ensure_ascii=False)

def normalize_answer_list(raw: Any) -> List[Any]:
    """正解候補を配列化（単一なら配列化）"""
    if raw is None:
        return []
    return raw if isinstance(raw, list) else [raw]

def map_answer_to_letter(ans: Any, choice_texts: List[str]) -> Optional[str]:
    """
    任意形式の正解→ a/b/c... にマップ
    - 'a','A' / 1,2 / '1' / 本文一致 / {id:'b'}/{index:2}/{text:'...'} etc
    """
    letters = "abcdefghijklmnopqrstuvwxyz"
    n = len(choice_texts)

    # 文字列
    if isinstance(ans, str):
        s = ans.strip()
        if len(s) == 1 and s.lower() in letters[:n]:
            return s.lower()
        if s.isdigit():
            idx = int(s) - 1
            if 0 <= idx < n:
                return letters[idx]
        # 本文一致
        for i, t in enumerate(choice_texts):
            if s == t:
                return letters[i]

    # 数値
    if isinstance(ans, (int, float)):
        for idx in (int(ans), int(ans) - 1):  # 1始/0始を許容
            if 0 <= idx < n:
                return letters[idx]

    # dict
    if isinstance(ans, dict):
        if "id" in ans and isinstance(ans["id"], str):
            return map_answer_to_letter(ans["id"], choice_texts)
        if "index" in ans and isinstance(ans["index"], (int, float, str)):
            return map_answer_to_letter(ans["index"], choice_texts)
        if "text" in ans and isinstance(ans["text"], str):
            return map_answer_to_letter(ans["text"], choice_texts)

    return None

def build_answers_cell(answer_letters: List[str]) -> str:
    """
    answerId 列（JSON配列文字列）を作成：
    [{"fieldId":"answerId","answerId":"a"}, ...]
    """
    items = [{"fieldId": ANSWER_CUSTOM_FIELD_ID, "answerId": a} for a in answer_letters]
    return json.dumps(items, ensure_ascii=False)

def convert(records: List[Dict[str, Any]]) -> List[List[str]]:
    rows: List[List[str]] = []
    for rec in records:
        # 章・問題文
        chapter = pick_first(rec, ["chapter", "category", "section"]) or ""
        text    = pick_first(rec, ["text", "question", "prompt", "title"]) or ""

        # 選択肢 → テキスト配列 → JSON
        raw_choices  = pick_first(rec, ["choices", "options", "answers", "selections"], [])
        choice_texts = extract_choice_texts(raw_choices)
        choices_cell = build_choices_cell(choice_texts)

        # 正解（複数）→ a/b/c... リスト
        raw_answer = pick_first(rec, ["answerIds", "answerId", "answers",
                                      "answer", "correct", "correctAnswer", "solutions", "solution", "indexes", "index"])
        letter_list: List[str] = []
        for item in normalize_answer_list(raw_answer):
            letter = map_answer_to_letter(item, choice_texts)
            if letter and letter not in letter_list:
                letter_list.append(letter)
        # 何も判定できなければ a を最低1つ
        if not letter_list and choice_texts:
            letter_list = ["a"]

        answers_cell = build_answers_cell(letter_list)

        # 解説
        explanation = pick_first(rec, ["explanation", "reason", "commentary", "hint"]) or ""

        # row（1列目はコンテンツID空欄）
        rows.append(["", str(chapter), str(text), choices_cell, answers_cell, str(explanation)])
    return rows

def main():
    if len(sys.argv) < 3:
        print("Usage: python json_to_microcms_csv_multi.py <input_json> <output_csv>")
        sys.exit(1)

    in_path  = Path(sys.argv[1])
    out_path = Path(sys.argv[2])

    data = json.loads(in_path.read_text(encoding="utf-8"))
    records = as_list(data)
    rows = convert(records)

    headers = [
        "コンテンツID※空欄で構いません。特定の値を設定したい場合に入力してください。",
        "chapter",
        "text",
        "choices",
        "answerId",     # 繰り返しJSON（fieldId:"answerId"）で複数正解を保持
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
