import { useState } from 'react'
import { useData } from '../lib/store.jsx'
import { roundTotals, pct, num } from '../lib/stats.js'
import { ConfirmButton, Segmented, shortDate } from '../components/ui.jsx'
import { go } from '../App.jsx'
import ShotHole from './ShotHole.jsx'
import Scorecard from './Scorecard.jsx'
import { shotStats } from '../lib/shots.js'

const TEES = [
  { value: 'pathway', label: 'Pathway 1,234 m' },
  { value: 'forward', label: 'Forward tees' },
  { value: 'other', label: 'Other tees' },
]
const MOODS = [
  { value: 'great', label: '🤩' },
  { value: 'good', label: '🙂' },
  { value: 'ok', label: '😐' },
  { value: 'tough', label: '😣' },
]
const newHole = (par = 4, metres = null) => ({ par, metres, score: null, putts: null, tee: null, penalties: 0, sand: null, routine: null, shots: [] })

function Setup({ onStart }) {
  const { profile } = useData()
  const [mode, setMode] = useState('shots')
  const [holes, setHoles] = useState(9)
  const [which, setWhich] = useState('front')
  const [tees, setTees] = useState('pathway')
  const [course, setCourse] = useState(profile.courses?.[0] || '')
  const [kind, setKind] = useState('casual')
  const [addingCard, setAddingCard] = useState(false)
  const card = profile.cards?.[course]

  if (addingCard) return <Scorecard onCancel={() => setAddingCard(false)} onDone={(name) => { setCourse(name); setAddingCard(false) }} />

  const start = () => {
    let list = card ? card.holes : null
    let n = card ? card.holes.length : holes
    if (card && card.holes.length === 18 && holes === 9) { list = which === 'back' ? card.holes.slice(9) : card.holes.slice(0, 9); n = 9 }
    const start = card && card.holes.length === 18 && holes === 9 && which === 'back' ? 9 : 0
    onStart({
      mode, holesPlanned: n, tees, course, kind, firstHole: start + 1,
      holes: Array.from({ length: n }, (_, i) => newHole(list?.[i]?.par ?? 4, list?.[i]?.metres ?? null)),
    })
  }

  return (
    <div className="stack">
      <h1 className="page-title">New round</h1>
      <section className="card">
        <h2>How do you want to track it?</h2>
        <Segmented options={[{ value: 'shots', label: '🏌️‍♀️ Shot by shot' }, { value: 'quick', label: '⚡ Quick score' }]} value={mode} onChange={setMode} />
        <h2>Course</h2>
        {profile.courses?.length > 0 && (
          <Segmented options={[...profile.courses.map((c) => ({ value: c, label: `${profile.cards?.[c] ? '📋 ' : ''}${c}` })), { value: '', label: 'Other' }]} value={course} onChange={setCourse} wrap />
        )}
        <button type="button" className="btn" onClick={() => setAddingCard(true)}>📷 Add a scorecard</button>
        {card && <p className="muted small">Pars loaded from the scorecard: par {card.holes.reduce((a, h) => a + h.par, 0)} for {card.holes.length} holes.</p>}
        <h2>How many holes?</h2>
        <Segmented options={[{ value: 9, label: '9 holes' }, { value: 18, label: '18 holes' }]} value={card?.holes.length === 9 ? 9 : holes} onChange={setHoles} size="lg" />
        {card?.holes.length === 18 && holes === 9 && (
          <Segmented options={[{ value: 'front', label: 'Front 9' }, { value: 'back', label: 'Back 9' }]} value={which} onChange={setWhich} />
        )}
        <h2>Which tees?</h2>
        <Segmented options={TEES} value={tees} onChange={setTees} wrap />
        <h2>What kind of round?</h2>
        <Segmented options={[{ value: 'casual', label: 'Fun' }, { value: 'practice', label: 'Practice' }, { value: 'event', label: 'Tournament' }]} value={kind} onChange={setKind} />
        <button type="button" className="btn btn-primary btn-xl" onClick={start}>
          Tee off! 🏌️‍♀️
        </button>
      </section>
    </div>
  )
}

