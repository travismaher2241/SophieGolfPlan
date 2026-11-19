import { useMemo, useState } from 'react'
import { useData } from '../lib/store.jsx'
import { QUESTIONS, QUIZ_CATEGORIES, buildQuiz } from '../data/quiz.js'
import { ConfirmButton, LineChart, Segmented, shortDate } from '../components/ui.jsx'

const CAT_LABEL = Object.fromEntries(QUIZ_CATEGORIES.map((c) => [c.id, c.label]))

export function missedCounts(entries) {
  const counts = {}
  for (const e of entries) if (e.type === 'quiz') for (const id of e.missed || []) counts[id] = (counts[id] || 0) + 1
  return counts
}

export default function Quiz() {
  const { entries, addEntry, deleteEntry } = useData()
  const [cat, setCat] = useState('mix')
  const [quiz, setQuiz] = useState(null)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [results, setResults] = useState([])
  const [done, setDone] = useState(false)
  const history = entries.filter((e) => e.type === 'quiz')
  const missed = useMemo(() => missedCounts(entries), [entries])

  const start = () => { setQuiz(buildQuiz(cat)); setI(0); setPicked(null); setResults([]); setDone(false) }

  const choose = (k) => {
    if (picked !== null) return
    setPicked(k)
    setResults((r) => [...r, { id: quiz[i].id, right: k === quiz[i].correct }])
  }

  const next = async () => {
    if (i < quiz.length - 1) { setI(i + 1); setPicked(null); return }
    const score = results.filter((r) => r.right).length
    await addEntry({ type: 'quiz', category: cat, score, total: quiz.length, missed: results.filter((r) => !r.right).map((r) => r.id) })
    setDone(true)
  }

  if (quiz && done) {
    const score = results.filter((r) => r.right).length
    const wrong = quiz.filter((q) => results.find((r) => r.id === q.id && !r.right))
    return (
      <div className="stack">
        <section className={`card result ${score === quiz.length ? 'pass' : ''}`}>
          <div className="result-big">{score === quiz.length ? '🏆 Perfect!' : score >= 8 ? '🎉 Great job!' : '💪 Nice try!'}</div>
          <div className="quiz-score">{score} / {quiz.length}</div>
          <div className="muted">{CAT_LABEL[cat]} quiz saved</div>
        </section>
        {wrong.length > 0 && (
          <section className="card">
            <h2>Ones to remember</h2>
            {wrong.map((q) => (
              <div key={q.id} className="review">
                <div className="review-q">{q.q}</div>
                <div className="review-a">✓ {q.options[q.answer]}</div>
                <div className="muted small">{q.why}</div>
              </div>
            ))}
          </section>
        )}
        <button type="button" className="btn btn-primary btn-xl" onClick={start}>Play again</button>
        <button type="button" className="btn" onClick={() => setQuiz(null)}>Done</button>
      </div>
    )
  }

  if (quiz) {
    const q = quiz[i]
    return (
      <div className="stack">
        <div className="quiz-top">
          <span>{q.cat === 'rules' ? '📘 Rules' : '🤝 Etiquette'}</span>
          <span>Question {i + 1} of {quiz.length}</span>
        </div>
        <div className="quiz-dots">
          {quiz.map((x, k) => {
            const r = results[k]
            return <span key={x.id} className={`qdot ${k === i ? 'on' : ''} ${r ? (r.right ? 'right' : 'wrong') : ''}`} />
          })}
        </div>
        <section className="card">
          <h1 className="quiz-q">{q.q}</h1>
          <div className="answers">
            {q.shown.map((opt, k) => {
              const state = picked === null ? '' : k === q.correct ? 'right' : k === picked ? 'wrong' : 'dim'
              return (
                <button type="button" key={opt} className={`answer ${state}`} onClick={() => choose(k)}>
                  {state === 'right' ? '✓ ' : state === 'wrong' ? '✗ ' : ''}{opt}
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <div className={`banner ${picked === q.correct ? 'good' : ''}`}>
              {picked === q.correct ? '🎉 Correct! ' : '💡 '}{q.why}
            </div>
          )}
        </section>
        {picked !== null && (
          <button type="button" className="btn btn-primary btn-xl" onClick={next}>
            {i < quiz.length - 1 ? 'Next question ›' : 'See my score'}
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => setQuiz(null)}>Stop quiz</button>
      </div>
    )
  }

  const tricky = Object.entries(missed).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, n]) => ({ q: QUESTIONS.find((x) => x.id === id), n })).filter((x) => x.q)

  return (
    <div className="stack">
      <section className="card">
        <h2>Rules & etiquette quiz</h2>
        <p className="muted small">10 questions. Tap the answer you think is right.</p>
        <Segmented options={QUIZ_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))} value={cat} onChange={setCat} />
        <button type="button" className="btn btn-primary btn-xl" onClick={start}>Start quiz</button>
      </section>

      {history.length > 0 && (
        <section className="card">
          <h2>My quiz scores</h2>
          <LineChart points={[...history].reverse().map((e) => ({ x: shortDate(e.date), y: e.score }))} target={10} />
          <ul className="history">
            {history.slice(0, 8).map((e) => (
              <li key={e.id}>
                <span>{shortDate(e.date)}</span>
                <span>{e.score}/{e.total} · {CAT_LABEL[e.category] || ''}</span>
                <span>{e.score === e.total ? '🏆' : ''}</span>
                <ConfirmButton className="x" onConfirm={() => deleteEntry(e.id)}>✕</ConfirmButton>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tricky.length > 0 && (
        <section className="card">
          <h2>Tricky ones</h2>
          {tricky.map(({ q, n }) => (
            <div key={q.id} className="review">
              <div className="review-q">{q.q} <span className="muted small">(missed {n}×)</span></div>
              <div className="review-a">✓ {q.options[q.answer]}</div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
