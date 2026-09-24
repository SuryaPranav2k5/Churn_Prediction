import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sliders,
  Sparkles,
  User,
  CreditCard,
  Wifi,
  Shield,
  Layers,
  PhoneCall,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';
import ShapChart from '../components/ShapChart';
import CustomerComparison from '../components/CustomerComparison';
import WhatIfPanel from '../components/WhatIfPanel';

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    if (id) fetchDetail(id);
  }, [id]);

  const fetchDetail = async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAccountDetail(customerId);
      setAccount(data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Computing local SHAP explanations and population percentiles...</p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Account Not Found</h3>
        <p className="text-xs text-rose-300">{error || 'Customer ID does not exist in dataset'}</p>
        <button
          onClick={() => navigate('/accounts')}
          className="px-4 py-2 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg hover:bg-slate-800"
        >
          Return to Accounts
        </button>
      </div>
    );
  }

  const { customerID, raw_attributes, derived_attributes, prediction, population_comparison, explanation } = account;
  const probPct = Math.round(prediction.churn_probability * 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Back button and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/accounts')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-mono text-white tracking-tight">{customerID}</h1>
              <RiskBadge level={prediction.risk_level} probability={prediction.churn_probability} size="md" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer Account Intelligence Profile & Explainability Audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/what-if?customerId=${customerID}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Launch Dedicated What-If Lab</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Churn Probability</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">{probPct}%</span>
          <span className="text-[10px] text-slate-500">Base: {Math.round(prediction.base_value * 100)}%</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Contract Type</span>
          <span className="text-lg font-bold text-slate-200 mt-1 block truncate">{raw_attributes.Contract}</span>
          <span className="text-[10px] text-slate-500">{derived_attributes.ContractCommitmentLevel}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Tenure</span>
          <span className="text-2xl font-bold font-mono text-slate-200 mt-1 block">
            {raw_attributes.tenure} mo{raw_attributes.tenure === 1 ? '' : 's'}
          </span>
          <span className="text-[10px] text-slate-500">{derived_attributes.TenureBand}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Monthly Value At Risk</span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
            ${prediction.risk_adjusted_value.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500">Bill: ${raw_attributes.MonthlyCharges.toFixed(2)}</span>
        </div>
      </div>

      {/* Hero Visualizer: Local SHAP Waterfall */}
      <ShapChart
        explanation={explanation}
        onFeatureClick={(f) => setSelectedFeature(f)}
      />

      {/* Customer vs Population Percentile Benchmark */}
      <CustomerComparison comparison={population_comparison} />

      {/* Subscribed Services & Raw Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Services Matrix */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wifi className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Services & Subscriptions</h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Internet:</span>
              <span className="font-semibold text-white">{raw_attributes.InternetService}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Phone Service:</span>
              <span className="font-semibold text-white">{raw_attributes.PhoneService}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Multiple Lines:</span>
              <span className="font-semibold text-white">{raw_attributes.MultipleLines}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Online Security:</span>
              <span className="font-semibold text-white">{raw_attributes.OnlineSecurity}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Tech Support:</span>
              <span className="font-semibold text-white">{raw_attributes.TechSupport}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Online Backup:</span>
              <span className="font-semibold text-white">{raw_attributes.OnlineBackup}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Streaming TV:</span>
              <span className="font-semibold text-white">{raw_attributes.StreamingTV}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Streaming Movies:</span>
              <span className="font-semibold text-white">{raw_attributes.StreamingMovies}</span>
            </div>
          </div>
        </div>

        {/* Derived Behavioral Attributes (Section 11-18) */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Derived Engineered Features</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Total Active Services:</span>
              <span className="font-mono font-bold text-white">{derived_attributes.TotalServices} of 9</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Add-on Service Count:</span>
              <span className="font-mono font-bold text-white">{derived_attributes.AddOnCount} of 6</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Service Adoption Ratio:</span>
              <span className="font-mono font-bold text-blue-400">{Math.round(derived_attributes.ServiceAdoption * 100)}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Avg Historical Monthly Charges:</span>
              <span className="font-mono font-bold text-white">${derived_attributes.AvgHistoricalMonthlyCharges?.toFixed(2)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Charge-to-Tenure Ratio:</span>
              <span className="font-mono font-bold text-white">{derived_attributes.ChargeTenureInteraction}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded What-If Simulator Panel */}
      <WhatIfPanel
        customerId={customerID}
        initialAccount={raw_attributes}
      />
    </div>
  );
}
