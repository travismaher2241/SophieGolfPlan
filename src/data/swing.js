// From the U.S. Kids Golf "Player Swing Speed Development" sheet (Swing Consultation).
// Girls' driver club speed (mph) by player height, at each percentile.
// The sheet's height bands are in inches (48"–66"); the app works in cm.
export const PERCENTILES = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]

export const GIRLS_SPEED_BY_HEIGHT = {
  48: [33, 36, 39, 42, 45, 48, 51, 54, 57, 60],
  51: [38, 41, 44, 47, 50, 53, 56, 59, 62, 65],
  54: [43, 46, 49, 52, 55, 58, 61, 64, 67, 70],
  57: [48, 51, 54, 57, 60, 63, 66, 69, 72, 75],
  60: [53, 56, 59, 62, 65, 68, 71, 74, 77, 80],
  63: [58, 61, 64, 67, 70, 73, 76, 79, 82, 85],
  66: [63, 66, 69, 72, 75, 78, 81, 84, 87, 90],
}

// Recommended U.S. Kids driver line by height band and club speed.
const DRIVER_RECS = {
  48: [{ max: 50, name: 'UL' }, { name: 'TS / ep' }],
  51: [{ max: 55, name: 'UL' }, { name: 'TS / ep' }],
  54: [{ max: 60, name: 'UL' }, { name: 'TS / ep' }],
  57: [{ max: 65, name: 'UL' }, { name: 'TS / ep' }],
  60: [{ max: 70, name: 'UL' }, { name: 'TS / ep' }],
  63: [{ max: 75, name: 'UL' }, { name: 'TS' }],
  66: [{ name: 'TS' }],
}

export const HEIGHT_BANDS = Object.keys(GIRLS_SPEED_BY_HEIGHT).map(Number)

export const CM_PER_IN = 2.54
export const bandCm = (band) => Math.round(band * CM_PER_IN)

// Sophie's height in cm (older saves stored inches).
export const heightCmOf = (profile) => profile?.heightCm || (profile?.heightIn ? Math.round(profile.heightIn * CM_PER_IN) : null)

export function bandFor(heightCm) {
  if (!heightCm) return null
  const heightIn = heightCm / CM_PER_IN
  let band = HEIGHT_BANDS[0]
  for (const h of HEIGHT_BANDS) if (heightIn >= h - 1) band = h
  return band
}

export function percentileFor(speed, heightCm) {
  const band = bandFor(heightCm)
  if (!band || !speed) return null
  const row = GIRLS_SPEED_BY_HEIGHT[band]
  if (speed < row[0]) return '<5'
  let p = 5
  row.forEach((s, i) => { if (speed >= s) p = PERCENTILES[i] })
  return p
}

export function driverRecFor(speed, heightCm) {
  const band = bandFor(heightCm)
  if (!band || !speed) return null
  for (const r of DRIVER_RECS[band]) if (r.max == null || speed < r.max) return r.name
  return null
}

// Optimised launch and spin by driver speed (0° attack angle).
export const OPTIMAL = [
  [45, 17.9, 1918], [50, 17.2, 2007], [55, 16.6, 2084], [60, 15.9, 2151], [65, 15.2, 2207],
  [70, 14.6, 2253], [75, 14.0, 2278], [80, 13.4, 2321], [85, 12.6, 2329], [90, 11.9, 2327],
  [95, 11.2, 2313], [100, 10.6, 2318],
]

export function optimalFor(speed) {
  if (!speed) return null
  let best = OPTIMAL[0]
  for (const row of OPTIMAL) if (Math.abs(row[0] - speed) < Math.abs(best[0] - speed)) best = row
  return { speed: best[0], launch: best[1], spin: best[2] }
}

// Next speed target: the speed at the next percentile up for her height.
export function nextTarget(speed, heightCm) {
  const band = bandFor(heightCm)
  if (!band) return null
  const row = GIRLS_SPEED_BY_HEIGHT[band]
  const next = row.find((s) => s > (speed || 0))
  return next ? { speed: next, pct: PERCENTILES[row.indexOf(next)] } : null
}
