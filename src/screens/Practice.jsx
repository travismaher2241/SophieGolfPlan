import { useState } from 'react'
import { useData } from '../lib/store.jsx'
import { CHECKPOINTS, getLevel, skillKey } from '../data/curriculum.js'
import { skillStatus } from '../lib/progress.js'
import { driverRecFor, nextTarget, optimalFor, percentileFor } from '../data/swing.js'
import { ConfirmButton, LineChart, Segmented, Stepper, shortDate } from '../components/ui.jsx'
import { go } from '../App.jsx'

const AREAS = [
  { value: 'putting', label: '⛳ Putting' },
  { value: 'chipping', label: '🟢 Chipping' },
  { value: 'pitching', label: '🪁 Pitching' },
  { value: 'sand', label: '🏖️ Sand' },
  { value: 'irons', label: '🏌️‍♀️ Irons' },
  { value: 'driver', label: '💥 Driver' },
  { value: 'course', label: '🌳 On course' },
  { value: 'fitness', label: '🤸 Fitness' },
]
const FUN = [
  { value: 3, label: '🤩 Loved it' },
  { value: 2, label: '🙂 Good' },
  { value: 1, label: '😐 Meh' },
]

function Tests() {
  const { profile, entries } = useData()
  const level = getLevel(profile.level) || getLevel(4)
  return (
    <div className="stack">
      <p className="muted">Level {level.level} skill tests. Pick one and tap through it with your coach.</p>
      {CHECKPOINTS.map((cp) => level.checkpoints[cp.id].flatMap((sec) => sec.skills.map((sk) => {
        const key = skillKey(level.level, cp.id, sec.id, sk.id)
        const s = skillStatus(sk, key, entries)
        return (
          <button type="button" key={key} className={`skill-row ${s.passed ? 'passed' : ''}`} onClick={() => go(`test/${encodeURIComponent(key)}`)}>
            <span className="skill-main">
              <span className="skill-name">{s.passed ? '🏅' : cp.emoji} {sk.name}</span>
              <span className="skill-detail">{sk.detail}</span>
            </span>
            <span className="skill-badge">{s.label}</span>
          </button>
        )
      })))}
      <button type="button" className="btn" onClick={() => go(`pathway/${level.level}`)}>Other levels and forms ›</button>
    </div>
  )
}

