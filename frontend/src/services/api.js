import axios from 'axios';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Health
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Dashboard Overview
  getDashboard: async () => {
    const res = await apiClient.get('/dashboard');
    return res.data;
  },

  // Accounts List with search & filters
  getAccounts: async (params = {}) => {
    const res = await apiClient.get('/accounts', { params });
    return res.data;
  },

  // Account Detail
  getAccountDetail: async (customerId) => {
    const res = await apiClient.get(`/accounts/${customerId}`);
    return res.data;
  },

  // Local SHAP Explanation
  getCustomerExplanation: async (customerId) => {
    const res = await apiClient.get(`/accounts/${customerId}/explanation`);
    return res.data;
  },

  // Global SHAP & Model Insights
  getGlobalExplanation: async () => {
    const res = await apiClient.get('/global-explanation');
    return res.data;
  },

  // What-if Simulation
  runWhatIf: async (customerId, changes) => {
    const res = await apiClient.post('/what-if', {
      customer_id: customerId,
      changes,
    });
    return res.data;
  },

  // On-demand customer scoring
  predictCustomer: async (customerData) => {
    const res = await apiClient.post('/predict', customerData);
    return res.data;
  },
};

export default api;
