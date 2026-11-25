import { useData } from '../lib/store.jsx'
import NextEvent from './NextEvent.jsx'
import { roundTotals, num } from '../lib/stats.js'
import { LineChart } from '../components/ui.jsx'
import { highlights } from '../lib/highlights.js'
import { finishOf, finishLabel, priorityStatus, tournaments, EVENTS_NEEDED, ORDER_OF_FINISH_MAX_9 } from '../lib/tour.js'

const short = (iso) => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
const shortCourse = (c = '') => c.replace(/\s+(Public\s+)?Golf\s*(&|and)?\s*(Country\s+)?(Club|Course)$/i, '').trim() || c

export function TourKpis({ list }) {
  const ts = list.map((r) => ({ r, t: roundTotals(r) }))
  const best = Math.min(...ts.map((x) => x.t.per9))
  const first = ts[0].t.per9
  const last = ts[ts.length - 1].t.per9
  const putts = ts.filter((x) => x.t.puttsPerHole != null)
  const avgPutts = putts.length ? (putts.reduce((a, x) => a + x.t.puttsPerHole, 0) / putts.length) * 9 : null
  return (
    <div className="stat-grid">
      <div><b>{Math.round(best)}</b><span>best (9 holes)</span></div>
      <div><b>{list.length > 1 ? (first - last > 0 ? `−${Math.round(first - last)}` : `+${Math.round(last - first)}`) : '–'}</b><span>first → latest</span></div>
      <div><b>{num(avgPutts)}</b><span>putts per 9</span></div>
      <div><b>{list.length}</b><span>events</span></div>
    </div>
  )
}

// One row per event: every girl's score as a dot, Sophie's in magenta.
export function FieldChart({ list }) {
  const rows = list.filter((r) => r.event?.field?.length).slice(-6)
  if (!rows.length) return <p className="muted small">Add the field’s scores to a tournament to see where she sits.</p>
  const all = rows.flatMap((r) => [roundTotals(r).per9, ...r.event.field.map((p) => (p.score * 9) / (r.holesPlanned || r.holes?.length || 9))])
  const lo = Math.floor(Math.min(...all) / 5) * 5
  const hi = Math.ceil(Math.max(...all) / 5) * 5
  const W = 320; const padL = 74; const padR = 10; const rowH = 30
  const H = rows.length * rowH + 22
  const x = (v) => padL + ((v - lo) * (W - padL - padR)) / (hi - lo || 1)
  const ticks = []
  for (let t = lo; t <= hi; t += (hi - lo) > 30 ? 10 : 5) ticks.push(t)
  return (
    <svg className="chart field-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Her score against the field">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={4} y2={H - 18} className="grid" />
          <text x={x(t)} y={H - 4} className="tick" textAnchor="middle">{t}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const cy = 4 + i * rowH + rowH / 2
        const n = r.holesPlanned || r.holes?.length || 9
        const mine = roundTotals(r).per9
        const f = finishOf(r)
        return (
          <g key={r.id}>
            <text x={0} y={cy - 2} className="tick field-label">{shortCourse(r.course).slice(0, 13)}</text>
            <text x={0} y={cy + 10} className="tick">{short(r.date)}{f ? ` · ${finishLabel(f).split(' ')[0]}` : ''}</text>
            <line x1={padL} x2={W - padR} y1={cy} y2={cy} className="field-track" />
            {r.event.field.map((p, j) => <circle key={j} cx={x((p.score * 9) / n)} cy={cy} r={4.5} className="field-dot" />)}
            <circle cx={x(mine)} cy={cy} r={6.5} className="field-me" />
          </g>
        )
      })}
    </svg>
  )
}

export function TourTrend({ list }) {
  const points = list.map((r) => ({ x: short(r.date), y: Math.round(roundTotals(r).per9) }))
  return <LineChart points={points} lowerIsBetter yLabel="Tournament scores" />
}

export function PriorityCard() {
  const { entries } = useData()
  const ps = priorityStatus(entries)
  if (!ps) return null
  const [a, b] = ps.bestTwo
  return (
    <section className="card">
      <h2>Priority Status · {ps.season.label}</h2>
      <p className="muted small">
        U.S. Kids rule: play {EVENTS_NEEDED} events in the same season on the same Local Tour; her two lowest scores are added together.
      </p>
      <div className="ps-dots">
        {Array.from({ length: EVENTS_NEEDED }, (_, i) => (
          <span key={i} className={`ps-dot ${i < ps.played ? 'on' : ''}`}>{i < ps.played ? '✓' : i + 1}</span>
        ))}
        <span className="ps-dots-label">{ps.played} of {EVENTS_NEEDED} events</span>
      </div>
      <div className="stat-grid three">
        <div><b>{a ? a.score : '–'}{b ? ` + ${b.score}` : ''}</b><span>two lowest</span></div>
        <div><b>{ps.total ?? '–'}</b><span>combined</span></div>
        <div><b>≤ {ORDER_OF_FINISH_MAX_9}</b><span>order-of-finish mark</span></div>
      </div>
      <h3>What she needs</h3>
      <ul className="ps-list">
        {ps.needed > 0 && (
          <li>
            {ps.needed === 1 ? 'One more event' : `${ps.needed} more events`} in {ps.season.label}
            {ps.isCurrent ? ` (the app counts ${ps.season.label.split(' ')[0]} as running to ${ps.season.ends.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })})` : ''}.
            {!ps.isCurrent && ' That season has finished, so this restarts with the next one.'}
          </li>
        )}
        {ps.needed === 0 && <li>She’s played enough events this season to earn status. 🎉</li>}
        {ps.underOrderOfFinish
          ? <li>Her two lowest add up to {ps.total}, inside the 90 order-of-finish mark.</li>
          : ps.needForOrderOfFinish != null && (
            <li>A {ps.needForOrderOfFinish} or better, paired with her {a.score}, gets her two lowest to 90 for the order-of-finish route.</li>
          )}
        <li>Status starts three months after the season’s age date and lasts one year.</li>
      </ul>
      <p className="muted small">The score-by-level table on the U.S. Kids site is an image I couldn’t read, so levels aren’t shown yet.</p>
    </section>
  )
}

export default function TourInsights() {
  const { entries } = useData()
  const list = tournaments(entries)
  if (!list.length) return null
  return (
    <>
      <section className="card">
        <h2>Her tournament journey</h2>
        <TourKpis list={list} />
        <h3>Scores (per 9 holes)</h3>
        <TourTrend list={list} />
      </section>
      <section className="card">
        <h2>What she’s doing well</h2>
        <ul className="wins">
          {highlights(list).map((h, i) => <li key={i}><span>{h.icon}</span>{h.text}</li>)}
        </ul>
      </section>
      <NextEvent />
      <PriorityCard />
    </>
  )
}
