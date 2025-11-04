export type Choice = { id: string; text: string };
export type Question = {
  id: string;
  text: string;
  choices: Choice[];
  answerId: string; // 正解の選択肢ID
  explanation?: string;
};

export const itfQuestions: Question[] = [
  {
    id: "itf-001",
    text: "コンピュータの基本構成に含まれないものはどれ？",
    choices: [
      { id: "a", text: "入出力装置" },
      { id: "b", text: "記憶装置" },
      { id: "c", text: "演算装置" },
      { id: "d", text: "冷却ファン" },
    ],
    answerId: "d",
    explanation:
      "冷却ファンは構成要素ではあるが、教科書的な基本5大機能には含めないことが多い。",
  },
  {
    id: "itf-002",
    text: "IPアドレスに関する説明として正しいものは？",
    choices: [
      { id: "a", text: "IPv4は128ビットで構成される" },
      { id: "b", text: "IPv6は32ビットで構成される" },
      { id: "c", text: "IPv4は32ビットで構成される" },
      { id: "d", text: "IPv6は64ビットで構成される" },
    ],
    answerId: "c",
  },
  {
    id: "itf-003",
    text: "情報セキュリティのCIAに含まれないものはどれ？",
    choices: [
      { id: "a", text: "機密性" },
      { id: "b", text: "完全性" },
      { id: "c", text: "可用性" },
      { id: "d", text: "迅速性" },
    ],
    answerId: "d",
  },
  {
    id: "itf-004",
    text: "ストレージのRAIDで、冗長性を持つ代表は？",
    choices: [
      { id: "a", text: "RAID 0" },
      { id: "b", text: "RAID 1" },
      { id: "c", text: "RAID -1" },
      { id: "d", text: "単一ディスク" },
    ],
    answerId: "b",
  },
  {
    id: "itf-005",
    text: "オペレーティングシステムの役割として適切なのは？",
    choices: [
      { id: "a", text: "アプリのUIデザインを自動生成する" },
      { id: "b", text: "ハードウェア資源の管理を行う" },
      { id: "c", text: "ネットワークケーブルの配線を行う" },
      { id: "d", text: "電力会社との契約を管理する" },
    ],
    answerId: "b",
  },
];
