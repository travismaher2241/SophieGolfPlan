import { useState } from 'react'
import { useData } from '../lib/store.jsx'
import { go } from '../App.jsx'
import { ConfirmButton, Segmented } from '../components/ui.jsx'
import { RILEY } from '../data/rivals.js'
import { compareJourneys, parseRounds, roundsText, sophieRounds } from '../lib/compare.js'

const shortCourse = (c = '') => c.replace(/\s+(Public\s+)?Golf.*$/i, '').trim() || c
const one = (v) => (v == null ? '–' : Number.isInteger(v) ? v : v.toFixed(1))

// Two lines by round number: theirs in grey, Sophie's in pink.
function JourneyChart({ mine, theirs, name }) {
  const len = Math.max(mine.length, theirs.length)
  const all = [...mine, ...theirs].map((r) => r.score)
  const lo = Math.floor(Math.min(...all) / 5) * 5
  const hi = Math.ceil(Math.max(...all) / 5) * 5
  const W = 320; const H = 170; const p = { l: 30, r: 10, t: 10, b: 24 }
  const x = (i) => p.l + (len === 1 ? 0 : (i * (W - p.l - p.r)) / (len - 1))
  const y = (v) => p.t + ((hi - v) * (H - p.t - p.b)) / (hi - lo || 1)
  const path = (rs) => rs.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r.score).toFixed(1)}`).join(' ')
  const ticks = []
  for (let t = lo; t <= hi; t += hi - lo > 20 ? 10 : 5) ticks.push(t)
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Sophie and ${name} by round`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={p.l} x2={W - p.r} y1={y(t)} y2={y(t)} className="grid" />
          <text x={p.l - 5} y={y(t) + 4} className="tick" textAnchor="end">{t}</text>
        </g>
      ))}
      <path d={path(theirs)} className="line cmp-them" />
      {theirs.map((r, i) => <circle key={`t${i}`} cx={x(i)} cy={y(r.score)} r={3} className="cmp-them-dot" />)}
      <path d={path(mine)} className="line" />
      {mine.map((r, i) => <circle key={`m${i}`} cx={x(i)} cy={y(r.score)} r={5} className="dot" />)}
      <text x={p.l} y={H - 6} className="tick">Round 1</text>
      <text x={W - p.r} y={H - 6} className="tick" textAnchor="end">Round {len}</text>
    </svg>
  )
}

