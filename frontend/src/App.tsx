import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { CustomerExplorerTab } from './components/CustomerExplorerTab';
import { CustomerDetailDrawer } from './components/CustomerDetailDrawer';
import { PredictorTab } from './components/PredictorTab';
import { IntegrationDocTab } from './components/IntegrationDocTab';
import { fetchHealth, fetchSummary } from './services/api';
import { HealthResponse, SummaryResponse, Customer } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [healthRes, summaryRes] = await Promise.all([
          fetchHealth().catch(() => null),
          fetchSummary().catch(() => null)
        ]);
        if (healthRes) setHealth(healthRes);
        if (summaryRes) setSummary(summaryRes);
      } catch (err) {
        console.error('Error fetching initial app state:', err);
      } finally {
        setLoadingSummary(false);
      }
    };

    loadInitialData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} health={health} />

      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'overview' && (
          <OverviewTab summary={summary} loading={loadingSummary} />
        )}
        {activeTab === 'explorer' && (
          <CustomerExplorerTab onSelectCustomer={(c) => setSelectedCustomer(c)} />
        )}
        {activeTab === 'predictor' && (
          <PredictorTab />
        )}
        {activeTab === 'integration' && (
          <IntegrationDocTab />
        )}
      </main>

      {/* Customer Detail Modal Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* Global Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(11, 15, 25, 0.8)', padding: '16px 24px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>ChurnLens</strong> &bull; Public Telecom Retention Intelligence Engine
          </div>
          <div>
            Data: Public Kaggle Telco Customer Churn Sample &bull; Mode: Demo Mode Active
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
