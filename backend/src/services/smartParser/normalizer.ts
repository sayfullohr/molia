/**
 * Normalizes text, fixes typos, handles apostrophes and Uzbek diacritics
 */
export function normalizeText(rawText: string): string {
  if (!rawText) return '';

  return rawText
    .toLowerCase()
    .replace(/[‘'’`ʼ]/g, "'") // standardise apostrophes
    .replace(/o['‘`ʼ]/g, "o'")
    .replace(/g['‘`ʼ]/g, "g'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Levenshtein distance for fuzzy matching typos
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Checks if a word is close enough to target word (fuzzy matching)
 */
export function isFuzzyMatch(word: string, target: string, maxDistance = 2): boolean {
  if (word === target) return true;
  if (Math.abs(word.length - target.length) > maxDistance) return false;
  return levenshteinDistance(word, target) <= maxDistance;
}
