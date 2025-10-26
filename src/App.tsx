// src/App.tsx
// 目的: 画面遷移（タイトル → 言語選択 → 準備 → ゲーム → 結果）。
// 今回追加: タイトル系画面の背景 <video> の BGM を、プレイ押下でだけ unmute+play する。
// 注意: WAV 効果音の制御は変更しない。ここでは「動画の音声のみ ON」にする。

import { useEffect, useRef } from "react";
import { useGame } from "./store";
import type { Phase } from "./store";
import type { Language } from "./data/texts";
import { calcRank } from "./score";
import TypePanel from "./components/TypePanel";
import { Howl } from "howler"; // 既存の打鍵SEを使っている場合は残す。使っていないなら削除可。

// --- 打鍵SE（任意。不要なら丸ごと削除してよい） ---
const keySounds = [
  new Howl({ src: ["/se/typeSound1.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound2.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound3.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound4.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound5.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound6.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound7.wav"], volume: 0.4 }),
  new Howl({ src: ["/se/typeSound8.wav"], volume: 0.4 }),
];
function playRandomKeySE() {
  keySounds[Math.floor(Math.random() * keySounds.length)].play();
}

// ---- 「動画のBGMだけ」を有効化するヘルパ ----
// ・タイトルや言語選択画面の <video> に data-bgm を付けておく
// ・クリック直後に muted=false → play() で音声が出る
function enableVideoBGM() {
  const videos = document.querySelectorAll<HTMLVideoElement>("video[data-bgm]");
  videos.forEach((v) => {
    try {
      v.muted = false;     // 音声を有効化
      v.volume = 1;        // 必要に応じて音量調整
      // iOS/Safari 向けに currentTime を微調整して確実に再生状態へ
      if (v.paused) {
        v.currentTime = Math.max(0, v.currentTime - 0.001);
        void v.play();
      }
    } catch {
      /* 失敗しても致命ではない */
    }
  });
}

// UI表記（言語ラベル）
const LANG_LABEL: Record<Language, string> = {
<<<<<<< HEAD
  java: "Java",
  php: "PHP",
  js: "JavaScript",
  html: "HTML",
  sql: "SQL",
  linux: "Linux",
=======
  java: "Java（実装済み）",
  php: "PHP（ハリボテ）",
  js: "JavaScript（ハリボテ）",
  html: "HTML（ハリボテ）",
  sql: "SQL（ハリボテ）",
  linux: "Linux（ハリボテ）",
>>>>>>> master
};

