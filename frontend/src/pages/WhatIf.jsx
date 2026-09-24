import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sliders, Search, Sparkles, Info, RefreshCw, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import api from '../services/api';
import WhatIfPanel from '../components/WhatIfPanel';
import ShapChart from '../components/ShapChart';
import RiskBadge from '../components/RiskBadge';

export default function WhatIf() {
  const [searchParams] = useSearchParams();
  const [customerId, setCustomerId] = useState(searchParams.get('customerId') || '7590-VHVEG');
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  // Pre-configured quick-test accounts from the dataset
  const sampleAccounts = [
    { id: '7590-VHVEG', label: '7590-VHVEG (Month-to-month, New Account, High Risk)' },
    { id: '9237-HQITU', label: '9237-HQITU (Fiber optic, High Churn Risk)' },
    { id: '5575-GNVDE', label: '5575-GNVDE (One year, 34 mos tenure, Low Risk)' },
    { id: '7795-CFOCW', label: '7795-CFOCW (DSL, 45 mos tenure, Medium/Low Risk)' }
  ];

  useEffect(() => {
    if (customerId) {
      loadCustomer(customerId);
    }
  }, [customerId]);

  const loadCustomer = async (cid) => {
    setLoading(true);
    setError(null);
    setSimulationResult(null);
    try {
      const data = await api.getAccountDetail(cid);
      setCurrentAccount(data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Customer not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (customerId.trim()) {
      loadCustomer(customerId.trim());
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">What-If Simulation Lab</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Perform sensitivity analysis on customer attributes to simulate model response under hypothetical intervention scenarios.
        </p>
      </div>

      {/* Account Selector & Quick Pick */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Enter Customer ID..."
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
            >
              Load
            </button>
          </form>

          {/* Quick-select chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Quick Select:</span>
            {sampleAccounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => setCustomerId(acc.id)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
                  customerId === acc.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {acc.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">Loading customer parameters and baseline model attributions...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {currentAccount && !loading && (
        <div className="space-y-8">
          {/* Active Account Overview Strip */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block">Active Target Account</span>
                <span className="text-lg font-bold font-mono text-white">{currentAccount.customerID}</span>
              </div>
              <RiskBadge level={currentAccount.prediction.risk_level} probability={currentAccount.prediction.churn_probability} />
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Contract</span>
                <span className="font-semibold text-white">{currentAccount.raw_attributes.Contract}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tenure</span>
                <span className="font-mono font-semibold text-white">{currentAccount.raw_attributes.tenure} mos</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Monthly Charge</span>
                <span className="font-mono font-semibold text-white">${currentAccount.raw_attributes.MonthlyCharges.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Interactive What-If Scenario Editor */}
          <WhatIfPanel
            customerId={currentAccount.customerID}
            initialAccount={currentAccount.raw_attributes}
            onSimulationResult={(res) => setSimulationResult(res)}
          />

          {/* If simulation has run, show simulated SHAP comparison */}
          {simulationResult?.simulated_explanation && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Simulated SHAP Attribution (Post-Intervention)
                </h3>
              </div>
              <ShapChart explanation={simulationResult.simulated_explanation} />
            </div>
          )}

          {/* Baseline SHAP Chart for comparison */}
          {!simulationResult && currentAccount.explanation && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-slate-400" />
                <h3 className="text-base font-bold text-slate-300 tracking-tight">
                  Baseline (Pre-Intervention) SHAP Waterfall
                </h3>
              </div>
              <ShapChart explanation={currentAccount.explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
