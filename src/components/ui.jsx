import { useState } from 'react'

export function Segmented({ options, value, onChange, size = 'md', wrap = false }) {
  return (
    <div className={`seg seg-${size} ${wrap ? 'seg-wrap' : ''}`} role="radiogroup">
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o
        const label = typeof o === 'object' ? o.label : o
        const active = Array.isArray(value) ? value.includes(v) : value === v
        return (
          <button
            key={String(v)}
            type="button"
            role="radio"
            aria-checked={active}
            className={`seg-btn ${active ? 'on' : ''} ${o.tone ? `tone-${o.tone}` : ''}`}
            onClick={() => onChange(v)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function Stepper({ value, onChange, min = 0, max = 999, steps = [1], unit = '' }) {
  const set = (v) => onChange(Math.max(min, Math.min(max, v)))
  const big = steps[steps.length - 1]
  return (
    <div className="stepper">
      {steps.length > 1 && <button type="button" className="step-btn small" onClick={() => set(value - big)}>−{big}</button>}
      <button type="button" className="step-btn" onClick={() => set(value - steps[0])} aria-label="less">−</button>
      <div className="step-val">{value}<span className="unit">{unit}</span></div>
      <button type="button" className="step-btn" onClick={() => set(value + steps[0])} aria-label="more">+</button>
      {steps.length > 1 && <button type="button" className="step-btn small" onClick={() => set(value + big)}>+{big}</button>}
    </div>
  )
}

// A tile you tap to cycle through values (blank → 1 → 2 → … → blank).
export function CycleTile({ value, values, onChange, label }) {
  const next = () => {
    const i = values.indexOf(value)
    onChange(i === -1 ? values[0] : i === values.length - 1 ? null : values[i + 1])
  }
  const display = value === true ? '✓' : value === false ? '✗' : value ?? '·'
  const tone = value === true ? 'yes' : value === false ? 'no' : value != null ? 'set' : ''
  return (
    <button type="button" className={`cycle ${tone}`} onClick={next}>
      <span className="cycle-val">{display}</span>
      {label && <span className="cycle-label">{label}</span>}
    </button>
  )
}

export function ProgressBar({ value, color }) {
  return (
    <div className="bar"><div className="bar-fill" style={{ width: `${Math.round(value * 100)}%`, background: color }} /></div>
  )
}

export function Pin({ earned, emoji, label, color }) {
  return (
    <div className={`pin ${earned ? 'earned' : ''}`} title={label}>
      <div className="pin-dot" style={earned ? { background: color } : undefined}>{emoji}</div>
      <div className="pin-label">{label}</div>
    </div>
  )
}

export function ConfirmButton({ children, onConfirm, className = '' }) {
  const [armed, setArmed] = useState(false)
  return (
    <button
      type="button"
      className={`${className} ${armed ? 'armed' : ''}`}
      onClick={() => (armed ? onConfirm() : (setArmed(true), setTimeout(() => setArmed(false), 3000)))}
    >
      {armed ? 'Tap again' : children}
    </button>
  )
}

// Small line chart. points: [{x: label, y: number}]. Lower-is-better shading optional.
export function LineChart({ points, target, height = 140, yLabel, lowerIsBetter = false, format = (v) => v }) {
  if (!points.length) return <div className="empty">Nothing logged yet</div>
  const W = 320; const H = height; const pad = { l: 34, r: 12, t: 12, b: 22 }
  const ys = points.map((p) => p.y).concat(target != null ? [target] : [])
  let lo = Math.min(...ys); let hi = Math.max(...ys)
  if (lo === hi) { lo -= 1; hi += 1 }
  const span = hi - lo; lo -= span * 0.15; hi += span * 0.15; if (ys.every((v) => v >= 0)) lo = Math.max(lo, Math.min(...ys) === 0 ? -0.5 : 0)
  const x = (i) => pad.l + (points.length === 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (points.length - 1))
  const y = (v) => pad.t + ((hi - v) * (H - pad.t - pad.b)) / (hi - lo)
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ')
  // Whole-number ticks at a tidy step so labels never repeat.
  const raw = (hi - lo) / 3
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1)))
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) || 10 * mag)
  const ticks = []
  for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) ticks.push(t)
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={yLabel}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
          <text x={pad.l - 6} y={y(t) + 4} className="tick" textAnchor="end">{format(Math.round(t))}</text>
        </g>
      ))}
      {target != null && (
        <g>
          <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} className="target" />
          <text x={W - pad.r} y={y(target) - 4} className="target-label" textAnchor="end">goal {format(target)}</text>
        </g>
      )}
      <path d={path} className="line" />
      {points.map((p, i) => {
        const good = target == null ? null : lowerIsBetter ? p.y <= target : p.y >= target
        return <circle key={i} cx={x(i)} cy={y(p.y)} r={4.5} className={`dot ${good ? 'good' : ''}`} />
      })}
      <text x={pad.l} y={H - 5} className="tick">{points[0].x}</text>
      {points.length > 1 && <text x={W - pad.r} y={H - 5} className="tick" textAnchor="end">{points[points.length - 1].x}</text>}
    </svg>
  )
}

export const shortDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
