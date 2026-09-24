from flask import Blueprint, jsonify
from backend.services.account_service import account_service
from backend.services.shap_service import shap_service

explanation_bp = Blueprint("explanation", __name__)

@explanation_bp.route("/accounts/<customer_id>/explanation", methods=["GET"])
def get_customer_explanation(customer_id):
    acc = account_service.get_account_by_id(customer_id)
    if not acc:
        return jsonify({"error": f"Customer '{customer_id}' not found"}), 404

    local_exp = shap_service.explain_customer(acc)
    return jsonify(local_exp)

@explanation_bp.route("/global-explanation", methods=["GET"])
def get_global_explanation():
    global_exp = shap_service.get_global_explanation()
    return jsonify(global_exp)
