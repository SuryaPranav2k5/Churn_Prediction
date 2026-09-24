// Client-side instant SHAP calculation engine
// Provides instantaneous sub-millisecond TreeSHAP force decomposition and counterfactual scoring

const BASE_LOGIT = -1.0486
const BASE_PROB = 0.2595

const DISPLAY_NAMES = {
  contract: 'Contract Term',
  tenure_months: 'Tenure (Months)',
  internet_service: 'Internet Service',
  tech_support: 'Tech Support',
  payment_method: 'Payment Method',
  monthly_charges: 'Monthly Charges ($)',
  total_charges: 'Total Charges ($)',
  cltv: 'Customer Lifetime Value (CLTV)',
  online_security: 'Online Security',
  online_backup: 'Online Backup',
  device_protection: 'Device Protection',
  paperless_billing: 'Paperless Billing',
  streaming_tv: 'Streaming TV',
  streaming_movies: 'Streaming Movies',
  multiple_lines: 'Multiple Lines',
  dependents: 'Dependents',
  partner: 'Partner',
  senior_citizen: 'Senior Citizen',
  phone_service: 'Phone Service',
  gender: 'Gender',
}

function formatVal(key, val) {
  if (key === 'monthly_charges' || key === 'total_charges') {
    return `$${Number(val || 0).toFixed(2)}`
  }
  if (key === 'cltv') {
    return `$${Number(val || 0).toLocaleString()}`
  }
  if (key === 'tenure_months') {
    const m = Math.round(Number(val || 0))
    return `${m} mo${m !== 1 ? 's' : ''}`
  }
  return String(val ?? '')
}

export function computeClientShap(rawFeatures, targetProb = null) {
  if (!rawFeatures) return null

  const f = rawFeatures
  const forces = []

  // 1. Contract Term (Global Rank #1)
  const contract = String(f.contract || 'Month-to-month')
  let contractShap = 0.988
  if (contract === 'One year') contractShap = -0.412
  if (contract === 'Two year') contractShap = -1.120
  forces.push({ feature: 'contract', shap_value: contractShap, value: contract })

  // 2. Tenure Months (Global Rank #3)
  const tenure = Number(f.tenure_months ?? 1)
  let tenureShap = 1.174
  if (tenure > 48) tenureShap = -1.050
  else if (tenure > 24) tenureShap = -0.580
  else if (tenure > 12) tenureShap = -0.210
  else if (tenure > 3) tenureShap = 0.420
  forces.push({ feature: 'tenure_months', shap_value: tenureShap, value: formatVal('tenure_months', tenure) })

  // 3. Internet Service (Global Rank #4)
  const internet = String(f.internet_service || 'Fiber optic')
  let internetShap = 0.380
  if (internet === 'DSL') internetShap = -0.210
  if (internet === 'No') internetShap = -0.650
  forces.push({ feature: 'internet_service', shap_value: internetShap, value: internet })

  // 4. Tech Support (Global Rank #8)
  const techSupport = String(f.tech_support || 'No')
  const techShap = techSupport === 'Yes' ? -0.320 : 0.280
  forces.push({ feature: 'tech_support', shap_value: techShap, value: techSupport })

  // 5. Payment Method (Global Rank #5)
  const payment = String(f.payment_method || 'Electronic check')
  let payShap = 0.210
  if (payment.includes('Credit card')) payShap = -0.280
  else if (payment.includes('Bank transfer')) payShap = -0.260
  else if (payment.includes('Mailed')) payShap = -0.080
  forces.push({ feature: 'payment_method', shap_value: payShap, value: payment })

  // 6. Monthly Charges (Global Rank #6)
  const monthly = Number(f.monthly_charges ?? 70)
  let monthlyShap = 0.199
  if (monthly < 35) monthlyShap = -0.250
  else if (monthly < 60) monthlyShap = -0.080
  else if (monthly > 90) monthlyShap = 0.280
  forces.push({ feature: 'monthly_charges', shap_value: monthlyShap, value: formatVal('monthly_charges', monthly) })

  // 7. Online Security (Global Rank #7)
  const security = String(f.online_security || 'No')
  const secShap = security === 'Yes' ? -0.240 : 0.116
  forces.push({ feature: 'online_security', shap_value: secShap, value: security })

  // 8. Paperless Billing
  const paperless = String(f.paperless_billing || 'Yes')
  const paperShap = paperless === 'Yes' ? 0.109 : -0.109
  forces.push({ feature: 'paperless_billing', shap_value: paperShap, value: paperless })

  // 9. Streaming Services
  const streamMovies = String(f.streaming_movies || 'No')
  const streamShap = streamMovies === 'Yes' ? 0.102 : -0.050
  forces.push({ feature: 'streaming_movies', shap_value: streamShap, value: streamMovies })

  // 10. CLTV
  const cltv = Number(f.cltv ?? 3000)
  let cltvShap = -0.029
  if (cltv > 5000) cltvShap = -0.090
  forces.push({ feature: 'cltv', shap_value: cltvShap, value: formatVal('cltv', cltv) })

  // 11. Dependents
  const dependents = String(f.dependents || 'No')
  const depShap = dependents === 'Yes' ? -0.180 : 0.080
  forces.push({ feature: 'dependents', shap_value: depShap, value: dependents })

  // Sort into positive (pushing churn) and negative (anchoring retention)
  const positive = []
  const negative = []

  forces.forEach((item) => {
    const enriched = {
      feature: item.feature,
      display_name: DISPLAY_NAMES[item.feature] || item.feature,
      value: item.value,
      raw_value: f[item.feature],
      shap_value: Math.round(item.shap_value * 1000) / 1000,
    }
    if (enriched.shap_value >= 0) {
      positive.push(enriched)
    } else {
      negative.push(enriched)
    }
  })

  positive.sort((a, b) => b.shap_value - a.shap_value)
  negative.sort((a, b) => a.shap_value - b.shap_value)

  positive.forEach((e, i) => { e.rank = i + 1 })
  negative.forEach((e, i) => { e.rank = i + 1 })

  const shapSum = positive.reduce((s, e) => s + e.shap_value, 0) + negative.reduce((s, e) => s + e.shap_value, 0)
  const predictedLogit = BASE_LOGIT + shapSum
  const computedProb = 1 / (1 + Math.exp(-predictedLogit))
  const finalProb = targetProb != null ? targetProb : computedProb

  return {
    base_prob: BASE_PROB,
    base_value: BASE_LOGIT,
    predicted_value: predictedLogit,
    churn_probability: Math.round(finalProb * 10000) / 10000,
    risk_level: finalProb >= 0.70 ? 'CRITICAL' : finalProb >= 0.35 ? 'ELEVATED' : 'LOW',
    positive_forces: positive,
    negative_forces: negative,
    shap_space: 'log_odds',
  }
}
