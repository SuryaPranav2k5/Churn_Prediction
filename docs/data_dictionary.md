# Data Dictionary: IBM Telco Customer Churn

| Feature | Type | Source | Model? | Explanation |
| :--- | :--- | :--- | :--- | :--- |
| `customerID` | String (ID) | Raw | No | Unique customer identifier |
| `gender` | Categorical | Raw | Yes | Gender ('Male', 'Female') |
| `SeniorCitizen` | Binary | Raw | Yes | Whether the customer is a senior citizen (1, 0) |
| `Partner` | Binary | Raw | Yes | Whether customer has a partner ('Yes', 'No') |
| `Dependents` | Binary | Raw | Yes | Whether customer has dependents ('Yes', 'No') |
| `tenure` | Numeric | Raw | Yes | Number of months customer has stayed with company |
| `PhoneService` | Binary | Raw | Yes | Whether customer has phone service ('Yes', 'No') |
| `MultipleLines` | Categorical | Raw | Yes | Multiple phone lines ('Yes', 'No', 'No phone service') |
| `InternetService` | Categorical | Raw | Yes | Internet connection type ('DSL', 'Fiber optic', 'No') |
| `OnlineSecurity` | Categorical | Raw | Yes | Online security add-on ('Yes', 'No', 'No internet service') |
| `OnlineBackup` | Categorical | Raw | Yes | Cloud backup service ('Yes', 'No', 'No internet service') |
| `DeviceProtection` | Categorical | Raw | Yes | Device warranty/protection ('Yes', 'No', 'No internet service') |
| `TechSupport` | Categorical | Raw | Yes | Premium technical assistance ('Yes', 'No', 'No internet service') |
| `StreamingTV` | Categorical | Raw | Yes | TV streaming subscription ('Yes', 'No', 'No internet service') |
| `StreamingMovies` | Categorical | Raw | Yes | Movie streaming subscription ('Yes', 'No', 'No internet service') |
| `Contract` | Categorical | Raw | Yes | Contract term ('Month-to-month', 'One year', 'Two year') |
| `PaperlessBilling` | Binary | Raw | Yes | Paperless billing enrollment ('Yes', 'No') |
| `PaymentMethod` | Categorical | Raw | Yes | Billing method (Electronic check, Mailed check, Automatic Bank/Card) |
| `MonthlyCharges` | Numeric | Raw | Yes | Current monthly charge amount in USD |
| `TotalCharges` | Numeric | Raw | Yes | Total historical charge amount in USD |
| `Churn` | Binary | Raw | **Target** | Customer churn status ('Yes', 'No') |
| `TotalServices` | Numeric | **Derived** | Yes | Count of total active services (0-9) |
| `AddOnCount` | Numeric | **Derived** | Yes | Count of subscribed optional add-on services (0-6) |
| `ServiceAdoption` | Numeric | **Derived** | Yes | Ratio of adopted add-on services (`AddOnCount / 6.0`) |
| `AvgHistoricalMonthlyCharges` | Numeric | **Derived** | Yes | `TotalCharges / max(tenure, 1)` |
| `ChargeTenureInteraction` | Numeric | **Derived** | Yes | `MonthlyCharges * (1 / (1 + tenure))` |
| `TenureBand` | Categorical | **Derived** | Dashboard | 0–6m, 7–12m, 13–24m, 25–48m, 49+m |
| `ContractCommitmentLevel` | Categorical | **Derived** | Dashboard | High/Medium/Low contractual mobility |
| `CustomerValueProxy` | Numeric | **Derived** | Dashboard | Total historical charges proxy for account value |
| `RiskAdjustedValue` | Numeric | **Derived** | Dashboard | `ChurnProbability * MonthlyCharges` |
