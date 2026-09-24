import { useEffect, useMemo, useRef, useState } from 'react'
import { TIER_COLOR, pct } from '../utils/format.js'

const SLIDERS = [
  { key: 'monthly_charges', label: 'Monthly Charges', min: 18, max: 120, step: 0.5, fmt: (v) => `$${v.toFixed(2)}` },
  { key: 'tenure_months', label: 'Tenure (Months)', min: 0, max: 72, step: 1, fmt: (v) => `${Math.round(v)} mo` },
]

const SELECTS = [
  { key: 'contract', label: 'Contract Term', options: ['Month-to-month', 'One year', 'Two year'] },
  { key: 'internet_service', label: 'Internet Service', options: ['DSL', 'Fiber optic', 'No'] },
]

const TOGGLES = [
  { key: 'tech_support', label: 'Tech Support' },
  { key: 'online_security', label: 'Online Security' },
  { key: 'online_backup', label: 'Online Backup' },
]

function Slider({ def, value, onChange }) {
  const fill = ((value - def.min) / (def.max - def.min)) * 100
  return (
    <div className="ctl">
      <label>
        <span>{def.label}</span>
        <span className="val">{def.fmt(value)}</span>
      </label>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        style={{ '--fill': `${fill}%` }}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}

export default function WhatIfSimulator({ detail, baseProb, baseRisk, runSimulation, sim, simBusy }) {
  const [values, setValues] = useState({})
  const timer = useRef()

  useEffect(() => {
    if (!detail?.raw_features) return
    const rf = detail.raw_features
    setValues({
      monthly_charges: rf.monthly_charges,
      tenure_months: rf.tenure_months,
      contract: rf.contract,
      internet_service: rf.internet_service,
      tech_support: rf.tech_support,
      online_security: rf.online_security,
      online_backup: rf.online_backup,
    })
  }, [detail?.account_id]) // eslint-disable-line react-hooks/exhaustive-deps

  const overrides = useMemo(() => {
    if (!detail?.raw_features) return {}
    const rf = detail.raw_features
    const out = {}
    for (const [k, v] of Object.entries(values)) {
      const orig = rf[k]
      const changed = typeof v === 'number' ? Math.abs(v - orig) > 1e-9 : v !== orig
      if (changed) out[k] = v
    }
    return out
  }, [values, detail])

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => runSimulation(overrides), 350)
    return () => clearTimeout(timer.current)
  }, [overrides, runSimulation])

  const set = (k) => (v) => setValues((s) => ({ ...s, [k]: v }))
  const reset = () => {
    if (!detail?.raw_features) return
    const rf = detail.raw_features
    setValues(Object.fromEntries(Object.keys(values).map((k) => [k, rf[k]])))
  }

  const shown = sim ? sim.simulated_probability : baseProb
  const shownTier = sim ? sim.new_risk_level : baseRisk
  const shownColor = TIER_COLOR[shownTier]
  const active = !!sim && Object.keys(sim.overrides).length > 0

  return (
    <div className="sim-grid">
      <div className="sim-controls">
        {SELECTS.map((s) => (
          <div className="ctl" key={s.key}>
            <label>
              <span>{s.label}</span>
            </label>
            <select value={values[s.key] ?? ''} onChange={(e) => set(s.key)(e.target.value)}>
              {s.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}
        {SLIDERS.map((s) => (
          <Slider key={s.key} def={s} value={values[s.key] ?? s.min} onChange={set(s.key)} />
        ))}
        {TOGGLES.map((t) => (
          <div className="switch-row" key={t.key}>
            <span>{t.label}</span>
            <button
              type="button"
              className={`switch ${(values[t.key] ?? 'No') === 'Yes' ? 'on' : ''}`}
              aria-label={`${t.label} toggle`}
              onClick={() => set(t.key)(values[t.key] === 'Yes' ? 'No' : 'Yes')}
            />
          </div>
        ))}
      </div>

      <div className="sim-out">
        <div className="sim-probs">
          <div className="sim-prob">
            <div className="cap">Original</div>
            <div className="pv" style={{ color: TIER_COLOR[baseRisk] || 'var(--text)' }}>
              {baseProb != null ? pct(baseProb) : '—'}
            </div>
          </div>
          <div className="sim-arrow">{simBusy ? '···' : '→'}</div>
          <div className="sim-prob">
            <div className="cap" style={{ color: active ? 'var(--accent)' : undefined }}>
              Simulated
            </div>
            <div className="pv" style={{ color: active ? shownColor : 'var(--text-faint)' }}>
              {active && shown != null ? pct(shown) : '—'}
            </div>
          </div>
        </div>

        <div className="sim-track" aria-hidden>
          <i style={{ width: `${(shown || 0) * 100}%` }} />
          {active && baseProb != null && <span className="mk" style={{ left: `calc(${baseProb * 100}% - 1px)` }} />}
        </div>

        <div className="sim-foot">
          {active ? (
            <span>
              <span
                className={`delta-chip ${sim.risk_delta < 0 ? 'good' : 'bad'}`}
              >
                {sim.risk_delta < 0 ? '▼' : '▲'} {pct(Math.abs(sim.risk_delta))}
              </span>{' '}
              <span style={{ color: shownColor, fontWeight: 600 }}>{sim.new_risk_level}</span>
              {' · '}
              {Object.keys(sim.overrides).length} lever{Object.keys(sim.overrides).length > 1 ? 's' : ''} pulled
            </span>
          ) : (
            <span>Pull a lever — the force plot re-derives live.</span>
          )}
          <button className="btn-reset" onClick={reset} disabled={!active}>
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
