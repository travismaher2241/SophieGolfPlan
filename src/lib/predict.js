// Expected score at a venue, from past Girls 9–10 results and her own form.
import { TOUR_RESULTS } from '../data/tourResults.js'
import { roundTotals } from './stats.js'
import { tournaments } from './tour.js'

const STOP = /\b(golf|club|course|country|public|and|the|&|-)\b/g
export const venueKey = (name = '') => name.toLowerCase().replace(/\(.*?\)/g, '').replace(STOP, ' ').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim()
const sameVenue = (a, b) => {
  const x = venueKey(a); const y = venueKey(b)
  return Boolean(x && y) && (x === y || x.startsWith(y) || y.startsWith(x))
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null
}
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

// Past results plus any tournaments logged in the app that aren't in the PDF.
export function allResults(entries) {
  const mine = tournaments(entries)
    .filter((r) => r.event?.field?.length)
    .filter((r) => !TOUR_RESULTS.some((t) => t.date === r.date.slice(0, 10) && sameVenue(t.venue, r.course)))
    .map((r) => {
      const n = r.holesPlanned || r.holes?.length || 9
      return { venue: r.course, date: r.date.slice(0, 10), par: 36, scores: [roundTotals(r).score, ...r.event.field.map((p) => p.score)].map((s) => (s * 9) / n).sort((a, b) => a - b) }
    })
  return [...TOUR_RESULTS, ...mine].sort((a, b) => a.date.localeCompare(b.date))
}

export function venues(entries) {
  const names = new Map()
  for (const r of allResults(entries)) {
    const k = venueKey(r.venue)
    if (!names.has(k)) names.set(k, r.venue)
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b))
}

// How much harder (+) or easier (−) a venue plays than the average event, in strokes.
function venueOffsets(results) {
  const usable = results.filter((r) => r.scores.length >= 3)
  const G = median(usable.map((r) => median(r.scores)))
  const by = new Map()
  for (const r of usable) {
    const k = venueKey(r.venue)
    if (!by.has(k)) by.set(k, [])
    by.get(k).push(median(r.scores) - G)
  }
  const off = new Map()
  for (const [k, ds] of by) off.set(k, (mean(ds) * ds.length) / (ds.length + 1)) // shrink small samples
  return { off, G }
}

export function predict(entries, venue) {
  const results = allResults(entries)
  const past = results.filter((r) => sameVenue(r.venue, venue))
  const { off } = venueOffsets(results)
  const offOf = (v) => off.get(venueKey(v)) ?? [...off.entries()].find(([k]) => sameVenue(k, v))?.[1] ?? 0

  // Her form: her latest tournament, nudged a quarter of the way back toward her
  // recent average (big drops don't repeat every week). Each score is adjusted
  // for how hard that course plays.
  const adj = tournaments(entries).slice(-4).map((r) => roundTotals(r).per9 - offOf(r.course))
  const latest = adj[adj.length - 1]
  const base = adj.length ? latest + 0.25 * (mean(adj) - latest) : null
  const expected = base != null ? Math.round(base + offOf(venue)) : null

  const all = past.flatMap((r) => r.scores)
  const wins = past.map((r) => r.scores[0])
  const thirds = past.filter((r) => r.scores.length >= 3).map((r) => r.scores[2])
  return {
    venue,
    events: past.length,
    offset: offOf(venue),
    expected,
    range: expected != null ? [expected - 3, expected + 3] : null,
    fieldAvg: all.length ? Math.round(mean(all)) : null,
    winning: wins.length ? Math.round(median(wins)) : null,
    podium: thirds.length ? Math.round(median(thirds)) : null,
    record: all.length ? Math.min(...all) : null,
    past: [...past].reverse(),
  }
}
