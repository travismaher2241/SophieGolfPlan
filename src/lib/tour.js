// Tournament results (U.S. Kids Golf Local Tour) and Sophie's age division.
import { roundTotals } from './stats.js'

const isEventRound = (e) => e.type === 'round' && e.kind === 'event' && e.status === 'done'
// Only U.S. Kids Golf tour rounds count. Other competitions marked Tournament in the app stay out.
export const isTournament = (e) => isEventRound(e) && Boolean(e.event?.tour)
export const otherEvents = (entries) => entries.filter((e) => isEventRound(e) && !e.event?.tour)

export const tournaments = (entries) =>
  entries.filter(isTournament).sort((a, b) => a.date.localeCompare(b.date))

// Where she finished, worked out from the other players' scores.
export function finishOf(round) {
  const field = (round.event?.field || []).filter((p) => Number.isFinite(p.score))
  const mine = roundTotals(round).score
  if (!field.length || !mine) return null
  const better = field.filter((p) => p.score < mine).length
  const tied = field.some((p) => p.score === mine)
  return { pos: better + 1, tied, of: field.length + 1, behind: better ? mine - Math.min(...field.map((p) => p.score)) : 0 }
}

export const finishLabel = (f) => (f ? `${f.tied ? 'T' : ''}${f.pos} of ${f.of}` : '')

// One player per line: "Ashleigh Lim 38", "Chloe, 41" or just "45".
export function parseField(text) {
  return text.split('\n').map((line) => {
    const m = line.trim().match(/^(.*?)[\s,:–-]*(\d{2,3})\s*$/)
    if (!m) return null
    return { name: m[1].trim(), score: Number(m[2]) }
  }).filter(Boolean)
}

export const fieldText = (field = []) => field.map((p) => (p.name ? `${p.name} ${p.score}` : String(p.score))).join('\n')

// ---- Age and division -------------------------------------------------------
// U.S. Kids Golf: "Each Local Tour Season has a uniform Tournament Age Date.
// Whatever your player's age is on that date is what age group they will compete
// in for the duration of that season." The tour doesn't publish the date, so we
// use her age today and say when she moves up.
const DIVISIONS = [
  { max: 8, name: 'Girls 8 & Under', next: 9 },
  { max: 10, name: 'Girls 9–10', next: 11 },
  { max: 12, name: 'Girls 11–12', next: 13 },
  { max: 14, name: 'Girls 13–14', next: 15 },
  { max: 99, name: 'Girls 15–18', next: null },
]

export function ageOn(dob, d = new Date()) {
  const b = new Date(`${dob}T00:00:00`)
  let age = d.getFullYear() - b.getFullYear()
  if (d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())) age--
  return age
}

export function divisionFor(dob, today = new Date()) {
  if (!dob) return null
  const age = ageOn(dob, today)
  const div = DIVISIONS.find((x) => age <= x.max)
  const b = new Date(`${dob}T00:00:00`)
  const moveUp = div.next ? new Date(b.getFullYear() + div.next, b.getMonth(), b.getDate()) : null
  const monthsLeft = moveUp
    ? Math.max(0, (moveUp.getFullYear() - today.getFullYear()) * 12 + moveUp.getMonth() - today.getMonth())
    : null
  return { age, division: div.name, moveUp, monthsLeft, nextAge: div.next }
}

// ---- Her first three Local Tour rounds (Spring 2026) -------------------------
// From the Gemini tracker Trav built. Field scores are the other girls' totals.
const KEILOR_HOLES = [
  [4, 201, 7, 2], [3, 101, 4, 2], [5, 293, 6, 1], [4, 187, 4, 1], [4, 197, 5, 3],
  [3, 96, 4, 2], [5, 302, 6, 2], [4, 169, 5, 2], [4, 169, 5, 2],
]

const base = {
  type: 'round', kind: 'event', status: 'done', mode: 'quick', source: 'tour', tees: 'other', firstHole: 1, holesPlanned: 9,
}

