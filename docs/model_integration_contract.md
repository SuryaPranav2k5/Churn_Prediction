# ChurnLens Model Integration Contract

## 1. Overview
This document specifies the integration contract between the **ChurnLens** backend API and the Machine Learning model artifact developed by the AI team.

ChurnLens supports two operational states:
1. **Demo Mode (Current Default):** The AI model artifact is not loaded. Historical dataset statistics are displayed, prediction fields return `null`, and explanations indicate that the model is pending.
2. **Real Model Mode:** The backend loads the trained model artifact from `models/churn_model.pkl` (or `.joblib`) and preprocesses input attributes to generate real-time churn predictions and SHAP explanations.

---

## 2. Allowed Model Input Attributes
The model adapter accepts a single dictionary of raw customer attributes using canonical dataset field names.

### Allowed Features:
- `tenure` (integer: 0 to 72)
- `PhoneService` (string: "Yes", "No")
- `MultipleLines` (string: "No phone service", "No", "Yes")
- `InternetService` (string: "DSL", "Fiber optic", "No")
- `OnlineSecurity` (string: "No internet service", "No", "Yes")
- `OnlineBackup` (string: "No internet service", "No", "Yes")
- `DeviceProtection` (string: "No internet service", "No", "Yes")
- `TechSupport` (string: "No internet service", "No", "Yes")
- `StreamingTV` (string: "No internet service", "No", "Yes")
- `StreamingMovies` (string: "No internet service", "No", "Yes")
- `Contract` (string: "Month-to-month", "One year", "Two year")
- `PaperlessBilling` (string: "Yes", "No")
- `PaymentMethod` (string: "Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)")
- `MonthlyCharges` (float: monthly bill amount)
- `TotalCharges` (float: total billed amount; missing values default to 0.0)

### Excluded / Prohibited Inputs:
- `customerID` (display/lookup key only)
- `Churn` (historical target label — strictly excluded from input)
- `Churn Value`, `Churn Score`, `Churn Reason` (data leakage fields from extended dataset)
- `Count`, `Country`, `State` (constant fields)
- Demographics (`gender`, `SeniorCitizen`, `Partner`, `Dependents`) & precise location (dropped in initial model scope to maintain unbiased operational focus)

---

## 3. Standard Model Output Contract
When real model inference is performed, the adapter MUST return a JSON object adhering to the schema below:

```json
{
  "available": true,
  "customer_id": "7590-VHVEG",
  "churn_probability": 0.78,
  "risk_band": "High",
  "model_version": "v1.0.0-telco-xgb",
  "explanation": {
    "base_value": 0.24,
    "output_space": "probability",
    "features": [
      {
        "feature": "Contract",
        "display_name": "Contract Type",
        "value": "Month-to-month",
        "impact": 0.22,
        "direction": "increases_risk"
      },
      {
        "feature": "tenure",
        "display_name": "Tenure (Months)",
        "value": 1,
        "impact": 0.15,
        "direction": "increases_risk"
      },
      {
        "feature": "TechSupport",
        "display_name": "Tech Support",
        "value": "No",
        "impact": 0.08,
        "direction": "increases_risk"
      },
      {
        "feature": "Contract",
        "display_name": "Contract Type",
        "value": "Two year",
        "impact": -0.18,
        "direction": "decreases_risk"
      }
    ]
  }
}
```

### Response Field Specifications:
- `churn_probability`: Float between `0.0` and `1.0` representing model-estimated risk based on telecom attributes.
- `output_space`: MUST explicitly state `"probability"`, `"log-odds"`, or `"raw"`. Do not format log-odds values as percentages.
- `risk_band`: Computed using backend thresholds (`Low` < 0.35, `Medium` 0.35 - 0.70, `High` >= 0.70).
- `features`: Array of SHAP feature contributions sorted by absolute impact descending.
  - `impact`: Numerical contribution value (positive = increases risk, negative = decreases risk).
  - `direction`: `"increases_risk"` or `"decreases_risk"`.

---

## 4. How the AI Teammate Plugs In
1. Save the trained model and optional preprocessor artifact to `models/churn_model.pkl` (or `.joblib`).
2. If SHAP explainer objects are saved separately, place them in `models/shap_explainer.pkl`.
3. Update `backend/services/model_service.py` if custom pipeline transformation functions are needed.
