import { money, pct, TIER_COLOR } from '../utils/format.js'

const ARC_L = Math.PI * 52 // semicircle length

function Fact({ k, v }) {
  return (
    <div className="fact">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  )
}

export default function AccountDetailCard({ detail, explanation, loading }) {
  const src = explanation || detail
  if (!detail && loading) {
    return (
      <div className="loading-note">
        <span className="spinner" /> fetching account…
      </div>
    )
  }
  if (!detail || !src) return null

  const prob = explanation ? explanation.churn_probability : detail.churn_probability
  const tier = explanation ? explanation.risk_level : detail.risk_level
  const color = TIER_COLOR[tier]
  const rf = detail.raw_features || {}

  return (
    <div className="detail-top">
      <div className="arc-meter">
        <svg viewBox="0 0 128 76" width="128" height="76">
          <path d="M 12,64 A 52,52 0 0 1 116,64" fill="none" stroke="var(--hairline)" strokeWidth="9" strokeLinecap="round" />
          <path
            d="M 12,64 A 52,52 0 0 1 116,64"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={ARC_L}
            strokeDashoffset={ARC_L * (1 - prob)}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1), stroke 0.4s', filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        <div className="arc-center">
          <span className="arc-prob" style={{ color }}>{pct(prob)}</span>
          <span className="arc-cap">churn risk</span>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }} className="num">
            {detail.account_id}
          </span>
          <span className={`risk-badge risk-${tier}`}>{tier}</span>
          <span
            className="risk-badge"
            style={{
              marginLeft: 'auto',
              color: detail.actual_churn ? 'var(--critical)' : 'var(--text-faint)',
              borderColor: 'var(--hairline)',
              background: 'transparent',
            }}
            title="Ground-truth label from held-out test set"
          >
            {detail.actual_churn ? 'TRUTH: CHURNED' : 'TRUTH: RETAINED'}
          </span>
        </div>
        <div className="detail-facts">
          <Fact k="Tenure" v={`${rf.tenure_months} mo`} />
          <Fact k="Monthly" v={money(rf.monthly_charges, 2)} />
          <Fact k="Total Paid" v={money(rf.total_charges)} />
          <Fact k="CLTV" v={money(rf.cltv)} />
          <Fact k="Contract" v={rf.contract} />
          <Fact k="Internet" v={rf.internet_service} />
          <Fact k="Payment" v={(rf.payment_method || '').replace(' (automatic)', ' auto')} />
          <Fact k="Tech Support" v={rf.tech_support} />
          <Fact k="Dependents" v={rf.dependents} />
        </div>
      </div>
    </div>
  )
}
