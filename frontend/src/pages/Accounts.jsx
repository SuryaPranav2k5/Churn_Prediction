import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Users, RefreshCw } from 'lucide-react';
import api from '../services/api';
import AccountTable from '../components/AccountTable';

export default function Accounts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [risk, setRisk] = useState(searchParams.get('risk') || 'ALL');
  const [contract, setContract] = useState(searchParams.get('contract') || 'all');
  const [sortBy, setSortBy] = useState('probability');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchAccounts();
  }, [page, risk, contract, sortBy, sortOrder]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.getAccounts({
        page,
        page_size: 15,
        search,
        risk,
        contract,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setAccounts(data.accounts || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load accounts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAccounts();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Account Explorer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and inspect churn predictions across the entire 7,043 customer cohort.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            Matching: <strong className="text-white">{total.toLocaleString()}</strong> accounts
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search by ID */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Customer ID (e.g. 7590)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </form>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Risk:</span>
            <select
              value={risk}
              onChange={(e) => { setRisk(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="HIGH">High Risk (&gt; 60%)</option>
              <option value="MEDIUM">Medium Risk (30-60%)</option>
              <option value="LOW">Low Risk (&lt; 30%)</option>
            </select>
          </div>

          {/* Contract Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Contract:</span>
            <select
              value={contract}
              onChange={(e) => { setContract(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Contracts</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Sort:</span>
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="probability_desc">Churn Risk (Highest first)</option>
              <option value="probability_asc">Churn Risk (Lowest first)</option>
              <option value="monthlyCharges_desc">Monthly Bill (High to Low)</option>
              <option value="monthlyCharges_asc">Monthly Bill (Low to High)</option>
              <option value="tenure_desc">Tenure (Longest first)</option>
              <option value="tenure_asc">Tenure (Newest first)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Records Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <AccountTable accounts={accounts} loading={loading} />

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/40 text-xs">
          <span className="text-slate-400">
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
