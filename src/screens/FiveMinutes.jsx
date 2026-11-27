import { useEffect, useMemo, useState } from 'react'
import { useData } from '../lib/store.jsx'
import { CHEERS, DRILLS, PLACES, pick } from '../data/drills.js'
import { Segmented } from '../components/ui.jsx'
import { go } from '../App.jsx'

const PLACE_KEY = 'sophie-five-place'
const LENGTH = 5 * 60

const readPlace = () => {
  try { return localStorage.getItem(PLACE_KEY) || 'home' } catch { return 'home' }
}
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function FiveMinutes() {
  const { entries, addEntry } = useData()
  const [place, setPlace] = useState(readPlace)
  const recent = useMemo(
    () => entries.filter((e) => e.type === 'practice' && e.drill).slice(0, 6).map((e) => e.drill),
    [entries],
  )
  const [drill, setDrill] = useState(() => pick(DRILLS.filter((d) => d.where.includes(readPlace())), recent))
  const [left, setLeft] = useState(LENGTH)
  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(null)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLeft((s) => {
      if (s <= 1) { setRunning(false); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(t)
  }, [running])

  const best = Math.max(0, ...entries.filter((e) => e.drill === drill.id && e.score != null).map((e) => e.score))
  const reset = () => { setLeft(LENGTH); setRunning(false); setCount(0); setDone(null) }

  const shuffle = (where = place) => {
    const pool = DRILLS.filter((d) => d.where.includes(where))
    setDrill(pick(pool, [drill.id, ...recent]))
    reset()
  }
  const changePlace = (p) => {
    setPlace(p)
    try { localStorage.setItem(PLACE_KEY, p) } catch { /* ignore */ }
    shuffle(p)
  }

  const finish = async () => {
    const newBest = drill.score && count > 0 && count > best
    setRunning(false)
    setDone({ cheer: CHEERS[Math.floor(Math.random() * CHEERS.length)], newBest })
    await addEntry({ type: 'practice', areas: [drill.area], minutes: 5, drill: drill.id, score: drill.score ? count : null })
  }

  if (done) {
    return (
      <div className="stack five">
        <section className="card five-done">
          <div className="five-emoji">{done.newBest ? '🏆' : '🎉'}</div>
          <h1 className="page-title">{done.cheer}</h1>
          {drill.score && <p className="five-score">{count} {drill.score}</p>}
          {done.newBest && <div className="banner good">New best for {drill.name}!</div>}
          <p className="muted">5 minutes added to your practice this week.</p>
        </section>
        <button type="button" className="btn btn-primary btn-xl" onClick={() => shuffle()}>🎲 Another 5 minutes</button>
        <button type="button" className="btn" onClick={() => go('home')}>I'm done for now</button>
      </div>
    )
  }

  return (
    <div className="stack five">
      <h1 className="page-title">I've got 5 minutes!</h1>
      <Segmented options={PLACES} value={place} onChange={changePlace} />

      <section className="card five-card">
        <div className="five-emoji">{drill.emoji}</div>
        <h2 className="five-name">{drill.name}</h2>
        <p className="five-need"><b>You need:</b> {drill.need}</p>
        <ol className="five-steps">
          {drill.steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <p className="five-challenge">⭐ {drill.challenge}</p>
        {best > 0 && <p className="muted small">Your best: {best} {drill.score}</p>}
      </section>

      <section className="card five-timer">
        <div className={`five-clock ${left === 0 ? 'up' : ''}`}>{left === 0 ? "Time's up! 🎉" : fmt(left)}</div>
        {left > 0 && (
          <button type="button" className="btn btn-primary btn-xl" onClick={() => setRunning((r) => !r)}>
            {running ? '⏸️ Pause' : left === LENGTH ? '▶️ Start' : '▶️ Keep going'}
          </button>
        )}
        {drill.score && (
          <>
            <h2>Count your {drill.score}</h2>
            <div className="stepper">
              <button type="button" className="step-btn" onClick={() => setCount((c) => Math.max(0, c - 1))} aria-label="less">−</button>
              <div className="step-val">{count}</div>
              <button type="button" className="step-btn" onClick={() => setCount((c) => c + 1)} aria-label="more">+</button>
            </div>
          </>
        )}
        <button type="button" className="btn btn-primary btn-xl five-finish" onClick={finish}>✅ I did it!</button>
      </section>

      <button type="button" className="btn" onClick={() => shuffle()}>🎲 Give me a different one</button>
    </div>
  )
}
