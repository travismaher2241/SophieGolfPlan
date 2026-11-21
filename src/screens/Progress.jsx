import { useData } from '../lib/store.jsx'
import { LEVELS, SCORE_LADDER, findSkill } from '../data/curriculum.js'
import { levelStatus } from '../lib/progress.js'
import { roundTotals, roundTrends, pct, num } from '../lib/stats.js'
import { LineChart, shortDate } from '../components/ui.jsx'
import { RoundSummary, ShotBreakdown } from './Round.jsx'

function Trend({ label, m, fmt, lowerIsBetter }) {
  let arrow = ''
  let tone = ''
  if (m.now != null && m.before != null && Math.abs(m.now - m.before) > 1e-9) {
    const better = lowerIsBetter ? m.now < m.before : m.now > m.before
    arrow = m.now > m.before ? '▲' : '▼'
    tone = better ? 'better' : 'worse'
  }
  return (
    <div className="trend">
      <b>{fmt(m.now)}</b>
      <span className="trend-label">{label}</span>
      {arrow && <span className={`trend-arrow ${tone}`}>{arrow} from {fmt(m.before)}</span>}
    </div>
  )
}

export default function Progress() {
  const { profile, entries } = useData()
  const rounds = entries.filter((e) => e.type === 'round' && e.status === 'done')
  const tr = roundTrends(rounds)
  const scorePts = [...rounds].reverse().map((r) => ({ r, t: roundTotals(r) })).filter((x) => x.t.holesPlayed >= 9)
    .map(({ r, t }) => ({ x: shortDate(r.date), y: Math.round(t.per9) }))
  const puttPts = [...rounds].reverse().map((r) => ({ r, t: roundTotals(r) })).filter((x) => x.t.puttsPerHole != null)
    .map(({ r, t }) => ({ x: shortDate(r.date), y: Math.round(t.puttsPerHole * 9) }))
  const best9 = scorePts.length ? Math.min(...scorePts.map((p) => p.y)) : null
  const nextRung = SCORE_LADDER.find((s) => best9 == null || s.nine < best9) || SCORE_LADDER[SCORE_LADDER.length - 1]

  // Skill tests grouped by key, for small trend charts.
  const byKey = {}
  for (const e of entries.filter((x) => x.type === 'skill' && (x.total != null || x.made != null))) (byKey[e.key] ||= []).push(e)

  const speeds = entries.filter((e) => e.type === 'swing').reverse()
  const quizzes = entries.filter((e) => e.type === 'quiz').reverse()

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = Date.now() - i * 7 * 864e5
    const start = end - 7 * 864e5
    const mins = entries.filter((e) => e.type === 'practice').filter((e) => {
      const t = new Date(e.date).getTime(); return t >= start && t < end
    }).reduce((a, e) => a + (e.minutes || 0), 0)
    return { x: i === 0 ? 'this wk' : `${i}w ago`, y: mins }
  }).reverse()

  return (
    <div className="stack">
      <h1 className="page-title">My Progress</h1>

      <section className="card">
        <h2>Pathway pins</h2>
        <div className="level-ladder">
          {LEVELS.map((l) => {
            const st = levelStatus(l.level, profile, entries)
            return (
              <div key={l.level} className={`ladder-row ${st.mastered ? 'mastered' : ''}`}>
                <span className="ladder-lv" style={{ background: l.color }}>L{l.level}</span>
                <span className="ladder-pins">{st.cps.map((c) => <span key={c.id} className={c.earned ? 'on' : ''}>{c.earned ? c.emoji : '○'}</span>)}</span>
                <span className="ladder-n">{st.mastered ? 'Mastered' : `${st.pins}/5`}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="card">
        <h2>More than the score</h2>
        <p className="muted small">{tr.count === 1 ? 'Your first round.' : `Last ${Math.min(5, tr.count)} rounds${tr.count > 5 ? ', with arrows compared to the 5 before' : ''}.`}</p>
        {tr.count === 0 ? <div className="empty">Play a round to see your numbers</div> : (
          <div className="trend-grid">
            <Trend label="putts per hole" m={tr.puttsPerHole} fmt={(v) => num(v, 2)} lowerIsBetter />
            <Trend label="fairways hit" m={tr.fairwayPct} fmt={pct} />
            <Trend label="greens in regulation" m={tr.girPct} fmt={pct} />
            <Trend label="saved par after missing" m={tr.scramblePct} fmt={pct} />
            <Trend label="3-putts per 9" m={tr.threePutts9} fmt={(v) => num(v)} lowerIsBetter />
            <Trend label="penalties per 9" m={tr.penalties9} fmt={(v) => num(v)} lowerIsBetter />
            <Trend label="used my routine" m={tr.routinePct} fmt={pct} />
            <Trend label="score per 9" m={tr.per9} fmt={(v) => num(v, 0)} lowerIsBetter />
          </div>
        )}
      </section>

      {rounds.some((r) => r.mode === 'shots') && (
        <section className="card">
          <h2>Ball striking (shot-by-shot rounds)</h2>
          <p className="muted small">Last 5 shot-by-shot rounds. "On target" means it finished on the fairway, fringe or green.</p>
          <ShotBreakdown rounds={rounds.filter((r) => r.mode === 'shots').slice(0, 5)} />
        </section>
      )}

      <section className="card">
        <h2>9-hole scores</h2>
        <p className="muted small">Next goal: <b>{nextRung.nine}</b> (Level {nextRung.level}: {nextRung.note}). Best so far: {best9 ?? '–'}.</p>
        <LineChart points={scorePts} target={nextRung.nine} lowerIsBetter />
      </section>

      <section className="card">
        <h2>Putts per 9 holes</h2>
        <LineChart points={puttPts} target={18} lowerIsBetter />
      </section>

      {Object.keys(byKey).length > 0 && (
        <section className="card">
          <h2>Skill tests</h2>
          {Object.entries(byKey).map(([key, list]) => {
            const f = findSkill(key)
            if (!f) return null
            const makes = f.skill.type === 'makes'
            const pts = [...list].reverse().map((e) => ({ x: shortDate(e.date), y: makes ? e.made : e.total }))
            return (
              <div key={key} className="mini-chart">
                <div className="mini-title">L{f.level.level} {f.section.title}: {f.skill.name}</div>
                <LineChart points={pts} target={makes ? f.skill.need : f.skill.max ?? f.skill.target} lowerIsBetter={!makes} height={110} />
              </div>
            )
          })}
        </section>
      )}

      <section className="card">
        <h2>Rules & etiquette quiz (out of 10)</h2>
        <LineChart points={quizzes.map((e) => ({ x: shortDate(e.date), y: e.score }))} target={10} />
      </section>

      <section className="card">
        <h2>Driver speed (mph)</h2>
        <LineChart points={speeds.map((e) => ({ x: shortDate(e.date), y: e.speed }))} />
      </section>

      <section className="card">
        <h2>Practice minutes per week</h2>
        <LineChart points={weeks} />
      </section>

      {rounds.length > 0 && (
        <section className="card">
          <h2>All rounds</h2>
          {rounds.map((r) => <div key={r.id} className="round-list-item"><RoundSummary round={r} /></div>)}
        </section>
      )}
    </div>
  )
}
