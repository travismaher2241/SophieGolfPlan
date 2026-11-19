import { useData } from '../lib/store.jsx'
import { getLevel } from '../data/curriculum.js'
import { levelStatus } from '../lib/progress.js'
import { roundTotals } from '../lib/stats.js'
import { Pin, shortDate } from '../components/ui.jsx'
import { go } from '../App.jsx'

function weekMinutes(entries) {
  const since = Date.now() - 7 * 864e5
  return entries.filter((e) => e.type === 'practice' && new Date(e.date).getTime() >= since)
    .reduce((a, e) => a + (e.minutes || 0), 0)
}

export default function Home() {
  const { profile, entries } = useData()
  const level = getLevel(profile.level) || getLevel(4)
  const status = levelStatus(level.level, profile, entries)
  const live = entries.find((e) => e.type === 'round' && e.status === 'live')
  const lastRound = entries.find((e) => e.type === 'round' && e.status === 'done')
  const lastSpeed = entries.find((e) => e.type === 'swing')
  const mins = weekMinutes(entries)
  const lastTotals = lastRound && roundTotals(lastRound)

  return (
    <div className="stack">
      <section className="hero">
        <img className="hero-logo" src="/logo.png" alt="Sophie Smashes" />
        <div className="hero-level" style={{ background: level.color }}>Level {level.level}</div>
        <p className="hero-blurb">{level.blurb}</p>
        <div className="pins">
          {status.cps.map((cp) => (
            <Pin key={cp.id} earned={cp.earned} emoji={cp.emoji} label={cp.name} color={level.color} />
          ))}
        </div>
        <div className="hero-count">{status.pins} of 5 pins{status.mastered ? ' · Mastered! 🎉' : ''}</div>
      </section>

      {live && (
        <button type="button" className="btn btn-primary btn-xl" onClick={() => go('round')}>
          ⛳ Back to my round
        </button>
      )}

      <section className="quick">
        {!live && <button type="button" className="quick-btn" onClick={() => go('round')}><span>⛳</span>Play a round</button>}
        <button type="button" className="quick-btn" onClick={() => go('practice/tests')}><span>🎯</span>Skills test</button>
        <button type="button" className="quick-btn" onClick={() => go('practice/log')}><span>⏱️</span>Log practice</button>
        <button type="button" className="quick-btn" onClick={() => go('practice/speed')}><span>💨</span>Swing speed</button>
        <button type="button" className="quick-btn" onClick={() => go(`pathway/${level.level}`)}><span>✅</span>My forms</button>
      </section>

      <section className="tiles">
        <div className="tile">
          <div className="tile-num">{mins}</div>
          <div className="tile-label">practice minutes this week</div>
        </div>
        <div className="tile">
          <div className="tile-num">{lastSpeed ? lastSpeed.speed : '–'}</div>
          <div className="tile-label">driver mph{lastSpeed ? ` · ${shortDate(lastSpeed.date)}` : ''}</div>
        </div>
        <div className="tile">
          <div className="tile-num">{lastTotals ? lastTotals.score : '–'}</div>
          <div className="tile-label">{lastTotals ? `last ${lastTotals.holesPlayed} holes · ${lastTotals.putts ?? '–'} putts` : 'no rounds yet'}</div>
        </div>
      </section>
    </div>
  )
}
