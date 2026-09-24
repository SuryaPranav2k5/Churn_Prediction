import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RiskBadge({ level = 'LOW', probability = null, showIcon = true, size = 'md' }) {
  const normLevel = String(level).toUpperCase();

  const styles = {
    HIGH: {
      bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
      icon: AlertTriangle,
      label: 'High Risk'
    },
    MEDIUM: {
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
      icon: AlertCircle,
      label: 'Medium Risk'
    },
    LOW: {
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
      icon: CheckCircle2,
      label: 'Low Risk'
    }
  };

  const current = styles[normLevel] || styles.LOW;
  const IconComponent = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border transition-all ${current.bg} ${sizeClasses}`}>
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{current.label}</span>
      {probability !== null && (
        <span className="font-mono opacity-90 pl-0.5 border-l border-current/25">
          {Math.round(probability * 100)}%
        </span>
      )}
    </span>
  );
}
