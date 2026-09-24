export const pct = (x, dp = 1) => `${(x * 100).toFixed(dp)}%`

export const money = (x, dp = 0) =>
  `$${x.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`

export const compactMoney = (x) =>
  x >= 1e6 ? `$${(x / 1e6).toFixed(2)}M` : x >= 1e3 ? `$${(x / 1e3).toFixed(1)}K` : money(x)

export const logit = (p) => {
  const q = Math.min(Math.max(p, 1e-6), 1 - 1e-6)
  return Math.log(q / (1 - q))
}

export const TIER_COLOR = { CRITICAL: 'var(--critical)', ELEVATED: 'var(--elevated)', LOW: 'var(--low)' }
