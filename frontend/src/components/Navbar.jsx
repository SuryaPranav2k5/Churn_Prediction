import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Sparkles, Sliders, Activity, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const [systemOk, setSystemOk] = useState(true);

  useEffect(() => {
    api.getHealth()
      .then(res => setSystemOk(res?.status === 'ok'))
      .catch(() => setSystemOk(false));
  }, []);

  const navLinks = [
    { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/accounts', label: 'Account Explorer', icon: Users },
    { to: '/insights', label: 'Global Insights (SHAP)', icon: Sparkles },
    { to: '/what-if', label: 'What-If Lab', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">PlaceMux</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Explainable Churn Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Health indicator & Meta */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="text-slate-500">Cohort:</span>
              <span className="font-mono text-slate-300 font-medium">IBM Telco (7,043)</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${systemOk ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-400'}`} />
              <span className="text-slate-300 font-medium">{systemOk ? 'Engine Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
