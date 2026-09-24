import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info, ShieldAlert, Sparkles } from 'lucide-react';

export default function ShapChart({
  explanation,
  onFeatureClick,
  compact = false
}) {
  if (!explanation) return null;

  const {
    probability = 0.5,
    risk = 'MEDIUM',
    base_value = 0.28,
    pushes_toward_churn = [],
    pushes_away_from_churn = [],
    disclaimer
  } = explanation;

  // Maximum SHAP magnitude to normalize bar lengths
  const allShaps = [...pushes_toward_churn, ...pushes_away_from_churn].map(f => Math.abs(f.shap_value || 0));
  const maxShap = Math.max(...allShaps, 0.25);

  const probPct = Math.round(probability * 100);
  const basePct = Math.round(base_value * 100);

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow-xl space-y-6">
      {/* Header & Central Probability Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Local SHAP Attribution Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Decomposition of how individual features shift predicted churn risk relative to the baseline population ({basePct}%).
          </p>
        </div>

        {/* Central Risk Indicator */}
        <div className="flex items-center gap-4 bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Model Score</span>
            <span className="text-2xl font-bold font-mono text-white">{probPct}%</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cohort Base</span>
            <span className="text-sm font-semibold font-mono text-slate-300">{basePct}%</span>
          </div>
        </div>
      </div>

      {/* Hero Visualizer: PUSHES TOWARD vs PUSHES AWAY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PUSHES TOWARD CHURN */}
        <div className="space-y-3 bg-rose-500/5 rounded-xl p-4 border border-rose-500/20">
          <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
            <div className="flex items-center gap-1.5 text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Pushes Toward Churn (Risk Factors)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-rose-400/80 font-medium">
              +{pushes_toward_churn.reduce((acc, f) => acc + f.shap_value, 0).toFixed(2)} total
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {pushes_toward_churn.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No significant risk accelerators detected.</p>
            ) : (
              pushes_toward_churn.map((feat) => {
                const widthPct = Math.min(100, Math.round((Math.abs(feat.shap_value) / maxShap) * 100));
                return (
                  <div
                    key={feat.name}
                    onClick={() => onFeatureClick && onFeatureClick(feat)}
                    className="group cursor-pointer rounded-lg p-2 hover:bg-rose-500/10 transition-colors"
                  >
                    <div className="flex justify-between items-baseline text-xs mb-1.5">
                      <span className="font-medium text-slate-200 group-hover:text-rose-300 transition-colors">
                        {feat.feature_label || feat.name}: <span className="text-slate-400 font-mono">{feat.value}</span>
                      </span>
                      <span className="font-mono font-bold text-rose-400 ml-2">
                        +{feat.shap_value.toFixed(2)}
                      </span>
                    </div>

                    {/* Bar visualization */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PUSHES AWAY FROM CHURN */}
        <div className="space-y-3 bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Pushes Away From Churn (Retention Anchors)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-emerald-400/80 font-medium">
              {pushes_away_from_churn.reduce((acc, f) => acc + f.shap_value, 0).toFixed(2)} total
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {pushes_away_from_churn.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No active retention anchors found.</p>
            ) : (
              pushes_away_from_churn.map((feat) => {
                const widthPct = Math.min(100, Math.round((Math.abs(feat.shap_value) / maxShap) * 100));
                return (
                  <div
                    key={feat.name}
                    onClick={() => onFeatureClick && onFeatureClick(feat)}
                    className="group cursor-pointer rounded-lg p-2 hover:bg-emerald-500/10 transition-colors"
                  >
                    <div className="flex justify-between items-baseline text-xs mb-1.5">
                      <span className="font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">
                        {feat.feature_label || feat.name}: <span className="text-slate-400 font-mono">{feat.value}</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400 ml-2">
                        {feat.shap_value.toFixed(2)}
                      </span>
                    </div>

                    {/* Bar visualization */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex justify-end">
                      <div
                        className="bg-gradient-to-l from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Methodological Disclaimer from Specification Page 30 & 31 */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Interpretability Notice: </span>
          {disclaimer || "SHAP explains model behavior, not causality. A positive contribution means this feature value elevated the model's risk score relative to baseline, not that it caused customer attrition."}
        </div>
      </div>
    </div>
  );
}
