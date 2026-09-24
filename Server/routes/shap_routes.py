"""Global + per-account (force-plot) SHAP endpoints."""

from flask import Blueprint, current_app, jsonify

from services.model_service import risk_level

shap_bp = Blueprint("shap", __name__, url_prefix="/api/shap")


def _risk(prob: float) -> str:
    return risk_level(prob)


def _build_local(account: dict) -> dict:
    ms = current_app.extensions["model_service"]
    ss = current_app.extensions["shap_service"]
    raw = account["raw_features"]
    prob = ms.predict(raw)
    forces = ss.decompose(raw)
    base_raw = ms.base_value_raw
    shap_sum = sum(f["shap_value"] for f in forces["positive_forces"]) + sum(
        f["shap_value"] for f in forces["negative_forces"]
    )
    return {
        "account_id": account["account_id"],
        "churn_probability": round(prob, 4),
        "risk_level": _risk(prob),
        "base_prob": ms.base_prob,
        "base_value": base_raw,
        "predicted_value": round(base_raw + shap_sum, 4),
        "prediction_delta": round(prob - ms.base_prob, 4),
        "shap_space": "log_odds",
        "positive_forces": forces["positive_forces"],
        "negative_forces": forces["negative_forces"],
    }


@shap_bp.get("/global")
def global_shap():
    ss = current_app.extensions["shap_service"]
    return jsonify(ss.global_response())


@shap_bp.get("/local/<account_id>")
def local_shap(account_id):
    acct = current_app.extensions["account_service"].by_id.get(account_id.upper())
    if acct is None:
        return jsonify({"error": f"unknown account '{account_id}'"}), 404
    return jsonify(_build_local(acct))
