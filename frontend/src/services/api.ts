import {
  HealthResponse,
  MetaResponse,
  SummaryResponse,
  CustomerListResponse,
  Customer,
  ExplanationResponse,
  PredictPayload
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

export async function fetchMeta(): Promise<MetaResponse> {
  const res = await fetch(`${API_BASE}/meta`);
  if (!res.ok) throw new Error('Failed to fetch project metadata');
  return res.json();
}

export async function fetchSummary(): Promise<SummaryResponse> {
  const res = await fetch(`${API_BASE}/summary`);
  if (!res.ok) throw new Error('Failed to fetch dataset summary');
  return res.json();
}

export async function fetchCustomers(params: {
  search?: string;
  contract?: string;
  internet_service?: string;
  page?: number;
  page_size?: number;
}): Promise<CustomerListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.contract) query.append('contract', params.contract);
  if (params.internet_service) query.append('internet_service', params.internet_service);
  if (params.page) query.append('page', params.page.toString());
  if (params.page_size) query.append('page_size', params.page_size.toString());

  const res = await fetch(`${API_BASE}/customers?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch customer list');
  return res.json();
}

export async function fetchCustomerById(customerId: string): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(customerId)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Customer ID '${customerId}' not found`);
    throw new Error('Failed to fetch customer details');
  }
  return res.json();
}

export async function fetchCustomerExplanation(customerId: string): Promise<ExplanationResponse> {
  const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(customerId)}/explanation`);
  if (!res.ok) throw new Error('Failed to fetch customer explanation');
  return res.json();
}

export async function submitPrediction(payload: PredictPayload): Promise<any> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  if (!res.ok) {
    return {
      status: res.status,
      error: data.error || 'Prediction failed',
      message: data.message || 'An error occurred while processing prediction request.',
      mode: data.mode || 'demo'
    };
  }
  return data;
}
