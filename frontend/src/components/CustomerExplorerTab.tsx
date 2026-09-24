import React, { useState, useEffect } from 'react';
import { Customer, CustomerListResponse } from '../types';
import { fetchCustomers } from '../services/api';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, AlertCircle } from 'lucide-react';

interface CustomerExplorerTabProps {
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomerExplorerTab: React.FC<CustomerExplorerTabProps> = ({ onSelectCustomer }) => {
  const [data, setData] = useState<CustomerListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [contract, setContract] = useState<string>('All');
  const [internetService, setInternetService] = useState<string>('All');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchCustomers({
        search: search.trim(),
        contract,
        internet_service: internetService,
        page,
        page_size: pageSize
      });
      setData(res);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, contract, internetService, page]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Controls & Filter Bar */}
      <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search by Customer ID (e.g. 7590-VHVEG)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={16} color="#94a3b8" />
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Contract:</span>
            <select
              value={contract}
              onChange={(e) => {
                setContract(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ width: '160px' }}
            >
              <option value="All">All Contracts</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Internet:</span>
            <select
              value={internetService}
              onChange={(e) => {
                setInternetService(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ width: '150px' }}
            >
              <option value="All">All Services</option>
              <option value="Fiber optic">Fiber optic</option>
              <option value="DSL">DSL</option>
              <option value="No">No Internet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Tenure</th>
                <th>Contract</th>
                <th>Internet Service</th>
                <th>Payment Method</th>
                <th>Monthly Bill</th>
                <th>Total Billed</th>
                <th>Historical Target</th>
                <th>Model Risk Score</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Loading customer directory...
                  </td>
                </tr>
              ) : !data || data.customers.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No customer records found matching filter criteria.
                  </td>
                </tr>
              ) : (
                data.customers.map((c) => (
                  <tr key={c.customerID} onClick={() => onSelectCustomer(c)}>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>
                      {c.customerID}
                    </td>
                    <td>{c.tenure} mo</td>
                    <td>{c.Contract}</td>
                    <td>{c.InternetService}</td>
                    <td>{c.PaymentMethod}</td>
                    <td>${c.MonthlyCharges.toFixed(2)}</td>
                    <td>${c.TotalCharges.toFixed(2)}</td>
                    <td>
                      {c.Churn === 'Yes' ? (
                        <span className="badge-churn-yes">Churned</span>
                      ) : (
                        <span className="badge-churn-no">Retained</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                        <AlertCircle size={14} color="#f59e0b" />
                        <span>Demo (Pending)</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCustomer(c);
                        }}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Eye size={14} /> View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && data.total_pages > 1 && (
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', background: 'rgba(11, 15, 25, 0.4)' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Showing {((data.page - 1) * pageSize) + 1} to {Math.min(data.page * pageSize, data.total)} of {data.total} records
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: data.page <= 1 ? '#475569' : '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: data.page <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700, padding: '0 8px' }}>
                Page {data.page} of {data.total_pages}
              </span>
              <button
                disabled={data.page >= data.total_pages}
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: data.page >= data.total_pages ? '#475569' : '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: data.page >= data.total_pages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
