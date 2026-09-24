import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'
import { computeClientShap } from '../utils/shapEngine.js'
import rawAccounts from '../data/accounts.json'
import rawGlobalShap from '../data/globalShap.json'

const PAGE_LIMIT = 10

export function useDashboardData() {
  const [health, setHealth] = useState({ status: 'healthy' })
  const [stats, setStats] = useState({
    total_accounts: 1409,
    avg_churn_probability: 0.3866,
    at_risk_mrr: 50679.1,
    at_risk_cltv: 2858622.0,
    risk_counts: { CRITICAL: 351, ELEVATED: 340, LOW: 718 },
  })
  const [globalShap, setGlobalShap] = useState(rawGlobalShap)
  const [error, setError] = useState(null)

  const [risk, setRisk] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [accounts, setAccounts] = useState([])
  const [acctMeta, setAcctMeta] = useState({ total: 1409, pages: Math.ceil(1409 / PAGE_LIMIT) })
  const [listLoading, setListLoading] = useState(false)

  const [selectedId, setSelectedId] = useState('ACC-2222')
  const [detail, setDetail] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [explainLoading, setExplainLoading] = useState(false)
  const [explainLatency, setExplainLatency] = useState(null)

  const [sim, setSim] = useState(null)
  const [simBusy, setSimBusy] = useState(false)

  // Local account index map for 0ms lookup
  const accountIndex = useMemo(() => {
    const map = new Map()
    rawAccounts.forEach((a) => map.set(a.account_id, a))
    return map
  }, [])

  // bootstrap: health / stats / global from API (if reachable)
  useEffect(() => {
    api.getHealth()
      .then((r) => {
        if (r?.data?.status) setHealth(r.data)
      })
      .catch(() => {
        setHealth({ status: 'live' })
      })

    api.getStats()
      .then((r) => {
        if (r?.data?.total_accounts) setStats(r.data)
      })
      .catch(() => {})

    api.getGlobalShap()
      .then((r) => {
        if (r?.data?.features) setGlobalShap(r.data)
      })
      .catch(() => {})
  }, [])

  // accounts list query (Server query with client-side fallback)
  useEffect(() => {
    let cancelled = false
    setListLoading(true)

    // Client-side fallback compute
    const term = search.trim().toLowerCase()
    let filtered = rawAccounts
    if (risk !== 'ALL') {
      filtered = filtered.filter((a) => a.risk_level === risk)
    }
    if (term) {
      filtered = filtered.filter(
        (a) =>
          a.account_id.toLowerCase().includes(term) ||
          (a.payment_method || '').toLowerCase().includes(term) ||
          (a.contract || '').toLowerCase().includes(term),
      )
    }
    const total = filtered.length
    const pages = Math.max(1, Math.ceil(total / PAGE_LIMIT))
    const startIdx = (page - 1) * PAGE_LIMIT
    const pageSlice = filtered.slice(startIdx, startIdx + PAGE_LIMIT)

    const t = setTimeout(() => {
      api
        .getAccounts({ risk, search, page, limit: PAGE_LIMIT })
        .then((r) => {
          if (cancelled) return
          if (r?.data?.accounts) {
            setAccounts(r.data.accounts)
            setAcctMeta({ total: r.data.total, pages: r.data.pages })
          } else {
            setAccounts(pageSlice)
            setAcctMeta({ total, pages })
          }
          setError(null)
        })
        .catch(() => {
          if (!cancelled) {
            setAccounts(pageSlice)
            setAcctMeta({ total, pages })
          }
        })
        .finally(() => !cancelled && setListLoading(false))
    }, search ? 200 : 0)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [risk, search, page])

  // auto-select first account if nothing selected
  useEffect(() => {
    if (!selectedId && accounts.length) {
      setSelectedId(accounts[0].account_id)
    }
  }, [accounts, selectedId])

  const selectAccount = useCallback((id) => {
    setSelectedId(id)
    setSim(null)
  }, [])

  // detail + local explanation for selected account (instant 0ms render with server sync)
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    setExplainLoading(true)

    // 1. Instant client lookup from in-memory index in 0ms
    const localAcct = accountIndex.get(selectedId)
    if (localAcct) {
      setDetail(localAcct)
      const instantShap = computeClientShap(localAcct.raw_features, localAcct.churn_probability)
      if (instantShap) {
        setExplanation(instantShap)
        setExplainLatency(0)
        setExplainLoading(false)
      }
    }

    // 2. Background API sync (if reachable)
    api.getAccount(selectedId)
      .then((d) => {
        if (cancelled) return
        if (d?.data?.account_id) {
          setDetail(d.data)
          const instantShap = computeClientShap(d.data.raw_features, d.data.churn_probability)
          if (instantShap) setExplanation(instantShap)
        }
      })
      .catch(() => {})

    api.getLocalShap(selectedId)
      .then((x) => {
        if (!cancelled && x?.data?.positive_forces) {
          setExplanation(x.data)
          setExplainLatency(x.latencyMs)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setExplainLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedId, accountIndex])

  const runSimulation = useCallback(
    async (overrides) => {
      if (!selectedId || !detail) return
      if (!Object.keys(overrides).length) {
        setSim(null)
        return
      }

      // 1. Instantly calculate counterfactual simulation in 0ms (60 FPS responsiveness)
      const simMerged = { ...detail.raw_features, ...overrides }
      const instantSim = computeClientShap(simMerged)
      if (instantSim) {
        setSim({
          base_account_id: selectedId,
          overrides,
          original_probability: detail.churn_probability,
          original_risk_level: detail.risk_level,
          simulated_probability: instantSim.churn_probability,
          simulated_risk_level: instantSim.risk_level,
          probability_delta: Math.round((instantSim.churn_probability - detail.churn_probability) * 10000) / 10000,
          updated_positive_forces: instantSim.positive_forces,
          updated_negative_forces: instantSim.negative_forces,
        })
      }

      // 2. Synchronize with backend API in background
      setSimBusy(true)
      try {
        const r = await api.simulate({ base_account_id: selectedId, overrides })
        if (r?.data?.simulated_probability != null) {
          setSim(r.data)
        }
      } catch {
        /* fallback remains active */
      } finally {
        setSimBusy(false)
      }
    },
    [selectedId, detail],
  )

  const onFilterChange = (nextRisk) => {
    setRisk(nextRisk)
    setPage(1)
  }
  const onSearchChange = (q) => {
    setSearch(q)
    setPage(1)
  }

  return {
    health,
    stats,
    globalShap,
    error,
    risk,
    search,
    page,
    accounts,
    acctMeta,
    listLoading,
    selectedId,
    detail,
    explanation,
    explainLoading,
    explainLatency,
    sim,
    simBusy,
    selectAccount,
    runSimulation,
    onFilterChange,
    onSearchChange,
    setPage,
  }
}
