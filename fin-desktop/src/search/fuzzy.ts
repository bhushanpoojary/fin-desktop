/**
 * Fuzzy subsequence matcher.
 *
 * Scores how well a query matches a candidate string (query characters must appear in order,
 * case-insensitive) and returns the matched character positions for highlighting. Bonuses for
 * consecutive matches and matches at word boundaries. Pure and deterministic.
 */

export interface FuzzyMatch {
  matched: boolean;
  score: number;
  positions: number[];
}

const SEPARATOR = /[\s\-_/.]/;

export function fuzzyMatch(query: string, text: string): FuzzyMatch {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  if (q.length === 0) return { matched: true, score: 0, positions: [] };
  if (q.length > t.length) return { matched: false, score: 0, positions: [] };

  // A contiguous substring is the strongest signal (extra credit at a word boundary).
  const idx = t.indexOf(q);
  if (idx >= 0) {
    let score = 15 + Math.max(0, 10 - (t.length - q.length));
    if (idx === 0 || SEPARATOR.test(t[idx - 1])) score += 15;
    const positions: number[] = [];
    for (let i = 0; i < q.length; i += 1) positions.push(idx + i);
    return { matched: true, score, positions };
  }

  // Otherwise fall back to subsequence scoring.
  const positions: number[] = [];
  let qi = 0;
  let score = 0;
  let prevMatch = -2;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      positions.push(ti);
      let bonus = 1;
      if (ti === prevMatch + 1) bonus += 3; // consecutive characters
      if (ti === 0 || SEPARATOR.test(t[ti - 1])) bonus += 4; // start of a word
      score += bonus;
      prevMatch = ti;
      qi += 1;
    }
  }

  if (qi < q.length) return { matched: false, score: 0, positions: [] };

  // Prefer denser matches (less filler) and shorter candidates.
  score += Math.max(0, 10 - (t.length - q.length));
  return { matched: true, score, positions };
}
