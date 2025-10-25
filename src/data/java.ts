// src/data/java.ts
// 出題履歴を保持して「直近5件の重複禁止」にする

export const VARS = ["count","total","index","result","temp"];
export const METHODS = ["toString","equals","substring","size","add"];
export const SNIPPETS = [
  "for(int i=0;i<10;i++){}",
  "if(value==null) return;",
  "List<String> list = new ArrayList<>();"
];

export type Mode = "variable"|"method"|"snippet"|"mix";

// 直近問題履歴（最大5件）
const history: string[] = [];

// ランダム抽選
function pick<T>(arr:T[]):T{
  return arr[Math.floor(Math.random()*arr.length)];
}

// 問題を履歴に登録（最大5件に制限）
function pushHistory(x:string){
  history.push(x);
  if(history.length > 5) history.shift(); // 先頭から削る
}

// モードに応じた問題を1つ返す（重複チェック付き）
export function nextText(m:Mode):string{
  const pools = {
    variable: VARS,
    method: METHODS,
    snippet: SNIPPETS,
    mix: [...VARS, ...METHODS, ...SNIPPETS]
  };

  const pool = pools[m];

  let cand = pick(pool);

  // 直近5件と重複していたら再抽選
  // ただし無限ループ防止のため最大50回
  let tries = 0;
  while(history.includes(cand) && tries < 50){
    cand = pick(pool);
    tries++;
  }

  // 履歴へ登録
  pushHistory(cand);

  return cand;
}
