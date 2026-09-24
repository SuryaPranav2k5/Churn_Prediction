import os

class Config:
    PROJECT_NAME = "ChurnLens"
    DATASET_LABEL = "Public telecom sample data"
    
    # Paths
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    RAW_DATA_PATH = os.path.join(DATA_DIR, "raw", "WA_Fn-UseC_-Telco-Customer-Churn.csv")
    FALLBACK_DATA_PATH = r"C:\Users\21302\Downloads\archive\WA_Fn-UseC_-Telco-Customer-Churn.csv"
    
    MODEL_DIR = os.path.join(BASE_DIR, "models")
    MODEL_PATH = os.path.join(MODEL_DIR, "telco_churn_model.joblib")
    ALT_MODEL_PATH = os.path.join(MODEL_DIR, "churn_model.pkl")
    EXPLAINER_PATH = os.path.join(MODEL_DIR, "shap_explainer.pkl")
    
    # Risk Band Thresholds (Single Backend Source of Truth)
    RISK_THRESHOLDS = {
        "LOW_MAX": 0.35,
        "MEDIUM_MAX": 0.70
    }
    
    @staticmethod
    def get_risk_band(probability: float) -> str:
        if probability is None:
            return "Unavailable"
        if probability < Config.RISK_THRESHOLDS["LOW_MAX"]:
            return "Low"
        elif probability < Config.RISK_THRESHOLDS["MEDIUM_MAX"]:
            return "Medium"
        else:
            return "High"

    # Schema definition
    ALLOWED_MODEL_INPUTS = [
        "tenure", "PhoneService", "MultipleLines", "InternetService",
        "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport",
        "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling",
        "PaymentMethod", "MonthlyCharges", "TotalCharges"
    ]
    
    FORBIDDEN_FIELDS = [
        "customerID", "Churn", "Churn Value", "Churn Score", "Churn Reason",
        "Count", "Country", "State", "City", "Zip Code", "Lat Long", "Latitude", "Longitude"
    ]

    SAFE_DISPLAY_FIELDS = [
        "customerID", "gender", "SeniorCitizen", "Partner", "Dependents",
        "tenure", "PhoneService", "MultipleLines", "InternetService",
        "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport",
        "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling",
        "PaymentMethod", "MonthlyCharges", "TotalCharges", "Churn"
    ]
