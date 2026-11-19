import { useState } from 'react'
import { useData } from '../lib/store.jsx'
import { roundTotals, pct, num } from '../lib/stats.js'
import { ConfirmButton, Segmented, shortDate } from '../components/ui.jsx'
import { go } from '../App.jsx'

const TEES = [
  { value: 'pathway', label: 'Pathway 1,350 yds' },
  { value: 'forward', label: 'Forward tees' },
  { value: 'other', label: 'Other tees' },
]
const MOODS = [
  { value: 'great', label: '🤩' },
  { value: 'good', label: '🙂' },
  { value: 'ok', label: '😐' },
  { value: 'tough', label: '😣' },
]
const newHole = () => ({ par: 4, score: null, putts: null, tee: null, penalties: 0, sand: null, routine: null })

function Setup({ onStart }) {
  const { profile } = useData()
  const [holes, setHoles] = useState(9)
  const [tees, setTees] = useState('pathway')
  const [course, setCourse] = useState(profile.courses?.[0] || '')
  const [kind, setKind] = useState('casual')
  return (
    <div className="stack">
      <h1 className="page-title">New round</h1>
      <section className="card">
        <h2>How many holes?</h2>
        <Segmented options={[{ value: 9, label: '9 holes' }, { value: 18, label: '18 holes' }]} value={holes} onChange={setHoles} size="lg" />
        <h2>Which tees?</h2>
        <Segmented options={TEES} value={tees} onChange={setTees} wrap />
        <h2>What kind of round?</h2>
        <Segmented options={[{ value: 'casual', label: 'Fun' }, { value: 'practice', label: 'Practice' }, { value: 'event', label: 'Tournament' }]} value={kind} onChange={setKind} />
        {profile.courses?.length > 0 && (
          <>
            <h2>Course</h2>
            <Segmented options={[...profile.courses.map((c) => ({ value: c, label: c })), { value: '', label: 'Other' }]} value={course} onChange={setCourse} wrap />
          </>
        )}
        <button type="button" className="btn btn-primary btn-xl" onClick={() => onStart({ holesPlanned: holes, tees, course, kind })}>
          Tee off! 🏌️‍♀️
        </button>
      </section>
    </div>
  )
}

function HoleView({ round }) {
  const { updateEntry, deleteEntry } = useData()
  const [finishing, setFinishing] = useState(false)
  const idx = round.current ?? 0
  const h = round.holes[idx]
  const totals = roundTotals(round)

  const patchHole = (patch) => {
    const holes = round.holes.map((x, i) => (i === idx ? { ...x, ...patch } : x))
    updateEntry(round.id, { holes })
  }
  const goHole = (i) => updateEntry(round.id, { current: i })
  const last = idx === round.holes.length - 1
  const scoreOpts = Array.from({ length: 8 }, (_, i) => Math.max(1, h.par - 2) + i)
  const label = (s) => (s - h.par === -2 ? 'Eagle' : s - h.par === -1 ? 'Birdie' : s === h.par ? 'Par' : s - h.par === 1 ? 'Bogey' : '')

  if (finishing) {
    return (
      <div className="stack">
        <section className="card">
          <h1 className="page-title">How did it feel?</h1>
          <Segmented options={MOODS} value={round.mood} onChange={(mood) => updateEntry(round.id, { mood })} size="xl" />
          <button type="button" className="btn btn-primary btn-xl" onClick={() => updateEntry(round.id, { status: 'done', finishedAt: new Date().toISOString() })}>
            Finish round ({totals.holesPlayed} holes)
          </button>
          <button type="button" className="btn" onClick={() => setFinishing(false)}>Keep playing</button>
        </section>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="round-top">
        <div>
          <div className="eyebrow">{round.course || 'Round'} · {totals.holesPlayed} played</div>
          <div className="round-score">{totals.score || 0} <span className={totals.toPar > 0 ? 'over' : 'under'}>{totals.holesPlayed ? (totals.toPar > 0 ? `+${totals.toPar}` : totals.toPar === 0 ? 'E' : totals.toPar) : ''}</span></div>
        </div>
        <div className="round-putts">{totals.putts ?? 0}<span>putts</span></div>
      </div>

      <div className="hole-dots">
        {round.holes.map((x, i) => (
          <button type="button" key={i} className={`hole-dot ${i === idx ? 'on' : ''} ${x.score != null ? 'done' : ''}`} onClick={() => goHole(i)}>{i + 1}</button>
        ))}
      </div>

      <section className="card hole">
        <div className="hole-head">
          <h1>Hole {idx + 1}</h1>
          <Segmented options={[3, 4, 5].map((p) => ({ value: p, label: `Par ${p}` }))} value={h.par} onChange={(par) => patchHole({ par, tee: par === 3 ? null : h.tee })} />
        </div>

        {h.par >= 4 && (
          <>
            <h2>Tee shot</h2>
            <Segmented
              options={[
                { value: 'L', label: '⬅️ Left' },
                { value: 'F', label: '🎯 Fairway', tone: 'good' },
                { value: 'R', label: 'Right ➡️' },
                { value: 'X', label: '🌳 Trouble' },
              ]}
              value={h.tee}
              onChange={(tee) => patchHole({ tee: h.tee === tee ? null : tee })}
            />
          </>
        )}

        <h2>Score</h2>
        <div className="score-pad">
          {scoreOpts.map((s) => (
            <button type="button" key={s} className={`score-btn ${h.score === s ? 'on' : ''} ${s < h.par ? 'under' : s === h.par ? 'par' : ''}`} onClick={() => patchHole({ score: s })}>
              <span>{s}</span><small>{label(s)}</small>
            </button>
          ))}
        </div>

        <h2>Putts</h2>
        <Segmented options={[0, 1, 2, 3, 4].map((p) => ({ value: p, label: p === 4 ? '4+' : String(p), tone: p >= 3 ? 'bad' : p <= 1 ? 'good' : undefined }))} value={h.putts} onChange={(putts) => patchHole({ putts })} size="lg" />

        <div className="two-col">
          <div>
            <h2>Penalties</h2>
            <Segmented options={[0, 1, 2].map((p) => ({ value: p, label: p === 2 ? '2+' : String(p) }))} value={h.penalties} onChange={(penalties) => patchHole({ penalties })} />
          </div>
          <div>
            <h2>In a bunker?</h2>
            <Segmented options={[{ value: true, label: 'Yes' }, { value: false, label: 'No' }]} value={h.sand} onChange={(sand) => patchHole({ sand })} />
          </div>
        </div>

        <h2>Plan · Setup · Play on every shot?</h2>
        <Segmented options={[{ value: true, label: '👍 Yes', tone: 'good' }, { value: false, label: '👎 Not every shot' }]} value={h.routine} onChange={(routine) => patchHole({ routine })} />
      </section>

      <div className="hole-nav">
        <button type="button" className="btn" disabled={idx === 0} onClick={() => goHole(idx - 1)}>‹ Hole {idx}</button>
        {last ? (
          <button type="button" className="btn btn-primary" onClick={() => setFinishing(true)}>Finish ✓</button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => goHole(idx + 1)}>Hole {idx + 2} ›</button>
        )}
      </div>
      <div className="hole-nav">
        <button type="button" className="btn btn-ghost" onClick={() => setFinishing(true)}>End round early</button>
        <ConfirmButton className="btn btn-ghost danger" onConfirm={() => deleteEntry(round.id)}>Delete round</ConfirmButton>
      </div>
    </div>
  )
}

