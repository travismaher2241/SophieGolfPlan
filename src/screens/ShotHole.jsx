import { useState } from 'react'
import { CLUBS, PUTTS, RESULTS, STRIKES, deriveHole, lieOf, resultLabel } from '../lib/shots.js'

const LIE_TEXT = {
  tee: 'from the tee', fairway: 'from the fairway', fringe: 'from the fringe', roughL: 'from the rough',
  roughR: 'from the rough', bunker: 'from the bunker', trees: 'from the trees', drop: 'after the drop', green: 'on the green',
}
const scoreName = (score, par) => ({ '-3': 'Albatross', '-2': 'Eagle', '-1': 'Birdie', 0: 'Par', 1: 'Bogey', 2: 'Double bogey' }[score - par] || `${score - par > 0 ? '+' : ''}${score - par}`)

export default function ShotHole({ hole, number, onChange, onNext, isLast }) {
  const [draft, setDraft] = useState({})
  const shots = hole.shots || []
  const lie = lieOf(shots)
  const d = deriveHole(hole)
  const strokesSoFar = shots.length + d.penalties

  const commit = (shot) => {
    const next = [...shots, shot]
    onChange({ shots: next, ...deriveHole({ ...hole, shots: next }) })
    setDraft({})
  }
  const undo = () => {
    if (draft.club) { setDraft({}); return }
    const next = shots.slice(0, -1)
    onChange({ shots: next, ...deriveHole({ ...hole, shots: next }) })
  }

  const header = (
    <div className="shot-head">
      <div>
        <h1>Hole {number}</h1>
        <div className="muted small">Par {hole.par}{hole.metres ? ` · ${hole.metres} m` : ''}</div>
      </div>
      <div className="shot-count"><b>{strokesSoFar}</b><span>strokes</span></div>
    </div>
  )

  const log = shots.length > 0 && (
    <ol className="shot-log">
      {shots.map((s, i) => (
        <li key={i}>
          {s.kind === 'putt'
            ? <>🏌️‍♀️ Putt: {s.result === 'holed' ? 'in! ⛳' : `missed ${s.result}`}</>
            : <>{s.club} · {s.strike === 'good' ? 'good' : s.strike} → {resultLabel(s.result)}{s.result === 'water' || s.result === 'ob' ? ' (+1)' : ''}</>}
        </li>
      ))}
    </ol>
  )

  if (lie === 'holed') {
    return (
      <section className="card hole">
        {header}
        <div className="holed">
          <div className="holed-score">{d.score}</div>
          <div className="holed-name">{scoreName(d.score, hole.par)}</div>
          <div className="muted">{d.putts} putt{d.putts === 1 ? '' : 's'}{d.penalties ? ` · ${d.penalties} penalty` : ''}</div>
        </div>
        <h2>Plan · Setup · Play on every shot?</h2>
        <div className="seg">
          <button type="button" className={`seg-btn ${hole.routine === true ? 'on tone-good' : ''}`} onClick={() => onChange({ routine: true })}>👍 Yes</button>
          <button type="button" className={`seg-btn ${hole.routine === false ? 'on' : ''}`} onClick={() => onChange({ routine: false })}>👎 Not every shot</button>
        </div>
        {log}
        <button type="button" className="btn btn-primary btn-xl" onClick={onNext}>{isLast ? 'Finish round ✓' : `Hole ${number + 1} ›`}</button>
        <button type="button" className="btn btn-ghost" onClick={undo}>↩︎ Undo last shot</button>
      </section>
    )
  }

  if (lie === 'green') {
    const n = shots.filter((s) => s.kind === 'putt').length + 1
    return (
      <section className="card hole">
        {header}
        <div className="shot-title">Putt {n}</div>
        <button type="button" className="btn btn-primary btn-xl holed-btn" onClick={() => commit({ kind: 'putt', result: 'holed' })}>⛳ In the hole!</button>
        <h2>Missed? Where did it finish?</h2>
        <div className="result-grid two">
          {PUTTS.map((p) => (
            <button type="button" key={p.value} className="res-btn" onClick={() => commit({ kind: 'putt', result: p.value })}>{p.label}</button>
          ))}
        </div>
        {log}
        {shots.length > 0 && <button type="button" className="btn btn-ghost" onClick={undo}>↩︎ Undo last shot</button>}
      </section>
    )
  }

  const shotNo = shots.length + 1
  return (
    <section className="card hole">
      {header}
      <div className="shot-title">Shot {shotNo} <span>{LIE_TEXT[lie] || ''}</span></div>

      {!draft.club && (
        <>
          <h2>Which club?</h2>
          <div className="club-grid">
            {CLUBS.map((c) => (
              <button type="button" key={c} className="club-btn" onClick={() => setDraft({ club: c })}>{c}</button>
            ))}
          </div>
        </>
      )}

      {draft.club && !draft.strike && (
        <>
          <div className="chosen">🏌️‍♀️ {draft.club}</div>
          <h2>How was the strike?</h2>
          <button type="button" className="btn btn-primary btn-xl good-btn" onClick={() => setDraft({ ...draft, strike: 'good' })}>✅ Good strike</button>
          <div className="result-grid four">
            {STRIKES.slice(1).map((s) => (
              <button type="button" key={s.value} className="res-btn" onClick={() => setDraft({ ...draft, strike: s.value })}>{s.label}</button>
            ))}
          </div>
        </>
      )}

      {draft.club && draft.strike && (
        <>
          <div className="chosen">🏌️‍♀️ {draft.club} · {draft.strike === 'good' ? '✅ good' : draft.strike}</div>
          <h2>Where did it finish?</h2>
          <div className="result-grid">
            {RESULTS.filter((r) => !(r.value === 'fairway' && hole.par === 3 && lie === 'tee')).map((r) => (
              <button type="button" key={r.value} className={`res-btn res-${r.value}`} onClick={() => commit({ kind: 'full', club: draft.club, strike: draft.strike, result: r.value })}>{r.label}</button>
            ))}
          </div>
        </>
      )}

      {log}
      {(shots.length > 0 || draft.club) && <button type="button" className="btn btn-ghost" onClick={undo}>↩︎ Undo</button>}
    </section>
  )
}
