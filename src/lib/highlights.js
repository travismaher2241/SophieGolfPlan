// Positive things to show Sophie from her U.S. Kids rounds. Only her own numbers.
import { roundTotals, holeFacts } from './stats.js'

const shortCourse = (c = '') => c.replace(/\s+(Public\s+)?Golf.*$/i, '').trim() || c
const list = (ns) => (ns.length > 1 ? `${ns.slice(0, -1).join(', ')} and ${ns[ns.length - 1]}` : `${ns[0]}`)

export function highlights(rounds) {
  if (!rounds.length) return []
  const rows = rounds.map((r) => ({ r, t: roundTotals(r) }))
  const first = rows[0]
  const latest = rows[rows.length - 1]
  const best = rows.reduce((a, b) => (b.t.per9 < a.t.per9 ? b : a))
  const out = []
  const gain = Math.round(first.t.per9 - latest.t.per9)
  if (rows.length > 1 && gain > 0) out.push({ icon: '🚀', text: `${gain} shots better than her very first tournament` })
  const prev = rows[rows.length - 2]
  const last3 = rows.slice(-3)
  if (last3.length === 3 && last3.every((x, i) => !i || x.t.per9 < last3[i - 1].t.per9)) out.push({ icon: '📈', text: 'Each of her last three rounds got better' })
  else if (prev && prev.t.per9 > latest.t.per9) out.push({ icon: '📈', text: `Her last round was ${Math.round(prev.t.per9 - latest.t.per9)} shots better than the one before` })
  out.push({ icon: '⭐', text: `Best score so far: ${Math.round(best.t.per9)} at ${shortCourse(best.r.course)}` })
  const facts = (latest.r.holes || []).map(holeFacts).filter(Boolean)
  if (facts.length) {
    if (latest.t.putts != null && latest.t.putts <= facts.length * 2) out.push({ icon: '🎯', text: `Only ${latest.t.putts} putts in ${facts.length} holes at ${shortCourse(latest.r.course)}${latest.t.onePutts ? `, with ${latest.t.onePutts} one-putt${latest.t.onePutts === 1 ? '' : 's'}` : ''}` })
    const pars = facts.map((f, i) => (f.toPar <= 0 ? i + 1 : null)).filter(Boolean)
    if (pars.length) out.push({ icon: '🏌️‍♀️', text: `Par or better on hole${pars.length > 1 ? 's' : ''} ${list(pars)}` })
    const gir = facts.map((f, i) => (f.gir ? i + 1 : null)).filter(Boolean)
    if (gir.length) out.push({ icon: '🟢', text: `Green in regulation on hole${gir.length > 1 ? 's' : ''} ${list(gir)}` })
    if (facts.length > 2 && facts.slice(1).every((f) => f.toPar <= 1)) out.push({ icon: '💪', text: 'After the first hole, nothing worse than a bogey' })
  }
  out.push({ icon: '🏆', text: `${rows.length} U.S. Kids tournament${rows.length === 1 ? '' : 's'} played` })
  return out
}