export function RoundSummary({ round }) {
  const t = roundTotals(round)
  const mood = MOODS.find((m) => m.value === round.mood)?.label || ''
  return (
    <div className="round-sum">
      <div className="round-sum-head">
        <span>{shortDate(round.date)} · {round.course || 'Round'} · {t.holesPlayed} holes</span>
        <span>{mood}</span>
      </div>
      <div className="stat-grid">
        <div><b>{t.score}</b><span>score</span></div>
        <div><b>{t.putts ?? '–'}</b><span>putts</span></div>
        <div><b>{pct(t.fairwayPct)}</b><span>fairways</span></div>
        <div><b>{pct(t.girPct)}</b><span>greens</span></div>
        <div><b>{pct(t.scramblePct)}</b><span>saved par</span></div>
        <div><b>{t.threePutts}</b><span>3-putts</span></div>
        <div><b>{t.penalties}</b><span>penalties</span></div>
        <div><b>{pct(t.routinePct)}</b><span>routine</span></div>
      </div>
      {t.puttsPerHole != null && <div className="muted small">{num(t.puttsPerHole, 2)} putts per hole · {t.onePutts} one-putts</div>}
    </div>
  )
}

export default function Round() {
  const { entries, addEntry } = useData()
  const live = entries.find((e) => e.type === 'round' && e.status === 'live')
  const recent = entries.filter((e) => e.type === 'round' && e.status === 'done').slice(0, 5)
  const [showSetup, setShowSetup] = useState(false)

  if (live) return <HoleView round={live} />

  if (showSetup) {
    return (
      <Setup
        onStart={async (opts) => {
          await addEntry({ type: 'round', status: 'live', current: 0, holes: Array.from({ length: opts.holesPlanned }, newHole), ...opts })
          setShowSetup(false)
        }}
      />
    )
  }

  return (
    <div className="stack">
      <h1 className="page-title">Rounds</h1>
      <button type="button" className="btn btn-primary btn-xl" onClick={() => setShowSetup(true)}>⛳ Start a round</button>
      <p className="muted">Each hole: tap par, tee shot, score, putts and whether you used your routine. Works without signal and saves as you go.</p>
      {recent.map((r) => <section className="card" key={r.id}><RoundSummary round={r} /></section>)}
      {recent.length > 0 && <button type="button" className="btn" onClick={() => go('progress')}>See all my progress ›</button>}
    </div>
  )
}
