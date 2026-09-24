export default function GlobalSHAPChart({ data }) {
  if (!data) {
    return (
      <section className="panel">
        <div className="panel-head">
          <div className="panel-title">
            <span className="idx">02</span>Global Feature Impact
          </div>
        </div>
        <div className="loading-note">
          <span className="spinner" /> loading SHAP ranking…
        </div>
      </section>
    )
  }
  const feats = data.features.slice(0, 10)
  const max = feats[0]?.mean_abs_shap || 1
  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-title">
          <span className="idx">02</span>Global Feature Impact
        </div>
        <div className="panel-meta">
          <span>mean |φ| · log-odds</span>
        </div>
      </div>
      <div className="gshap-list">
        {feats.map((f, i) => (
          <div className="gshap-row" key={f.feature}>
            <div className="gshap-name">
              <span className="num" style={{ color: 'var(--text-faint)', fontSize: 10, width: 16 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="nm">{f.display_name}</span>
              <span className="cat-chip">{f.category}</span>
            </div>
            <div className="gshap-track">
              <div
                className="gshap-fill"
                style={{ width: `${(f.mean_abs_shap / max) * 100}%`, animationDelay: `${i * 60}ms` }}
              />
            </div>
            <div className="gshap-val">{f.mean_abs_shap.toFixed(3)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
