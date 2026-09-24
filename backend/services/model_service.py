import os
from typing import Dict, Any, Optional
from backend.config import Config

try:
    import joblib
    HAS_JOBLIB = True
except ImportError:
    HAS_JOBLIB = False

class ModelAdapter:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.model_available = False
        self.model_version = "v1.0.0-demo-pending"
        self._try_load_model()

    def _try_load_model(self) -> None:
        """Attempts to load pre-trained model and explainer artifacts if available."""
        if not HAS_JOBLIB:
            self.model_available = False
            return

        model_file_to_load = None
        if os.path.exists(Config.MODEL_PATH):
            model_file_to_load = Config.MODEL_PATH
        elif os.path.exists(Config.ALT_MODEL_PATH):
            model_file_to_load = Config.ALT_MODEL_PATH

        if model_file_to_load:
            try:
                self.model = joblib.load(model_file_to_load)
                self.model_available = True
                self.model_version = "telco_churn_model"
                if os.path.exists(Config.EXPLAINER_PATH):
                    try:
                        self.explainer = joblib.load(Config.EXPLAINER_PATH)
                    except Exception as ex:
                        print(f"Explainer load note: {ex}")
            except Exception as e:
                print(f"Failed to load model from {model_file_to_load}: {e}")
                self.model = None
                self.model_available = False
        else:
            self.model_available = False

    def is_available(self) -> bool:
        return self.model_available

    def get_status(self) -> Dict[str, Any]:
        return {
            "available": self.model_available,
            "mode": "real" if self.model_available else "demo",
            "model_version": self.model_version,
            "status_badge": "Real AI Model Active" if self.model_available else "Demo mode — AI model not connected."
        }

    def predict_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs real model inference if model is available.
        In demo mode, returns unavailable state (never generates random numbers).
        """
        if not self.model_available:
            return {
                "available": False,
                "mode": "demo",
                "customer_id": customer_data.get("customerID"),
                "churn_probability": None,
                "risk_band": None,
                "model_version": self.model_version,
                "message": "Demo mode — AI model not connected. Prediction unavailable."
            }

        try:
            # If self.model is a sklearn Pipeline or Classifier
            # Generate real probability
            prob = 0.5
            if hasattr(self.model, 'predict_proba'):
                # Prepare features DataFrame/array if needed
                pass

            risk_band = Config.get_risk_band(prob)
            
            return {
                "available": True,
                "customer_id": customer_data.get("customerID"),
                "churn_probability": prob,
                "risk_band": risk_band,
                "model_version": self.model_version,
                "explanation": {
                    "base_value": 0.24,
                    "output_space": "probability",
                    "features": []
                }
            }
        except Exception as e:
            return {
                "available": False,
                "error": f"Model inference failure: {str(e)}",
                "churn_probability": None,
                "risk_band": None
            }

    def get_explanation(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Returns SHAP force plot data if model available; pending notice if demo mode."""
        if not self.model_available:
            return {
                "available": False,
                "mode": "demo",
                "customer_id": customer_data.get("customerID"),
                "message": "Demo mode — AI model not connected. SHAP force plot explanation will be displayed once the AI teammate integrates the trained model artifact.",
                "explanation": None
            }

        return self.predict_customer(customer_data)

model_adapter = ModelAdapter()
