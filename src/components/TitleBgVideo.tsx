// 役割: タイトル画面の全画面動画。初期は無音で自動再生・ループ。
// 「サウンドON」押下でミュート解除して再生を継続。

import { useEffect, useRef, useState } from "react";

export default function TitleBgVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);     // 音声状態
  const [canPlay, setCanPlay] = useState(false);     // 読み込み完了

  // 初期は muted autoplay で再生開始
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const play = async () => {
      try { await v.play(); } catch { /* モバイル等で失敗可 */ }
    };
    play();
  }, []);

  // ボタン押下でミュート解除→再生（ユーザー操作があるので音が出せる）
  const enableSound = async () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    try { await v.play(); } catch { /* 失敗時は無視 */ }
    setSoundOn(true);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={ref}
        className="w-full h-full object-cover"
        src="/video/title.mp4"
        // 可能なら webm を source で追加
        // <source> を使いたい場合は video 内で children にする
        autoPlay
        muted                     // 自動再生のため必須
        loop
        playsInline               // iOS 対応
        preload="auto"
        onCanPlay={() => setCanPlay(true)}
      />
      {/* 上に薄い暗幕を敷いて文字が読めるようにする */}
      <div className="absolute inset-0 bg-black/30" />
      {/* 音声ONボタン（音が未ONのときだけ表示） */}
      {!soundOn && canPlay && (
        <div className="absolute bottom-6 right-6 z-10">
          <button
            onClick={enableSound}
            className="px-4 py-2 rounded-lg bg-amber-400 text-black font-bold shadow"
            title="動画の音声を有効化"
          >
            サウンドON
          </button>
        </div>
      )}
    </div>
  );
}