function Editor({ player, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(player?.name || '')
  const [text, setText] = useState(roundsText(player?.rounds))
  const rounds = parseRounds(text)
  return (
    <section className="card tour-form">
      <h2>{player ? `Edit ${player.name}` : 'Add a player'}</h2>
      <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riley" /></label>
      <label>
        Their tournament rounds, oldest first
        <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder={'One round per line, e.g.\nDorset Golf, Winter 2025, 69\nAlbert Park, Winter 2025, 66\nor just the scores: 69'} />
      </label>
      <p className="muted small">{rounds.length} round{rounds.length === 1 ? '' : 's'} read. The last number on each line is the 9-hole score.</p>
      <button type="button" className="btn btn-primary" disabled={!name.trim() || !rounds.length} onClick={() => onSave({ id: player?.id || `p${Date.now()}`, name: name.trim(), rounds })}>Save</button>
      <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      {player && <ConfirmButton className="btn btn-ghost danger" onConfirm={onDelete}>Remove {player.name}</ConfirmButton>}
    </section>
  )
}

export default function Compare() {
  const { entries, profile, saveProfile } = useData()
  const players = profile.rivals || [RILEY]
  const [sel, setSel] = useState(players[0]?.id || null)
  const [editing, setEditing] = useState(players.length ? null : 'new')
  const mine = sophieRounds(entries)
  const player = players.find((x) => x.id === sel) || players[0]

  const save = (pl) => {
    const next = players.some((x) => x.id === pl.id) ? players.map((x) => (x.id === pl.id ? pl : x)) : [...players, pl]
    saveProfile({ rivals: next }); setSel(pl.id); setEditing(null)
  }
  const remove = (id) => {
    const next = players.filter((x) => x.id !== id)
    saveProfile({ rivals: next }); setSel(next[0]?.id || null); setEditing(next.length ? null : 'new')
  }

  const head = (
    <>
      <button type="button" className="back" onClick={() => go('tour')}>‹ Tournaments</button>
      <h1 className="page-title">Compare journeys</h1>
      <p className="muted small">Grown-ups only. Lines up Sophie’s first tournaments with another girl’s first tournaments, round for round. Riley is loaded already; add anyone else by pasting their rounds.</p>
    </>
  )

  if (editing) {
    return (
      <div className="stack">
        {head}
        <Editor key={editing === 'new' ? 'new' : editing.id} player={editing === 'new' ? null : editing} onSave={save} onCancel={() => setEditing(null)} onDelete={() => remove(editing.id)} />
      </div>
    )
  }

  const c = player && compareJourneys(mine, player.rounds)
  const them = player?.name.split(' ')[0]
  return (
    <div className="stack">
      {head}
      {players.length > 1 && <Segmented options={players.map((x) => ({ value: x.id, label: x.name.split(' ')[0] }))} value={player.id} onChange={setSel} wrap />}
      <div className="cmp-actions">
        <button type="button" className="btn" onClick={() => setEditing(player)}>✏️ Edit {them}</button>
        <button type="button" className="btn" onClick={() => setEditing('new')}>➕ Add a player</button>
      </div>

      {!mine.length && <p className="empty">Add Sophie’s tournaments first.</p>}
      {c && (
        <>
          <section className="card">
            <h2>First {c.n} round{c.n === 1 ? '' : 's'}: Sophie vs {them}</h2>
            <div className="stat-grid three">
              <div><b>{one(c.avg[0])}</b><span>Sophie avg · {them} {one(c.avg[1])}</span></div>
              <div><b>{c.best[0]}</b><span>Sophie best · {them} {c.best[1]}</span></div>
              <div><b>{c.n > 1 ? `−${c.drop[0]}` : '–'}</b><span>Sophie drop · {them} {c.n > 1 ? `${c.drop[1] >= 0 ? '−' : '+'}${Math.abs(c.drop[1])}` : '–'}</span></div>
            </div>
            <ul className="ps-list">
              {c.avg[0] < c.avg[1] && <li>Over their first {c.n} rounds Sophie averaged {one(c.avg[1] - c.avg[0])} shots a round better than {them}.</li>}
              {c.reachedAt && c.reachedAt > c.n && <li>{them} first shot {c.myBest} or better in round {c.reachedAt}. Sophie did it in round {mine.findIndex((r) => r.score === c.myBest) + 1}.</li>}
              {!c.reachedAt && <li>Sophie’s best ({c.myBest}) is lower than any round {them} has entered so far.</li>}
              <li>{them}’s best so far is {c.theirBest}, after {player.rounds.length} rounds.</li>
            </ul>
          </section>

          <section className="card">
            <h2>Round by round</h2>
            <p className="muted small"><span className="cmp-key me" /> Sophie <span className="cmp-key them" /> {them}’s whole journey. Lower is better.</p>
            <JourneyChart mine={mine} theirs={player.rounds} name={them} />
            <table className="letter-table cmp-table">
              <thead><tr><th>#</th><th>Sophie</th><th>{them}</th></tr></thead>
              <tbody>
                {player.rounds.map((r, i) => (
                  <tr key={i} className={i < c.n ? 'on' : ''}>
                    <td>{i + 1}</td>
                    <td>{mine[i] ? <><b>{mine[i].score}</b> <span className="muted small">{shortCourse(mine[i].course)}</span></> : ''}</td>
                    <td><b>{r.score}</b> <span className="muted small">{shortCourse(r.course)}{r.season ? ` · ${r.season}` : ''}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  )
}