function HoleView({ round }) {
  const { updateEntry, deleteEntry } = useData()
  const [finishing, setFinishing] = useState(false)
  const shotMode = round.mode === 'shots'
  const idx = round.current ?? 0
  const h = round.holes[idx]
  const totals = roundTotals(round)

  const patchHole = (patch) => {
    const holes = round.holes.map((x, i) => (i === idx ? { ...x, ...patch } : x))
    updateEntry(round.id, { holes })
  }
  const goHole = (i) => updateEntry(round.id, { current: i })
  const first = round.firstHole || 1
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
          <button type="button" key={i} className={`hole-dot ${i === idx ? 'on' : ''} ${x.score != null ? 'done' : ''}`} onClick={() => goHole(i)}>{first + i}</button>
        ))}
      </div>

      {!shotMode && (
        <div className="banner">
          {totals.holesPlayed === 0 ? (
            <>
              This round is set to Quick score.
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 8, width: '100%' }}
                onClick={() => updateEntry(round.id, { mode: 'shots', holes: round.holes.map((x) => ({ ...x, shots: x.shots || [] })) })}
              >
                🏌️‍♀️ Switch to shot by shot
              </button>
            </>
          ) : (
            <>Quick score round. To track shot by shot, tap End round early below, then start a new round and pick Shot by shot.</>
          )}
        </div>
      )}

      {shotMode ? (
        <ShotHole
          key={idx}
          hole={h}
          number={first + idx}
          isLast={last}
          onChange={patchHole}
          onNext={() => (last ? setFinishing(true) : goHole(idx + 1))}
        />
      ) : (
      <section className="card hole">
        <div className="hole-head">
          <h1>Hole {first + idx}</h1>
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
      )}

      <div className="hole-nav">
        <button type="button" className="btn" disabled={idx === 0} onClick={() => goHole(idx - 1)}>{idx === 0 ? "‹ Back" : `‹ Hole ${first + idx - 1}`}</button>
        {last ? (
          <button type="button" className="btn btn-primary" onClick={() => setFinishing(true)}>Finish ✓</button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => goHole(idx + 1)}>Hole {first + idx + 1} ›</button>
        )}
      </div>
      <div className="hole-nav">
        <button type="button" className="btn btn-ghost" onClick={() => setFinishing(true)}>End round early</button>
        <ConfirmButton className="btn btn-ghost danger" onConfirm={() => deleteEntry(round.id)}>Delete round</ConfirmButton>
      </div>
    </div>
  )
}

const MISS_LABEL = { thin: 'thin', fat: 'fat', topped: 'topped', shank: 'shank' }
const PUTT_LABEL = { short: 'short', long: 'long', left: 'left', right: 'right' }

export function ShotBreakdown({ rounds }) {
  const st = shotStats(rounds)
  if (!st.fullShots) return null
  const missText = Object.entries(st.misses).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${MISS_LABEL[k]}`).join(' · ')
  const puttText = Object.entries(st.puttMiss).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${PUTT_LABEL[k]}`).join(' · ')
  return (
    <div className="shot-breakdown">
      <div className="stat-grid three">
        <div><b>{pct(st.goodPct)}</b><span>good strikes</span></div>
        <div><b>{st.fullShots}</b><span>full shots</span></div>
        <div><b>{st.penalties}</b><span>water / OB</span></div>
      </div>
      {missText && <p className="muted small">Misses: {missText}</p>}
      {puttText && <p className="muted small">Missed putts finished: {puttText}</p>}
      <table className="club-table">
        <thead><tr><th>Club</th><th>Shots</th><th>Good strike</th><th>On target</th></tr></thead>
        <tbody>
          {st.clubs.map((c) => (
            <tr key={c.club}><td>{c.club}</td><td>{c.shots}</td><td>{pct(c.good / c.shots)}</td><td>{pct(c.onTarget / c.shots)}</td></tr>
          ))}
        </tbody>
      </table>
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
      {round.mode === 'shots' && <ShotBreakdown rounds={[round]} />}
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
          await addEntry({ type: 'round', status: 'live', current: 0, ...opts })
          setShowSetup(false)
        }}
      />
    )
  }

  return (
    <div className="stack">
      <h1 className="page-title">Rounds</h1>
      <button type="button" className="btn btn-primary btn-xl" onClick={() => setShowSetup(true)}>⛳ Start a round</button>
      <p className="muted">Shot by shot: tap the club, the strike and where it finished, and the app counts the score. Or pick Quick score to tap just the score and putts. Works without signal and saves as you go.</p>
      {recent.map((r) => <section className="card" key={r.id}><RoundSummary round={r} /></section>)}
      {recent.length > 0 && <button type="button" className="btn" onClick={() => go('progress')}>See all my progress ›</button>}
    </div>
  )
}
