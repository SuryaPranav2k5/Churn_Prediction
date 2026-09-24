import React, { useState } from 'react';
import { Sliders, Play, RefreshCw, ArrowRight, AlertCircle, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import api from '../services/api';
import RiskBadge from './RiskBadge';

export default function WhatIfPanel({ customerId, initialAccount, onSimulationResult }) {
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(initialAccount?.Contract || 'Month-to-month');
  const [techSupport, setTechSupport] = useState(initialAccount?.TechSupport || 'No');
  const [onlineSecurity, setOnlineSecurity] = useState(initialAccount?.OnlineSecurity || 'No');
  const [onlineBackup, setOnlineBackup] = useState(initialAccount?.OnlineBackup || 'No');
  const [paymentMethod, setPaymentMethod] = useState(initialAccount?.PaymentMethod || 'Electronic check');
  const [paperlessBilling, setPaperlessBilling] = useState(initialAccount?.PaperlessBilling || 'Yes');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSimulate = async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const changes = {
        Contract: contract,
        TechSupport: techSupport,
        OnlineSecurity: onlineSecurity,
        OnlineBackup: onlineBackup,
        PaymentMethod: paymentMethod,
        PaperlessBilling: paperlessBilling,
      };
      const res = await api.runWhatIf(customerId, changes);
      setResult(res);
      if (onSimulationResult) onSimulationResult(res);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Simulation error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContract(initialAccount?.Contract || 'Month-to-month');
    setTechSupport(initialAccount?.TechSupport || 'No');
    setOnlineSecurity(initialAccount?.OnlineSecurity || 'No');
    setOnlineBackup(initialAccount?.OnlineBackup || 'No');
    setPaymentMethod(initialAccount?.PaymentMethod || 'Electronic check');
    setPaperlessBilling(initialAccount?.PaperlessBilling || 'Yes');
    setResult(null);
    setError(null);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Interactive What-If Simulation</h3>
            <p className="text-xs text-slate-400">Model sensitivity testing on customer attributes</p>
          </div>
        </div>
        <button
          onClick={resetForm}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Attribute modification controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Contract */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contract Type</label>
          <select
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="Month-to-month">Month-to-month</option>
            <option value="One year">One year</option>
            <option value="Two year">Two year</option>
          </select>
        </div>

        {/* Tech Support */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tech Support</label>
          <select
            value={techSupport}
            onChange={(e) => setTechSupport(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* Online Security */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Online Security</label>
          <select
            value={onlineSecurity}
            onChange={(e) => setOnlineSecurity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* Online Backup */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Online Backup</label>
          <select
            value={onlineBackup}
            onChange={(e) => setOnlineBackup(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="Electronic check">Electronic check</option>
            <option value="Mailed check">Mailed check</option>
            <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
            <option value="Credit card (automatic)">Credit card (automatic)</option>
          </select>
        </div>

        {/* Paperless Billing */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Paperless Billing</label>
          <select
            value={paperlessBilling}
            onChange={(e) => setPaperlessBilling(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      {/* Action button */}
      <div>
        <button
          onClick={handleSimulate}
          disabled={loading || !customerId}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>Run What-If Simulation</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Simulation Result Card */}
      {result && (
        <div className="rounded-xl bg-slate-900/90 border border-indigo-500/30 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Simulation Outcome</span>
            <span className="text-xs text-slate-400 font-mono">Customer: {result.customer_id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {/* Original */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Original Risk</span>
              <div className="text-2xl font-bold font-mono text-white">
                {Math.round(result.original_probability * 100)}%
              </div>
              <div className="mt-1">
                <RiskBadge level={result.original_risk} size="sm" />
              </div>
            </div>

            {/* Delta */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[11px] text-slate-400 block mb-1">Simulated Delta</span>
              <div className={`text-2xl font-bold font-mono flex items-center gap-1 ${result.delta < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.delta < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                <span>{result.delta_percentage > 0 ? `+${result.delta_percentage}%` : `${result.delta_percentage}%`}</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                {result.delta < 0 ? 'Risk Reduction' : 'Risk Increase'}
              </span>
            </div>

            {/* Simulated */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-indigo-500/30">
              <span className="text-[11px] text-indigo-300 block mb-1">Simulated Risk</span>
              <div className="text-2xl font-bold font-mono text-indigo-400">
                {Math.round(result.simulated_probability * 100)}%
              </div>
              <div className="mt-1">
                <RiskBadge level={result.simulated_risk} size="sm" />
              </div>
            </div>
          </div>

          {/* Causal Disclaimer */}
          <div className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2.5 rounded border border-slate-800/80">
            "{result.disclaimer}"
          </div>
        </div>
      )}
    </div>
  );
}
