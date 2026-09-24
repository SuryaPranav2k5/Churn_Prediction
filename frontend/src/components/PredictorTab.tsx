import React, { useState } from 'react';
import { PredictPayload } from '../types';
import { submitPrediction } from '../services/api';
import { Calculator, AlertTriangle, CheckCircle, Info, Send, ShieldAlert, Cpu } from 'lucide-react';

export const PredictorTab: React.FC = () => {
  const [formData, setFormData] = useState<PredictPayload>({
    tenure: 12,
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'No',
    OnlineBackup: 'Yes',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'Yes',
    StreamingMovies: 'Yes',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 85.50,
    TotalCharges: 1026.00
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (field: keyof PredictPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await submitPrediction(formData);
      setResult(res);
    } catch (err: any) {
      setResult({
        error: 'Network failure',
        message: err.message || 'Failed to communicate with prediction service'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', background: 'rgba(139, 92, 246, 0.08)', borderColor: 'rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '10px', borderRadius: '10px', color: '#c084fc' }}>
            <Calculator size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
              Telecom Retention Churn Risk Simulator
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '2px' }}>
              Test hypothetical customer attribute profiles against the model adapter payload. Target and leakage fields are strictly excluded.
            </p>
          </div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.775rem', color: '#cbd5e1' }}>
          Input Schema: <strong>Allowed Telecom Attributes Only</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Attribute Form */}
        <form className="glass-card" onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            Customer Attribute Profile
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Tenure (Months): {formData.tenure}
              </label>
              <input
                type="range"
                min={0}
                max={72}
                value={formData.tenure}
                onChange={(e) => handleChange('tenure', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Monthly Charges ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.MonthlyCharges}
                onChange={(e) => handleChange('MonthlyCharges', parseFloat(e.target.value) || 0)}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Contract Type
              </label>
              <select
                value={formData.Contract}
                onChange={(e) => handleChange('Contract', e.target.value)}
                className="form-select"
              >
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Internet Service
              </label>
              <select
                value={formData.InternetService}
                onChange={(e) => handleChange('InternetService', e.target.value)}
                className="form-select"
              >
                <option value="Fiber optic">Fiber optic</option>
                <option value="DSL">DSL</option>
                <option value="No">No Internet</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Payment Method
              </label>
              <select
                value={formData.PaymentMethod}
                onChange={(e) => handleChange('PaymentMethod', e.target.value)}
                className="form-select"
              >
                <option value="Electronic check">Electronic check</option>
                <option value="Mailed check">Mailed check</option>
                <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                <option value="Credit card (automatic)">Credit card (automatic)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Tech Support
              </label>
              <select
                value={formData.TechSupport}
                onChange={(e) => handleChange('TechSupport', e.target.value)}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
            }}
          >
            <Send size={16} /> {loading ? 'Submitting to Adapter...' : 'Run Churn Prediction'}
          </button>
        </form>

        {/* Prediction Result / Demo Mode Notice */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '16px' }}>
              Model Adapter Response
            </h3>

            {!result ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <Cpu size={36} color="#475569" style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Click "Run Churn Prediction" to test the backend model integration adapter.
                </p>
              </div>
            ) : result.status === 503 || result.error === 'AI model unavailable' ? (
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', marginBottom: '12px' }}>
                  <AlertTriangle size={22} />
                  <strong style={{ fontSize: '1rem', color: '#fbbf24' }}>503 Service Unavailable — AI Model Not Connected</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '14px' }}>
                  {result.message}
                </p>
                <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#94a3b8', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: '#60a5fa', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    How to connect the real model:
                  </span>
                  Place the trained model artifact into <code style={{ color: '#c084fc' }}>models/churn_model.pkl</code>. The adapter will automatically switch to Real Model Mode without requiring a frontend rewrite.
                </div>
              </div>
            ) : result.available ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', marginBottom: '12px' }}>
                  <CheckCircle size={22} />
                  <strong style={{ fontSize: '1rem' }}>Prediction Successfully Generated</strong>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
                  {(result.churn_probability * 100).toFixed(1)}% Probability
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Risk Band: <strong>{result.risk_band}</strong>
                </div>
              </div>
            ) : (
              <div style={{ color: '#f43f5e', padding: '16px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '8px' }}>
                {result.error || 'An unexpected error occurred.'}
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} />
            <span>Predictions are model-estimated churn probabilities based on available telecom attributes.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
