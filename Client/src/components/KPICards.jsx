import { useEffect, useRef, useState } from 'react'
import { compactMoney, pct } from '../utils/format.js'

function useCountUp(target, dur = 900) {
  const [val, setVal] = useState(0)
  const raf = useRef()
  useEffect(() => {
    if (target == null) return
    const t0 = performance.now()
    const from = 0
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur)
      const eased = 1 - Math.pow(1 - k, 3)
      setVal(from + (target - from) * eased)
      if (k < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, dur])
  return val
}

function Kpi({ label, value, format, sub, accent, children, delay = 0 }) {
  const v = useCountUp(value)
  return (
    <div className="kpi" style={{ '--kpi-accent': accent, animationDelay: `${delay}ms` }}>
      <div className="kpi-label">
        <span className="mono-label">{label}</span>
      </div>
      <div className="kpi-value">{format(v)}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {children}
    </div>
  )
}

export default function KPICards({ stats }) {
  if (!stats) return null
  const tiers = stats.risk_counts
  const total = stats.total_accounts
  const criticalShare = tiers.CRITICAL / total

  return (
    <section className="kpi-strip" aria-label="Portfolio metrics">
      <Kpi
        label="Accounts Monitored"
        value={total}
        format={(v) => Math.round(v).toLocaleString('en-US')}
        sub={
          <span>
            out-of-sample cohort · <span className="num">{stats.avg_churn_probability ? pct(stats.avg_churn_probability) : ''}</span> avg risk
          </span>
        }
        accent="var(--accent)"
      />
      <Kpi
        label="Churn Signal"
        value={stats.avg_churn_probability * 100}
        format={(v) => `${v.toFixed(1)}%`}
        sub={<span>mean predicted churn probability</span>}
        accent="var(--elevated)"
        delay={70}
      />
      <Kpi
        label="Critical Accounts"
        value={tiers.CRITICAL}
        format={(v) => Math.round(v).toLocaleString('en-US')}
        sub={
          <span>
            <span className="delta-chip bad">▲ {pct(criticalShare)}</span> of portfolio at p ≥ 0.70
          </span>
        }
        accent="var(--critical)"
        delay={140}
      >
        <div className="risk-composition" title="portfolio risk mix">
          <span className="c-critical" style={{ width: `${(tiers.CRITICAL / total) * 100}%` }} />
          <span className="c-elevated" style={{ width: `${(tiers.ELEVATED / total) * 100}%` }} />
          <span className="c-low" style={{ width: `${(tiers.LOW / total) * 100}%` }} />
        </div>
      </Kpi>
      <Kpi
        label="Revenue At Risk"
        value={stats.at_risk_mrr}
        format={(v) => compactMoney(v)}
        sub={
          <span>
            monthly recurring · <span className="num">{compactMoney(stats.at_risk_cltv)}</span> CLTV exposed
          </span>
        }
        accent="var(--critical)"
        delay={210}
      />
    </section>
  )
}
