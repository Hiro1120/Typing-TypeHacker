// src/components/TypePanel.tsx
// 目的：エディタ風の複数行表示 + 「点滅カーソル」を表示
// ポイント：
// - 10行固定の表示枠（スクロールなし）
// - 改行/タブをそのまま表示（white-space: pre）
// - 入力済み=緑、未入力=灰、現在位置の直前に「細い縦棒カーソル」を挿入
// - カーソルは CSS のアニメーションで点滅

import { useEffect } from "react";
import { useGame } from "../store";

export default function TypePanel(){
  // text: 出題全文（1本の文字列）
  // pos : 現在の入力位置（text の先頭から何文字正解したか）
  // keyin: 1文字入力の判定
  const { text, pos, keyin } = useGame();

  // 入力監視（ゲーム画面のみ親で音を鳴らす。ここでは純粋に判定だけ）
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if(e.isComposing) return;                    // IME中は無視
      if(e.key.length===1 && !e.ctrlKey && !e.metaKey){
        keyin(e.key);                               // 1文字入力を判定へ
      }
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[keyin]);

  // 文字列を「入力済み」「未入力」に二分
  // カーソルはこの境界（pos）に挿入する
  const left  = text.slice(0, pos);  // 入力済み（緑）
  const right = text.slice(pos);     // 未入力（灰）。先頭が現在要求される文字

  return (
    <div
      className="font-mono bg-black text-white p-4 rounded-xl border"
      style={{
        whiteSpace: "pre",          // 改行/タブをそのまま表示
        overflow: "hidden",         // 枠外は隠す（スクロールなし）
        height: "calc(1.25em * 10)",// 10行固定
        lineHeight: "1.25em",       // 行高を一定に
      }}
    >
      {/* 入力済み部分 */}
      <span className="text-green-400">{left}</span>

      {/* カーソル（現在位置に細い縦棒）。改行直前/直後でも自然に挿入される */}
      <span
        aria-hidden
        className="inline-block align-bottom"
        style={{
          width: "1px",             // 細い縦線
          height: "1.25em",         // 1行分の高さ
          background: "#f43f5e",    // 赤系（視認性）
          marginLeft: "0px",
          marginRight: "0px",
          animation: "blink 1s step-end infinite", // 点滅
        }}
      />

      {/* 未入力部分。先頭が「次に打つべき文字」 */}
      <span className="text-gray-400">{right}</span>

      {/* カーソル点滅アニメ（CSS） */}
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
