import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Sliders, ExternalLink } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function AccountTable({ accounts = [], loading = false }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Loading customer cohort records...</p>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 text-xs">
        No accounts match the current filter criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px] bg-slate-900/40">
            <th className="py-3 px-4">Account ID</th>
            <th className="py-3 px-3">Contract</th>
            <th className="py-3 px-3">Tenure</th>
            <th className="py-3 px-3">Monthly Bill</th>
            <th className="py-3 px-3">Churn Risk</th>
            <th className="py-3 px-3">Risk Level</th>
            <th className="py-3 px-3">At-Risk Value</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {accounts.map((acc) => {
            const probPct = Math.round(acc.churn_probability * 100);
            return (
              <tr
                key={acc.customerID}
                className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                onClick={() => navigate(`/accounts/${acc.customerID}`)}
              >
                <td className="py-3 px-4 font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                  {acc.customerID}
                </td>
                <td className="py-3 px-3 text-slate-300">
                  <span className="truncate block max-w-[120px]">{acc.Contract}</span>
                </td>
                <td className="py-3 px-3 text-slate-300 font-mono">
                  {acc.tenure} mo{acc.tenure === 1 ? '' : 's'}
                </td>
                <td className="py-3 px-3 font-mono text-slate-200">
                  ${acc.MonthlyCharges?.toFixed(2)}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-100 min-w-[32px]">{probPct}%</span>
                    <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          acc.risk_level === 'HIGH'
                            ? 'bg-rose-500'
                            : acc.risk_level === 'MEDIUM'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${probPct}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <RiskBadge level={acc.risk_level} size="sm" showIcon={false} />
                </td>
                <td className="py-3 px-3 font-mono text-slate-300">
                  ${acc.risk_adjusted_value?.toFixed(2)}/mo
                </td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => navigate(`/accounts/${acc.customerID}`)}
                      title="Inspect SHAP Explanation"
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/what-if?customerId=${acc.customerID}`)}
                      title="Simulate What-If Scenarios"
                      className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
