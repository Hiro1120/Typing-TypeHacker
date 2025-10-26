// src/data/texts.ts
// 目的：言語ごとの出題文字列を管理する。出題は常に「ごちゃ混ぜ」固定。
// 方針：各言語につき「変数候補」「メソッド名」「スニペット」を用意し、ランダムで取り出す。
//       仕様上、Java だけ本実装。他はハリボテの簡易データ。

export type Language = "java" | "php" | "js" | "html" | "sql" | "linux";

// ランダム抽出ユーティリティ
function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

// ---- Java（本実装） ----
const JAVA_VARS = ["count", "total", "index", "result", "temp", "buffer", "flag"];
const JAVA_METHODS = ["toString", "equals", "substring", "size", "add", "put", "get"];
const JAVA_SNIPPETS = [
  "for(int i=0;i<10;i++){ System.out.println(i); }",
  "if(value==null) return;",
  "List<String> list = new ArrayList<>();",
  "try{ doWork(); }catch(Exception e){ e.printStackTrace(); }",
  "Map<String,Integer> map = new HashMap<>();",
  "String s = input.trim().toLowerCase();",
];

// ---- ハリボテ群（最低限のダミー。将来差し替え予定） ----
const PHP_SNIPPETS = [
  "dummy",
];
const JS_SNIPPETS = [
  "dummy",
];
const HTML_SNIPPETS = [
  "dummy",
];
const SQL_SNIPPETS = [
  "dummy",
];
const LINUX_SNIPPETS = [
  "dummy",
];

// 言語→プール定義
const POOLS: Record<Language, { vars?: string[]; methods?: string[]; snippets: string[] }> = {
  java: { vars: JAVA_VARS, methods: JAVA_METHODS, snippets: JAVA_SNIPPETS },
  php: { snippets: PHP_SNIPPETS },
  js: { snippets: JS_SNIPPETS },
  html: { snippets: HTML_SNIPPETS },
  sql: { snippets: SQL_SNIPPETS },
  linux: { snippets: LINUX_SNIPPETS },
};

// ごちゃ混ぜ固定で1件返す
export function nextTextByLanguage(lang: Language): string {
  const pool = POOLS[lang];
  // 変数・メソッド・スニペットのいずれかから選ぶ（ない場合はスニペットにフォールバック）
  const candidates: string[][] = [];
  if (pool.vars) candidates.push(pool.vars);
  if (pool.methods) candidates.push(pool.methods);
  candidates.push(pool.snippets);
  return pick(pick(candidates));
}