export const SPRING_2026 = [
  {
    ...base,
    course: 'Settlers Run Golf & Country Club',
    date: '2026-11-08T12:00:00.000Z',
    holes: [], totalScore: 63, totalPar: 36, lengthM: 1740,
    event: { tour: 'Melbourne Local Tour', field: [44, 49, 49, 49, 50, 51, 51, 58, 73].map((score) => ({ name: '', score })), notes: 'Tour debut on a tough, hazard-heavy layout.' },
  },
  {
    ...base,
    course: 'Glen Waverley Golf Course',
    date: '2026-11-15T12:00:00.000Z',
    holes: [], totalScore: 59, totalPar: 36, lengthM: 1690,
    event: { tour: 'Melbourne Local Tour', field: [38, 39, 40, 40, 44, 44, 44, 45].map((score) => ({ name: '', score })), notes: '4 shots better than her debut.' },
  },
  {
    ...base,
    course: 'Keilor Public Golf Course',
    date: '2026-11-22T12:00:00.000Z',
    holes: KEILOR_HOLES.map(([par, metres, score, putts]) => ({ par, metres, score, putts, tee: null, penalties: 0, sand: null, routine: null, shots: [] })),
    lengthM: 1715,
    event: { tour: 'Melbourne Local Tour', field: [38, 41, 41, 45, 45, 45, 46, 56].map((score) => ({ name: '', score })), notes: 'Soft fairways, slow and bumpy greens. 17 putts and a green in regulation on the par-4 5th.' },
  },
]

// ---- Seasons and Priority Status ---------------------------------------------
// Melbourne Local Tour seasons follow Australian seasons. Summer spans the new
// year, so it's named by both years.
export function seasonOf(iso) {
  const d = new Date(iso)
  const m = d.getMonth(); const y = d.getFullYear()
  if (m === 11) return { key: `${y}-summer`, label: `Summer ${y}–${String(y + 1).slice(2)}`, ends: new Date(y + 1, 2, 0) }
  if (m <= 1) return { key: `${y - 1}-summer`, label: `Summer ${y - 1}–${String(y).slice(2)}`, ends: new Date(y, 2, 0) }
  if (m <= 4) return { key: `${y}-autumn`, label: `Autumn ${y}`, ends: new Date(y, 5, 0) }
  if (m <= 7) return { key: `${y}-winter`, label: `Winter ${y}`, ends: new Date(y, 8, 0) }
  return { key: `${y}-spring`, label: `Spring ${y}`, ends: new Date(y, 11, 0) }
}

// U.S. Kids Golf: "Participants must play four (4) Local Tour events within a
// season on the same Local Tour to earn Priority Status", using "the two (2)
// lowest scores totaled". By order of finish, the two lowest combined "must be
// 180/90 or lower" (18/9 holes).
export const EVENTS_NEEDED = 4
export const ORDER_OF_FINISH_MAX_9 = 90

export function priorityStatus(entries, today = new Date()) {
  const list = tournaments(entries)
  if (!list.length) return null
  const bySeason = new Map()
  for (const r of list) {
    const s = seasonOf(r.date)
    if (!bySeason.has(s.key)) bySeason.set(s.key, { ...s, rounds: [] })
    bySeason.get(s.key).rounds.push(r)
  }
  const current = bySeason.get(seasonOf(today.toISOString()).key)
  const season = current || [...bySeason.values()].pop()
  const scores = season.rounds.map((r) => ({ round: r, score: Math.round(roundTotals(r).per9) })).sort((a, b) => a.score - b.score)
  const bestTwo = scores.slice(0, 2)
  const total = bestTwo.length === 2 ? bestTwo[0].score + bestTwo[1].score : null
  const best = bestTwo[0]?.score ?? null
  return {
    season,
    isCurrent: Boolean(current),
    played: season.rounds.length,
    needed: Math.max(0, EVENTS_NEEDED - season.rounds.length),
    bestTwo,
    total,
    // Score she'd need next time (with her best) to reach the order-of-finish mark.
    needForOrderOfFinish: best != null ? ORDER_OF_FINISH_MAX_9 - best : null,
    underOrderOfFinish: total != null && total <= ORDER_OF_FINISH_MAX_9,
    seasons: [...bySeason.values()].map((s) => ({ label: s.label, played: s.rounds.length })),
  }
}
