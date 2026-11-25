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
            <div className="predict-label">expected score{saved.date ? ` · ${longDate(saved.date)}` : ''}</div>
          </div>
          {p.events === 0 ? (
            <p className="muted small">No past Girls 9–10 results at {saved.venue}, so this uses her recent form on an average course.</p>
          ) : (
            <>
              <div className="stat-grid">
                <div><b>{p.fieldAvg}</b><span>field average</span></div>
                <div><b>{p.winning}</b><span>usual winner</span></div>
                <div><b>{p.podium ?? '–'}</b><span>usual 3rd</span></div>
                <div><b>{p.record}</b><span>best ever</span></div>
              </div>
              <p className="muted small">
                {p.events} past {p.events === 1 ? 'event' : 'events'} here. It plays {Math.abs(Math.round(p.offset)) < 1 ? 'about average' : `about ${Math.abs(Math.round(p.offset))} ${p.offset > 0 ? 'harder' : 'easier'} than an average event`}. Her range starts from her latest tournament, nudged a little toward her earlier ones, and adjusted for how hard each course plays.
              </p>
              <table className="club-table">
                <thead><tr><th>Date</th><th>Girls</th><th>Winner</th><th>Middle</th></tr></thead>
                <tbody>
                  {p.past.slice(0, 8).map((r) => (
                    <tr key={r.date + r.venue}>
                      <td>{longDate(r.date)}{r.tc ? ' 🏆' : ''}</td>
                      <td>{r.scores.length}</td>
                      <td>{Math.round(r.scores[0])}</td>
                      <td>{Math.round(r.scores[Math.floor(r.scores.length / 2)])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </section>
  )
}
