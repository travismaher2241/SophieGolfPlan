import { useState } from 'react'
import { useData } from '../lib/store.jsx'

export default function SignIn() {
  const { signIn } = useData()
  const [err, setErr] = useState(null)
  return (
    <div className="signin">
      <img className="signin-logo" src="/logo.png" alt="Sophie Smashes" />
      <p className="signin-sub">Track every putt, chip, swing and pin.</p>
      <button type="button" className="btn btn-primary btn-xl" onClick={() => signIn().catch((e) => setErr(e.message))}>
        Sign in with Google
      </button>
      <p className="hint">Use the same family Google account on every phone so everything stays in one place.</p>
      {err && <p className="error">{err}</p>}
    </div>
  )
}
