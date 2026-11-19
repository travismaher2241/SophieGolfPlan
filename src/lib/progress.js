import { CHECKPOINTS, LEVELS, formKey, skillKey } from '../data/curriculum.js'
import { roundTotals } from './stats.js'

export const skillEntries = (entries, key) =>
  entries.filter((e) => e.type === 'skill' && e.key === key).sort((a, b) => a.date.localeCompare(b.date))

// How a single skill test stands right now.
export function skillStatus(skill, key, entries) {
  const tries = skillEntries(entries, key)
  if (skill.type === 'holes') {
    const good = tries.flatMap((t) => t.scores || []).filter((s) => s <= skill.target).length
    return { tries: tries.length, count: good, passed: good >= skill.times, label: `${Math.min(good, skill.times)} of ${skill.times}` }
  }
  if (skill.type === 'nine') {
    const fromTests = tries.filter((t) => t.total <= skill.target).length
    const fromRounds = entries.filter((e) => e.type === 'round' && e.status === 'done').filter((r) => {
      const t = roundTotals(r)
      return t.holesPlayed === 9 && t.score <= skill.target
    }).length
    const good = fromTests + fromRounds
    return { tries: tries.length, count: good, passed: good >= skill.times, label: `${Math.min(good, skill.times)} of ${skill.times}` }
  }
  const passed = tries.some((t) => t.passed)
  const last = tries[tries.length - 1]
  return { tries: tries.length, passed, last, label: passed ? 'Passed' : tries.length ? 'Keep going' : 'Not tried' }
}

export function checkpointStatus(levelNum, cpId, profile, entries) {
  const level = LEVELS.find((l) => l.level === levelNum)
  const sections = level.checkpoints[cpId]
  let formsDone = 0; let formsTotal = 0; let skillsPassed = 0; let skillsTotal = 0
  for (const sec of sections) {
    for (const f of sec.forms) {
      formsTotal++
      if (profile.forms?.[formKey(levelNum, cpId, sec.id, f.id)]) formsDone++
    }
    for (const sk of sec.skills) {
      skillsTotal++
      if (skillStatus(sk, skillKey(levelNum, cpId, sec.id, sk.id), entries).passed) skillsPassed++
    }
  }
  const total = formsTotal + skillsTotal
  const done = formsDone + skillsPassed
  return { formsDone, formsTotal, skillsPassed, skillsTotal, pct: total ? done / total : 0, earned: total > 0 && done === total }
}

export function levelStatus(levelNum, profile, entries) {
  const cps = CHECKPOINTS.map((cp) => ({ ...cp, ...checkpointStatus(levelNum, cp.id, profile, entries) }))
  return { cps, pins: cps.filter((c) => c.earned).length, mastered: cps.every((c) => c.earned) }
}
