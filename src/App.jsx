import { useEffect, useState } from 'react'
import { useData } from './lib/store.jsx'
import Home from './screens/Home.jsx'
import Pathway from './screens/Pathway.jsx'
import SkillTest from './screens/SkillTest.jsx'
import Round from './screens/Round.jsx'
import Practice from './screens/Practice.jsx'
import Progress from './screens/Progress.jsx'
import Settings from './screens/Settings.jsx'
import SignIn from './screens/SignIn.jsx'
import Tournament from './screens/Tournament.jsx'
import Letter from './screens/Letter.jsx'
import Compare from './screens/Compare.jsx'
import ManageRounds from './screens/ManageRounds.jsx'
import FiveMinutes from './screens/FiveMinutes.jsx'

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'pathway', label: 'Pathway', icon: '📍' },
  { id: 'round', label: 'Round', icon: '⛳' },
  { id: 'tour', label: 'Tour', icon: '🏆' },
  { id: 'practice', label: 'Practice', icon: '🎯' },
  { id: 'progress', label: 'Progress', icon: '📈' },
]

function useRoute() {
  const read = () => (window.location.hash.replace(/^#\/?/, '') || 'home').split('/')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const go = (path) => { window.location.hash = `#/${path}` }

export default function App() {
  const { user, profile, syncing, cloud } = useData()
  const [page, ...rest] = useRoute()

  if (user === undefined || (user && !profile)) {
    return <div className="splash"><img src="/logo.png" alt="Sophie Smashes" /></div>
  }
  if (cloud && !user) return <SignIn />

  let screen
  switch (page) {
    case 'pathway': screen = <Pathway levelParam={rest[0]} />; break
    case 'test': screen = <SkillTest key={rest[0]} skillKey={decodeURIComponent(rest[0] || '')} />; break
    case 'round': screen = <Round />; break
    case 'practice': screen = <Practice tab={rest[0]} />; break
    case 'progress': screen = <Progress />; break
    case 'settings': screen = <Settings />; break
    case 'five': screen = <FiveMinutes />; break
    case 'rounds': screen = <ManageRounds />; break
    case 'tour': screen = rest[0] === 'letter' ? <Letter /> : rest[0] === 'compare' ? <Compare /> : <Tournament />; break
    default: screen = <Home />
  }

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => go('home')}>
          <img src="/logo.png" alt="" />
          <span>Sophie Smashes</span>
        </button>
        <div className="topbar-right">
          {cloud && <span className={`sync ${syncing ? 'pending' : ''}`} title={syncing ? 'Saving…' : 'Saved'}>{syncing ? '⏳' : '☁️'}</span>}
          <button type="button" className="icon-btn" onClick={() => go('settings')} aria-label="Settings">⚙️</button>
        </div>
      </header>
      <main className="main">{screen}</main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`tab ${page === t.id || (t.id === 'practice' && page === 'test') || (t.id === 'home' && !TABS.some((x) => x.id === page) && page !== 'test' && page !== 'settings') ? 'on' : ''}`}
            onClick={() => go(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
