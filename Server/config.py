import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = Path(os.environ.get("MEETMUX_ARTIFACTS", BASE_DIR / "Model" / "artifacts"))

MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
EXPLAINER_PATH = ARTIFACTS_DIR / "explainer.joblib"
GLOBAL_SHAP_PATH = ARTIFACTS_DIR / "global_shap.json"
FEATURE_META_PATH = ARTIFACTS_DIR / "feature_metadata.json"
ACCOUNTS_CACHE_PATH = ARTIFACTS_DIR / "accounts_cache.json"

API_HOST = os.environ.get("MEETMUX_HOST", "0.0.0.0")
API_PORT = int(os.environ.get("PORT", os.environ.get("MEETMUX_PORT", "5000")))
CORS_ORIGINS = os.environ.get("MEETMUX_CORS", "*").split(",")

MODEL_VERSION = "1.0.0"

# Thresholds must match Model/train.py risk-tier logic
RISK_CRITICAL = 0.70
RISK_ELEVATED = 0.35
