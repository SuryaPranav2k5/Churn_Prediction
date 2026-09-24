import React from 'react';

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  accent = 'blue',
  badge
}) {
  const accentStyles = {
    blue: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 text-blue-400',
    rose: 'from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20 text-rose-400',
    amber: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 text-amber-400',
    emerald: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 text-emerald-400',
    indigo: 'from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 text-indigo-400',
  }[accent] || 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 text-blue-400';

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${accentStyles} border p-5 glass-card glass-card-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">{value}</h3>
            {badge && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 ${accentStyles.split(' ').pop()}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
          <span>{subtitle}</span>
          {trend && (
            <span className={`font-medium font-mono ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
