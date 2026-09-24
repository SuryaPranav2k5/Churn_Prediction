import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import KPICard from '../components/KPICard';
import RiskBadge from '../components/RiskBadge';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      setError(err?.message || 'Failed to load executive dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Aggregating cohort intelligence and SHAP distributions...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Dashboard Offline</h3>
        <p className="text-xs text-rose-300">{error || 'Could not connect to intelligence backend API'}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg hover:bg-slate-800"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { summary, risk_breakdown, top_drivers, high_risk_sample, model_performance } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Executive Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-slate-950">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable Customer Churn Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Beyond Black-Box Predictions: <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Predict, Explain, Drill-Down & Simulate
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Telecom retention teams require more than raw risk probabilities. Our engine delivers mathematical transparency via SHAP attribution, cohort benchmarking, and sensitivity what-if simulations.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/accounts')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all"
            >
              <span>Explore 7,043 Accounts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/insights')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all"
            >
              <span>Global SHAP Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Monitored Accounts"
          value={summary.total_accounts.toLocaleString()}
          subtitle="IBM Telco Cohort Size"
          icon={Users}
          accent="blue"
          badge="Full Cohort"
        />
        <KPICard
          title="Historical Churn Rate"
          value={`${summary.churn_rate_percent}%`}
          subtitle="Ground-truth positive rate"
          icon={TrendingDown}
          accent="amber"
          trend="+0.4% MoM"
          trendPositive={false}
        />
        <KPICard
          title="High Risk Accounts"
          value={summary.high_risk_accounts.toLocaleString()}
          subtitle="Probability score > 60%"
          icon={AlertTriangle}
          accent="rose"
          badge={`${Math.round(summary.high_risk_accounts / summary.total_accounts * 100)}% of Base`}
        />
        <KPICard
          title="Monthly Value At Risk"
          value={`$${summary.monthly_revenue_at_risk.toLocaleString()}`}
          subtitle="Model-weighted monthly charges"
          icon={DollarSign}
          accent="indigo"
          badge="Risk Adjusted"
        />
      </div>

      {/* Middle Grid: Risk Distribution + Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Cohort Risk Stratification</h2>
              <p className="text-xs text-slate-400">Distribution of customers across operational intervention tiers</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Threshold: {summary.active_threshold}</span>
          </div>

          <div className="space-y-4">
            {risk_breakdown.map((item) => (
              <div key={item.risk} className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-slate-200">{item.risk}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-white">{item.count.toLocaleString()}</span>
                    <span className="font-mono text-slate-400 text-[11px]">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}40`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Key Insights summary pills */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Immediate Action Needed</span>
              <span className="text-sm font-bold text-rose-400 font-mono mt-1 block">
                {summary.high_risk_accounts} Accounts
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Nurture & Monitor</span>
              <span className="text-sm font-bold text-amber-400 font-mono mt-1 block">
                {summary.medium_risk_accounts} Accounts
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Healthy Stable Core</span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-1 block">
                {summary.low_risk_accounts} Accounts
              </span>
            </div>
          </div>
        </div>

        {/* Model Evaluation & Health (Page 26-28) */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Model Validation</h2>
              <p className="text-[11px] text-slate-400">{model_performance.model_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">ROC-AUC</span>
              <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">
                {model_performance.roc_auc}
              </span>
              <span className="text-[10px] text-slate-500">Discrimination</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">PR-AUC</span>
              <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
                {model_performance.pr_auc}
              </span>
              <span className="text-[10px] text-slate-500">Minority class</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Precision</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                {model_performance.precision}
              </span>
              <span className="text-[10px] text-slate-500">At threshold 0.5</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Brier Score</span>
              <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">
                {model_performance.brier_score}
              </span>
              <span className="text-[10px] text-slate-500">Calibration (low=good)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[11px] text-slate-300 leading-relaxed">
            <span className="font-semibold text-blue-400">Why PR-AUC?</span> Because churn is the minority class (~26.5%), models cannot rely on raw accuracy alone. Discrimination is verified across precision/recall trade-offs.
          </div>
        </div>
      </div>

      {/* Global Drivers Preview */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Primary Global Churn Drivers (SHAP)</h2>
              <p className="text-xs text-slate-400">Features with the largest average systemic impact across all 7,043 customers</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/insights')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>View All Drivers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {top_drivers.map((driver, idx) => (
            <div
              key={driver.feature}
              onClick={() => navigate('/insights')}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-mono font-bold text-blue-400">#{idx + 1} Driver</span>
                <span className="text-xs font-mono font-bold text-white">{driver.mean_shap} |SHAP|</span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                {driver.feature}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {driver.behavior}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* High-Risk Accounts Spotlight Sample (Page 45 Hero Flow) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">High-Risk Accounts for Immediate Review</h2>
            <p className="text-xs text-slate-400">Select any customer to view local SHAP explanation and run what-if simulations</p>
          </div>
          <button
            onClick={() => navigate('/accounts?risk=HIGH')}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
          >
            <span>Filter All High Risk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-900/40">
                <th className="py-2.5 px-4">Account ID</th>
                <th className="py-2.5 px-3">Contract</th>
                <th className="py-2.5 px-3">Tenure</th>
                <th className="py-2.5 px-3">Monthly Charge</th>
                <th className="py-2.5 px-3">Risk Probability</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {high_risk_sample.map((acc) => (
                <tr
                  key={acc.customerID}
                  onClick={() => navigate(`/accounts/${acc.customerID}`)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-white group-hover:text-blue-400">
                    {acc.customerID}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{acc.Contract}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{acc.tenure} mo{acc.tenure === 1 ? '' : 's'}</td>
                  <td className="py-3 px-3 font-mono text-slate-200">${acc.MonthlyCharges.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-rose-400">
                      {Math.round(acc.churn_probability * 100)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge level={acc.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                      <span>Explain</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
