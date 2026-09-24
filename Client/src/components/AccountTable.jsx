const TIERS = ['ALL', 'CRITICAL', 'ELEVATED', 'LOW']

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export default function AccountTable({
  accounts,
  meta,
  page,
  risk,
  search,
  loading,
  selectedId,
  onSelect,
  onFilterChange,
  onSearchChange,
  setPage,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-title">
          <span className="idx">01</span>Account Portfolio
        </div>
        <div className="panel-meta num">
          {loading ? 'querying…' : `${meta.total.toLocaleString()} accounts`}
        </div>
      </div>

      <div className="table-tools">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="search id / payment / contract…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search accounts"
          />
        </div>
        <div className="seg" role="tablist" aria-label="Risk filter">
          {TIERS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={risk === t}
              className={`${risk === t ? 'on' : ''} ${t !== 'ALL' ? `tier-${t}` : ''}`}
              onClick={() => onFilterChange(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="acct-scroll">
        <table className="accts">
          <thead>
            <tr>
              <th>Account</th>
              <th>Contract</th>
              <th className="r">Tenure</th>
              <th className="r">MRC</th>
              <th className="r">Churn p</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6}>
                  <div className="loading-note">
                    <span className="spinner" /> scoring portfolio…
                  </div>
                </td>
              </tr>
            )}
            {!loading && !accounts.length && (
              <tr>
                <td colSpan={6}>
                  <div className="loading-note">no accounts match this filter</div>
                </td>
              </tr>
            )}
            {!loading &&
              accounts.map((a) => (
                <tr
                  key={a.account_id}
                  className={a.account_id === selectedId ? 'sel' : ''}
                  onClick={() => onSelect(a.account_id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelect(a.account_id)}
                >
                  <td>
                    <span className="acct-id">{a.account_id}</span>
                  </td>
                  <td>
                    <span className="acct-contract">{a.contract}</span>
                  </td>
                  <td className="r">
                    <span className="tenure-bar">
                      <i style={{ width: `${(a.tenure_months / 72) * 100}%` }} />
                    </span>{' '}
                    <span className="num" style={{ color: 'var(--text-muted)' }}>
                      {a.tenure_months}m
                    </span>
                  </td>
                  <td className="r num">${a.monthly_charges.toFixed(2)}</td>
                  <td className="r">
                    <span className="prob-cell">
                      <span className="prob-num" style={{ color: a.churn_probability >= 0.7 ? 'var(--critical)' : a.churn_probability >= 0.35 ? 'var(--elevated)' : 'var(--low)' }}>
                        {(a.churn_probability * 100).toFixed(1)}%
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className={`risk-badge risk-${a.risk_level}`}>{a.risk_level}</span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="table-foot">
        <span className="num">
          page {page} / {meta.pages}
        </span>
        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ← prev
          </button>
          <button disabled={page >= meta.pages} onClick={() => setPage(page + 1)}>
            next →
          </button>
        </div>
      </div>
    </section>
  )
}
