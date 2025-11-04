import type { Question } from "./itf";

export const seajQuestions: Question[] = [
  {
    id: "seaj-001",
    text: "要件定義の目的として最も適切なのはどれ？",
    choices: [
      { id: "a", text: "テストケースの網羅率を測る" },
      { id: "b", text: "ユーザーが求める価値・範囲を明確化する" },
      { id: "c", text: "Gitのブランチ戦略を決める" },
      { id: "d", text: "コーディング規約を策定する" },
    ],
    answerId: "b",
  },
  {
    id: "seaj-002",
    text: "ウォーターフォールの工程の並びとして妥当なのは？",
    choices: [
      { id: "a", text: "詳細設計→要件定義→テスト→運用" },
      { id: "b", text: "要件定義→基本設計→詳細設計→実装→テスト" },
      { id: "c", text: "運用→テスト→実装→要件定義" },
      { id: "d", text: "詳細設計→テスト→基本設計→実装" },
    ],
    answerId: "b",
  },
  {
    id: "seaj-003",
    text: "非機能要件に含まれやすいものはどれ？",
    choices: [
      { id: "a", text: "検索機能" },
      { id: "b", text: "応答性能" },
      { id: "c", text: "ユーザー登録" },
      { id: "d", text: "レポート出力" },
    ],
    answerId: "b",
  },
  {
    id: "seaj-004",
    text: "結合テストの主目的として適切なのは？",
    choices: [
      { id: "a", text: "単体モジュール内部の分岐網羅" },
      { id: "b", text: "モジュール間のインタフェース・連携の確認" },
      { id: "c", text: "UIの使いやすさ評価" },
      { id: "d", text: "運用監視手順の整備" },
    ],
    answerId: "b",
  },
  {
    id: "seaj-005",
    text: "アジャイル開発でスプリントレビューの目的は？",
    choices: [
      { id: "a", text: "見積もりの再計算のみ" },
      {
        id: "b",
        text: "インクリメントをステークホルダーと確認しフィードバックを得る",
      },
      { id: "c", text: "障害対応の振り返りのみ" },
      { id: "d", text: "チーム編成を変更する会議" },
    ],
    answerId: "b",
  },
];
