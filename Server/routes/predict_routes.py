"""Real-time scoring + counterfactual What-If simulation endpoints."""

from flask import Blueprint, current_app, jsonify, request

from schemas.request_schemas import ValidationError, validate_predict, validate_simulate
from services.model_service import risk_level

predict_bp = Blueprint("predict", __name__, url_prefix="/api")


@predict_bp.post("/predict")
def predict():
    ms = current_app.extensions["model_service"]
    ss = current_app.extensions["shap_service"]
    try:
        raw = validate_predict(request.get_json(silent=True) or {}, ms)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400
    prob = ms.predict(raw)
    forces = ss.decompose(raw)
    return jsonify(
        {
            "churn_probability": round(prob, 4),
            "risk_level": risk_level(prob),
            "base_prob": ms.base_prob,
            "positive_forces": forces["positive_forces"],
            "negative_forces": forces["negative_forces"],
        }
    )


@predict_bp.post("/simulate")
def simulate():
    ms = current_app.extensions["model_service"]
    ss = current_app.extensions["shap_service"]
    svc = current_app.extensions["account_service"]
    try:
        body = validate_simulate(request.get_json(silent=True) or {}, ms)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400

    base = svc.by_id.get(body["base_account_id"].upper())
    if base is None:
        return jsonify({"error": f"unknown account '{body['base_account_id']}'"}), 404

    base_raw = dict(base["raw_features"])
    original_prob = ms.predict(base_raw)

    sim_raw = dict(base_raw)
    sim_raw.update(body["overrides"])
    sim_prob = ms.predict(sim_raw)
    forces = ss.decompose(sim_raw)

    return jsonify(
        {
            "base_account_id": base["account_id"],
            "overrides": body["overrides"],
            "original_probability": round(original_prob, 4),
            "original_risk_level": risk_level(original_prob),
            "simulated_probability": round(sim_prob, 4),
            "new_risk_level": risk_level(sim_prob),
            "risk_delta": round(sim_prob - original_prob, 4),
            "updated_positive_forces": forces["positive_forces"],
            "updated_negative_forces": forces["negative_forces"],
        }
    )
