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
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ComposedChart,
  Area
} from 'recharts';
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
        <p className="text-sm font-medium">Aggregating cohort intelligence, Recharts visuals, and SHAP distributions...</p>
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

  const { summary, charts = {}, top_drivers, high_risk_sample, model_performance } = data;
  const {
    risk_pie_data = [],
    tenure_chart_data = [],
    contract_chart_data = [],
    threshold_curve = []
  } = charts;

  // Custom Recharts Dark Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs space-y-1">
          <p className="font-semibold text-white">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span>{entry.name}:</span>
              <strong className="text-white">{entry.value}{entry.unit || ''}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            <button
              onClick={() => navigate('/what-if')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/40 text-indigo-200 text-xs font-semibold transition-all"
            >
              <span>Launch What-If Lab</span>
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
          title="Cohort Churn Rate"
          value={`${summary.churn_rate_percent}%`}
          subtitle="Ground-truth positive rate"
          icon={TrendingDown}
          accent="amber"
          trend="1,869 churned"
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

      {/* Visual Analytics Grid: Interactive Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Risk Tier Stratification Donut Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Risk Tier Stratification</h3>
                <p className="text-xs text-slate-400">Customer base distribution by predicted attrition probability</p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Cutoff: 0.60
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={risk_pie_data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {risk_pie_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Tenure vs Churn Rate Trend */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Tenure vs Churn Attrition Rate</h3>
                <p className="text-xs text-slate-400">Empirical churn rate (%) dropping steeply across account age bands</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tenure_chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="band" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="churn_rate" name="Churn Rate" unit="%" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="churn_rate" name="Trend" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Contract Commitment vs Churn Rate */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Contract Commitment Sensitivity</h3>
                <p className="text-xs text-slate-400">Month-to-month contracts vs Long-term lock-in</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-indigo-400">#1 SHAP Driver</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contract_chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="contract" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="churn_rate" name="Churn Rate" unit="%" radius={[6, 6, 0, 0]}>
                  {contract_chart_data.map((entry, index) => {
                    const colors = ['#f43f5e', '#f59e0b', '#10b981'];
                    return <Cell key={`bar-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 4: Precision vs Recall Operational Frontier */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <LineIcon className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Threshold Trade-off Curve</h3>
                <p className="text-xs text-slate-400">Precision vs Recall trade-offs for proactive retention campaigns</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">PR-AUC: 0.658</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={threshold_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="threshold" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="recall" name="Recall" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
                <Area type="monotone" dataKey="precision" name="Precision" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Performance Validation Badges */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Production Model Evaluation Metrics</h2>
            <p className="text-xs text-slate-400">{model_performance.model_name} trained on Stratified 80/20 Split</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">ROC-AUC</span>
            <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">{model_performance.roc_auc}</span>
            <span className="text-[10px] text-slate-500">Discrimination</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">PR-AUC</span>
            <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">{model_performance.pr_auc}</span>
            <span className="text-[10px] text-slate-500">Imbalanced metric</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Precision</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{model_performance.precision}</span>
            <span className="text-[10px] text-slate-500">True pos rate</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Recall</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{model_performance.recall}</span>
            <span className="text-[10px] text-slate-500">Catch rate</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">F1-Score</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">{model_performance.f1}</span>
            <span className="text-[10px] text-slate-500">Harmonic mean</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Brier Score</span>
            <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">{model_performance.brier_score}</span>
            <span className="text-[10px] text-slate-500">Calibration</span>
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
