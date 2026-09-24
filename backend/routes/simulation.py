from flask import Blueprint, jsonify, request
from backend.services.account_service import account_service
from backend.services.model_service import model_service
from backend.services.shap_service import shap_service

simulation_bp = Blueprint("simulation", __name__)

@simulation_bp.route("/what-if", methods=["POST"])
def run_simulation():
    body = request.get_json() or {}
    customer_id = body.get("customer_id")
    changes = body.get("changes", {})

    if not customer_id:
        return jsonify({"error": "Field 'customer_id' is required"}), 400

    original_acc = account_service.get_account_by_id(customer_id)
    if not original_acc:
        return jsonify({"error": f"Customer '{customer_id}' not found"}), 404

    # Calculate original prediction
    orig_prob = model_service.predict_single(original_acc)
    orig_risk = model_service.get_risk_level(orig_prob)

    # Clone customer record and apply hypothetical changes
    simulated_acc = original_acc.copy()
    for field, new_val in changes.items():
        if field in simulated_acc:
            simulated_acc[field] = new_val

    # Recalculate derived features if relevant fields changed
    # e.g., if TechSupport or OnlineSecurity changed, recompute AddOnCount
    active_sec = 1 if simulated_acc.get("OnlineSecurity") == "Yes" else 0
    active_backup = 1 if simulated_acc.get("OnlineBackup") == "Yes" else 0
    active_protection = 1 if simulated_acc.get("DeviceProtection") == "Yes" else 0
    active_tech = 1 if simulated_acc.get("TechSupport") == "Yes" else 0
    active_tv = 1 if simulated_acc.get("StreamingTV") == "Yes" else 0
    active_movies = 1 if simulated_acc.get("StreamingMovies") == "Yes" else 0
    simulated_acc["AddOnCount"] = active_sec + active_backup + active_protection + active_tech + active_tv + active_movies
    simulated_acc["ServiceAdoption"] = round(simulated_acc["AddOnCount"] / 6.0, 4)

    # Predict simulated probability
    sim_prob = model_service.predict_single(simulated_acc)
    sim_risk = model_service.get_risk_level(sim_prob)
    delta = round(sim_prob - orig_prob, 4)

    # Explanation of the simulated state
    sim_explanation = shap_service.explain_customer(simulated_acc)

    return jsonify({
        "customer_id": customer_id,
        "original_probability": orig_prob,
        "simulated_probability": sim_prob,
        "delta": delta,
        "original_risk": orig_risk,
        "simulated_risk": sim_risk,
        "risk_reduced": delta < 0,
        "delta_percentage": round(delta * 100, 2),
        "changes_applied": changes,
        "simulated_explanation": sim_explanation,
        "disclaimer": "Scenario simulation, not causal prediction. This is model sensitivity analysis, not evidence that changing features will causally alter customer behavior."
    })
