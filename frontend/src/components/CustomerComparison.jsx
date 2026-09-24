import React from 'react';
import { Users, BarChart3, ArrowRight, Check, X } from 'lucide-react';

export default function CustomerComparison({ comparison }) {
  if (!comparison) return null;

  const { monthly_charges, tenure, contract, tech_support, addon_count } = comparison;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <Users className="w-5 h-5 text-cyan-400" />
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Customer vs Population Benchmark</h3>
          <p className="text-xs text-slate-400">Contextualizing individual values against the 7,043 customer distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Charges Benchmark */}
        {monthly_charges && (
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-300">Monthly Billing</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-white">${monthly_charges.customer_value.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 font-mono">(Pop. Median: ${monthly_charges.population_median.toFixed(2)})</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-semibold">
                  {monthly_charges.percentile}th %ile
                </span>
              </div>
            </div>

            {/* Percentile bar */}
            <div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${monthly_charges.percentile}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {monthly_charges.interpretation}
              </p>
            </div>
          </div>
        )}

        {/* Tenure Benchmark */}
        {tenure && (
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-300">Account Tenure</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-white">{tenure.customer_value} mos</span>
                  <span className="text-xs text-slate-400 font-mono">(Pop. Median: {tenure.population_median} mos)</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-semibold">
                  {tenure.percentile}th %ile
                </span>
              </div>
            </div>

            {/* Percentile bar */}
            <div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${tenure.percentile}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {tenure.interpretation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Categorical Benchmarks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[11px]">Contract Mobility</span>
          <span className="font-semibold text-white mt-1 block">{contract?.customer_value}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Cohort Share: {contract?.population_distribution?.[contract?.customer_value] || 55}%</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[11px]">Tech Support</span>
          <div className="flex items-center gap-1.5 mt-1 font-semibold text-white">
            {tech_support?.customer_value === 'Yes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
            <span>{tech_support?.customer_value}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Cohort Adoption: {tech_support?.population_adoption_rate || 29}%</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[11px]">Add-on Ecosystem</span>
          <span className="font-semibold text-white mt-1 block">{addon_count?.customer_value} of 6 Add-ons</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Cohort Mean: {addon_count?.population_average || 2.0}</span>
        </div>
      </div>
    </div>
  );
}
