import React from 'react';
import { FileCode, CheckCircle, XCircle, AlertCircle, Terminal, Layers } from 'lucide-react';

export const IntegrationDocTab: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'rgba(6, 182, 212, 0.08)', borderColor: 'rgba(6, 182, 212, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '10px', borderRadius: '10px', color: '#22d3ee' }}>
            <FileCode size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              AI Model Teammate Integration Contract
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              Standardized API boundaries, payload schemas, and zero-downtime drop-in deployment guide.
            </p>
          </div>
        </div>
        <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
          Contract File: docs/model_integration_contract.md
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Input Scope & Constraints */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#3b82f6" /> 1. Allowed Features vs Prohibited Fields
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <CheckCircle size={15} /> ALLOWED TELECOM FEATURES (15):
            </span>
            <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '12px', borderRadius: '8px', fontSize: '0.775rem', fontFamily: 'var(--font-mono)', color: '#cbd5e1', lineHeight: 1.6, border: '1px solid var(--border-subtle)' }}>
              tenure, PhoneService, MultipleLines, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies, Contract, PaperlessBilling, PaymentMethod, MonthlyCharges, TotalCharges
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: '#f43f5e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <XCircle size={15} /> STRICTLY PROHIBITED INPUTS (TARGET & LEAKAGE):
            </span>
            <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.775rem', fontFamily: 'var(--font-mono)', color: '#fda4af', lineHeight: 1.6, border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              customerID (display only), Churn (target label), Churn Value, Churn Score, Churn Reason (leakage), Count, Country, State (constant/demographic location fields dropped)
            </div>
          </div>
        </div>

        {/* Thresholds & Output Space */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="#8b5cf6" /> 2. Risk Thresholds & Output Space
          </h3>

          <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            <p style={{ marginBottom: '10px' }}>
              Risk band thresholds are centrally configured in backend <code style={{ color: '#c084fc' }}>backend/config.py</code>:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong>Low Risk:</strong> Probability &lt; 0.35</li>
              <li><strong>Medium Risk:</strong> Probability 0.35 to 0.70</li>
              <li><strong>High Risk:</strong> Probability &ge; 0.70</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#fbbf24', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Output Space Rule:</strong> Model output space must explicitly specify whether SHAP values are in "probability" or "log-odds". Log-odds MUST NOT be rendered as percentage probabilities.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
