import { pct } from '../utils/format.js'

const W = 820
const H = 300
const PAD = 34
const BAR_Y = 142
const BAR_H = 20
const PROB_TICKS = [0.05, 0.25, 0.5, 0.75, 0.95]

const INV = (p) => {
  const q = Math.min(Math.max(p, 1e-6), 1 - 1e-6)
  return Math.log(q / (1 - q))
}

export default function LocalForcePlot({ data, latency, simulated }) {
  if (!data) {
    return (
      <div className="loading-note">
        <span className="spinner" /> computing SHAP attribution…
      </div>
    )
  }

  const pos = data.positive_forces || []
  const neg = data.negative_forces || []
  const base = data.base_value
  const sumPos = pos.reduce((s, f) => s + f.shap_value, 0)
  const sumNeg = neg.reduce((s, f) => s + f.shap_value, 0)
  const lo = base + sumNeg
  const hi = base + sumPos
  const span = Math.max(hi - lo, 1e-4)
  const x = (v) => PAD + ((v - lo) / span) * (W - 2 * PAD)
  const xBase = x(base)
  const pred = data.predicted_value != null ? data.predicted_value : INV(data.prob)
  const xPred = x(Math.min(Math.max(pred, lo), hi))
  const minBlock = 2.5

  let cum = base
  const posBlocks = pos.map((f, i) => {
    const x0 = x(cum)
    cum += f.shap_value
    const x1 = x(cum)
    return { f, i, x0, w: Math.max(x1 - x0, minBlock) }
  })
  cum = base
  const negBlocks = neg.map((f, i) => {
    cum += f.shap_value // shap_value is negative -> moves left
    const x1 = x(cum)
    return { f, i, x0: x1, w: Math.max(xBase - x1, minBlock) }
  })

  const tickXs = PROB_TICKS.map((p) => ({ p, logit: INV(p) }))
    .filter((t) => t.logit >= lo && t.logit <= hi)
    .map((t) => ({ ...t, x: x(t.logit) }))

  const LabelGroup = ({ blocks, above, color, maxLabels }) =>
    blocks.slice(0, maxLabels).map(({ f, i, x0, w }) => {
      const cx = x0 + w / 2
      const tier = i % 3
      const ly = above ? BAR_Y - 16 - tier * 20 : BAR_Y + BAR_H + 22 + tier * 20
      return (
        <g key={f.feature} className="fp-bar" style={{ animationDelay: `${120 + i * 70}ms` }}>
          <line x1={cx} y1={above ? BAR_Y - 2 : BAR_Y + BAR_H + 2} x2={cx} y2={ly + (above ? 8 : -4)} stroke={color} strokeWidth="0.8" opacity="0.5" />
          <text x={cx} y={ly} textAnchor="middle" fontSize="9.5" fill={color} fontWeight="600" style={{ paintOrder: 'stroke', stroke: 'var(--panel)', strokeWidth: 3 }}>
            {f.display_name}
          </text>
          <text x={cx} y={ly + 10.5} textAnchor="middle" fontSize="8.5" fill="var(--text-muted)" style={{ paintOrder: 'stroke', stroke: 'var(--panel)', strokeWidth: 3 }} className="num">
            {f.value} · {f.shap_value > 0 ? '+' : ''}
            {f.shap_value.toFixed(3)}
          </text>
        </g>
      )
    })

  return (
    <div className="forceplot-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="SHAP force plot">
        {/* probability gridlines */}
        {tickXs.map((t) => (
          <g key={t.p}>
            <line x1={t.x} y1={64} x2={t.x} y2={H - 46} stroke="var(--hairline)" strokeWidth="1" strokeDasharray="2 5" />
            <text x={t.x} y={H - 34} textAnchor="middle" fontSize="8.5" fill="var(--text-faint)" className="num">
              {t.p * 100}%
            </text>
          </g>
        ))}

        {/* base anchor */}
        <line x1={xBase} y1={78} x2={xBase} y2={BAR_Y + BAR_H + 10} stroke="var(--text-faint)" strokeWidth="1.2" strokeDasharray="3 3" />
        <text x={xBase} y={BAR_Y + BAR_H + 26} textAnchor="middle" fontSize="9" fill="var(--text-faint)" fontWeight="600">
          BASE
        </text>
        <text x={xBase} y={BAR_Y + BAR_H + 38} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" className="num">
          {pct(data.base_prob ?? 0.26)}
        </text>

        {/* force blocks */}
        {posBlocks.map(({ f, i, x0, w }) => (
          <g key={f.feature} className="fp-grow" style={{ animationDelay: `${i * 70}ms`, transformOrigin: `${x0}px ${BAR_Y + BAR_H / 2}px` }}>
            <rect x={x0} y={BAR_Y} width={w} height={BAR_H} rx="4" fill="var(--critical)" opacity={0.92 - i * 0.09} />
            <title>{`${f.display_name} = ${f.value} · φ = +${f.shap_value.toFixed(4)}`}</title>
          </g>
        ))}
        {negBlocks.map(({ f, i, x0, w }) => (
          <g key={f.feature} className="fp-grow" style={{ animationDelay: `${i * 70}ms`, transformOrigin: `${x0 + w}px ${BAR_Y + BAR_H / 2}px` }}>
            <rect x={x0} y={BAR_Y} width={w} height={BAR_H} rx="4" fill="var(--low)" opacity={0.92 - i * 0.09} />
            <title>{`${f.display_name} = ${f.value} · φ = ${f.shap_value.toFixed(4)}`}</title>
          </g>
        ))}

        {/* prediction arrow */}
        <g className="fp-bar" style={{ animationDelay: '650ms' }}>
          <line x1={xPred} y1={74} x2={xPred} y2={BAR_Y - 4} stroke="var(--text)" strokeWidth="1.4" />
          <path d={`M ${xPred - 5} ${BAR_Y - 12} L ${xPred + 5} ${BAR_Y - 12} L ${xPred} ${BAR_Y - 3} Z`} fill="var(--text)" />
          <rect x={xPred - 26} y={40} width={52} height={20} rx="6" fill={simulated ? 'var(--accent-dim)' : 'var(--panel-raised)'} stroke={simulated ? 'var(--accent)' : 'var(--hairline)'} />
          <text x={xPred} y={54} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={simulated ? 'var(--accent)' : 'var(--text)'} className="num">
            {pct(data.prob)}
          </text>
          <text x={xPred} y={34} textAnchor="middle" fontSize="8" letterSpacing="0.14em" fill="var(--text-faint)" fontWeight="600">
            {simulated ? 'SIMULATED' : 'PREDICTED'}
          </text>
        </g>

        {/* labels */}
        <LabelGroup blocks={posBlocks} above color="var(--critical)" maxLabels={7} />
        <LabelGroup blocks={negBlocks} above={false} color="var(--low)" maxLabels={6} />
      </svg>
    </div>
  )
}
