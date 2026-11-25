import { useState } from 'react'
import { useData } from '../lib/store.jsx'
import { CLUBS } from '../lib/shots.js'
import { ConfirmButton, Segmented, Stepper, shortDate } from '../components/ui.jsx'

const BAG = CLUBS.filter((c) => c !== 'Putter')
const round = (n) => Math.round(n)

// Her number for each club: the average of its last 3 saved hits.
export function clubTable(entries) {
  const logs = entries.filter((e) => e.type === 'clubdist')
  return BAG.map((club) => {
    const mine = logs.filter((e) => e.club === club).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    const recent = mine.slice(0, 3)
    const avg = (k) => {
      const xs = recent.map((e) => e[k]).filter((v) => v != null)
      return xs.length ? round(xs.reduce((a, b) => a + b, 0) / xs.length) : null
    }
    return { club, carry: avg('carryM'), total: avg('totalM'), count: mine.length, last: mine[0]?.date || null, logs: mine }
  })
}

export default function Clubs() {
  const { entries, addEntry, deleteEntry } = useData()
  const table = clubTable(entries)
  const [club, setClub] = useState('7i')
  const row = table.find((r) => r.club === club)
  const [carry, setCarry] = useState(row?.carry ?? 80)
  const [total, setTotal] = useState(row?.total ?? 90)
  const [saved, setSaved] = useState(false)

  const pick = (c) => {
    setClub(c)
    const r = table.find((x) => x.club === c)
    if (r?.carry != null) setCarry(r.carry)
    if (r?.total != null) setTotal(r.total)
  }

  const filled = table.filter((r) => r.carry != null)
  return (
    <div className="stack">
      <section className="card">
        <h2>Which club?</h2>
        <Segmented options={BAG} value={club} onChange={pick} size="sm" wrap />
        <h2>Carry</h2>
        <Stepper value={carry} onChange={setCarry} min={0} max={250} steps={[1, 5]} unit="m" />
        <h2>Total (with roll)</h2>
        <Stepper value={total} onChange={setTotal} min={0} max={280} steps={[1, 5]} unit="m" />
        {saved && <div className="banner good">📏 Saved!</div>}
        <button
          type="button"
          className="btn btn-primary btn-xl"
          onClick={async () => {
            await addEntry({ type: 'clubdist', club, carryM: carry, totalM: Math.max(total, carry) })
            setSaved(true); setTimeout(() => setSaved(false), 2000)
          }}
        >
          Save {club}
        </button>
        <p className="muted small">Her number is the average of the last 3 saves for that club, so new clubs settle in as you go.</p>
      </section>

      <section className="card">
        <h2>Her distances</h2>
        {!filled.length && <p className="muted small">Nothing saved yet. Save a few hits per club and the gaps show up here.</p>}
        <table className="club-table">
          <thead><tr><th>Club</th><th>Carry</th><th>Total</th><th>Gap</th><th /></tr></thead>
          <tbody>
            {table.map((r, i) => {
              const next = table.slice(i + 1).find((x) => x.carry != null)
              const gap = r.carry != null && next ? r.carry - next.carry : null
              const flag = gap != null && (gap < 5 ? 'tight' : gap > 20 ? 'wide' : '')
              return (
                <tr key={r.club} className={r.club === club ? 'on' : ''} onClick={() => pick(r.club)}>
                  <td><b>{r.club}</b></td>
                  <td>{r.carry != null ? `${r.carry} m` : '–'}</td>
                  <td>{r.total != null ? `${r.total} m` : '–'}</td>
                  <td className={flag ? `gap-${flag}` : ''}>{gap != null ? `${gap} m` : ''}</td>
                  <td className="muted small">{r.last ? `${shortDate(r.last)} · ${r.count}×` : ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filled.length > 1 && <p className="muted small">Gap is carry to the next club down. Under 5 m (orange) two clubs go about the same distance; over 20 m (blue) there’s a hole in the bag.</p>}
      </section>

      {row?.logs.length > 0 && (
        <section className="card">
          <h2>{club} history</h2>
          <ul className="history">
            {row.logs.slice(0, 10).map((e) => (
              <li key={e.id}>
                <span>{shortDate(e.date)}</span>
                <span>{e.carryM} m carry · {e.totalM ?? '–'} m total</span>
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
