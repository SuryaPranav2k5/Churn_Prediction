import os
from pathlib import Path

# Base project directory (Churn_Prediction root)
BASE_DIR = Path(__file__).resolve().parent.parent

class Config:
    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1", "t")
    
    # Paths
    RAW_DATA_PATH = BASE_DIR / "data" / "raw" / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
    PROCESSED_DATA_PATH = BASE_DIR / "data" / "processed" / "telco_processed.csv"
    
    MODEL_PATH = BASE_DIR / "models" / "churn_model.pkl"
    PREPROCESSOR_PATH = BASE_DIR / "models" / "preprocessor.pkl"
    METADATA_PATH = BASE_DIR / "models" / "model_metadata.json"
    
    # Risk Thresholds
    DEFAULT_THRESHOLD = 0.50
    HIGH_RISK_THRESHOLD = 0.60
    MEDIUM_RISK_THRESHOLD = 0.30
