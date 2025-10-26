// src/store.ts
// -----------------------------------------------------------------------------
// ゲーム全体の状態管理（Zustand）
// 変更点：
// - フェーズを title → titleLang → ready → game → result に拡張
// - モード選択（変数/メソッド/…）は廃止し、常に「ごちゃ混ぜ」固定
// - 言語選択を追加（java 本実装、他はハリボテ）
// - 準備画面に「戻る」ボタンを表示し、言語選択画面（titleLang）へ戻れる
// - タイトルへ戻るで全体リセット
// -----------------------------------------------------------------------------

import { create } from "zustand";
import type { Language } from "./data/texts";
import { nextTextByLanguage } from "./data/texts";

// 画面フェーズ
export type Phase = "title" | "titleLang" | "ready" | "game" | "result";

type State = {
  phase: Phase;          // 現在の画面
  language: Language;    // 選択中の言語
  text: string;          // 現在の出題全文
  pos: number;           // 正解済みの文字数
  timeAll: number;       // 全体残り時間（秒）
  timeOne: number;       // 個別残り時間（秒）
  score: number;         // スコア
  perfect: boolean;      // 現在の出題をミスなく進めているか
  recent: string[];      // 直近の出題履歴（重複防止用）
};

type Act = {
  // タイトル1枚目 → 言語選択画面へ（サウンド許可後に呼ぶ）
  enterLangSelect: () => void;
  // 言語選択 → 準備画面へ
  selectLanguage: (lang: Language) => void;
  // 準備画面 → ゲーム開始
  start: () => void;
  // ゲーム → リザルト
  finish: () => void;
  // リザルト or ゲーム → タイトル（完全リセット）
  backToTitle: () => void;
  // 準備画面の「戻る」→ 言語選択へ（選択状態は保持）
  backToLang: () => void;
  // キー入力（1文字）
  keyin: (ch: string) => void;
  // 経過時間の進行
  tick: (dt: number) => void;
};

// 定数（必要に応じて調整）
const INIT_ALL_TIME = 120;
const INIT_ONE_TIME = 20;
const RECENT_LIMIT = 5; // 直近5問は出さない

// 直近重複を避ける出題
function nextUniqueText(lang: Language, recent: string[]): string {
  let tries = 0;
  while (tries++ < 50) {
    const t = nextTextByLanguage(lang);
    if (!recent.includes(t)) return t;
  }
  // どうしても避けられなければ最後に許容
  return nextTextByLanguage(lang);
}

export const useGame = create<State & Act>()((set, get) => ({
  // 初期状態
  phase: "title",
  language: "java",
  text: "",
  pos: 0,
  timeAll: INIT_ALL_TIME,
  timeOne: INIT_ONE_TIME,
  score: 0,
  perfect: true,
  recent: [],

  // タイトル → 言語選択
  enterLangSelect: () => set({ phase: "titleLang" }),

  // 言語選択 → 準備
  selectLanguage: (lang) => set({ language: lang, phase: "ready" }),

  // 準備 → ゲーム開始（各タイマーとスコアをリセット）
  start: () =>
    set({
      phase: "game",
      text: nextUniqueText(get().language, get().recent),
      pos: 0,
      timeAll: INIT_ALL_TIME,
      timeOne: INIT_ONE_TIME,
      score: 0,
      perfect: true,
      recent: get().recent, // ここでは履歴はまだ触らない
    }),

  // ゲーム → リザルト
  finish: () => set({ phase: "result" }),

  // どこからでも → タイトル（完全リセット）
  backToTitle: () =>
    set({
      phase: "title",
      language: "java",
      text: "",
      pos: 0,
      timeAll: INIT_ALL_TIME,
      timeOne: INIT_ONE_TIME,
      score: 0,
      perfect: true,
      recent: [],
    }),

  // 準備 → 言語選択（選択内容は保持したまま戻る）
  backToLang: () => set({ phase: "titleLang" }),

  // 入力判定（ミス時に時間は減らさない仕様）
  keyin: (ch) => {
    if (get().phase !== "game") return;

    const { text, pos, score, perfect, language, recent } = get();

    if (text[pos] === ch) {
      const nextPos = pos + 1;

      // 問題を最後まで正解したら次問へ
      if (nextPos === text.length) {
        // 履歴を更新（直近RECENT_LIMIT件を保持）
        const newRecent = [text, ...recent].slice(0, RECENT_LIMIT);

        set({
          score: score + text.length,
          timeAll: get().timeAll + 3, // パーフェクト時ボーナスは別途付けたいならここで調整
          timeOne: INIT_ONE_TIME,
          text: nextUniqueText(language, newRecent),
          pos: 0,
          perfect, // perfectはミス時にのみfalseにする
          recent: newRecent,
        });
      } else {
        set({ pos: nextPos });
      }
    } else {
      // ミス時：時間は減らない。perfect だけ崩す
      if (perfect) set({ perfect: false });
    }
  },

  // 経過時間管理（個別タイム切れは次問へ）
  tick: (dt) => {
    if (get().phase !== "game") return;

    const newAll = get().timeAll - dt;
    const newOne = get().timeOne - dt;

    if (newAll <= 0) {
      get().finish();
      return;
    }

    if (newOne <= 0) {
      // 個別時間切れ → 強制で次問。履歴も更新。
      const { text, language, recent } = get();
      const newRecent = [text, ...recent].slice(0, RECENT_LIMIT);
      set({
        timeAll: newAll,
        timeOne: INIT_ONE_TIME,
        text: nextUniqueText(language, newRecent),
        pos: 0,
        recent: newRecent,
        perfect: true, // 新問はまたperfectに戻す
      });
    } else {
      set({ timeAll: newAll, timeOne: newOne });
    }
  },
}));
