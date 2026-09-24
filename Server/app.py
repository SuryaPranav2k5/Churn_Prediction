import sys
from pathlib import Path

# Ensure Server/ directory is in sys.path when running from repository root
SERVER_DIR = Path(__file__).resolve().parent
if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

from flask import Flask, jsonify
from flask_cors import CORS

from config import API_HOST, API_PORT, CORS_ORIGINS, MODEL_VERSION
from routes.account_routes import account_bp
from routes.predict_routes import predict_bp
from routes.shap_routes import shap_bp
from services.account_service import AccountService
from services.model_service import ModelService
from services.shap_service import ShapService


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,OPTIONS"
        return response

    ms = ModelService()
    app.extensions["model_service"] = ms
    app.extensions["shap_service"] = ShapService(ms)
    app.extensions["account_service"] = AccountService(ms)

    @app.get("/api/health")
    def health():
        return jsonify(
            {
                "status": "healthy",
                "model_loaded": True,
                "explainer_loaded": True,
                "total_accounts": len(app.extensions["account_service"].accounts),
                "model_version": MODEL_VERSION,
                "metrics": ms.metrics,
            }
        )

    app.register_blueprint(account_bp)
    app.register_blueprint(shap_bp)
    app.register_blueprint(predict_bp)

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(_):
        return jsonify({"error": "method not allowed"}), 405

    @app.errorhandler(Exception)
    def server_error(exc):
        app.logger.exception("unhandled error")
        return jsonify({"error": "internal server error", "detail": str(exc)}), 500

    return app


if __name__ == "__main__":
    create_app().run(host=API_HOST, port=API_PORT, debug=False)
