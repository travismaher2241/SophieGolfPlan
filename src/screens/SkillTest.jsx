import { useMemo, useState } from 'react'
import { useData } from '../lib/store.jsx'
import { findSkill, CHECKPOINTS } from '../data/curriculum.js'
import { skillEntries, skillStatus } from '../lib/progress.js'
import { ConfirmButton, CycleTile, LineChart, Stepper, shortDate } from '../components/ui.jsx'
import { go } from '../App.jsx'

const STROKES = [1, 2, 3, 4, 5, 6]
const CHIP_STROKES = [2, 3, 4, 5, 6, 7]

function initial(skill) {
  switch (skill.type) {
    case 'makes': return Array(skill.attempts).fill(null)
    case 'strokes': return Array(skill.balls).fill(null)
    case 'grid': return Array(skill.rounds).fill(0).map(() => Array(skill.stations.length).fill(null))
    case 'chipout': return Array(skill.stations.length).fill(null)
    case 'holes': return []
    case 'nine': return skill.target
    default: return null
  }
}

const sum = (xs) => xs.reduce((a, b) => a + (b || 0), 0)

function evaluate(skill, v) {
  switch (skill.type) {
    case 'makes': {
      const made = v.filter((x) => x === true).length
      const complete = v.every((x) => x !== null)
      return { made, complete, passed: made >= skill.need, summary: `${made} of ${skill.attempts}` }
    }
    case 'strokes':
    case 'chipout': {
      const total = sum(v)
      const complete = v.every((x) => x !== null)
      return { total, complete, passed: complete && total <= skill.max, summary: `${total} strokes` }
    }
    case 'grid': {
      const flat = v.flat()
      const total = sum(flat)
      const complete = flat.every((x) => x !== null)
      return { total, complete, passed: complete && total <= skill.max, summary: `${total} strokes` }
    }
    case 'holes': {
      const good = v.filter((s) => s <= skill.target).length
      return { complete: v.length > 0, good, passed: null, summary: `${good} of ${v.length} at ${skill.target} or less` }
    }
    case 'nine':
      return { total: v, complete: true, passed: v <= skill.target, summary: `${v} for 9 holes` }
    default: return {}
  }
}

