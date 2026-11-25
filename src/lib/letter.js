// Facts for Sophie's note, and a ready-made note for when Gemini isn't available.
import { roundTotals, holeFacts } from './stats.js'
import { divisionFor, finishOf, tournaments } from './tour.js'

const day = (iso) => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })
const ord = (n) => {
  const t = n % 100
  if (t >= 11 && t <= 13) return `${n}th`
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'}`
}

export function letterFacts(entries, profile) {
  const list = tournaments(entries)
  if (!list.length) return null
  const rows = list.map((r) => ({ r, t: roundTotals(r), f: finishOf(r) }))
  const latest = rows[rows.length - 1]
  const first = rows[0]
  const lines = []
  lines.push(`Tournament rounds so far (9 holes, par 36 unless noted): ${rows.map(({ r, t, f }) => `${day(r.date)} at ${r.course}: ${t.score} (${t.toPar > 0 ? '+' : ''}${t.toPar})`).join('; ')}.`)
  if (rows.length > 1) lines.push(`From her first tournament to her latest she improved by ${Math.round(first.t.per9 - latest.t.per9)} shots.`)
  const prev = rows[rows.length - 2]
  if (prev && prev.t.per9 > latest.t.per9) lines.push(`Her latest round was ${Math.round(prev.t.per9 - latest.t.per9)} shots better than the one before.`)

  const L = latest.r
  const field = L.event?.field?.map((p) => p.score) || []
  if (field.length && latest.f) {
    const better = [...new Set(field.filter((s) => s < latest.t.score))].sort((a, b) => b - a)
    if (latest.f.pos === 1) lines.push('She won her latest event.')
  }
  const facts = (L.holes || []).map(holeFacts).filter(Boolean)
  if (facts.length) {
    if (latest.t.putts != null) lines.push(`She took ${latest.t.putts} putts in ${facts.length} holes, with ${latest.t.onePutts} one-putt${latest.t.onePutts === 1 ? '' : 's'}.`)
    const gir = facts.map((f, i) => (f.gir ? i + 1 : null)).filter(Boolean)
    if (gir.length) lines.push(`She hit the green in regulation on hole${gir.length > 1 ? 's' : ''} ${gir.join(', ')}.`)
    const pars = facts.map((f, i) => (f.toPar <= 0 ? i + 1 : null)).filter(Boolean)
    if (pars.length) lines.push(`She made par or better on hole${pars.length > 1 ? 's' : ''} ${pars.join(', ')}.`)
    const afterFirst = facts.slice(1)
    if (afterFirst.length && afterFirst.every((f) => f.toPar <= 1)) lines.push(`After the first hole she didn't score worse than a bogey on any hole.`)
  }
  if (L.event?.notes) lines.push(`Notes from the parent about that round: ${L.event.notes}`)

  const d = divisionFor(profile.dob)
  if (d) lines.push(`She is ${d.age}, in the ${d.division} division, with about ${d.monthsLeft} months left before she moves up.`)
  return { text: lines.join('\n'), latest, first, rows, division: d }
}

// Used when Gemini isn't switched on or is busy.
export function templateLetter(facts) {
  const { latest, first, rows, division } = facts
  const sections = []
  if (rows.length > 1) {
    sections.push({
      heading: 'Look how fast you’re improving',
      points: [
        `Your tournament scores so far: ${rows.map(({ t }) => t.score).join(', ')}.`,
        `That’s ${Math.round(first.t.per9 - latest.t.per9)} shots better since your very first tournament!`,
      ],
    })
  }
  const pts = []
  if (latest.t.putts != null) pts.push(`Only ${latest.t.putts} putts, with ${latest.t.onePutts} one-putt${latest.t.onePutts === 1 ? '' : 's'}. Great touch on the greens!`)
  if (latest.f && latest.f.pos === 1) pts.push('You won!')
  pts.push('You kept smiling and kept going, all the way to the last hole.')
  sections.push({ heading: `Your round at ${latest.r.course.replace(/\s+(Public\s+)?Golf.*$/i, '')}`, points: pts })
  if (division) {
    sections.push({
      heading: 'Time is on your side',
      points: [`You’re ${division.age}, and you’re only just getting started.`, `You still have about ${division.monthsLeft} months in ${division.division}, so there is so much more to come.`],
    })
  }
  sections.push({
    heading: 'Trust your swing',
    points: ['Your swing has lovely speed. Trust it!', 'Pick a clear target, swing with your speed and hold your finish.'],
  })
  return {
    title: 'Look How Far You’ve Come!',
    intro: 'We are so proud of you, Sophie. Here’s a look at everything you’ve done in your tournaments so far.',
    sections,
    closing: 'Keep swinging with speed, keep having fun, and keep being you. We can’t wait to watch your next round!',
  }
}
