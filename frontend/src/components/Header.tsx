import React from 'react';
import { Activity, Users, Calculator, FileCode, AlertCircle, ShieldAlert } from 'lucide-react';
import { HealthResponse } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthResponse | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, health }) => {
  const isDemo = !health || !health.model_available;

  return (
    <header className="glass-card" style={{ borderRadius: '0 0 20px 20px', borderTop: 'none', padding: '16px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
          }}>
            <Activity size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                ChurnLens
              </h1>
              <span style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Telecom Retention Intelligence
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '2px' }}>
              Explainable Customer Churn Engine & SHAP Analytics
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(11, 15, 25, 0.5)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={16} /> Overview
          </button>
          <button
            className={`nav-tab ${activeTab === 'explorer' ? 'active' : ''}`}
            onClick={() => setActiveTab('explorer')}
          >
            <Users size={16} /> Customer Explorer
          </button>
          <button
            className={`nav-tab ${activeTab === 'predictor' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictor')}
          >
            <Calculator size={16} /> Churn Simulator
          </button>
          <button
            className={`nav-tab ${activeTab === 'integration' ? 'active' : ''}`}
            onClick={() => setActiveTab('integration')}
          >
            <FileCode size={16} /> AI Contract
          </button>
        </nav>

        {/* Demo Mode Badge */}
        <div>
          {isDemo ? (
            <div className="badge-demo" title="The AI teammate is developing the trained model artifact. App runs in clean demo mode.">
              <AlertCircle size={15} />
              <span>Demo mode — AI model not connected</span>
            </div>
          ) : (
            <div className="badge-real">
              <ShieldAlert size={15} />
              <span>Real Model Active</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
