import { useState } from 'react'
import { useData } from '../lib/store.jsx'
import { predict, venues } from '../lib/predict.js'

const longDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

export default function NextEvent() {
  const { profile, saveProfile, entries } = useData()
  const saved = profile.nextComp || {}
  const [venue, setVenue] = useState(saved.venue || '')
  const [date, setDate] = useState(saved.date || '')
  const list = venues(entries)
  const p = saved.venue ? predict(entries, saved.venue) : null
  const dirty = venue !== (saved.venue || '') || date !== (saved.date || '')

  return (
    <section className="card tour-form">
      <h2>Next event</h2>
      <label>Venue
        <input list="tour-venues" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Start typing a course" />
        <datalist id="tour-venues">{list.map((v) => <option key={v} value={v} />)}</datalist>
      </label>
      <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      {dirty && <button type="button" className="btn btn-primary" disabled={!venue.trim()} onClick={() => saveProfile({ nextComp: { venue: venue.trim(), date } })}>Save next event</button>}

      {p && !dirty && (
        <>
          <div className="predict">
            <div className="predict-big">{p.range ? `${p.range[0]}–${p.range[1]}` : '–'}</div>
            <div className="predict-label">her target range{saved.date ? ` · ${longDate(saved.date)}` : ''}</div>
          </div>
          {p.events === 0 ? (
            <p className="muted small">The range comes from her own recent rounds.</p>
          ) : (
            <>
              <p className="muted small">
                This course plays {Math.abs(Math.round(p.offset)) < 1 ? 'about average' : `about ${Math.abs(Math.round(p.offset))} ${p.offset > 0 ? 'harder' : 'easier'} than an average event`}. The range comes from her own recent rounds.
              </p>
            </>
          )}
        </>
      )}
    </section>
  )
}
