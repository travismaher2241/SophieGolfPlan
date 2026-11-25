import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useData } from '../lib/store.jsx'
import { go } from '../App.jsx'
import { letterFacts, templateLetter } from '../lib/letter.js'

const longDate = (iso) => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })

// The printed sheet: A4 landscape, two A5 panels, folded down the middle.
function Sheet({ letter, from, rows }) {
  return (
    <div className="letter-sheet">
      <div className="letter-fold" />
      <div className="letter-cols">
        <div className="letter-head">
          <img src="/logo.png" alt="" />
          <div>
            <div className="letter-kicker">Melbourne Local Tour</div>
            <h1>{letter.title}</h1>
          </div>
        </div>
        <p className="letter-hi">Hey Sophie,</p>
        <p>{letter.intro}</p>
        {rows.length > 1 && (
          <table className="letter-table">
            <thead><tr><th>Round</th><th>Course</th><th>Score</th></tr></thead>
            <tbody>
              {rows.map(({ r, t }, i) => (
                <tr key={r.id}><td>{i + 1} · {longDate(r.date)}</td><td>{r.course.replace(/\s+(Public\s+)?Golf.*$/i, '')}</td><td><b>{t.score}</b></td></tr>
              ))}
            </tbody>
          </table>
        )}
        {letter.sections.map((s, i) => (
          <div className="letter-sec" key={i}>
            <h2>{s.heading}</h2>
            <ul>{s.points.filter(Boolean).map((p, j) => <li key={j}>{p}</li>)}</ul>
          </div>
        ))}
        <p>{letter.closing}</p>
        <p className="letter-sign">Love,<br />{from || '…'}</p>
      </div>
    </div>
  )
}

function Preview(props) {
  const box = useRef(null)
  const [scale, setScale] = useState(0.3)
  useLayoutEffect(() => {
    const fit = () => box.current && setScale(box.current.clientWidth / 1123)
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return (
    <div className="letter-preview" ref={box} style={{ height: 794 * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}><Sheet {...props} /></div>
    </div>
  )
}

export default function Letter() {
  const { entries, profile, saveProfile } = useData()
  const facts = letterFacts(entries, profile)
  const [letter, setLetter] = useState(profile.letter || null)
  const [extra, setExtra] = useState(profile.letterExtra || '')
  const [from, setFrom] = useState(profile.letterFrom || '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  // Save edits a moment after typing stops.
  useEffect(() => {
    const t = setTimeout(() => {
      if (letter !== (profile.letter || null) || extra !== (profile.letterExtra || '') || from !== (profile.letterFrom || '')) {
        saveProfile({ letter, letterExtra: extra, letterFrom: from })
      }
    }, 800)
    return () => clearTimeout(t)
  }, [letter, extra, from]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!facts) {
    return (
      <div className="stack">
        <button type="button" className="back" onClick={() => go('tour')}>‹ Tournaments</button>
        <p className="empty">Add a tournament first, then the note can be written from it.</p>
      </div>
    )
  }

  const write = async () => {
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facts: facts.text, extra }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) setLetter(data)
      else {
        setLetter(templateLetter(facts))
        setMsg(data.error === 'not_configured' ? 'Gemini isn’t switched on, so here’s a ready-made note to edit.' : `${data.error || 'Gemini couldn’t write it.'} Here’s a ready-made note to edit.`)
      }
    } catch {
      setLetter(templateLetter(facts))
      setMsg('No signal, so here’s a ready-made note to edit.')
    } finally {
      setBusy(false)
    }
  }

  const set = (patch) => setLetter((l) => ({ ...l, ...patch }))
  const setSec = (i, patch) => setLetter((l) => ({ ...l, sections: l.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) }))

  return (
    <div className="stack">
      <button type="button" className="back" onClick={() => go('tour')}>‹ Tournaments</button>
      <h1 className="page-title">A note for Sophie</h1>
      <section className="card tour-form">
        <p className="muted small">Written from her tournament results: only the good stuff. Prints on one A4 page (landscape) that folds in half into a small card.</p>
        <label>Anything else to include?<textarea rows={3} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="e.g. her swing looked smooth and fast in the video, great finish position" /></label>
        <button type="button" className="btn btn-primary btn-xl" disabled={busy} onClick={write}>{busy ? '✍️ Writing…' : letter ? '✨ Write a new one' : '✨ Write the note'}</button>
        {msg && <div className="banner">{msg}</div>}
      </section>

      {letter && (
        <>
          <section className="card">
            <h2>Preview</h2>
            <Preview letter={letter} from={from} rows={facts.rows} />
            <button type="button" className="btn btn-primary btn-xl" onClick={() => window.print()}>🖨️ Print</button>
            <p className="muted small">In the print window choose A4, landscape, no margins or headers, then fold down the dashed line.</p>
          </section>

          <section className="card tour-form">
            <h2>Edit the words</h2>
            <label>Headline<input value={letter.title} onChange={(e) => set({ title: e.target.value })} /></label>
            <label>Opening<textarea rows={3} value={letter.intro} onChange={(e) => set({ intro: e.target.value })} /></label>
            {letter.sections.map((s, i) => (
              <div key={i} className="letter-edit-sec">
                <label>Section {i + 1}<input value={s.heading} onChange={(e) => setSec(i, { heading: e.target.value })} /></label>
                <textarea rows={Math.max(2, s.points.length + 1)} value={s.points.join('\n')} onChange={(e) => setSec(i, { points: e.target.value.split('\n') })} />
                <p className="muted small">One point per line.</p>
              </div>
            ))}
            <label>Closing<textarea rows={3} value={letter.closing} onChange={(e) => set({ closing: e.target.value })} /></label>
            <label>Signed<input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g. Mum & Dad" /></label>
          </section>

          {createPortal(<div className="print-only"><Sheet letter={letter} from={from} rows={facts.rows} /></div>, document.body)}
        </>
      )}
    </div>
  )
}
