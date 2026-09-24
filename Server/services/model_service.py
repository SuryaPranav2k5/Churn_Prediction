"""Loads LightGBM artifacts and owns feature encoding + inference."""

import json

import joblib
import pandas as pd

from config import (
    FEATURE_META_PATH,
    MODEL_PATH,
    RISK_CRITICAL,
    RISK_ELEVATED,
)


def risk_level(prob: float) -> str:
    if prob >= RISK_CRITICAL:
        return "CRITICAL"
    if prob >= RISK_ELEVATED:
        return "ELEVATED"
    return "LOW"


class ModelService:
    def __init__(self):
        self.model = joblib.load(MODEL_PATH)
        self.metadata = json.loads(FEATURE_META_PATH.read_text(encoding="utf-8"))
        self.feature_cols: list[str] = self.metadata["feature_cols"]
        self.cat_cols: set[str] = set(self.metadata["cat_cols"])
        self.num_cols: set[str] = set(self.metadata["num_cols"])
        self.mappings: dict = self.metadata["category_mappings"]
        self.display_names: dict = self.metadata["display_names"]
        self.defaults: dict = self.metadata["feature_defaults"]
        self.metrics: dict = self.metadata["model_metrics"]
        self.base_value_raw: float = self.metadata["base_value_raw"]
        self.base_prob: float = self.metadata["base_prob"]

    def normalize_raw(self, features: dict) -> dict:
        """Fill missing keys with training defaults and drop unknown keys."""
        return {col: features.get(col, self.defaults[col]) for col in self.feature_cols}

    def encode(self, raw: dict) -> pd.DataFrame:
        """Encode a raw-value feature dict into model input order."""
        row = {}
        for col in self.feature_cols:
            val = raw.get(col, self.defaults[col])
            if col in self.mappings:
                val = self.mappings[col]["val_to_int"].get(str(val), -1)
            else:
                val = float(val)
            row[col] = val
        return pd.DataFrame([row], columns=self.feature_cols)

    def predict(self, raw: dict) -> float:
        return float(self.model.predict_proba(self.encode(raw))[:, 1][0])
