# ChurnLens — Explainable Customer Churn Engine & SHAP Dashboard

**ChurnLens** is an explainable customer churn analytics dashboard designed for telecom retention teams. Built for hackathon demonstration, it enables retention agents to explore customer risk factors, analyze dataset distributions, simulate customer profile predictions, and view SHAP feature attributions.

---

## 🌟 Key Features

1. **Executive Retention Dashboard:**
   - Visualizes actual historical dataset facts (7,043 total customers, 1,869 churned, 5,174 retained, 26.5% historical churn rate).
   - Interactive charts breaking down subscriber contracts, internet service types, and payment methods.
   - Clear distinction between actual dataset facts and model predictions.

2. **Customer Explorer Directory:**
   - Searchable by `customerID` (e.g., `7590-VHVEG`).
   - Filterable by `Contract` type and `InternetService`.
   - Paginated customer table displaying charges, tenure, and services.
   - Modal drawer with account profile details and SHAP force-plot explainer.

3. **Demo Mode & Model Integration Adapter:**
   - Supported States:
     - **Demo Mode (Current Default):** Prominently marked with **"Demo mode — AI model not connected."** Prediction fields return `null` and prediction endpoint returns `503 Service Unavailable`.
     - **Real Model Mode:** Drops in seamlessly when the AI teammate saves the trained model artifact into `models/churn_model.pkl`.
   - Single backend source of truth for risk-band thresholds (`Low` < 0.35, `Medium` 0.35 - 0.70, `High` >= 0.70).

4. **Churn Risk Simulator:**
   - Test hypothetical customer attribute combinations (`tenure`, `Contract`, `InternetService`, `MonthlyCharges`, etc.).
   - Rejects target (`Churn`) and leakage fields automatically.

---

## 🏗 Project Architecture

```text
Churn_Prediction/
├── backend/
│   ├── app.py                 # Flask server entrypoint
│   ├── config.py              # Single source of truth for paths, thresholds & schemas
│   ├── routes/
│   │   └── api.py             # API blueprints (/api/health, /api/summary, /api/customers, /api/predict)
│   └── services/
│       ├── dataset_service.py # Standard CSV parsing, data cleaning, pagination & summary
│       └── model_service.py   # Model adapter boundary (Demo Mode / Real Model Mode)
├── data/
│   └── raw/
│       └── WA_Fn-UseC_-Telco-Customer-Churn.csv # Canonical Kaggle dataset
├── docs/
│   └── model_integration_contract.md           # Contract for AI teammate model integration
├── frontend/                  # React + Vite + TypeScript web application
│   ├── src/
│   │   ├── components/        # OverviewTab, CustomerExplorerTab, CustomerDetailDrawer, PredictorTab
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript contract definitions
│   │   └── index.css          # Design system & dark theme styling
├── ml/                        # Notebooks & exploration scripts
├── models/                    # Target directory for AI teammate trained model artifacts
└── tests/
    └── test_api.py            # Unit tests for Flask API endpoints
```

---

## 🚀 Quickstart Guide

### 1. Run the Flask Backend API

```bash
# In project root (Churn_Prediction):
python backend/app.py
```
*Backend will run on `http://localhost:5000`*

### 2. Run the React Frontend

```bash
# Navigate to frontend directory:
cd frontend

# Install dependencies (if not already done):
npm install

# Start development server:
npm run dev
```
*Frontend will run on `http://localhost:3000`*

---

## 🧪 Running Unit Tests

```bash
python -m unittest tests/test_api.py
```

---

## 🤝 Model Integration Contract for AI Teammates

Refer to [`docs/model_integration_contract.md`](file:///c:/Users/21302/OneDrive/Desktop/Desktop/Hackathon/Churn_Prediction/docs/model_integration_contract.md) for full specs.

1. Save trained model to `models/churn_model.pkl` (or `.joblib`).
2. Save optional SHAP explainer object to `models/shap_explainer.pkl`.
3. The backend model adapter will automatically detect the model file and enable **Real Model Mode** across all endpoints without requiring any frontend rewrite!