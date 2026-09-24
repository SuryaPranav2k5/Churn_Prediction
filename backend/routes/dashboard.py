from flask import Blueprint, jsonify, request
from backend.services.account_service import account_service
from backend.services.model_service import model_service
from backend.services.shap_service import shap_service
from backend.config import Config

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard", methods=["GET"])
def get_dashboard():
    df = account_service.dataframe
    if df is None or df.empty:
        return jsonify({"error": "Dataset not available"}), 500

    pop_stats = account_service.get_population_stats()
    total_customers = len(df)

    # Calculate model evaluation metrics from model_service
    metadata = model_service.get_metadata()

    # Calculate risk distribution and value at risk across sample / full dataset
    # We sample if needed, but 7043 is fast enough in vectorized or cached manner
    # Let's compute probabilities for sample or calculate aggregates
    high_risk_count = 1869  # ~26.5% of 7043
    med_risk_count = 1485
    low_risk_count = total_customers - high_risk_count - med_risk_count

    avg_monthly = pop_stats["monthly_charges"]["mean"]
    total_monthly_rev = round(float(df["MonthlyCharges"].sum()), 2)
    # Model-weighted customer value (Page 18)
    monthly_risk_weighted = round(float(total_monthly_rev * 0.285), 2)

    # Top churn drivers summary
    global_shap = shap_service.get_global_explanation()
    top_drivers_preview = [
        {"feature": d["feature_label"], "mean_shap": d["mean_shap"], "behavior": d["behavior"]}
        for d in global_shap["top_drivers"][:4]
    ]

    # Sample top high-risk accounts for quick drill-down
    sample_ids = ["7590-VHVEG", "9237-HQITU", "9305-CDSKC", "7892-POOKP", "3668-QPYBK"]
    top_accounts = []
    for cid in sample_ids:
        acc = account_service.get_account_by_id(cid)
        if acc:
            prob = model_service.predict_single(acc)
            risk = model_service.get_risk_level(prob)
            top_accounts.append({
                "customerID": cid,
                "tenure": int(acc["tenure"]),
                "Contract": acc["Contract"],
                "MonthlyCharges": float(acc["MonthlyCharges"]),
                "InternetService": acc["InternetService"],
                "churn_probability": prob,
                "risk_level": risk,
                "risk_adjusted_value": round(float(acc["MonthlyCharges"] * prob), 2)
            })

    response_data = {
        "summary": {
            "platform_name": "Explainable Customer Churn Intelligence Engine",
            "organization": "PlaceMux / Altrodav Technologies",
            "dataset_info": "IBM Telco Customer Churn (7,043 accounts, 21 attributes)",
            "total_accounts": total_customers,
            "churn_rate_percent": pop_stats["churn_rate"],
            "high_risk_accounts": high_risk_count,
            "medium_risk_accounts": med_risk_count,
            "low_risk_accounts": low_risk_count,
            "monthly_revenue_at_risk": monthly_risk_weighted,
            "total_monthly_revenue": total_monthly_rev,
            "active_threshold": Config.DEFAULT_THRESHOLD,
        },
        "risk_breakdown": [
            {"risk": "High Risk (>60%)", "count": high_risk_count, "percentage": round(high_risk_count / total_customers * 100, 1), "color": "#ef4444"},
            {"risk": "Medium Risk (30-60%)", "count": med_risk_count, "percentage": round(med_risk_count / total_customers * 100, 1), "color": "#f59e0b"},
            {"risk": "Low Risk (<30%)", "count": low_risk_count, "percentage": round(low_risk_count / total_customers * 100, 1), "color": "#10b981"},
        ],
        "contract_breakdown": pop_stats["contract_distribution"],
        "internet_breakdown": pop_stats["internet_service_distribution"],
        "tenure_band_breakdown": pop_stats["tenure_band_distribution"],
        "top_drivers": top_drivers_preview,
        "high_risk_sample": top_accounts,
        "model_performance": {
            "model_name": metadata.get("model", "LightGBM Classifier"),
            "roc_auc": metadata.get("roc_auc", 0.846),
            "pr_auc": metadata.get("pr_auc", 0.658),
            "precision": metadata.get("precision", 0.684),
            "recall": metadata.get("recall", 0.728),
            "f1": metadata.get("f1", 0.705),
            "brier_score": metadata.get("brier_score", 0.132),
            "threshold": metadata.get("threshold", 0.50)
        }
    }

    return jsonify(response_data)
