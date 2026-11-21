// Shot-by-shot helpers: what each tap means and how it adds up.

export const CLUBS = ['Driver', '3 Wood', 'Hybrid', '5i', '6i', '7i', '8i', '9i', 'PW', 'SW', 'Putter']

export const STRIKES = [
  { value: 'good', label: '✅ Good strike' },
  { value: 'thin', label: 'Thin' },
  { value: 'fat', label: 'Fat' },
  { value: 'topped', label: 'Topped' },
  { value: 'shank', label: 'Shank' },
]

export const RESULTS = [
  { value: 'fairway', label: '🎯 Fairway', short: 'fairway' },
  { value: 'green', label: '🟢 Green', short: 'green' },
  { value: 'fringe', label: '🟡 Fringe', short: 'fringe' },
  { value: 'roughL', label: '⬅️ Rough left', short: 'rough left' },
  { value: 'roughR', label: 'Rough right ➡️', short: 'rough right' },
  { value: 'bunker', label: '🏖️ Bunker', short: 'bunker' },
  { value: 'trees', label: '🌳 Trees', short: 'trees' },
  { value: 'water', label: '💧 Water +1', short: 'water', penalty: 1 },
  { value: 'ob', label: '🚫 OB / lost +1', short: 'out of bounds', penalty: 1 },
  { value: 'holed', label: '⛳ In the hole!', short: 'in the hole' },
]

export const PUTTS = [
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
  { value: 'left', label: '⬅️ Left' },
  { value: 'right', label: 'Right ➡️' },
]

const RESULT = Object.fromEntries(RESULTS.map((r) => [r.value, r]))
export const resultLabel = (v) => RESULT[v]?.short || v

const penaltyOf = (s) => (s.kind === 'full' ? RESULT[s.result]?.penalty || 0 : 0)

// Where the ball is now, before the next shot.
export function lieOf(shots) {
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i]
    if (s.kind === 'putt') return s.result === 'holed' ? 'holed' : 'green'
    if (s.result === 'ob') continue // replay from the previous spot
    if (s.result === 'water') return 'drop'
    return s.result
  }
  return 'tee'
}

export function deriveHole(h) {
  const shots = h.shots || []
  const holed = shots.length > 0 && shots[shots.length - 1].result === 'holed'
  const penalties = shots.reduce((a, s) => a + penaltyOf(s), 0)
  const putts = shots.filter((s) => s.kind === 'putt').length
  const tee = shots.find((s) => s.kind === 'full')
  let teeCode = null
  if (h.par >= 4 && tee) {
    teeCode = { fairway: 'F', green: 'F', fringe: 'F', roughL: 'L', roughR: 'R' }[tee.result] || 'X'
  }
  return {
    score: holed ? shots.length + penalties : null,
    putts: holed ? putts : putts || null,
    tee: teeCode,
    penalties,
    sand: shots.some((s) => s.result === 'bunker'),
  }
}

// Stats only shot-by-shot rounds can give.
export function shotStats(rounds) {
  const full = []; const putts = []
  for (const r of rounds) for (const h of r.holes || []) for (const s of h.shots || []) (s.kind === 'putt' ? putts : full).push(s)
  const strikes = full.filter((s) => s.strike)
  const good = strikes.filter((s) => s.strike === 'good').length
  const misses = {}
  for (const s of strikes) if (s.strike !== 'good') misses[s.strike] = (misses[s.strike] || 0) + 1
  const clubs = {}
  for (const s of full) {
    if (!s.club) continue
    const c = (clubs[s.club] ||= { club: s.club, shots: 0, good: 0, onTarget: 0 })
    c.shots++
    if (s.strike === 'good') c.good++
    if (['fairway', 'green', 'fringe', 'holed'].includes(s.result)) c.onTarget++
  }
  const missedPutts = putts.filter((p) => p.result !== 'holed')
  const puttMiss = {}
  for (const p of missedPutts) puttMiss[p.result] = (puttMiss[p.result] || 0) + 1
  return {
    fullShots: full.length,
    goodPct: strikes.length ? good / strikes.length : null,
    misses,
    clubs: Object.values(clubs).sort((a, b) => CLUBS.indexOf(a.club) - CLUBS.indexOf(b.club)),
    puttMiss,
    penalties: full.filter((s) => RESULT[s.result]?.penalty).length,
  }
}
