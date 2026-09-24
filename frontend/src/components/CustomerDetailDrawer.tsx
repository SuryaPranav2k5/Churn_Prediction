import React from 'react';
import { Customer } from '../types';
import { X, User, DollarSign, Calendar, ShieldCheck, AlertCircle, Info, Layers, CheckCircle2, XCircle } from 'lucide-react';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({ customer, onClose }) => {
  if (!customer) return null;

  const services = [
    { label: 'Phone Service', val: customer.PhoneService },
    { label: 'Multiple Lines', val: customer.MultipleLines },
    { label: 'Internet Service', val: customer.InternetService },
    { label: 'Online Security', val: customer.OnlineSecurity },
    { label: 'Online Backup', val: customer.OnlineBackup },
    { label: 'Device Protection', val: customer.DeviceProtection },
    { label: 'Tech Support', val: customer.TechSupport },
    { label: 'Streaming TV', val: customer.StreamingTV },
    { label: 'Streaming Movies', val: customer.StreamingMovies },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '580px',
          height: '100%',
          borderRadius: 0,
          borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '28px',
          background: '#0e1526'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '10px', color: '#60a5fa' }}>
              <User size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TELECOM ACCOUNT PROFILE</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                {customer.customerID}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: '#94a3b8',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Historical Status Card */}
        <div style={{ margin: '20px 0', padding: '16px', borderRadius: '12px', background: 'rgba(19, 27, 46, 0.8)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Historical Target Label</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Recorded dataset label</span>
          </div>
          <div>
            {customer.Churn === 'Yes' ? (
              <span className="badge-churn-yes" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>Actual Churned</span>
            ) : (
              <span className="badge-churn-no" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>Actual Retained</span>
            )}
          </div>
        </div>

        {/* Financial & Subscription Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
              <Calendar size={14} color="#3b82f6" /> Tenure
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              {customer.tenure} Months
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
              <DollarSign size={14} color="#10b981" /> Monthly Bill
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              ${customer.MonthlyCharges.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Contract & Services List */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Subscription & Features
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Contract: <strong style={{ color: '#fff' }}>{customer.Contract}</strong></div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Payment: <strong style={{ color: '#fff' }}>{customer.PaymentMethod}</strong></div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Paperless Billing: <strong style={{ color: '#fff' }}>{customer.PaperlessBilling}</strong></div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Total Billed: <strong style={{ color: '#fff' }}>${customer.TotalCharges.toFixed(2)}</strong></div>
          </div>

          <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
            {services.map((s, idx) => (
              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px', fontSize: '0.775rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>{s.label}</span>
                <span style={{ fontWeight: 600, color: s.val === 'Yes' ? '#34d399' : s.val === 'No' ? '#94a3b8' : '#f59e0b' }}>
                  {s.val || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SHAP Force Plot / Explainability Section */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#8b5cf6" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                SHAP Force Plot & Feature Attribution
              </h4>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Demo Mode
            </span>
          </div>

          {/* Model Pending Notice Box */}
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#fbbf24', fontSize: '0.875rem' }}>AI Model Pending Integration</strong>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.4 }}>
                  Demo mode — AI model not connected. Live SHAP force-plot values will be generated once the AI teammate connects the trained model artifact.
                </p>
              </div>
            </div>
          </div>

          {/* Educational SHAP Visualization Demo */}
          <div style={{ background: 'rgba(11, 15, 25, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>
              <span>Expected Output Space: <strong>Probability</strong></span>
              <span>Base Value: <strong>0.24</strong></span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={13} /> SHAP describes model feature contributions, not proven causal drivers of customer churn.
            </div>

            {/* Illustrative Force Plot Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#fda4af' }}>Month-to-month Contract (Increases Risk)</span>
                <span style={{ fontWeight: 700, color: '#f43f5e' }}>+0.22 impact</span>
              </div>
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#fda4af' }}>Fiber Optic Internet (Increases Risk)</span>
                <span style={{ fontWeight: 700, color: '#f43f5e' }}>+0.14 impact</span>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#6ee7b7' }}>Tenure Length ({customer.tenure} mo) (Decreases Risk)</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>-0.18 impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
