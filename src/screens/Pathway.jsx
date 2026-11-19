import { useState } from 'react'
import { useData } from '../lib/store.jsx'
import { CHECKPOINTS, LEVELS, formKey, skillKey, getLevel } from '../data/curriculum.js'
import { checkpointStatus, levelStatus, skillStatus } from '../lib/progress.js'
import { ProgressBar, Segmented, shortDate } from '../components/ui.jsx'
import { go } from '../App.jsx'

export default function Pathway({ levelParam }) {
  const { profile, entries, toggleForm } = useData()
  const levelNum = Number(levelParam) || profile.level || 4
  const level = getLevel(levelNum)
  const [open, setOpen] = useState(null)

  return (
    <div className="stack">
      <h1 className="page-title">Player Pathway</h1>
      <Segmented
        options={LEVELS.map((l) => ({
          value: l.level,
          label: `${levelStatus(l.level, profile, entries).mastered ? '★' : ''}L${l.level}`,
        }))}
        value={levelNum}
        onChange={(v) => go(`pathway/${v}`)}
      />
      <p className="muted">{level.blurb} Tap a form when you can say it and show it. Pass every skill test to earn the pin.</p>

      {CHECKPOINTS.map((cp) => {
        const st = checkpointStatus(levelNum, cp.id, profile, entries)
        const isOpen = open === cp.id
        return (
          <section key={cp.id} className={`card cp ${st.earned ? 'earned' : ''}`}>
            <button type="button" className="cp-head" onClick={() => setOpen(isOpen ? null : cp.id)}>
              <span className="cp-emoji" style={st.earned ? { background: level.color } : undefined}>{cp.emoji}</span>
              <span className="cp-main">
                <span className="cp-name">{cp.name}{st.earned ? ' · Pin earned!' : ''}</span>
                <ProgressBar value={st.pct} color={level.color} />
                <span className="cp-sub">
                  {st.formsTotal ? `${st.formsDone}/${st.formsTotal} forms` : ''}
                  {st.formsTotal && st.skillsTotal ? ' · ' : ''}
                  {st.skillsTotal ? `${st.skillsPassed}/${st.skillsTotal} skills` : ''}
                </span>
              </span>
              <span className="chev">{isOpen ? '▴' : '▾'}</span>
            </button>

            {isOpen && level.checkpoints[cp.id].map((sec) => (
              <div key={sec.id} className="section">
                {level.checkpoints[cp.id].length > 1 && <h3>{sec.title}</h3>}
                {sec.forms.length > 0 && (
                  <ul className="forms">
                    {sec.forms.map((f) => {
                      const key = formKey(levelNum, cp.id, sec.id, f.id)
                      const done = profile.forms?.[key]
                      return (
                        <li key={f.id}>
                          <button type="button" className={`form ${done ? 'done' : ''}`} onClick={() => toggleForm(key)}>
                            <span className="check">{done ? '✓' : ''}</span>
                            <span className="form-name">{f.name}</span>
                            {done && <span className="form-date">{shortDate(done)}</span>}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
                {sec.skills.map((sk) => {
                  const key = skillKey(levelNum, cp.id, sec.id, sk.id)
                  const s = skillStatus(sk, key, entries)
                  return (
                    <button type="button" key={sk.id} className={`skill-row ${s.passed ? 'passed' : ''}`} onClick={() => go(`test/${encodeURIComponent(key)}`)}>
                      <span className="skill-main">
                        <span className="skill-name">{s.passed ? '🏅 ' : '🎯 '}{sk.name}</span>
                        <span className="skill-detail">{sk.detail}</span>
                      </span>
                      <span className="skill-badge">{s.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}
