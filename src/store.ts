// src/store.ts
// -----------------------------------------------------------------------------
// ゲーム全体の状態管理（Zustand）
// ・phase: 画面遷移（title → ready → game → result）
// ・timeAll: 全体残り秒数、timeOne: 個別問題の残り秒数（仕様で常に10秒）
// ・ミス時は時間を減らさない（perfect だけ false にする）
// ・次問への遷移条件は「正解で打ち切り」or「個別時間が0秒」
// -----------------------------------------------------------------------------

import { create } from "zustand";
import { nextText } from "./data/java";
import type { Mode } from "./data/java";

// 画面フェーズ
export type Phase = "title" | "ready" | "game" | "result";

// 状態
type State = {
  phase:   Phase;   // 現在の画面
  mode:    Mode;    // 選択モード
  text:    string;  // 現在の出題テキスト
  pos:     number;  // 何文字正解済みか（カーソル位置）
  timeAll: number;  // 全体残り時間(秒)
  timeOne: number;  // 個別残り時間(秒) 仕様: 常に10秒リセット
  score:   number;  // スコア（= 正解時に文字数加点）
  perfect: boolean; // 現在の問題でミス無しなら true
};

// 操作（アクション）
type Act = {
  // タイトルでモード選択 → 準備画面へ
  selectMode: (m: Mode) => void;
  // 準備画面で Space → ゲーム開始
  start: () => void;
  // 全体時間0で結果へ
  finish: () => void;
  // タイトルへ戻る（タイマー等を完全初期化）
  backToTitle: () => void;
  // 1打鍵判定（ゲーム中のみ有効）
  keyin: (ch: string) => void;
  // 経過時間更新（ゲーム中のみ有効）
  tick: (dt: number) => void;
};

// 初期値
const INIT_ALL_TIME = 60;
const INIT_ONE_TIME = 10;

export const useGame = create<State & Act>()((set, get) => ({
  // --- 初期状態 ---
  phase:   "title",
  mode:    "mix",
  text:    "",
  pos:     0,
  timeAll: INIT_ALL_TIME,
  timeOne: INIT_ONE_TIME,
  score:   0,
  perfect: true,

  // --- タイトル → 準備 ---
  // （ここではタイマーは動かさない。実際の初期化は start() で行う）
  selectMode: (m) => set({ phase: "ready", mode: m }),

  // --- 準備 → ゲーム開始 ---
  start: () =>
    set({
      phase:   "game",
      text:    nextText(get().mode), // モードに応じた新規出題
      pos:     0,
      timeAll: INIT_ALL_TIME,        // 全体60秒にリセット
      timeOne: INIT_ONE_TIME,        // 個別10秒にリセット
      score:   0,
      perfect: true,
    }),

  // --- 全体時間0 → 結果 ---
  finish: () => set({ phase: "result" }),

  // --- タイトルへ戻る（完全初期化）---
  // ※ ここで phase="title" にしておけば、tick は即 return するため
  //    戻った直後に勝手に時間が減ることはない
  backToTitle: () =>
    set({
      phase:   "title",
      text:    "",
      pos:     0,
      timeAll: INIT_ALL_TIME,
      timeOne: INIT_ONE_TIME,
      score:   0,
      perfect: true,
      // mode は保持（タイトルで再選択可）
    }),

  // --- キー入力判定（ゲーム中のみ）---
  keyin: (ch) => {
    if (get().phase !== "game") return; // それ以外は無視

    const { text, pos, score, perfect } = get();

    if (text[pos] === ch) {
      // 正しい打鍵
      const nextPos = pos + 1;

      if (nextPos === text.length) {
        // すべて正解 → 次の出題へ（個別10秒リセット、全体+3秒）
        set({
          score:   score + text.length,
          timeAll: get().timeAll + 3,
          timeOne: INIT_ONE_TIME,
          text:    nextText(get().mode),
          pos:     0,
          perfect, // 維持（ミスが無ければ true のまま）
        });
      } else {
        // まだ途中 → カーソルを進める
        set({ pos: nextPos });
      }
    } else {
      // ミス：時間は減らさない仕様（変更点）
      //       次問への遷移条件は満たさないので進まない
      set({ perfect: false });
    }
  },

  // --- 経過時間更新（ゲーム中のみ）---
  tick: (dt) => {
    if (get().phase !== "game") return; // title / ready / result では何もしない

    const newAll = get().timeAll - dt; // 全体時間を減算
    const newOne = get().timeOne - dt; // 個別時間を減算

    // 全体0秒 → 結果へ
    if (newAll <= 0) {
      get().finish();
      return;
    }

    // 個別0秒 → 強制で次問（全体 -2秒のペナルティは維持）
    if (newOne <= 0) {
      set({
        timeAll: newAll - 2,            // 罰則（仕様どおり保持）
        timeOne: INIT_ONE_TIME,         // 個別を10秒にリセット
        text:    nextText(get().mode),  // 次の出題
        pos:     0,
        perfect: true,                  // 新問はパーフェクト状態から
      });
      return;
    }

    // 通常減算（まだどちらも0未満でない場合）
    set({
      timeAll: newAll,
      timeOne: newOne,
    });
  },
}));
