import { useState } from 'react'
import { useData } from '../lib/store.jsx'
import { Segmented } from '../components/ui.jsx'

// Shrink a phone photo so it uploads fast and fits the API's limits.
export function shrink(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      const url = c.toDataURL('image/jpeg', 0.85)
      URL.revokeObjectURL(img.src)
      resolve(url)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const cyclePar = (p) => (p >= 5 ? 3 : p + 1)

export default function Scorecard({ onDone, onCancel }) {
  const { profile, saveProfile } = useData()
  const [photo, setPhoto] = useState(null)
  const [status, setStatus] = useState('idle') // idle | reading | read | manual | error
  const [msg, setMsg] = useState('')
  const [name, setName] = useState('')
  const [holes, setHoles] = useState(null) // [{par, metres}]

  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await shrink(file)
    setPhoto(url)
    setStatus('reading'); setMsg('')
    try {
      const res = await fetch('/api/scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url.split(',')[1], mediaType: 'image/jpeg' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.holes?.length) {
        setHoles(data.holes.map((h) => ({ par: h.par, metres: h.metres ?? null })))
        if (data.courseName) setName(data.courseName)
        setMsg(data.notes || '')
        setStatus('read')
      } else {
        setHoles((h) => h || Array.from({ length: 18 }, () => ({ par: 4, metres: null })))
        setStatus('manual')
        setMsg(data.error === 'not_configured'
          ? 'Automatic reading isn’t switched on yet, so tap each hole’s par using the photo.'
          : `${data.error || 'Couldn’t read that photo.'} Tap each hole’s par instead.`)
      }
    } catch {
      setHoles((h) => h || Array.from({ length: 18 }, () => ({ par: 4, metres: null })))
      setStatus('manual')
      setMsg('No signal to read the card. Tap each hole’s par instead.')
    }
  }

  const manual = () => {
    setHoles(Array.from({ length: 18 }, () => ({ par: 4, metres: null })))
    setStatus('manual')
  }

  const save = () => {
    const courseName = name.trim() || 'My course'
    const cards = { ...(profile.cards || {}), [courseName]: { holes, savedAt: new Date().toISOString() } }
    saveProfile({ cards, courses: [...new Set([...(profile.courses || []), courseName])] })
    onDone(courseName)
  }

  const total = holes?.reduce((a, h) => a + h.par, 0)

  return (
    <div className="stack">
      <button type="button" className="back" onClick={onCancel}>‹ Back</button>
      <h1 className="page-title">Add a scorecard</h1>

      <section className="card">
        <label className="btn btn-primary btn-xl file-btn">
          📷 {photo ? 'Take another photo' : 'Take a photo of the scorecard'}
          <input type="file" accept="image/*" capture="environment" onChange={pick} hidden />
        </label>
        {!photo && !holes && <button type="button" className="btn" onClick={manual}>No photo, I’ll tap the pars</button>}
        {photo && <img className="card-photo" src={photo} alt="Scorecard" />}
        {status === 'reading' && <div className="banner">🔍 Reading the scorecard…</div>}
        {msg && <p className="muted small">{msg}</p>}
      </section>

      {holes && (
        <section className="card">
          <h2>Pars {status === 'read' ? '(check them)' : ''}</h2>
          <p className="muted small">Tap a hole to change its par.</p>
          <Segmented options={[{ value: 9, label: '9 holes' }, { value: 18, label: '18 holes' }]} value={holes.length}
            onChange={(n) => setHoles((hs) => (n < hs.length ? hs.slice(0, n) : [...hs, ...Array.from({ length: n - hs.length }, () => ({ par: 4, metres: null }))]))} />
          <div className="par-grid">
            {holes.map((h, i) => (
              <button type="button" key={i} className={`par-cell p${h.par}`} onClick={() => setHoles((hs) => hs.map((x, j) => (j === i ? { ...x, par: cyclePar(x.par) } : x)))}>
                <small>{i + 1}</small>
                <b>{h.par}</b>
                {h.metres ? <small>{h.metres} m</small> : null}
              </button>
            ))}
          </div>
          <div className="score-line">Par {total}</div>
          <h2>Course name (grown-ups)</h2>
          <div className="inline-form">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Course name" />
          </div>
          <button type="button" className="btn btn-primary btn-xl" onClick={save}>Save scorecard</button>
        </section>
      )}
    </div>
  )
}
