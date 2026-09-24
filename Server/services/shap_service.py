"""SHAP extraction: global ranking passthrough + per-account force decomposition.

SHAP contributions are returned in raw log-odds space, the true TreeExplainer
semantics:  base_value_raw + sum(shap) == logit(churn_probability).
"""

import json

import joblib
import numpy as np

from config import GLOBAL_SHAP_PATH

# Business grouping for the global-impact chart
FEATURE_GROUP = {
    "gender": "Demographic",
    "senior_citizen": "Demographic",
    "partner": "Demographic",
    "dependents": "Demographic",
    "tenure_months": "Usage",
    "monthly_charges": "Financial",
    "total_charges": "Financial",
    "cltv": "Financial",
    "contract": "Contractual",
    "payment_method": "Contractual",
    "paperless_billing": "Contractual",
    "internet_service": "Services",
    "online_security": "Services",
    "online_backup": "Services",
    "device_protection": "Services",
    "tech_support": "Services",
    "streaming_tv": "Services",
    "streaming_movies": "Services",
    "phone_service": "Services",
    "multiple_lines": "Services",
}

MONEY_2DP = {"monthly_charges", "total_charges"}
MONEY_INT = {"cltv"}


def format_value(col: str, val) -> str:
    """Human-readable rendering of a raw feature value for force labels."""
    if col in MONEY_2DP:
        return f"${float(val):,.2f}"
    if col in MONEY_INT:
        return f"${int(round(float(val))):,}"
    if col == "tenure_months":
        months = int(round(float(val)))
        return f"{months} month{'s' if months != 1 else ''}"
    return str(val)


class ShapService:
    def __init__(self, model_service):
        self.ms = model_service
        self.global_shap = json.loads(GLOBAL_SHAP_PATH.read_text(encoding="utf-8"))

    def shap_vector(self, raw: dict) -> list[float]:
        """Positive-class Tree SHAP contributions using native LightGBM pred_contrib.
        
        LightGBM's native pred_contrib runs in <1ms, avoids cross-platform C++ 
        serialization issues, and yields exact Tree SHAP attributions.
        """
        X = self.ms.encode(raw)
        contribs = self.ms.model.booster_.predict(X, pred_contrib=True)
        # contribs has shape (1, n_features + 1), where last element is base_value
        return [float(v) for v in contribs[0][:-1]]

    def decompose(self, raw: dict) -> dict:
        """Split SHAP vector into ranked positive / negative force sets."""
        vec = self.shap_vector(raw)
        display = self.ms.display_names

        pos, neg = [], []
        for feature, shap_value in zip(self.ms.feature_cols, vec):
            raw_value = raw.get(feature, self.ms.defaults[feature])
            entry = {
                "feature": feature,
                "display_name": display.get(feature, feature),
                "value": format_value(feature, raw_value),
                "raw_value": raw_value,
                "shap_value": round(float(shap_value), 4),
            }
            (pos if entry["shap_value"] >= 0 else neg).append(entry)

        pos.sort(key=lambda e: e["shap_value"], reverse=True)
        neg.sort(key=lambda e: e["shap_value"])
        for forces in (pos, neg):
            for rank, entry in enumerate(forces, 1):
                entry["rank"] = rank
        return {"positive_forces": pos, "negative_forces": neg}

    def global_response(self) -> dict:
        return {
            "base_prob": self.global_shap["base_prob"],
            "base_value": self.ms.base_value_raw,
            "features": [
                {
                    **item,
                    "category": FEATURE_GROUP.get(item["feature"], "Other"),
                }
                for item in self.global_shap["features"]
            ],
        }
