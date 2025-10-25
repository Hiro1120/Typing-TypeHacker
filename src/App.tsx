// src/App.tsx
// 目的: 画面遷移（タイトル→準備→ゲーム→結果）と打鍵SEランダム再生のみの最小構成
// 注意: 背景アニメ(Pixi)は使わない。HowlerのSE読み込みとZustandの状態のみ。

import { useEffect, useRef } from "react";
import { useGame } from "./store";              // ゲーム状態と操作
import type { Mode } from "./data/java";
import type { Phase } from "./store";
import { calcRank } from "./score";
import TypePanel from "./components/TypePanel";
import { Howl } from "howler";

// --- 効果音: /public/se/typeSound1.wav ～ typeSound5.wav を用意 ---
const sounds = [
  new Howl({ src: ["/se/typeSound1.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound2.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound3.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound4.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound5.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound6.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound7.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound8.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound9.wav"], volume: 0.4 }),
];
// 1打鍵ごとにどれかを鳴らす
function playRandom() { sounds[Math.floor(Math.random() * sounds.length)].play(); }

// UI表示用のラベル
const MODE_LABEL: Record<Mode, string> = {
  variable: "変数",
  method: "メソッド",
  snippet: "処理",
  mix: "ごちゃ混ぜ",
};

export default function App() {
  // ---- Zustand から必要最小限を取得（個別取得で再描画を抑制） ----
  const phase: Phase = useGame(s => s.phase);
  const mode: Mode = useGame(s => s.mode);
  const selectMode = useGame(s => s.selectMode);
  const start = useGame(s => s.start);
  const backToTitle = useGame(s => s.backToTitle);
  const tick = useGame(s => s.tick);
  const timeAll = useGame(s => s.timeAll);
  const timeOne = useGame(s => s.timeOne);
  const score = useGame(s => s.score);

  // requestAnimationFrame の前回時刻
  const last = useRef(performance.now());

  // ---- 時間進行ループ（1フレームの経過秒を tick に渡す）----
  useEffect(() => {
    const loop = (t: number) => {
      const dt = (t - last.current) / 1000; // ms → s
      last.current = t;
      tick(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }, [tick]);

  // ---- 全体キー入力: 準備→Spaceで開始、ゲーム中は打鍵音 ----
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.isComposing) return;                 // IME中は無視
      if (phase === "ready" && e.code === "Space") { start(); return; }
      if (phase === "game" && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        playRandom();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [phase, start]);

  const choose = (m: Mode) => () => selectMode(m);

  // ---- 画面: タイトル（モード選択）----
  if (phase === "title") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 to-fuchsia-400 text-white
                      flex flex-col items-center justify-center gap-6 p-6">
        <h1 className="text-4xl font-extrabold drop-shadow">Typing × Programming</h1>
        <p className="opacity-90">モードを選択してください</p>
        <div className="flex gap-3">
          <button className="btn" onClick={choose("variable")}>変数</button>
          <button className="btn" onClick={choose("method")}>メソッド</button>
          <button className="btn" onClick={choose("snippet")}>処理</button>
          <button className="btn" onClick={choose("mix")}>ごちゃ混ぜ</button>
        </div>
        <style>{`.btn{padding:.6rem 1.1rem;border-radius:.9rem;background:#2563eb;font-weight:800}`}</style>
      </div>
    );
  }

  // ---- 画面: 準備（選択モード表示とSpace案内）----
  if (phase === "ready") {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-6">
        <div className="text-xl opacity-80">選択モード</div>
        <div className="text-5xl font-extrabold">{MODE_LABEL[mode]}</div>
        <p className="text-lg">スペースキーでゲーム開始</p>
      </div>
    );
  }

  // ---- 画面: リザルト（スコアとランク、タイトル戻り）----
  if (phase === "result") {
    return (
      <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl mb-2">結果</h1>
        <p>モード：{MODE_LABEL[mode]}</p>
        <p>得点：{score}</p>
        <p>ランク：{calcRank(score)}</p>
        <button className="btn" onClick={backToTitle}>タイトルへ戻る</button>
        <style>{`.btn{padding:.6rem 1.1rem;border-radius:.9rem;background:#22d3ee;color:#002b36;font-weight:800}`}</style>
      </div>
    );
  }

  // ---- 画面: ゲーム（上部情報 + TypePanel + タイトルへ戻る）----
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 to-violet-900 p-6">
      <header className="flex items-center justify-between mb-4 text-white">
        <div className="flex items-center gap-4">
          <span className="px-2 py-1 rounded bg-black/30">モード：{MODE_LABEL[mode]}</span>
          <span>残り {Math.max(0, timeAll).toFixed(1)} 秒／個別 {timeOne.toFixed(1)} 秒</span>
        </div>
        <div>得点 {score}</div>
      </header>

      <TypePanel/>

      <div className="flex justify-center mt-4">
        <button onClick={backToTitle}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500">
          タイトルへ戻る
        </button>
      </div>
    </div>
  );
}
