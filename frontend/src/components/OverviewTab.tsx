import React from 'react';
import { SummaryResponse } from '../types';
import { Users, UserX, UserCheck, Percent, ShieldAlert, Database, Info } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

interface OverviewTabProps {
  summary: SummaryResponse | null;
  loading: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
        Loading retention analytics...
      </div>
    );
  }

  const contractData = Object.entries(summary.contract_distribution || {}).map(([name, total]) => ({
    name,
    total,
    churned: summary.churn_by_contract?.[name] || 0
  }));

  const internetData = Object.entries(summary.internet_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner / Disclaimer */}
      <div className="glass-card" style={{ padding: '16px 20px', background: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Database size={20} color="#3b82f6" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{summary.dataset_label}</span>
              <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Validated Dataset</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Canonical Telco Customer Churn sample (7,043 rows). Data Cleaning: 11 blank TotalCharges values for tenure=0 filled with 0.0.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <Info size={15} />
          <span>Historical dataset facts shown below. Model predictions remain null in Demo Mode.</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Total Customers */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Customers</span>
            <Users size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '10px', color: '#ffffff' }}>
            {summary.total_customers.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Unique Telco accounts in dataset
          </div>
        </div>

        {/* Actual Churned */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Actual Churned</span>
            <UserX size={20} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '10px', color: '#f43f5e' }}>
            {summary.actual_churned.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Historical churn label "Yes"
          </div>
        </div>

        {/* Actual Retained */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Actual Retained</span>
            <UserCheck size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '10px', color: '#10b981' }}>
            {summary.actual_non_churned.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Historical churn label "No"
          </div>
        </div>

        {/* Historical Churn Rate */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Historical Churn Rate</span>
            <Percent size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '10px', color: '#c084fc' }}>
            {(summary.actual_churn_rate * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Actual sample proportion (not a forecast)
          </div>
        </div>

        {/* Model Risk Counts */}
        <div className="glass-card" style={{ padding: '20px', border: '1px dashed rgba(245, 158, 11, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f59e0b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Predicted High Risk</span>
            <ShieldAlert size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '12px', color: '#fbbf24' }}>
            Unavailable
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            AI Model pending integration
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Contract & Churn Breakdown Bar Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', color: '#ffffff' }}>
            Customer Breakdown by Contract Type
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px' }}>
            Comparing total customer count vs actual historical churn count
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#131b2e', border: '1px solid #3b82f6', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="total" name="Total Customers" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="churned" name="Actual Churned" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Internet Service Pie Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', color: '#ffffff' }}>
            Internet Service Type Share
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px' }}>
            Distribution of fiber optic, DSL, and no-internet subscribers
          </p>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={internetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {internetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#131b2e', border: '1px solid #3b82f6', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
