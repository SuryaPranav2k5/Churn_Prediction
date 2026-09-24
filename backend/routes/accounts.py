from flask import Blueprint, jsonify, request
from backend.services.account_service import account_service
from backend.services.model_service import model_service
from backend.services.shap_service import shap_service

accounts_bp = Blueprint("accounts", __name__)

@accounts_bp.route("/accounts", methods=["GET"])
def get_accounts():
    df = account_service.dataframe
    if df is None or df.empty:
        return jsonify({"error": "Dataset not available"}), 500

    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 15))
    search = request.args.get("search", "").strip()
    risk_filter = request.args.get("risk", "all").strip().upper()
    contract_filter = request.args.get("contract", "all").strip()
    sort_by = request.args.get("sort_by", "probability")
    sort_order = request.args.get("sort_order", "desc")

    # Start with filtered dataframe
    filtered_df = df.copy()

    if search:
        search_lower = search.lower()
        filtered_df = filtered_df[filtered_df["customerID"].str.lower().str.contains(search_lower)]

    if contract_filter and contract_filter != "all":
        filtered_df = filtered_df[filtered_df["Contract"] == contract_filter]

    # Convert subset or slice to list of dicts with predictions
    # To be extremely efficient and accurate:
    # First apply search/contract filter
    total_matching = len(filtered_df)

    # If sorting by static fields first
    if sort_by == "tenure":
        filtered_df = filtered_df.sort_values("tenure", ascending=(sort_order == "asc"))
    elif sort_by == "monthlyCharges":
        filtered_df = filtered_df.sort_values("MonthlyCharges", ascending=(sort_order == "asc"))
    elif sort_by == "totalCharges":
        filtered_df = filtered_df.sort_values("TotalCharges", ascending=(sort_order == "asc"))

    # To calculate probabilities accurately, we can evaluate rows
    records = filtered_df.to_dict(orient="records")

    enriched_records = []
    for r in records:
        prob = model_service.predict_single(r)
        risk = model_service.get_risk_level(prob)

        if risk_filter != "ALL" and risk != risk_filter:
            continue

        item = {
            "customerID": r["customerID"],
            "gender": r["gender"],
            "SeniorCitizen": int(r["SeniorCitizen"]),
            "Partner": r["Partner"],
            "Dependents": r["Dependents"],
            "tenure": int(r["tenure"]),
            "PhoneService": r["PhoneService"],
            "MultipleLines": r["MultipleLines"],
            "InternetService": r["InternetService"],
            "OnlineSecurity": r["OnlineSecurity"],
            "OnlineBackup": r["OnlineBackup"],
            "DeviceProtection": r["DeviceProtection"],
            "TechSupport": r["TechSupport"],
            "StreamingTV": r["StreamingTV"],
            "StreamingMovies": r["StreamingMovies"],
            "Contract": r["Contract"],
            "PaperlessBilling": r["PaperlessBilling"],
            "PaymentMethod": r["PaymentMethod"],
            "MonthlyCharges": float(r["MonthlyCharges"]),
            "TotalCharges": float(r["TotalCharges"]),
            # Derived features
            "TotalServices": int(r.get("TotalServices", 0)),
            "AddOnCount": int(r.get("AddOnCount", 0)),
            "ServiceAdoption": float(r.get("ServiceAdoption", 0.0)),
            "AvgHistoricalMonthlyCharges": float(r.get("AvgHistoricalMonthlyCharges", 0.0)),
            "ChargeTenureInteraction": float(r.get("ChargeTenureInteraction", 0.0)),
            "TenureBand": r.get("TenureBand", ""),
            "ContractCommitmentLevel": r.get("ContractCommitmentLevel", ""),
            "CustomerValueProxy": float(r.get("CustomerValueProxy", r["TotalCharges"])),
            # Model outputs
            "churn_probability": prob,
            "risk_level": risk,
            "risk_adjusted_value": round(float(r["MonthlyCharges"] * prob), 2),
            "actual_churn": r.get("Churn", "No")
        }
        enriched_records.append(item)

    # If sorting by probability or risk_adjusted_value
    if sort_by in ["probability", "churn_probability"]:
        enriched_records.sort(key=lambda x: x["churn_probability"], reverse=(sort_order == "desc"))
    elif sort_by == "risk_adjusted_value":
        enriched_records.sort(key=lambda x: x["risk_adjusted_value"], reverse=(sort_order == "desc"))

    total_filtered = len(enriched_records)
    total_pages = max(1, (total_filtered + page_size - 1) // page_size)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_items = enriched_records[start_idx:end_idx]

    return jsonify({
        "total": total_filtered,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "accounts": page_items
    })

@accounts_bp.route("/accounts/<customer_id>", methods=["GET"])
def get_account_detail(customer_id):
    acc = account_service.get_account_by_id(customer_id)
    if not acc:
        return jsonify({"error": f"Customer '{customer_id}' not found"}), 404

    prob = model_service.predict_single(acc)
    risk = model_service.get_risk_level(prob)

    # Population stats comparison (Page 32-33)
    pop_stats = account_service.get_population_stats()

    monthly_charge = float(acc["MonthlyCharges"])
    tenure_val = float(acc["tenure"])
    total_charge = float(acc["TotalCharges"])

    monthly_percentile = account_service.compute_percentile("MonthlyCharges", monthly_charge)
    tenure_percentile = account_service.compute_percentile("tenure", tenure_val)
    total_percentile = account_service.compute_percentile("TotalCharges", total_charge)

    comparison = {
        "monthly_charges": {
            "customer_value": monthly_charge,
            "population_median": pop_stats["monthly_charges"]["median"],
            "population_mean": pop_stats["monthly_charges"]["mean"],
            "percentile": monthly_percentile,
            "interpretation": f"Customer's monthly charge (${monthly_charge:.2f}) is at the {monthly_percentile}th percentile of the reference population (median ${pop_stats['monthly_charges']['median']:.2f})."
        },
        "tenure": {
            "customer_value": int(tenure_val),
            "population_median": pop_stats["tenure"]["median"],
            "population_mean": pop_stats["tenure"]["mean"],
            "percentile": tenure_percentile,
            "interpretation": f"Customer's tenure ({int(tenure_val)} months) is at the {tenure_percentile}th percentile (median {pop_stats['tenure']['median']} months)."
        },
        "contract": {
            "customer_value": acc["Contract"],
            "commitment_level": acc["ContractCommitmentLevel"],
            "population_distribution": pop_stats["contract_distribution"]
        },
        "tech_support": {
            "customer_value": acc["TechSupport"],
            "population_adoption_rate": pop_stats["tech_support_adoption_rate"]
        },
        "addon_count": {
            "customer_value": int(acc["AddOnCount"]),
            "population_average": pop_stats["avg_addon_count"]
        }
    }

    # Get local SHAP explanation
    explanation = shap_service.explain_customer(acc)

    response_data = {
        "customerID": customer_id,
        "raw_attributes": {
            "gender": acc["gender"],
            "SeniorCitizen": int(acc["SeniorCitizen"]),
            "Partner": acc["Partner"],
            "Dependents": acc["Dependents"],
            "tenure": int(acc["tenure"]),
            "PhoneService": acc["PhoneService"],
            "MultipleLines": acc["MultipleLines"],
            "InternetService": acc["InternetService"],
            "OnlineSecurity": acc["OnlineSecurity"],
            "OnlineBackup": acc["OnlineBackup"],
            "DeviceProtection": acc["DeviceProtection"],
            "TechSupport": acc["TechSupport"],
            "StreamingTV": acc["StreamingTV"],
            "StreamingMovies": acc["StreamingMovies"],
            "Contract": acc["Contract"],
            "PaperlessBilling": acc["PaperlessBilling"],
            "PaymentMethod": acc["PaymentMethod"],
            "MonthlyCharges": float(acc["MonthlyCharges"]),
            "TotalCharges": float(acc["TotalCharges"]),
            "Churn": acc.get("Churn", "No")
        },
        "derived_attributes": {
            "TotalServices": int(acc.get("TotalServices", 0)),
            "AddOnCount": int(acc.get("AddOnCount", 0)),
            "ServiceAdoption": float(acc.get("ServiceAdoption", 0.0)),
            "AvgHistoricalMonthlyCharges": float(acc.get("AvgHistoricalMonthlyCharges", 0.0)),
            "ChargeTenureInteraction": float(acc.get("ChargeTenureInteraction", 0.0)),
            "TenureBand": acc.get("TenureBand", ""),
            "ContractCommitmentLevel": acc.get("ContractCommitmentLevel", ""),
            "CustomerValueProxy": float(acc.get("CustomerValueProxy", acc["TotalCharges"])),
            "MonthlyValueProxy": float(acc.get("MonthlyValueProxy", acc["MonthlyCharges"]))
        },
        "prediction": {
            "churn_probability": prob,
            "risk_level": risk,
            "risk_adjusted_value": round(float(acc["MonthlyCharges"] * prob), 2),
            "base_value": explanation["base_value"],
        },
        "population_comparison": comparison,
        "explanation": explanation
    }

    return jsonify(response_data)
