import { useMemo } from 'react'
import Header from './components/Header.jsx'
import KPICards from './components/KPICards.jsx'
import AccountTable from './components/AccountTable.jsx'
import GlobalSHAPChart from './components/GlobalSHAPChart.jsx'
import AccountDetailCard from './components/AccountDetailCard.jsx'
import LocalForcePlot from './components/LocalForcePlot.jsx'
import WhatIfSimulator from './components/WhatIfSimulator.jsx'
import { useDashboardData } from './hooks/useDashboardData.js'
import { logit } from './utils/format.js'

export default function App() {
  const d = useDashboardData()

  const forceData = useMemo(() => {
    if (d.sim) {
      return {
        base_value: d.explanation?.base_value ?? -1.0486,
        base_prob: d.explanation?.base_prob ?? 0.2652,
        predicted_value: logit(d.sim.simulated_probability),
        prob: d.sim.simulated_probability,
        positive_forces: d.sim.updated_positive_forces || [],
        negative_forces: d.sim.updated_negative_forces || [],
      }
    }
    if (!d.explanation) return null
    const e = d.explanation
    return {
      base_value: e.base_value ?? -1.0486,
      base_prob: e.base_prob ?? 0.2652,
      predicted_value: e.predicted_value != null ? e.predicted_value : logit(e.churn_probability),
      prob: e.churn_probability,
      positive_forces: e.positive_forces || [],
      negative_forces: e.negative_forces || [],
    }
  }, [d.explanation, d.sim])

  const plotKey = `${d.selectedId || 'none'}:${forceData?.prob ?? 0}`

  return (
    <div className="app">
      <Header health={d.health} latency={d.explainLatency} />
      <KPICards stats={d.stats} />

      {d.error && <div className="error-note">⚠ {d.error}</div>}

      <main className="main-grid">
        <div className="col">
          <AccountTable
            accounts={d.accounts}
            meta={d.acctMeta}
            page={d.page}
            risk={d.risk}
            loading={d.listLoading}
            selectedId={d.selectedId}
            onSelect={d.selectAccount}
            onFilterChange={d.onFilterChange}
            onSearchChange={d.onSearchChange}
            setPage={d.setPage}
          />
          <GlobalSHAPChart data={d.globalShap} />
        </div>

        <div className="col">
          <section className="panel" style={{ animationDelay: '80ms' }}>
            <div className="panel-head">
              <div className="panel-title">
                <span className="idx">03</span>Account Telemetry
              </div>
              {d.explainLatency != null && (
                <div className="panel-meta num">scored in {d.explainLatency}ms</div>
              )}
            </div>
            <AccountDetailCard detail={d.detail} explanation={d.explanation} loading={d.explainLoading} />
          </section>

          <section className="panel" style={{ animationDelay: '140ms' }}>
            <div className="panel-head">
              <div className="panel-title">
                <span className="idx">04</span>SHAP Force Decomposition
              </div>
              <div className="panel-meta">
                <span className={`risk-badge ${d.sim ? 'risk-LOW' : 'risk-ELEVATED'}`}>
                  {d.sim ? 'LIVE WHAT-IF' : `LOG-ODDS · ${d.explanation ? d.explanation.risk_level : '—'}`}
                </span>
              </div>
            </div>
            <LocalForcePlot key={plotKey} data={forceData} simulated={!!d.sim} />
            <div className="fp-legend">
              <span>
                <i style={{ background: 'var(--critical)' }} />
                pushing toward churn
              </span>
              <span>
                <i style={{ background: 'var(--low)' }} />
                anchoring retention
              </span>
              <span style={{ marginLeft: 'auto' }} className="num">
                f(x) = E[f] + Σφᵢ
              </span>
            </div>
          </section>

          <section className="panel" style={{ animationDelay: '200ms' }}>
            <div className="panel-head">
              <div className="panel-title">
                <span className="idx">05</span>What-If Lab · Counterfactual Engine
              </div>
              <div className="panel-meta num">{d.simBusy ? 're-scoring…' : 'POST /api/simulate'}</div>
            </div>
            <WhatIfSimulator
              detail={d.detail}
              baseProb={d.explanation?.churn_probability}
              baseRisk={d.explanation?.risk_level}
              runSimulation={d.runSimulation}
              sim={d.sim}
              simBusy={d.simBusy}
            />
          </section>
        </div>
      </main>

      <footer className="footer">
        <span>ChurnMux · LightGBM × SHAP × Flask × React</span>
        <span>
          {d.health?.status === 'healthy'
            ? `${d.health.total_accounts?.toLocaleString()} out-of-sample accounts · CV ROC-AUC ${d.health.metrics?.cv_mean_roc_auc?.toFixed(3)}`
            : 'awaiting API'}
        </span>
      </footer>
    </div>
  )
}
