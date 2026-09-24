import React, { useState, useEffect } from 'react';
import { Sparkles, Info, ShieldCheck, BarChart2, Layers, Sliders, ArrowRight } from 'lucide-react';
import api from '../services/api';
import FeatureImpact from '../components/FeatureImpact';

export default function GlobalInsights() {
  const [globalData, setGlobalData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedThreshold, setSelectedThreshold] = useState(0.5);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [gRes, dRes] = await Promise.all([
        api.getGlobalExplanation(),
        api.getDashboard(),
      ]);
      setGlobalData(gRes);
      setDashboardData(dRes);
      if (gRes.top_drivers?.length > 0) {
        setSelectedDriver(gRes.top_drivers[0]);
      }
    } catch (err) {
      console.error('Failed to load global insights', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Computing cohort-wide SHAP values and model discrimination metrics...</p>
      </div>
    );
  }

  const modelPerf = dashboardData?.model_performance || {};
  const drivers = globalData?.top_drivers || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Explanation */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Global SHAP Intelligence</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Population-level feature importances and sub-category impact distributions across all 7,043 customers.
        </p>
      </div>

      {/* Hero: Top Drivers Grid and Active Feature Drill-down */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Driver Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Mean |SHAP| Feature Ranking
            </h2>
            <span className="text-[11px] text-slate-500">Click any card to inspect category breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {drivers.map((d) => (
              <FeatureImpact
                key={d.feature}
                driver={d}
                onSelect={(drv) => setSelectedDriver(drv)}
              />
            ))}
          </div>
        </div>

        {/* Right Col: Selected Feature Deep Dive (Section 41) */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {selectedDriver ? selectedDriver.feature_label : 'Feature Drill-Down'}
              </h3>
              <p className="text-[11px] text-slate-400">Section 41: Global-to-Local Decomposition</p>
            </div>
          </div>

          {selectedDriver ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Global Mean |SHAP|</span>
                <span className="text-xl font-bold font-mono text-indigo-400">{selectedDriver.mean_shap}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1.5">Behavioral Pattern:</span>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {selectedDriver.behavior}
                </p>
              </div>

              {selectedDriver.drill_down && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">Sub-tier Contributions:</span>
                  <div className="space-y-1.5">
                    {Object.entries(selectedDriver.drill_down).map(([tier, data]) => (
                      <div key={tier} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{tier}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{data.mean_effect || data}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Select a feature to view detailed breakdown.</p>
          )}

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[11px] text-slate-300 leading-relaxed">
            <span className="font-semibold text-blue-400">Presentation Note: </span>
            Highlight that SHAP uncovers nonlinear interactions and feature importance without enforcing arbitrary linear assumptions.
          </div>
        </div>
      </div>

      {/* Model Performance & Threshold Configuration Section (Pages 27-28) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Operational Threshold & Trade-off Optimization
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Testing intervention trade-offs between precision and recall (Section 34 & 35)
            </p>
          </div>
        </div>

        {/* Threshold Selection Table */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[
            { t: 0.2, p: 0.46, r: 0.91, f1: 0.61, desc: 'Maximum Recall (High retention outreach)' },
            { t: 0.3, p: 0.54, r: 0.85, f1: 0.66, desc: 'Aggressive' },
            { t: 0.4, p: 0.62, r: 0.79, f1: 0.69, desc: 'Balanced Catch' },
            { t: 0.5, p: 0.68, r: 0.73, f1: 0.70, desc: 'Standard Operating Threshold' },
            { t: 0.6, p: 0.75, r: 0.61, f1: 0.67, desc: 'High Confidence Only' },
            { t: 0.7, p: 0.82, r: 0.47, f1: 0.60, desc: 'Low Budget / Targeted Promotions' },
          ].map((item) => (
            <div
              key={item.t}
              onClick={() => setSelectedThreshold(item.t)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedThreshold === item.t
                  ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-mono font-bold text-white">Threshold [{item.t}]</span>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Prec:</span> <strong className="text-emerald-400">{Math.round(item.p * 100)}%</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Recall:</span> <strong className="text-cyan-400">{Math.round(item.r * 100)}%</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>F1:</span> <strong className="text-white">{item.f1}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mandatory causality disclaimer */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Methodology Limitation: </span>
            {globalData?.disclaimer || "SHAP explains model behavior, not causality. Feature importance values indicate how heavily the model relies on specific attributes, not causal levers."}
          </div>
        </div>
      </div>
    </div>
  );
}
