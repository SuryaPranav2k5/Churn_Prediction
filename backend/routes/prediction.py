from flask import Blueprint, jsonify, request
from backend.services.model_service import model_service
from backend.services.shap_service import shap_service

prediction_bp = Blueprint("prediction", __name__)

@prediction_bp.route("/predict", methods=["POST"])
def predict_churn():
    customer_data = request.get_json() or {}
    if not customer_data:
        return jsonify({"error": "No customer data provided in request body"}), 400

    probability = model_service.predict_single(customer_data)
    risk_level = model_service.get_risk_level(probability)

    explanation = shap_service.explain_customer(customer_data)

    return jsonify({
        "churn_probability": probability,
        "risk_level": risk_level,
        "base_value": explanation["base_value"],
        "top_features": explanation["features"][:5],
        "disclaimer": "SHAP explains model behavior, not causality."
    })