export default function SkillTest({ skillKey }) {
  const { entries, addEntry, deleteEntry } = useData()
  const found = findSkill(skillKey)
  const [vals, setVals] = useState(() => (found ? initial(found.skill) : null))
  const [saved, setSaved] = useState(null)
  const history = useMemo(() => skillEntries(entries, skillKey), [entries, skillKey])

  if (!found) return <div className="stack"><p>That test wasn’t found.</p><button type="button" className="btn" onClick={() => go('practice/tests')}>Back</button></div>
  const { level, cpId, section, skill } = found
  const cp = CHECKPOINTS.find((c) => c.id === cpId)
  const res = evaluate(skill, vals)
  const status = skillStatus(skill, skillKey, entries)

  const save = async () => {
    const entry = {
      type: 'skill', key: skillKey, level: level.level, name: skill.name, kind: skill.type,
      passed: res.passed ?? false, summary: res.summary,
    }
    if (res.made != null) entry.made = res.made
    if (res.total != null) entry.total = res.total
    if (skill.type === 'holes') entry.scores = vals
    else if (skill.type === 'grid') entry.values = vals.map((r) => r.join(','))
    else if (skill.type !== 'nine') entry.values = vals
    await addEntry(entry)
    setSaved({ ...res })
    setVals(initial(skill))
  }

  const setAt = (i, v) => setVals((xs) => xs.map((x, j) => (j === i ? v : x)))

  const chartPoints = history
    .filter((h) => (skill.type === 'makes' ? h.made != null : h.total != null))
    .map((h) => ({ x: shortDate(h.date), y: skill.type === 'makes' ? h.made : h.total }))

  return (
    <div className="stack">
      <button type="button" className="back" onClick={() => go(`pathway/${level.level}`)}>‹ Level {level.level} {cp.name}</button>
      <section className="card">
        <div className="eyebrow">Level {level.level} · {section.title}</div>
        <h1 className="page-title">{skill.name}</h1>
        <p className="muted">{skill.detail}</p>
        {status.passed && <div className="banner good">🏅 Already passed. Keep it sharp!</div>}
        {skill.type === 'holes' && <div className="banner">{status.label} done so far</div>}
      </section>

      {saved && (
        <section className={`card result ${saved.passed ? 'pass' : ''}`}>
          <div className="result-big">{saved.passed ? '🎉 Passed!' : saved.passed === false ? '💪 Saved. Try again soon!' : '✅ Saved'}</div>
          <div className="muted">{saved.summary}</div>
        </section>
      )}

      <section className="card">
        {skill.type === 'makes' && (
          <>
            <p className="instr">Tap each ball: once for ✓ made, twice for ✗ missed.</p>
            <div className="tiles-row">
              {vals.map((v, i) => (
                <CycleTile key={i} value={v} values={[true, false]} label={`Ball ${i + 1}`} onChange={(nv) => setAt(i, nv)} />
              ))}
            </div>
            <div className={`score-line ${res.passed ? 'good' : ''}`}>{res.made} made · need {skill.need}</div>
          </>
        )}

        {skill.type === 'strokes' && (
          <>
            <p className="instr">Tap each ball to count its strokes until it’s in the hole.</p>
            <div className="tiles-row">
              {vals.map((v, i) => (
                <CycleTile key={i} value={v} values={STROKES} label={`Ball ${i + 1}`} onChange={(nv) => setAt(i, nv)} />
              ))}
            </div>
            <div className={`score-line ${res.passed ? 'good' : ''}`}>{res.total} strokes · goal {skill.max} or less</div>
          </>
        )}

        {skill.type === 'chipout' && (
          <>
            <p className="instr">Tap each station to count strokes: the chip plus every putt.</p>
            <div className="tiles-row">
              {vals.map((v, i) => (
                <CycleTile key={i} value={v} values={CHIP_STROKES} label={skill.stations[i]} onChange={(nv) => setAt(i, nv)} />
              ))}
            </div>
            <div className={`score-line ${res.passed ? 'good' : ''}`}>{res.total} strokes · goal {skill.max} or less</div>
          </>
        )}

        {skill.type === 'grid' && (
          <>
            <p className="instr">Tap each box to count strokes to hole out.</p>
            <div className="grid-test">
              <div />
              {skill.stations.map((s) => <div key={s} className="grid-h">{s}</div>)}
              {vals.map((row, r) => (
                <div key={r} className="grid-row">
                  <div className="grid-r">R{r + 1}</div>
                  {row.map((v, c) => (
                    <CycleTile
                      key={c}
                      value={v}
                      values={STROKES}
                      onChange={(nv) => setVals((g) => g.map((rr, ri) => (ri === r ? rr.map((x, ci) => (ci === c ? nv : x)) : rr)))}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className={`score-line ${res.passed ? 'good' : ''}`}>{res.total} strokes · goal {skill.max} or less</div>
          </>
        )}

        {skill.type === 'holes' && (
          <>
            <p className="instr">Play the {skill.yards}-yard hole, then tap your score. Tap a score below to remove it.</p>
            <div className="num-pad">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button type="button" key={n} className={`num ${n <= skill.target ? 'good' : ''}`} onClick={() => setVals((xs) => [...xs, n])}>{n}</button>
              ))}
            </div>
            <div className="chips">
              {vals.map((s, i) => (
                <button type="button" key={i} className={`chip ${s <= skill.target ? 'good' : ''}`} onClick={() => setVals((xs) => xs.filter((_, j) => j !== i))}>{s} ✕</button>
              ))}
            </div>
            <div className="score-line">{res.summary}</div>
          </>
        )}

        {skill.type === 'nine' && (
          <>
            <p className="instr">Tap to set the 9-hole score. Rounds you log in the Round tab count too.</p>
            <Stepper value={vals} onChange={setVals} min={27} max={120} steps={[1, 5]} />
            <div className={`score-line ${res.passed ? 'good' : ''}`}>goal {skill.target} or less</div>
          </>
        )}

        <button type="button" className="btn btn-primary btn-xl" disabled={!res.complete} onClick={save}>
          {res.complete ? 'Save this test' : 'Fill in every ball to save'}
        </button>
      </section>

      {chartPoints.length > 0 && (
        <section className="card">
          <h2>My history</h2>
          <LineChart
            points={chartPoints}
            target={skill.type === 'makes' ? skill.need : skill.max ?? skill.target}
            lowerIsBetter={skill.type !== 'makes'}
          />
        </section>
      )}

      {history.length > 0 && (
        <section className="card">
          <h2>Past tries</h2>
          <ul className="history">
            {[...history].reverse().slice(0, 12).map((h) => (
              <li key={h.id}>
                <span>{shortDate(h.date)}</span>
                <span>{h.summary}</span>
                <span>{h.passed ? '🏅' : ''}</span>
                <ConfirmButton className="x" onConfirm={() => deleteEntry(h.id)}>✕</ConfirmButton>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
