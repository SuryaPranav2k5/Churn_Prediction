import { useMemo, useState } from 'react'
import { pct, logit } from '../utils/format.js'

const W = 840
const H = 310
const PAD = 44
const BAR_Y = 148
const BAR_H = 22
const PROB_TICKS = [0.05, 0.20, 0.35, 0.50, 0.70, 0.85, 0.95]

export default function LocalForcePlot({ data, latency, simulated }) {
  const [showTable, setShowTable] = useState(false)

  if (!data) {
    return (
      <div className="loading-note" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <span className="spinner" /> computing live SHAP force attribution…
      </div>
    )
  }

  const pos = data.positive_forces || []
  const neg = data.negative_forces || []
  const base = data.base_value ?? -1.0486
  const baseProb = data.base_prob ?? 0.2652
  const prob = data.prob ?? 0.5
  const pred = data.predicted_value != null ? data.predicted_value : logit(prob)

  const sumPos = pos.reduce((s, f) => s + (Number(f.shap_value) || 0), 0)
  const sumNeg = neg.reduce((s, f) => s + (Number(f.shap_value) || 0), 0)

  // Axis bounds with padding for visual clarity
  const minVal = Math.min(base, pred, base + sumNeg) - 0.45
  const maxVal = Math.max(base, pred, base + sumPos) + 0.45
  const span = Math.max(maxVal - minVal, 1.0)

  const x = (v) => PAD + ((v - minVal) / span) * (W - 2 * PAD)
  const xBase = x(base)
  const xPred = x(pred)
  const minBlock = 3

  // 1. Positive force blocks (stack rightwards starting at base)
  let cumPos = base
  const posBlocks = pos.map((f, i) => {
    const sv = Number(f.shap_value) || 0
    const x0 = x(cumPos)
    cumPos += sv
    const x1 = x(cumPos)
    const w = Math.max(x1 - x0, minBlock)
    return { f, i, x0, w, sv, cum: cumPos }
  })

  // 2. Negative force blocks (stack leftwards starting from base + sumPos down to pred)
  let cumNeg = base + sumPos
  const negBlocks = neg.map((f, i) => {
    const sv = Math.abs(Number(f.shap_value) || 0)
    const x1 = x(cumNeg)
    cumNeg -= sv
    const x0 = x(cumNeg)
    const w = Math.max(x1 - x0, minBlock)
    return { f, i, x0, w, sv, cum: cumNeg }
  })

  // Grid tick marks
  const tickXs = PROB_TICKS.map((p) => ({ p, logitVal: logit(p) }))
    .filter((t) => t.logitVal >= minVal && t.logitVal <= maxVal)
    .map((t) => ({ ...t, x: x(t.logitVal) }))

  // Render top feature labels
  const topPos = posBlocks.slice(0, 4)
  const topNeg = negBlocks.slice(0, 4)

  return (
    <div className="forceplot-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 6px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--critical)', fontWeight: '600' }}>+{sumPos.toFixed(3)}</span> Churn Push vs{' '}
          <span style={{ color: 'var(--low)', fontWeight: '600' }}>{sumNeg.toFixed(3)}</span> Retention Anchor
        </div>
        <button
          onClick={() => setShowTable(!showTable)}
          style={{
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: '5px',
            background: showTable ? 'var(--panel-raised)' : 'var(--bg)',
            border: '1px solid var(--hairline)',
            color: showTable ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          {showTable ? 'Hide Vectors Table' : 'Show Vectors Table'}
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="SHAP Force Decomposition Plot" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="posGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff4d5e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ff7b88" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="negGrad" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#2dd4a7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Probability gridlines */}
        {tickXs.map((t) => (
          <g key={t.p}>
            <line x1={t.x} y1={68} x2={t.x} y2={H - 48} stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
            <text x={t.x} y={H - 34} textAnchor="middle" fontSize="9" fill="var(--text-faint)" className="num">
              {Math.round(t.p * 100)}%
            </text>
          </g>
        ))}

        {/* Baseline anchor */}
        <line x1={xBase} y1={76} x2={xBase} y2={BAR_Y + BAR_H + 16} stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
        <text x={xBase} y={BAR_Y + BAR_H + 30} textAnchor="middle" fontSize="9.5" fill="var(--accent)" fontWeight="700">
          BASE
        </text>
        <text x={xBase} y={BAR_Y + BAR_H + 42} textAnchor="middle" fontSize="9" fill="var(--text-muted)" className="num">
          {pct(baseProb)}
        </text>

        {/* Positive Force Bars (Red) */}
        {posBlocks.map(({ f, i, x0, w, sv }) => (
          <g key={f.feature || i} className="fp-grow" style={{ animationDelay: `${i * 50}ms` }}>
            <rect
              x={x0}
              y={BAR_Y}
              width={w}
              height={BAR_H}
              rx="3"
              fill="url(#posGrad)"
              stroke="#ff4d5e"
              strokeWidth="0.5"
              opacity={Math.max(0.4, 0.95 - i * 0.08)}
            />
            <title>{`${f.display_name} (${f.value}): +${sv.toFixed(4)} log-odds`}</title>
          </g>
        ))}

        {/* Negative Force Bars (Cyan/Green) */}
        {negBlocks.map(({ f, i, x0, w, sv }) => (
          <g key={f.feature || i} className="fp-grow" style={{ animationDelay: `${i * 50}ms` }}>
            <rect
              x={x0}
              y={BAR_Y}
              width={w}
              height={BAR_H}
              rx="3"
              fill="url(#negGrad)"
              stroke="#2dd4a7"
              strokeWidth="0.5"
              opacity={Math.max(0.4, 0.95 - i * 0.08)}
            />
            <title>{`${f.display_name} (${f.value}): -${sv.toFixed(4)} log-odds`}</title>
          </g>
        ))}

        {/* Prediction Target Marker */}
        <g className="fp-bar" style={{ animationDelay: '400ms' }}>
          <line x1={xPred} y1={68} x2={xPred} y2={BAR_Y - 4} stroke={prob >= 0.7 ? 'var(--critical)' : prob >= 0.35 ? 'var(--elevated)' : 'var(--low)'} strokeWidth="2" />
          <polygon
            points={`${xPred - 6},${BAR_Y - 12} ${xPred + 6},${BAR_Y - 12} ${xPred},${BAR_Y - 2}`}
            fill={prob >= 0.7 ? 'var(--critical)' : prob >= 0.35 ? 'var(--elevated)' : 'var(--low)'}
          />
          <rect
            x={xPred - 34}
            y={36}
            width={68}
            height={24}
            rx="6"
            fill="var(--panel-raised)"
            stroke={simulated ? 'var(--accent)' : prob >= 0.7 ? 'var(--critical)' : 'var(--hairline)'}
            strokeWidth="1.5"
          />
          <text
            x={xPred}
            y={52}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={simulated ? 'var(--accent)' : prob >= 0.7 ? 'var(--critical)' : 'var(--text)'}
            className="num"
          >
            {pct(prob)}
          </text>
          <text x={xPred} y={30} textAnchor="middle" fontSize="8" letterSpacing="0.12em" fill="var(--text-faint)" fontWeight="600">
            {simulated ? 'SIMULATED' : 'PREDICTED'}
          </text>
        </g>

        {/* Positive Labels (Above) */}
        {topPos.map(({ f, i, x0, w, sv }) => {
          const cx = Math.max(PAD + 40, Math.min(W - PAD - 40, x0 + w / 2))
          const tier = i % 2
          const ly = BAR_Y - 24 - tier * 24
          return (
            <g key={f.feature || i} className="fp-bar">
              <line x1={cx} y1={BAR_Y - 2} x2={cx} y2={ly + 10} stroke="var(--critical)" strokeWidth="0.8" opacity="0.4" />
              <text x={cx} y={ly} textAnchor="middle" fontSize="9" fill="var(--critical)" fontWeight="600">
                {f.display_name}
              </text>
              <text x={cx} y={ly + 10} textAnchor="middle" fontSize="8" fill="var(--text-muted)" className="num">
                {f.value} (+{sv.toFixed(3)})
              </text>
            </g>
          )
        })}

        {/* Negative Labels (Below) */}
        {topNeg.map(({ f, i, x0, w, sv }) => {
          const cx = Math.max(PAD + 40, Math.min(W - PAD - 40, x0 + w / 2))
          const tier = i % 2
          const ly = BAR_Y + BAR_H + 34 + tier * 24
          return (
            <g key={f.feature || i} className="fp-bar">
              <line x1={cx} y1={BAR_Y + BAR_H + 2} x2={cx} y2={ly - 8} stroke="var(--low)" strokeWidth="0.8" opacity="0.4" />
              <text x={cx} y={ly} textAnchor="middle" fontSize="9" fill="var(--low)" fontWeight="600">
                {f.display_name}
              </text>
              <text x={cx} y={ly + 10} textAnchor="middle" fontSize="8" fill="var(--text-muted)" className="num">
                {f.value} (-{sv.toFixed(3)})
              </text>
            </g>
          )
        })}
      </svg>

      {/* Expandable SHAP Feature Vectors Table */}
      {showTable && (
        <div style={{ marginTop: '12px', borderTop: '1px solid var(--hairline-soft)', paddingTop: '10px' }}>
          <div style={{ maxHeight: '180px', overflowY: 'auto', fontSize: '11.5px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--text-faint)', borderBottom: '1px solid var(--hairline-soft)', textAlign: 'left', fontSize: '10px' }}>
                  <th style={{ padding: '4px 6px' }}>FEATURE</th>
                  <th style={{ padding: '4px 6px' }}>VALUE</th>
                  <th style={{ padding: '4px 6px', textAlign: 'right' }}>SHAP VALUE (LOG-ODDS)</th>
                  <th style={{ padding: '4px 6px', textAlign: 'right' }}>DIRECTION</th>
                </tr>
              </thead>
              <tbody>
                {[...pos, ...neg]
                  .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
                  .map((f, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '4px 6px', fontWeight: '500' }}>{f.display_name}</td>
                      <td style={{ padding: '4px 6px', color: 'var(--text-muted)' }} className="num">{f.value}</td>
                      <td
                        style={{
                          padding: '4px 6px',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: f.shap_value >= 0 ? 'var(--critical)' : 'var(--low)',
                        }}
                        className="num"
                      >
                        {f.shap_value >= 0 ? '+' : ''}
                        {Number(f.shap_value).toFixed(4)}
                      </td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', fontSize: '10px' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: f.shap_value >= 0 ? 'var(--critical-dim)' : 'var(--low-dim)',
                            color: f.shap_value >= 0 ? 'var(--critical)' : 'var(--low)',
                            fontWeight: '600',
                          }}
                        >
                          {f.shap_value >= 0 ? 'Pushing Churn' : 'Anchoring Retention'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