function PracticeLog() {
  const { entries, addEntry, deleteEntry } = useData()
  const [areas, setAreas] = useState([])
  const [minutes, setMinutes] = useState(null)
  const [fun, setFun] = useState(null)
  const [done, setDone] = useState(false)
  const toggle = (a) => setAreas((xs) => (xs.includes(a) ? xs.filter((x) => x !== a) : [...xs, a]))
  const logs = entries.filter((e) => e.type === 'practice')

  const since = Date.now() - 7 * 864e5
  const week = logs.filter((e) => new Date(e.date).getTime() >= since)
  const byArea = AREAS.map((a) => ({
    ...a,
    mins: week.reduce((t, e) => t + (e.areas?.includes(a.value) ? (e.minutes || 0) / (e.areas.length || 1) : 0), 0),
  }))
  const maxMins = Math.max(1, ...byArea.map((a) => a.mins))

  const save = async () => {
    await addEntry({ type: 'practice', areas, minutes, fun })
    setAreas([]); setMinutes(null); setFun(null); setDone(true)
    setTimeout(() => setDone(false), 2500)
  }

  return (
    <div className="stack">
      {done && <div className="banner good">✅ Practice saved. Nice work!</div>}
      <section className="card">
        <h2>What did you practise?</h2>
        <Segmented options={AREAS} value={areas} onChange={toggle} wrap />
        <h2>How long?</h2>
        <Segmented options={[15, 30, 45, 60, 90].map((m) => ({ value: m, label: `${m} min` }))} value={minutes} onChange={setMinutes} wrap />
        <h2>How was it?</h2>
        <Segmented options={FUN} value={fun} onChange={setFun} />
        <button type="button" className="btn btn-primary btn-xl" disabled={!areas.length || !minutes} onClick={save}>Save practice</button>
      </section>

      <section className="card">
        <h2>This week</h2>
        {byArea.filter((a) => a.mins > 0).length === 0 && <div className="empty">No practice logged this week yet</div>}
        {byArea.filter((a) => a.mins > 0).map((a) => (
          <div key={a.value} className="hbar">
            <span className="hbar-label">{a.label}</span>
            <span className="hbar-track"><span className="hbar-fill" style={{ width: `${(a.mins / maxMins) * 100}%` }} /></span>
            <span className="hbar-val">{Math.round(a.mins)}</span>
          </div>
        ))}
      </section>

      {logs.length > 0 && (
        <section className="card">
          <h2>Recent</h2>
          <ul className="history">
            {logs.slice(0, 10).map((e) => (
              <li key={e.id}>
                <span>{shortDate(e.date)}</span>
                <span>{e.minutes} min · {e.areas?.map((a) => AREAS.find((x) => x.value === a)?.label.split(' ')[0]).join(' ')}</span>
                <span>{FUN.find((f) => f.value === e.fun)?.label.split(' ')[0] || ''}</span>
                <ConfirmButton className="x" onConfirm={() => deleteEntry(e.id)}>✕</ConfirmButton>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function SwingSpeed() {
  const { profile, entries, addEntry, saveProfile, deleteEntry } = useData()
  const logs = entries.filter((e) => e.type === 'swing')
  const last = logs[0]
  const [speed, setSpeed] = useState(last?.speed || 55)
  const [carry, setCarry] = useState(last?.carry || 80)
  const [saved, setSaved] = useState(false)
  const [h, setH] = useState(54)
  const height = profile.heightIn
  const p = percentileFor(speed, height)
  const rec = driverRecFor(speed, height)
  const next = nextTarget(speed, height)
  const opt = optimalFor(speed)

  return (
    <div className="stack">
      {!height && (
        <section className="card">
          <h2>How tall are you (in shoes)?</h2>
          <p className="muted">Used to compare your speed with other girls your height.</p>
          <Stepper value={h} onChange={setH} min={40} max={72} unit="in" />
          <button type="button" className="btn btn-primary" onClick={() => saveProfile({ heightIn: h })}>Save {h} in</button>
        </section>
      )}
      <section className="card">
        <h2>Driver club speed</h2>
        <Stepper value={speed} onChange={setSpeed} min={20} max={120} steps={[1, 5]} unit="mph" />
        <h2>Carry distance</h2>
        <Stepper value={carry} onChange={setCarry} min={0} max={300} steps={[1, 10]} unit="yds" />
        {height && (
          <div className="speed-facts">
            <div><b>{p ?? '–'}{p && p !== '<5' ? 'th' : ''}</b><span>percentile for {height}" girls</span></div>
            <div><b>{rec || '–'}</b><span>U.S. Kids driver</span></div>
            <div><b>{next ? `${next.speed}` : '🔥'}</b><span>{next ? `mph = ${next.pct}th %` : 'top of the chart'}</span></div>
          </div>
        )}
        {opt && <p className="muted small">At about {opt.speed} mph the best launch is {opt.launch}° with {opt.spin} rpm backspin.</p>}
        {saved && <div className="banner good">💨 Saved!</div>}
        <button
          type="button"
          className="btn btn-primary btn-xl"
          onClick={async () => {
            await addEntry({ type: 'swing', club: 'driver', speed, carry, heightIn: height || null })
            setSaved(true); setTimeout(() => setSaved(false), 2000)
          }}
        >
          Save swing speed
        </button>
      </section>

      {logs.length > 0 && (
        <section className="card">
          <h2>Speed over time</h2>
          <LineChart points={[...logs].reverse().map((e) => ({ x: shortDate(e.date), y: e.speed }))} target={next?.speed} />
          <ul className="history">
            {logs.slice(0, 8).map((e) => (
              <li key={e.id}>
                <span>{shortDate(e.date)}</span>
                <span>{e.speed} mph · {e.carry ?? '–'} yds</span>
                <span />
                <ConfirmButton className="x" onConfirm={() => deleteEntry(e.id)}>✕</ConfirmButton>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default function Practice({ tab = 'tests' }) {
  return (
    <div className="stack">
      <h1 className="page-title">Practice</h1>
      <Segmented
        options={[{ value: 'tests', label: '🎯 Tests' }, { value: 'log', label: '⏱️ Log' }, { value: 'speed', label: '💨 Speed' }]}
        value={tab}
        onChange={(t) => go(`practice/${t}`)}
      />
      {tab === 'log' ? <PracticeLog /> : tab === 'speed' ? <SwingSpeed /> : <Tests />}
    </div>
  )
}
