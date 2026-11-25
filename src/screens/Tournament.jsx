import { useEffect, useState } from 'react'
import { useData } from '../lib/store.jsx'
import { roundTotals } from '../lib/stats.js'
import { ConfirmButton, Segmented } from '../components/ui.jsx'
import { go } from '../App.jsx'
import { shrink } from './Scorecard.jsx'
import TourInsights from './TourInsights.jsx'
import {
  divisionFor, fieldText, finishLabel, finishOf, parseField, SPRING_2026, tournaments,
} from '../lib/tour.js'

const toPar = (n) => (n > 0 ? `+${n}` : n === 0 ? 'E' : String(n))
const longDate = (iso) => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
const blankHole = (par = 4) => ({ par, metres: '', score: '', putts: '' })
const n = (v) => (v === '' || v == null ? null : Number(v))

function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export function DivisionCard() {
  const { profile } = useData()
  const d = divisionFor(profile.dob)
  if (!d) {
    return (
      <section className="card">
        <h2>Age division</h2>
        <p className="muted small">Add Sophie’s date of birth in Settings to see her division and how long she has left in it.</p>
        <button type="button" className="btn" onClick={() => go('settings')}>Open Settings</button>
      </section>
    )
  }
  return (
    <section className="card">
      <h2>Age division</h2>
      <div className="stat-grid three">
        <div><b>{d.age}</b><span>years old</span></div>
        <div><b>{d.division.replace('Girls ', '')}</b><span>girls division</span></div>
        <div><b>{d.monthsLeft ?? '–'}</b><span>months left</span></div>
      </div>
      {d.moveUp && (
        <p className="muted small">
          She turns {d.nextAge} on {longDate(d.moveUp.toISOString())}, so she moves up after that. The exact season depends on the tour’s age date, which U.S. Kids sets per season.
        </p>
      )}
    </section>
  )
}

