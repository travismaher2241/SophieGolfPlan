import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut } from 'firebase/auth'
import {
  collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc,
} from 'firebase/firestore'
import { auth, db, googleProvider, isConfigured } from './firebase.js'

const LOCAL_KEY = 'sophie-smashes-v1'
const DEFAULT_PROFILE = { level: 4, forms: {}, heightCm: null, courses: [] }

const Ctx = createContext(null)
export const useData = () => useContext(Ctx)

const now = () => new Date().toISOString()
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { profile: DEFAULT_PROFILE, entries: [] }
}
function writeLocal(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)) } catch { /* ignore */ }
}

export function DataProvider({ children }) {
  const [user, setUser] = useState(isConfigured ? undefined : { local: true })
  const [profile, setProfile] = useState(isConfigured ? null : readLocal().profile)
  const [entries, setEntries] = useState(isConfigured ? [] : readLocal().entries)
  const [syncing, setSyncing] = useState(false)

  // Cloud mode: follow sign-in, then live-listen to the profile and entries.
  useEffect(() => {
    if (!isConfigured) return
    return onAuthStateChanged(auth, (u) => setUser(u || null))
  }, [])

  useEffect(() => {
    if (!isConfigured || !user) return
    const base = `users/${user.uid}`
    const unsubProfile = onSnapshot(doc(db, base), (snap) => {
      setProfile({ ...DEFAULT_PROFILE, ...(snap.data() || {}) })
    })
    const unsubEntries = onSnapshot(
      query(collection(db, `${base}/entries`), orderBy('date', 'desc')),
      { includeMetadataChanges: true },
      (snap) => {
        setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setSyncing(snap.metadata.hasPendingWrites)
      },
    )
    return () => { unsubProfile(); unsubEntries() }
  }, [user])

  // Local mode keeps everything in this browser.
  useEffect(() => {
    if (!isConfigured) writeLocal({ profile, entries })
  }, [profile, entries])

  const saveProfile = useCallback(async (patch) => {
    setProfile((p) => ({ ...p, ...patch }))
    if (isConfigured && user) await setDoc(doc(db, `users/${user.uid}`), patch, { merge: true })
  }, [user])

  const toggleForm = useCallback((key) => {
    const forms = { ...(profile?.forms || {}) }
    if (forms[key]) delete forms[key]
    else forms[key] = now()
    setProfile((p) => ({ ...p, forms }))
    if (isConfigured && user) setDoc(doc(db, `users/${user.uid}`), { forms }, { mergeFields: ['forms'] })
  }, [user, profile])

  const addEntry = useCallback(async (entry) => {
    const data = { date: now(), ...entry }
    if (isConfigured && user) {
      // Don't await: with the offline cache the write lands locally at once.
      const ref = doc(collection(db, `users/${user.uid}/entries`))
      setDoc(ref, data)
      return ref.id
    }
    const id = uid()
    setEntries((es) => [{ id, ...data }, ...es])
    return id
  }, [user])

  const updateEntry = useCallback(async (id, patch) => {
    if (isConfigured && user) {
      updateDoc(doc(db, `users/${user.uid}/entries/${id}`), patch)
      return
    }
    setEntries((es) => es.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }, [user])

  const deleteEntry = useCallback(async (id) => {
    if (isConfigured && user) {
      deleteDoc(doc(db, `users/${user.uid}/entries/${id}`))
      return
    }
    setEntries((es) => es.filter((e) => e.id !== id))
  }, [user])

  const signIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider)
      } else {
        throw err
      }
    }
  }, [])

  const signOut = useCallback(() => fbSignOut(auth), [])

  const value = useMemo(() => ({
    user, profile, entries, syncing, cloud: isConfigured,
    saveProfile, toggleForm, addEntry, updateEntry, deleteEntry, signIn, signOut,
  }), [user, profile, entries, syncing, saveProfile, toggleForm, addEntry, updateEntry, deleteEntry, signIn, signOut])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
