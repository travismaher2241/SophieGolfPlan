// Another player's tournament journey, typed in by a grown-up and kept in the
// family's own profile (never in the code), compared round by round with Sophie's.
import { roundTotals } from './stats.js'
import { tournaments } from './tour.js'

const SEASON = /\b(summer|fall|autumn|winter|spring)\s+(\d{4})\b/i

// One round per line: "Dorset Golf, Winter 2025, 69" or just "69". The last number is the score.
export function parseRounds(text = '') {
  return text.split('\n').map((line) => {
    const nums = line.match(/\d+(?:\.\d+)?/g)
    if (!nums) return null
    const season = line.match(SEASON)
    let rest = line.replace(SEASON, ' ')
    const scoreStr = rest.match(/\d+(?:\.\d+)?(?=[^\d]*$)/)?.[0]
    const score = Number(scoreStr ?? nums[nums.length - 1])
    if (!(score >= 20 && score <= 150)) return null
    rest = rest.replace(/\d+(?:\.\d+)?(?=[^\d]*$)/, ' ').replace(/^\s*\d+\s*[.)]\s+/, '').replace(/[,;:·\-–\s]+$/g, '').replace(/^[,;:·\-–\s]+/, '').replace(/\s+/g, ' ').trim()
    return { course: rest, season: season ? `${season[1][0].toUpperCase()}${season[1].slice(1).toLowerCase()} ${season[2]}` : '', score }
  }).filter(Boolean)
}

export const roundsText = (rounds = []) => rounds.map((r) => [r.course, r.season, r.score].filter(Boolean).join(', ')).join('\n')

export function sophieRounds(entries) {
  return tournaments(entries).map((r) => ({ course: r.course, date: r.date, score: Math.round(roundTotals(r).per9) }))
}

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

export function compareJourneys(mine, theirs) {
  const n = Math.min(mine.length, theirs.length)
  if (!n) return null
  const a = mine.slice(0, n).map((r) => r.score)
  const b = theirs.slice(0, n).map((r) => r.score)
  const myBest = Math.min(...mine.map((r) => r.score))
  const reached = theirs.findIndex((r) => r.score <= myBest)
  return {
    n,
    avg: [avg(a), avg(b)],
    best: [Math.min(...a), Math.min(...b)],
    drop: [a[0] - a[n - 1], b[0] - b[n - 1]],
    myBest,
    // Which of their rounds first matched Sophie's best (1-based), or null if never.
    reachedAt: reached >= 0 ? reached + 1 : null,
    theirBest: Math.min(...theirs.map((r) => r.score)),
  }
}
