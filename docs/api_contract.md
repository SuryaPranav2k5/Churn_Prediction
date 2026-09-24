# API Contract: Explainable Customer Churn Intelligence Engine

All endpoints are hosted with prefix `/api` on port `5000`.

## 1. System Health
- **Route:** `GET /api/health`
- **Response:**
```json
{
  "status": "ok",
  "service": "Explainable Customer Churn Intelligence Engine",
  "version": "1.0.0"
}
```

## 2. Executive Dashboard Overview
- **Route:** `GET /api/dashboard`
- **Response:** High-level cohort KPIs, risk breakdown, model discrimination metrics (ROC-AUC, PR-AUC, Precision, Recall, F1, Brier Score), and top global SHAP churn drivers.

## 3. Account Explorer
- **Route:** `GET /api/accounts`
- **Query Parameters:** `page`, `page_size`, `search`, `risk` (`HIGH`, `MEDIUM`, `LOW`, `ALL`), `contract`, `sort_by`, `sort_order`
- **Response:** Paginated list of customer accounts with churn probability, risk level, and derived features.

## 4. Account Profile & Benchmarking
- **Route:** `GET /api/accounts/<customer_id>`
- **Response:** Complete customer profile, derived features, model prediction, population percentile benchmarks (`Percentile(x) = #(values < x) / N * 100`), and local SHAP explanation.

## 5. Local SHAP Attribution
- **Route:** `GET /api/accounts/<customer_id>/explanation`
- **Response:** Feature attributions pushing toward or away from churn, base value, and causality disclaimer.

## 6. Global SHAP Feature Importance
- **Route:** `GET /api/global-explanation`
- **Response:** Feature ranking by Mean |SHAP|, subgroup sensitivities, and methodological notices.

## 7. What-If Scenario Simulation
- **Route:** `POST /api/what-if`
- **Payload:**
```json
{
  "customer_id": "7590-VHVEG",
  "changes": {
    "Contract": "Two year",
    "TechSupport": "Yes"
  }
}
```
- **Response:** Original probability, simulated probability, delta, risk level transitions, and simulated SHAP waterfall.
