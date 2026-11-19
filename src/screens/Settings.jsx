import { useState } from 'react'
import { useData } from '../lib/store.jsx'
import { LEVELS } from '../data/curriculum.js'
import { Segmented, Stepper } from '../components/ui.jsx'

export default function Settings() {
  const { profile, saveProfile, user, cloud, signOut, entries } = useData()
  const [course, setCourse] = useState('')
  const [h, setH] = useState(profile.heightIn || 54)

  const addCourse = () => {
    const name = course.trim()
    if (!name) return
    saveProfile({ courses: [...new Set([...(profile.courses || []), name])] })
    setCourse('')
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ profile, entries }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sophie-smashes-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  return (
    <div className="stack">
      <h1 className="page-title">Settings</h1>
      <section className="card">
        <h2>Current level</h2>
        <Segmented options={LEVELS.map((l) => ({ value: l.level, label: `Level ${l.level}` }))} value={profile.level} onChange={(level) => saveProfile({ level })} wrap />
        <h2>Height in shoes</h2>
        <Stepper value={h} onChange={setH} min={40} max={72} unit="in" />
        <button type="button" className="btn" disabled={h === profile.heightIn} onClick={() => saveProfile({ heightIn: h })}>Save height</button>
      </section>

      <section className="card">
        <h2>Courses (for grown-ups)</h2>
        <p className="muted small">Add course names once here, then Sophie just taps them when starting a round.</p>
        <div className="inline-form">
          <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course name" onKeyDown={(e) => e.key === 'Enter' && addCourse()} />
          <button type="button" className="btn btn-primary" onClick={addCourse}>Add</button>
        </div>
        <div className="chips">
          {(profile.courses || []).map((c) => (
            <button type="button" key={c} className="chip" onClick={() => saveProfile({ courses: profile.courses.filter((x) => x !== c) })}>{c} ✕</button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Account</h2>
        {cloud ? (
          <>
            <p className="muted small">Signed in as {user?.displayName || user?.email}. Everything saves to Firebase and syncs across phones on this account.</p>
            <button type="button" className="btn" onClick={signOut}>Sign out</button>
          </>
        ) : (
          <p className="muted small">Firebase isn’t set up yet, so data is saved on this device only.</p>
        )}
        <button type="button" className="btn" onClick={exportData}>Download a backup</button>
      </section>
    </div>
  )
}
