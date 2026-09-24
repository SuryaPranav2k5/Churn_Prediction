export default function Header({ health, latency }) {
  const up = health?.status === 'healthy'
  const m = health?.metrics || {}
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M6 22l6-11 5 7 3-4 6 9" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="brand-name">
            Churn<em>Mux</em>
          </div>
          <div className="brand-sub">Churn · Explainability Engine</div>
        </div>
      </div>

      <div className="header-badges">
        <span className="hbadge">
          <span className="tag">Prob 16</span>
        </span>
        <span className="hbadge">
          <span className="tag">ROC-AUC</span>
          <b>{m.test_roc_auc ? m.test_roc_auc.toFixed(3) : '—'}</b>
        </span>
        <span className="hbadge">
          <span className="tag">PR-AUC</span>
          <b>{m.test_pr_auc ? m.test_pr_auc.toFixed(3) : '—'}</b>
        </span>
        <span className="hbadge">
          <span className="tag">v</span>
          <b>{health?.model_version || '—'}</b>
        </span>
        <span className={`live-pill ${up ? '' : 'offline'}`}>
          <span className="live-dot" />
          {up ? `API LIVE · ${latency ?? '--'}ms` : 'API OFFLINE'}
        </span>
      </div>
    </header>
  )
}
