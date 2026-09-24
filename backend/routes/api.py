from flask import Blueprint, jsonify, request
from backend.config import Config
from backend.services.dataset_service import dataset_service
from backend.services.model_service import model_adapter

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health():
    model_status = model_adapter.get_status()
    return jsonify({
        "status": "ok",
        "dataset_available": dataset_service.dataset_available,
        "model_available": model_status["available"],
        "mode": model_status["mode"]
    }), 200

@api_bp.route('/meta', methods=['GET'])
def meta():
    model_status = model_adapter.get_status()
    return jsonify({
        "project_name": Config.PROJECT_NAME,
        "dataset_label": Config.DATASET_LABEL,
        "model_status": model_status["mode"],
        "model_available": model_status["available"],
        "model_badge": model_status["status_badge"],
        "safe_display_fields": Config.SAFE_DISPLAY_FIELDS,
        "allowed_model_inputs": Config.ALLOWED_MODEL_INPUTS,
        "supported_filters": ["search", "contract", "internet_service"],
        "limitations": [
            "This static dataset has a historical churn label; it does not predict future dated customer behavior.",
            "SHAP force plots describe model feature contributions, not proven causal drivers of customer churn.",
            "Predictions are model-estimated churn probabilities based on available telecom attributes."
        ]
    }), 200

@api_bp.route('/summary', methods=['GET'])
def summary():
    summary_data = dataset_service.get_summary()
    summary_data["model_available"] = model_adapter.is_available()
    return jsonify(summary_data), 200

@api_bp.route('/customers', methods=['GET'])
def get_customers():
    search = request.args.get('search', None)
    contract = request.args.get('contract', None)
    internet_service = request.args.get('internet_service', None)
    
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 20))
    except ValueError:
        return jsonify({"error": "page and page_size must be valid integers."}), 400

    result = dataset_service.get_customers(
        search=search,
        contract=contract,
        internet_service=internet_service,
        page=page,
        page_size=page_size
    )
    return jsonify(result), 200

@api_bp.route('/customers/<customer_id>', methods=['GET'])
def get_customer(customer_id):
    customer = dataset_service.get_customer_by_id(customer_id)
    if not customer:
        return jsonify({"error": f"Customer ID '{customer_id}' not found."}), 404
    return jsonify(customer), 200

@api_bp.route('/customers/<customer_id>/explanation', methods=['GET'])
def get_customer_explanation(customer_id):
    customer = dataset_service.get_customer_by_id(customer_id)
    if not customer:
        return jsonify({"error": f"Customer ID '{customer_id}' not found."}), 404

    explanation = model_adapter.get_explanation(customer)
    return jsonify(explanation), 200

@api_bp.route('/predict', methods=['POST'])
def predict():
    if not request.is_json:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    data = request.get_json()

    # Reject prohibited target / leakage fields
    rejected_fields = [f for f in Config.FORBIDDEN_FIELDS if f in data]
    if rejected_fields:
        return jsonify({
            "error": f"Prohibited fields detected in prediction payload: {', '.join(rejected_fields)}. Target and leakage fields are strictly forbidden."
        }), 400

    # If model is not connected, return 503 as specified in requirements
    if not model_adapter.is_available():
        return jsonify({
            "status": 503,
            "error": "AI model unavailable",
            "message": "Demo mode — AI model not connected. Prediction service is currently unavailable until the trained model artifact is integrated by the AI teammate.",
            "mode": "demo"
        }), 503

    result = model_adapter.predict_customer(data)
    return jsonify(result), 200
