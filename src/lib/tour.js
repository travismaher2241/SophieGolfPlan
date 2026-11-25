// Tournament results (U.S. Kids Golf Local Tour) and Sophie's age division.
import { roundTotals } from './stats.js'

export const isTournament = (e) => e.type === 'round' && e.kind === 'event' && e.status === 'done'

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