function TourForm({ round, onDone }) {
  const { addEntry, updateEntry, deleteEntry } = useData()
  const tracked = round && round.source !== 'tour' // scored live in the app, hole by hole
  const [course, setCourse] = useState(round?.course || '')
  const [date, setDate] = useState((round?.date || new Date().toISOString()).slice(0, 10))
  const [detail, setDetail] = useState(round && !round.holes?.length ? 'total' : 'holes')
  const [holes, setHoles] = useState(
    round?.holes?.length
      ? round.holes.map((h) => ({ par: h.par, metres: h.metres ?? '', score: h.score ?? '', putts: h.putts ?? '' }))
      : Array.from({ length: 9 }, () => blankHole()),
  )
  const [total, setTotal] = useState(round?.totalScore ?? '')
  const [totalPar, setTotalPar] = useState(round?.totalPar ?? 36)
  const [field, setField] = useState(fieldText(round?.event?.field))
  const [points, setPoints] = useState(round?.event?.points ?? '')
  const [notes, setNotes] = useState(round?.event?.notes || '')
  const [reading, setReading] = useState(false)
  const [msg, setMsg] = useState('')

  const setHole = (i, k, v) => setHoles((hs) => hs.map((h, j) => (j === i ? { ...h, [k]: v } : h)))
  const setCount = (c) => setHoles((hs) => (c < hs.length ? hs.slice(0, c) : [...hs, ...Array.from({ length: c - hs.length }, () => blankHole())]))

  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const isPdf = file.type === 'application/pdf'
    if (isPdf && file.size > 3.2e6) { setMsg('That PDF is too big to read (over 3 MB). Try a screenshot of the page instead.'); return }
    setReading(true); setMsg('')
    try {
      const url = isPdf ? await readFile(file) : await shrink(file, 2000)
      const res = await fetch('/api/tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: url.split(',')[1], mediaType: isPdf ? 'application/pdf' : 'image/jpeg', player: 'Sophie Maher' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg(data.error === 'not_configured' ? 'Automatic reading isn’t switched on (GEMINI_API_KEY is missing in Vercel), so type the scores in.' : data.error || 'Couldn’t read that file.')
        return
      }
      if (data.courseName && !course) setCourse(data.courseName)
      if (data.date) setDate(data.date)
      if (!tracked && data.holes.length) {
        setDetail('holes')
        setHoles(data.holes.map((h) => ({ par: h.par, metres: h.metres ?? '', score: h.score ?? '', putts: h.putts ?? '' })))
      } else if (!tracked && data.playerTotal) {
        setDetail('total'); setTotal(data.playerTotal)
        if (data.totalPar) setTotalPar(data.totalPar)
      }
      if (data.field.length) setField(fieldText(data.field))
      setMsg(`Read it. Check everything below before saving.${data.playerTotal == null ? ' Sophie wasn’t found on that sheet.' : ''}${data.notes ? ` ${data.notes}` : ''}`)
    } catch {
      setMsg('No signal to read the file. Type the scores in instead.')
    } finally {
      setReading(false)
    }
  }

  const holesOut = holes.map((h, i) => ({
    ...(round?.holes?.[i] || { tee: null, penalties: 0, sand: null, routine: null, shots: [] }),
    par: Number(h.par) || 4, metres: n(h.metres), score: n(h.score), putts: n(h.putts),
  }))
  const preview = tracked ? roundTotals(round) : roundTotals(
    detail === 'holes' ? { holes: holesOut } : { holes: [], totalScore: n(total), totalPar: n(totalPar), holesPlanned: holes.length },
  )
  const canSave = course.trim() && date && preview.score > 0

  const save = async () => {
    const event = { ...(round?.event || {}), tour: 'Melbourne Local Tour', field: parseField(field), points: n(points), notes: notes.trim() }
    const common = { course: course.trim(), date: new Date(`${date}T12:00:00`).toISOString(), event }
    if (tracked) {
      await updateEntry(round.id, common)
    } else {
      const scoring = detail === 'holes'
        ? { holes: holesOut, totalScore: null, totalPar: null, holesPlanned: holes.length }
        : { holes: [], totalScore: n(total), totalPar: n(totalPar), holesPlanned: holes.length }
      const lengthM = detail === 'holes' && holesOut.every((h) => h.metres) ? holesOut.reduce((a, h) => a + h.metres, 0) : round?.lengthM ?? null
      if (round) await updateEntry(round.id, { ...common, ...scoring, lengthM })
      else await addEntry({ type: 'round', kind: 'event', status: 'done', mode: 'quick', source: 'tour', tees: 'other', firstHole: 1, ...common, ...scoring, lengthM })
    }
    onDone()
  }

  return (
    <div className="stack">
      <button type="button" className="back" onClick={onDone}>‹ Tournaments</button>
      <h1 className="page-title">{round ? 'Edit tournament' : 'Add a tournament'}</h1>

      <section className="card">
        <h2>Read it from the results</h2>
        <p className="muted small">A photo or screenshot of her scorecard or the leaderboard, or a results PDF. Yards are changed to metres.</p>
        <label className={`btn btn-primary file-btn ${reading ? 'disabled' : ''}`}>
          {reading ? '🔍 Reading…' : '📷 Choose photo or PDF'}
          <input type="file" accept="image/*,application/pdf" onChange={pick} hidden disabled={reading} />
        </label>
        {msg && <div className="banner">{msg}</div>}
      </section>

      <section className="card tour-form">
        <label>Course<input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Keilor Public Golf Course" /></label>
        <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>

        {tracked ? (
          <p className="muted small">Scores come from the round Sophie tracked in the app ({preview.score}, {toPar(preview.toPar)}).</p>
        ) : (
          <>
            <h2>Holes</h2>
            <Segmented options={[{ value: 9, label: '9 holes' }, { value: 18, label: '18 holes' }]} value={holes.length} onChange={setCount} />
            <h2>Her scores</h2>
            <Segmented options={[{ value: 'holes', label: 'Hole by hole' }, { value: 'total', label: 'Total only' }]} value={detail} onChange={setDetail} />
            {detail === 'holes' ? (
              <div className="tour-grid-wrap">
                <table className="tour-grid">
                  <thead><tr><th>Hole</th><th>Par</th><th>Metres</th><th>Score</th><th>Putts</th></tr></thead>
                  <tbody>
                    {holes.map((h, i) => (
                      <tr key={i}>
                        <td><b>{i + 1}</b></td>
                        <td><input inputMode="numeric" value={h.par} onChange={(e) => setHole(i, 'par', e.target.value)} /></td>
                        <td><input inputMode="numeric" value={h.metres} onChange={(e) => setHole(i, 'metres', e.target.value)} /></td>
                        <td><input inputMode="numeric" value={h.score} onChange={(e) => setHole(i, 'score', e.target.value)} /></td>
                        <td><input inputMode="numeric" value={h.putts} onChange={(e) => setHole(i, 'putts', e.target.value)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="two-col">
                <label>Score<input inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value)} /></label>
                <label>Par<input inputMode="numeric" value={totalPar} onChange={(e) => setTotalPar(e.target.value)} /></label>
              </div>
            )}
            <div className="score-line">{preview.score ? `${preview.score} (${toPar(preview.toPar)})${preview.putts != null ? ` · ${preview.putts} putts` : ''}` : 'No score yet'}</div>
          </>
        )}

        <h2>The field</h2>
        <p className="muted small">The other girls in her division, one per line: name and total, like “Ashleigh 38”. A score on its own is fine. Her finish is worked out from these.</p>
        <textarea rows={6} value={field} onChange={(e) => setField(e.target.value)} placeholder={'Ashleigh 38\nChloe 41'} />
        {preview.score > 0 && parseField(field).length > 0 && (
          <div className="score-line">Finished {finishLabel(finishOf({ ...(tracked ? round : { holes: detail === 'holes' ? holesOut : [], totalScore: n(total), totalPar: n(totalPar), holesPlanned: holes.length }), event: { field: parseField(field) } }))}</div>
        )}
        <div className="two-col">
          <label>Tour points<input inputMode="decimal" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="optional" /></label>
          <div />
        </div>
        <label>Notes<textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Conditions, highlights…" /></label>

        <button type="button" className="btn btn-primary btn-xl" disabled={!canSave} onClick={save}>Save tournament</button>
        {round && (
          <ConfirmButton className="btn btn-ghost danger" onConfirm={async () => { await deleteEntry(round.id); onDone() }}>Delete this tournament</ConfirmButton>
        )}
      </section>
    </div>
  )
}

export function TourRow({ round, onOpen }) {
  const t = roundTotals(round)
  const f = finishOf(round)
  return (
    <button type="button" className="tour-row" onClick={onOpen}>
      <div className="tour-score"><b>{t.score}</b><span>{toPar(t.toPar)}</span></div>
      <div className="tour-info">
        <b>{round.course || 'Tournament'}</b>
        <span>{longDate(round.date)}{t.putts != null ? ` · ${t.putts} putts` : ''}</span>
      </div>
      <div className="tour-finish">{f ? finishLabel(f) : <span className="muted small">add field</span>}</div>
    </button>
  )
}

export default function Tournament() {
  const { entries, addEntry, profile, saveProfile, ready } = useData()
  const [editing, setEditing] = useState(null) // null | 'new' | round
  const list = tournaments(entries)
  const missingSeed = SPRING_2026.filter((s) => !list.some((r) => r.course === s.course && r.date.slice(0, 10) === s.date.slice(0, 10)))

  // Put her Spring 2026 rounds in once, automatically. If one is deleted later it stays deleted.
  useEffect(() => {
    if (!ready || profile.seededTour) return
    missingSeed.forEach((s) => addEntry(structuredClone(s)))
    saveProfile({ seededTour: true })
  }, [ready, profile.seededTour]) // eslint-disable-line react-hooks/exhaustive-deps

  if (editing) return <TourForm round={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />

  return (
    <div className="stack">
      <h1 className="page-title">🏆 Tournaments</h1>
      <p className="muted">Sophie’s U.S. Kids Melbourne Local Tour journey.</p>

      <TourInsights />
      <DivisionCard />

      <section className="card">
        <h2>Results</h2>
        {list.length === 0 && <p className="empty">No tournaments yet.</p>}
        {[...list].reverse().map((r) => <TourRow key={r.id} round={r} onOpen={() => setEditing(r)} />)}
      </section>

      <section className="card">
        <h2>For grown-ups</h2>
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>➕ Add a tournament</button>
        {list.length > 0 && <button type="button" className="btn" onClick={() => go('tour/letter')}>✉️ Write Sophie a note</button>}
        {list.length > 0 && <button type="button" className="btn" onClick={() => go('tour/compare')}>🔒 Compare journeys</button>}
        {missingSeed.length > 0 && profile.seededTour && (
          <button type="button" className="btn" onClick={() => missingSeed.forEach((s) => addEntry(structuredClone(s)))}>Reload her Spring 2026 rounds</button>
        )}
      </section>
    </div>
  )
}
