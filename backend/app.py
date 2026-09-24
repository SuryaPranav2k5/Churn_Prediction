import sys
from pathlib import Path

# Add project root to sys.path so backend imports work reliably
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.routes.dashboard import dashboard_bp
from backend.routes.accounts import accounts_bp
from backend.routes.prediction import prediction_bp
from backend.routes.explanation import explanation_bp
from backend.routes.simulation import simulation_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all frontend origins
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Health check endpoint (Page 34, 47 of specification)
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "ok",
            "service": "Explainable Customer Churn Intelligence Engine",
            "version": "1.0.0"
        })

    # Register Blueprints under /api prefix
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(accounts_bp, url_prefix="/api")
    app.register_blueprint(prediction_bp, url_prefix="/api")
    app.register_blueprint(explanation_bp, url_prefix="/api")
    app.register_blueprint(simulation_bp, url_prefix="/api")

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    return app

app = create_app()

if __name__ == "__main__":
    print(f"Starting Churn Intelligence API on port {Config.PORT}...")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
