"""Account listing, detail and portfolio stats endpoints."""

from flask import Blueprint, current_app, jsonify, request

account_bp = Blueprint("accounts", __name__, url_prefix="/api")


def _svc():
    return current_app.extensions["account_service"]


@account_bp.get("/accounts")
def list_accounts():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
    except ValueError:
        return jsonify({"error": "page and limit must be integers"}), 400
    limit = max(1, min(limit, 100))
    try:
        result = _svc().query(
            risk=request.args.get("risk_level", "ALL"),
            search=request.args.get("search", ""),
            page=page,
            limit=limit,
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(result)


@account_bp.get("/accounts/stats")
def account_stats():
    return jsonify(_svc().stats())


@account_bp.get("/accounts/<account_id>")
def account_detail(account_id):
    account = _svc().by_id.get(account_id.upper())
    if account is None:
        return jsonify({"error": f"unknown account '{account_id}'"}), 404
    return jsonify(account)
