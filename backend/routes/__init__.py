from backend.routes.dashboard import dashboard_bp
from backend.routes.accounts import accounts_bp
from backend.routes.prediction import prediction_bp
from backend.routes.explanation import explanation_bp
from backend.routes.simulation import simulation_bp

__all__ = ["dashboard_bp", "accounts_bp", "prediction_bp", "explanation_bp", "simulation_bp"]
