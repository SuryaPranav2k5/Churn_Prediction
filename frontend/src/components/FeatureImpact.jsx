import React from 'react';
import { TrendingUp, TrendingDown, HelpCircle, Layers } from 'lucide-react';

export default function FeatureImpact({ driver, onSelect }) {
  if (!driver) return null;

  return (
    <div
      onClick={() => onSelect && onSelect(driver)}
      className="glass-card glass-card-hover rounded-xl p-4 border border-slate-800 cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Rank #{driver.impact_rank}
            </span>
            <h4 className="text-sm font-bold text-white">{driver.feature_label || driver.feature}</h4>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{driver.behavior}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mean |SHAP|</span>
          <span className="text-base font-mono font-bold text-indigo-400">{driver.mean_shap}</span>
        </div>
      </div>

      {driver.drill_down && (
        <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Subgroup Sensitivities</span>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            {Object.entries(driver.drill_down).slice(0, 3).map(([subgroup, info]) => (
              <div key={subgroup} className="flex justify-between items-center py-1 px-2 rounded bg-slate-900/60 text-[11px]">
                <span className="text-slate-300 font-medium">{subgroup}</span>
                <span className="font-mono text-slate-400">{info.mean_effect || info}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
