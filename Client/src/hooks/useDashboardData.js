import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'

const PAGE_LIMIT = 10

export function useDashboardData() {
  const [health, setHealth] = useState(null)
  const [stats, setStats] = useState(null)
  const [globalShap, setGlobalShap] = useState(null)
  const [error, setError] = useState(null)

  const [risk, setRisk] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [accounts, setAccounts] = useState([])
  const [acctMeta, setAcctMeta] = useState({ total: 0, pages: 1 })
  const [listLoading, setListLoading] = useState(true)

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [explainLoading, setExplainLoading] = useState(false)
  const [explainLatency, setExplainLatency] = useState(null)

  const [sim, setSim] = useState(null)
  const [simBusy, setSimBusy] = useState(false)

  // bootstrap: health / stats / global
  useEffect(() => {
    api.getHealth().then((r) => setHealth(r.data)).catch((e) => {
      setError(e.message)
      setHealth({ status: 'down' })
    })
    api.getStats().then((r) => setStats(r.data)).catch((e) => setError(e.message))
    api.getGlobalShap().then((r) => setGlobalShap(r.data)).catch((e) => setError(e.message))
  }, [])

  // accounts list — debounced server-side query
  useEffect(() => {
    let cancelled = false
    setListLoading(true)
    const t = setTimeout(() => {
      api
        .getAccounts({ risk, search, page, limit: PAGE_LIMIT })
        .then((r) => {
          if (cancelled) return
          setAccounts(r.data.accounts)
          setAcctMeta({ total: r.data.total, pages: r.data.pages })
          setError(null)
        })
        .catch((e) => !cancelled && setError(e.message))
        .finally(() => !cancelled && setListLoading(false))
    }, search ? 250 : 0)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [risk, search, page])

  // auto-select the first account once the list loads for a healthy demo state
  useEffect(() => {
    if (!selectedId && accounts.length) setSelectedId(accounts[0].account_id)
  }, [accounts, selectedId])

  const selectAccount = useCallback((id) => {
    setSelectedId(id)
    setSim(null)
  }, [])

  // detail + local explanation for selected account
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    setExplainLoading(true)
    setExplanation(null)
    Promise.all([api.getAccount(selectedId), api.getLocalShap(selectedId)])
      .then(([d, x]) => {
        if (cancelled) return
        setDetail(d.data)
        setExplanation(x.data)
        setExplainLatency(x.latencyMs)
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setExplainLoading(false))
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const runSimulation = useCallback(
    async (overrides) => {
      if (!selectedId) return
      if (!Object.keys(overrides).length) {
        setSim(null)
        return
      }
      setSimBusy(true)
      try {
        const r = await api.simulate({ base_account_id: selectedId, overrides })
        setSim(r.data)
      } catch (e) {
        setError(e.message)
      } finally {
        setSimBusy(false)
      }
    },
    [selectedId],
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
