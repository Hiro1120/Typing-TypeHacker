// プレイヤーの得点に応じてランクを返す

export function calcRank(score:number){
  if(score>=800) return "SSS 天才ハッカー";
  if(score>=600) return "SS 超上級";
  if(score>=450) return "S 達人";
  if(score>=320) return "A 上級";
  if(score>=200) return "B 中級";
  if(score>=120) return "C 駆け出し";
  return "D 初心者";
}
