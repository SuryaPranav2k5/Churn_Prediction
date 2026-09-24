export interface HealthResponse {
  status: string;
  dataset_available: boolean;
  model_available: boolean;
  mode: 'demo' | 'real';
}

export interface MetaResponse {
  project_name: string;
  dataset_label: string;
  model_status: string;
  model_available: boolean;
  model_badge: string;
  safe_display_fields: string[];
  allowed_model_inputs: string[];
  supported_filters: string[];
  limitations: string[];
}

export interface SummaryResponse {
  dataset_label: string;
  dataset_available: boolean;
  total_customers: number;
  actual_churned: number;
  actual_non_churned: number;
  actual_churn_rate: number;
  contract_distribution: Record<string, number>;
  internet_distribution: Record<string, number>;
  payment_distribution: Record<string, number>;
  churn_by_contract: Record<string, number>;
  predicted_risk_counts: Record<string, number> | null;
  model_available: boolean;
  data_cleaning_note?: string;
}

export interface Customer {
  customerID: string;
  gender?: string;
  SeniorCitizen?: number | string;
  SeniorCitizen_Display?: string;
  Partner?: string;
  Dependents?: string;
  tenure: number;
  PhoneService?: string;
  MultipleLines?: string;
  InternetService?: string;
  OnlineSecurity?: string;
  OnlineBackup?: string;
  DeviceProtection?: string;
  TechSupport?: string;
  StreamingTV?: string;
  StreamingMovies?: string;
  Contract?: string;
  PaperlessBilling?: string;
  PaymentMethod?: string;
  MonthlyCharges: number;
  TotalCharges: number;
  Churn: 'Yes' | 'No';
  churn_probability: number | null;
  risk_band: 'Low' | 'Medium' | 'High' | null;
}

export interface CustomerListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  customers: Customer[];
}

export interface SHAPFeature {
  feature: string;
  display_name: string;
  value: string | number;
  impact: number;
  direction: 'increases_risk' | 'decreases_risk';
}

export interface ExplanationResponse {
  available: boolean;
  mode?: string;
  customer_id?: string;
  message?: string;
  churn_probability?: number | null;
  risk_band?: string | null;
  model_version?: string;
  explanation?: {
    base_value: number;
    output_space: string;
    features: SHAPFeature[];
  } | null;
}

export interface PredictPayload {
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number;
}
