import { useData } from '../lib/store.jsx'
import { roundTotals } from '../lib/stats.js'
import { ConfirmButton } from '../components/ui.jsx'
import { go } from '../App.jsx'

const day = (iso) => new Date(iso).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })

// A round with no score, or one with only a few holes, is probably a test or a mistake.
export const looksEmpty = (r) => {
  const t = roundTotals(r)
  return !t.score || t.holesPlayed < 3
}

export default function ManageRounds() {
  const { entries, deleteEntry } = useData()
  const rounds = entries.filter((e) => e.type === 'round').sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  const empty = rounds.filter((r) => r.status !== 'live' && looksEmpty(r)) // never bulk-delete a round in progress

  return (
    <div className="stack">
      <button type="button" className="back" onClick={() => go('settings')}>‹ Settings</button>
      <h1 className="page-title">Manage rounds</h1>
      <p className="muted small">For grown-ups. Delete rounds that shouldn’t count. A deleted round is gone for good, and it comes off her charts and stats.</p>

      {empty.length > 0 && (
        <section className="card">
          <h2>Probably not real rounds</h2>
          <p className="muted small">{empty.length} round{empty.length === 1 ? ' has' : 's have'} no score or fewer than 3 holes. They’re marked ⚠️ below.</p>
          <ConfirmButton className="btn btn-ghost danger" onConfirm={() => empty.forEach((r) => deleteEntry(r.id))}>Delete all {empty.length}</ConfirmButton>
        </section>
      )}

      <section className="card">
        <h2>All rounds ({rounds.length})</h2>
        {!rounds.length && <p className="empty">No rounds yet.</p>}
        {rounds.map((r) => {
          const t = roundTotals(r)
          return (
            <div key={r.id} className="manage-row">
              <div>
                <b>{looksEmpty(r) ? '⚠️ ' : ''}{r.course || 'Round'}</b>
                <span className="muted small">
                  {day(r.date)} · {t.holesPlayed} hole{t.holesPlayed === 1 ? '' : 's'}{t.score ? ` · ${t.score}` : ' · no score'}
                  {r.status === 'live' ? ' · still playing' : ''}{r.event?.tour ? ' · U.S. Kids' : r.kind === 'event' ? ' · tournament' : ''}
                </span>
              </div>
              <ConfirmButton className="btn btn-ghost danger" onConfirm={() => deleteEntry(r.id)}>Delete</ConfirmButton>
            </div>
          )
        })}
      </section>
    </div>
  )
}
