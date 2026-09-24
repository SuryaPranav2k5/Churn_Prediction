const RAW_BASE = import.meta.env.VITE_API_URL || ''
const BASE = RAW_BASE ? `${RAW_BASE.replace(/\/+$/, '')}/api` : '/api'

async function request(path, options = {}) {
  const t0 = performance.now()
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const latencyMs = Math.round(performance.now() - t0)
  let body = null
  try {
    body = await res.json()
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    const err = new Error(body?.error || body?.detail || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return { data: body, latencyMs }
}

export const api = {
  getHealth: () => request('/health'),
  getStats: () => request('/accounts/stats'),
  getAccounts: ({ risk = 'ALL', search = '', page = 1, limit = 12 }) => {
    const q = new URLSearchParams({ risk_level: risk, search, page, limit })
    return request(`/accounts?${q}`)
  },
  getAccount: (id) => request(`/accounts/${id}`),
  getGlobalShap: () => request('/shap/global'),
  getLocalShap: (id) => request(`/shap/local/${id}`),
  simulate: (payload) => request('/simulate', { method: 'POST', body: JSON.stringify(payload) }),
}