export default function App() {
  // ---- Zustand から状態と操作を取得 ----
  const phase: Phase = useGame((s) => s.phase);
  const language: Language = useGame((s) => s.language);
  const enterLangSelect = useGame((s) => s.enterLangSelect);
  const selectLanguage = useGame((s) => s.selectLanguage);
  const start = useGame((s) => s.start);
  const backToTitle = useGame((s) => s.backToTitle);
  const backToLang = useGame((s) => s.backToLang);
  const tick = useGame((s) => s.tick);
  const timeAll = useGame((s) => s.timeAll);
  const timeOne = useGame((s) => s.timeOne);
  const score = useGame((s) => s.score);

  // 経過時間計測
  const last = useRef(performance.now());

  // ---- 時間進行ループ ----
  useEffect(() => {
    let stop = false;
    const loop = (t: number) => {
      if (stop) return;
      const dt = (t - last.current) / 1000;
      last.current = t;
      tick(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => { stop = true; };
  }, [tick]);

  // ---- キー入力（準備=Spaceで開始、ゲーム中=打鍵SE）----
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if (phase === "ready" && e.code === "Space") {
        start();
        return;
      }
      if (
        phase === "game" &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        playRandomKeySE(); // 不要ならこの行を削除
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [phase, start]);

  // プレイ押下時: 動画BGMだけを有効化 → 言語選択へ
  const onPlayButton = () => {
    enableVideoBGM();
    enterLangSelect();
  };

  // 言語選択ボタン
  const choose = (lang: Language) => () => selectLanguage(lang);

  // ---------------- 画面分岐 ----------------

<<<<<<< HEAD
 // タイトル／言語選択／準備（共通の背景動画を1枚だけ使う）
if (phase === "title" || phase === "titleLang" || phase === "ready") {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/video/title.mp4"
        autoPlay
        muted={phase === "title"}   // 初回のみミュート。プレイ押下で enableVideoBGM() が解除
        playsInline
        loop
        preload="auto"
        data-bgm
      />

      {/* 前景UI */}
      {phase === "title" && (
        <div className="absolute inset-0 flex items-center justify-center text-white backdrop-brightness-75">
          <div className="title-box">
            <h1 className="text-4xl font-extrabold drop-shadow">Typing-TypeHacker</h1>
            <button onClick={onPlayButton} className="btn-flat">
              <span>Typing-TypeHacker をプレイ</span>
            </button>
          </div>
        </div>
      )}

      {phase === "titleLang" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 text-white backdrop-brightness-75">
          <div className="title-box">
            <h2 className="text-3xl font-bold drop-shadow mb-2">モードを選択</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              <button className="btn-flat" onClick={choose("java")}><span>{LANG_LABEL["java"]}</span></button>
              <button className="btn-flat" onClick={choose("php")}><span>{LANG_LABEL["php"]}</span></button>
              <button className="btn-flat" onClick={choose("js")}><span>{LANG_LABEL["js"]}</span></button>
              <button className="btn-flat" onClick={choose("html")}><span>{LANG_LABEL["html"]}</span></button>
              <button className="btn-flat" onClick={choose("sql")}><span>{LANG_LABEL["sql"]}</span></button>
              <button className="btn-flat" onClick={choose("linux")}><span>{LANG_LABEL["linux"]}</span></button>
            </div>
            <button className="mt-4 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30" onClick={backToTitle}>
              タイトルへ戻る
            </button>
          </div>
        </div>
      )}

      {phase === "ready" && (
        <div className="absolute inset-0 flex items-center justify-center text-white backdrop-brightness-75">
          <div className="title-box">
            <div className="text-xl font-extrabold text-white">選択モード</div>
            <div className="mode-title">{LANG_LABEL[language]}</div>
            <p className="text-lg"><span className="keycap">スペースキー</span>でゲーム開始</p>
            <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30" onClick={backToLang}>
              モード選択へ戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
=======
  // タイトル（背景動画あり。初期は muted で自動再生）
  if (phase === "title") {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* 背景動画: data-bgm を付与してターゲットにする。初期は muted で autoplay */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/video/title.mp4"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          data-bgm
        />
        {/* 前景UI */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-6
                        text-white backdrop-brightness-75">
          <h1 className="text-4xl font-extrabold drop-shadow">Typing-TypeHacker</h1>
          <button
            onClick={onPlayButton}
            className="px-6 py-3 rounded-xl bg-amber-400 text-black font-extrabold shadow
                       hover:brightness-110 active:translate-y-[2px]"
          >
            Typing-TypeHacker をプレイ
          </button>
        </div>
      </div>
    );
  }

  // 言語選択（同じ背景動画を継続表示。プレイ押下後はすでに unmute 済み）
  if (phase === "titleLang") {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/video/title.mp4"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          data-bgm
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6
                        text-white backdrop-brightness-75">
          <h2 className="text-3xl font-bold drop-shadow mb-2">言語を選択</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            <button className="btn" onClick={choose("java")}>{LANG_LABEL["java"]}</button>
            <button className="btn" onClick={choose("php")}>{LANG_LABEL["php"]}</button>
            <button className="btn" onClick={choose("js")}>{LANG_LABEL["js"]}</button>
            <button className="btn" onClick={choose("html")}>{LANG_LABEL["html"]}</button>
            <button className="btn" onClick={choose("sql")}>{LANG_LABEL["sql"]}</button>
            <button className="btn" onClick={choose("linux")}>{LANG_LABEL["linux"]}</button>
          </div>
          <button
            className="mt-4 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30"
            onClick={backToTitle}
          >
            タイトルへ戻る
          </button>
          <style>{`
            .btn{
              padding:.6rem 1.1rem; border-radius:.9rem;
              background:#2563eb; color:#fff; font-weight:800;
              box-shadow:0 8px 0 rgba(0,0,0,.18);
              transition:transform .08s ease, box-shadow .08s ease, filter .1s ease;
            }
            .btn:active{ transform:translateY(2px); box-shadow:0 6px 0 rgba(0,0,0,.18); }
            .btn:hover{ filter:brightness(1.08); }
          `}</style>
        </div>
      </div>
    );
  }

  // 準備
  if (phase === "ready") {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-6">
        <div className="text-xl opacity-80">選択言語</div>
        <div className="text-5xl font-extrabold">
          {LANG_LABEL[language]}
        </div>
        <p className="text-lg">スペースキーでゲーム開始</p>
        <button
          className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25"
          onClick={backToLang}
        >
          戻る（言語選択へ）
        </button>
      </div>
    );
  }
>>>>>>> master

  // リザルト
  if (phase === "result") {
    return (
      <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl mb-2">結果</h1>
        <p>言語：{LANG_LABEL[language]}</p>
        <p>得点：{score}</p>
        <p>ランク：{calcRank(score)}</p>
        <button className="btn" onClick={backToTitle}>タイトルへ戻る</button>
        <style>{`.btn{padding:.6rem 1.1rem;border-radius:.9rem;background:#22d3ee;color:#002b36;font-weight:800}`}</style>
      </div>
    );
  }

  // ゲーム
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 to-violet-900 p-6">
      <header className="flex items-center justify-between mb-4 text-white">
        <div className="flex items-center gap-4">
          <span className="px-2 py-1 rounded bg-black/30">言語：{LANG_LABEL[language]}</span>
          <span>残り {Math.max(0, timeAll).toFixed(1)} 秒／個別 {timeOne.toFixed(1)} 秒</span>
        </div>
        <div>得点 {score}</div>
      </header>

      <TypePanel/>

      <div className="flex justify-center mt-4">
        <button
          onClick={backToTitle}
          className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500"
        >
          タイトルへ戻る
        </button>
      </div>
    </div>
  );
}
