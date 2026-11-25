// Numbers that show improvement beyond the score.

export function holeFacts(h) {
  if (!h || h.score == null) return null
  const putts = h.putts ?? null
  const gir = putts != null ? h.score - putts <= h.par - 2 : null
  return {
    score: h.score,
    toPar: h.score - h.par,
    putts,
    gir,
    scramble: gir === false ? h.score <= h.par : null,
    threePutt: putts != null ? putts >= 3 : null,
    onePutt: putts != null ? putts <= 1 : null,
    fairway: h.par >= 4 && h.tee ? h.tee === 'F' : null,
    penalties: h.penalties || 0,
    sand: h.sand ?? null,
    routine: h.routine ?? null,
  }
}

export function roundTotals(round) {
  const facts = (round.holes || []).map(holeFacts).filter(Boolean)
  const sum = (f) => facts.reduce((a, x) => a + (f(x) || 0), 0)
  const rate = (f) => {
    const vals = facts.map(f).filter((v) => v !== null && v !== undefined)
    return vals.length ? vals.filter(Boolean).length / vals.length : null
  }
  const puttHoles = facts.filter((f) => f.putts != null)
  // A tournament entered as a total only (no hole-by-hole scores).
  if (!facts.length && round.totalScore) {
    const n = round.holesPlanned || 9
    return {
      holesPlayed: n, score: round.totalScore, toPar: round.totalScore - (round.totalPar || (n === 18 ? 72 : 36)),
      putts: null, puttsPerHole: null, girPct: null, fairwayPct: null, scramblePct: null,
      threePutts: 0, onePutts: 0, penalties: 0, routinePct: null, per9: (round.totalScore * 9) / n,
    }
  }
  return {
    holesPlayed: facts.length,
    score: sum((f) => f.score),
    toPar: sum((f) => f.toPar),
    putts: puttHoles.length ? sum((f) => f.putts) : null,
    puttsPerHole: puttHoles.length ? sum((f) => f.putts) / puttHoles.length : null,
    girPct: rate((f) => f.gir),
    fairwayPct: rate((f) => f.fairway),
    scramblePct: rate((f) => f.scramble),
    threePutts: facts.filter((f) => f.threePutt).length,
    onePutts: facts.filter((f) => f.onePutt).length,
    penalties: sum((f) => f.penalties),
    routinePct: rate((f) => f.routine),
    // Score scaled to 9 holes so 9- and 18-hole rounds can share a chart.
    per9: facts.length ? (sum((f) => f.score) * 9) / facts.length : null,
  }
}

const avg = (xs) => {
  const v = xs.filter((x) => x !== null && x !== undefined && !Number.isNaN(x))
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}

// Compare her last few rounds with the few before them.
export function roundTrends(rounds, n = 5) {
  const done = rounds.filter((r) => r.status === 'done').sort((a, b) => b.date.localeCompare(a.date))
  const recent = done.slice(0, n).map(roundTotals)
  const before = done.slice(n, n * 2).map(roundTotals)
  const metric = (f) => ({ now: avg(recent.map(f)), before: avg(before.map(f)) })
  return {
    count: done.length,
    per9: metric((t) => t.per9),
    puttsPerHole: metric((t) => t.puttsPerHole),
    girPct: metric((t) => t.girPct),
    fairwayPct: metric((t) => t.fairwayPct),
    scramblePct: metric((t) => t.scramblePct),
    threePutts9: metric((t) => (t.holesPlayed ? (t.threePutts * 9) / t.holesPlayed : null)),
    penalties9: metric((t) => (t.holesPlayed ? (t.penalties * 9) / t.holesPlayed : null)),
    routinePct: metric((t) => t.routinePct),
  }
}

export const pct = (v) => (v == null ? '–' : `${Math.round(v * 100)}%`)
export const num = (v, d = 1) => (v == null ? '–' : Number(v).toFixed(d).replace(/\.0$/, ''))
