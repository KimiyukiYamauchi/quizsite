// lib/shuffle.ts
// 問題のシャッフル（並べ替えはサーバーで行う）
//
// URL の ?shuffle=<シード> から並び順を決める。同じシードなら必ず同じ並びになるので、
// ページ送りをしても並びが崩れない

// シードとして受け付ける文字列（英小文字・数字 1〜16 文字）
const SEED_PATTERN = /^[a-z0-9]{1,16}$/;

// URL の ?shuffle= をシードにする。形式が違えばシャッフルしない
export function parseShuffleSeed(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && SEED_PATTERN.test(raw) ? raw : undefined;
}

// 新しいシードを作る（例: "k3x9qa"）
export function newShuffleSeed(): string {
  return Math.random().toString(36).slice(2, 8) || "1";
}

// 文字列から 32 ビットの整数を作る（cyrb53 を簡略化したもの）
function hashString(str: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return (h1 ^ h2 ^ (h2 >>> 16)) >>> 0;
}

// シードから 0 以上 1 未満の乱数を順に返す関数を作る（mulberry32）
function seededRandom(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// シードで決まる順番に並べ替えた新しい配列を返す（元の配列は変えない。Fisher–Yates）
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = [...items];
  const random = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
