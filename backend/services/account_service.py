import pandas as pd
import numpy as np
from pathlib import Path
from backend.config import Config

class AccountService:
    def __init__(self):
        self._df = None
        self._population_stats = None
        self.load_data()

    def load_data(self):
        csv_path = Config.RAW_DATA_PATH
        if not csv_path.exists():
            print(f"[AccountService] Dataset not found at {csv_path}")
            return None

        df = pd.read_csv(csv_path)

        # Handle TotalCharges string issue (Page 20 of specification)
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
        # For new customers with tenure == 0, TotalCharges is NaN -> fill with 0.0
        df["TotalCharges"] = df["TotalCharges"].fillna(0.0)

        # Derived Feature 1: TotalServices (Page 14)
        active_phone = (df["PhoneService"] == "Yes").astype(int)
        active_multiple = (df["MultipleLines"] == "Yes").astype(int)
        active_internet = (df["InternetService"].isin(["DSL", "Fiber optic"])).astype(int)
        active_sec = (df["OnlineSecurity"] == "Yes").astype(int)
        active_backup = (df["OnlineBackup"] == "Yes").astype(int)
        active_protection = (df["DeviceProtection"] == "Yes").astype(int)
        active_tech = (df["TechSupport"] == "Yes").astype(int)
        active_tv = (df["StreamingTV"] == "Yes").astype(int)
        active_movies = (df["StreamingMovies"] == "Yes").astype(int)

        df["TotalServices"] = (
            active_phone + active_multiple + active_internet +
            active_sec + active_backup + active_protection +
            active_tech + active_tv + active_movies
        )

        # Derived Feature 2: Add-on Service Count (Page 15, Range 0-6)
        df["AddOnCount"] = (
            active_sec + active_backup + active_protection +
            active_tech + active_tv + active_movies
        )

        # Derived Feature 3: Service Adoption Ratio (Page 15)
        df["ServiceAdoption"] = (df["AddOnCount"] / 6.0).round(4)

        # Derived Feature 4: AvgHistoricalMonthlyCharges (Page 16)
        df["AvgHistoricalMonthlyCharges"] = (
            df["TotalCharges"] / df["tenure"].clip(lower=1)
        ).round(2)

        # Derived Feature 5: Charge-to-Tenure interaction (Page 16)
        df["ChargeTenureInteraction"] = (
            df["MonthlyCharges"] * (1.0 / (1.0 + df["tenure"]))
        ).round(4)

        # Derived Feature 6: Tenure Band (Page 17)
        def assign_tenure_band(t):
            if t <= 6:
                return "0–6 months"
            elif t <= 12:
                return "7–12 months"
            elif t <= 24:
                return "13–24 months"
            elif t <= 48:
                return "25–48 months"
            else:
                return "49+ months"

        df["TenureBand"] = df["tenure"].apply(assign_tenure_band)

        # Derived Feature 7: Contract Risk Category / ContractCommitmentLevel (Page 17)
        commitment_map = {
            "Month-to-month": "High contractual mobility",
            "One year": "Medium contractual mobility",
            "Two year": "Low contractual mobility"
        }
        df["ContractCommitmentLevel"] = df["Contract"].map(commitment_map).fillna("Unknown")

        # Derived Feature 8: Customer Value Proxy & Monthly Value Proxy (Page 18)
        df["CustomerValueProxy"] = df["TotalCharges"]
        df["MonthlyValueProxy"] = df["MonthlyCharges"]

        self._df = df
        self._compute_population_stats()
        return self._df

    def _compute_population_stats(self):
        if self._df is None or self._df.empty:
            return

        df = self._df
        total_n = len(df)

        self._population_stats = {
            "total_customers": total_n,
            "churn_rate": round(float((df["Churn"] == "Yes").mean() * 100), 2),
            "monthly_charges": {
                "median": round(float(df["MonthlyCharges"].median()), 2),
                "mean": round(float(df["MonthlyCharges"].mean()), 2),
                "std": round(float(df["MonthlyCharges"].std()), 2),
                "min": round(float(df["MonthlyCharges"].min()), 2),
                "max": round(float(df["MonthlyCharges"].max()), 2),
            },
            "tenure": {
                "median": round(float(df["tenure"].median()), 1),
                "mean": round(float(df["tenure"].mean()), 1),
                "std": round(float(df["tenure"].std()), 1),
                "min": int(df["tenure"].min()),
                "max": int(df["tenure"].max()),
            },
            "total_charges": {
                "median": round(float(df["TotalCharges"].median()), 2),
                "mean": round(float(df["TotalCharges"].mean()), 2),
            },
            "contract_distribution": {
                k: round(float(v / total_n * 100), 1)
                for k, v in df["Contract"].value_counts().items()
            },
            "internet_service_distribution": {
                k: round(float(v / total_n * 100), 1)
                for k, v in df["InternetService"].value_counts().items()
            },
            "tech_support_adoption_rate": round(
                float((df["TechSupport"] == "Yes").mean() * 100), 1
            ),
            "online_security_adoption_rate": round(
                float((df["OnlineSecurity"] == "Yes").mean() * 100), 1
            ),
            "avg_addon_count": round(float(df["AddOnCount"].mean()), 2),
            "tenure_band_distribution": {
                k: round(float(v / total_n * 100), 1)
                for k, v in df["TenureBand"].value_counts().items()
            }
        }

    def get_population_stats(self):
        if self._population_stats is None:
            self._compute_population_stats()
        return self._population_stats

    def compute_percentile(self, column_name, value):
        """Page 33 formula: Percentile(x) = #(values < x) / N * 100"""
        if self._df is None or column_name not in self._df.columns:
            return 50.0
        series = self._df[column_name].dropna()
        n = len(series)
        if n == 0:
            return 50.0
        count_less = (series < value).sum()
        return round(float(count_less / n * 100), 1)

    def get_account_by_id(self, customer_id):
        if self._df is None:
            self.load_data()
        match = self._df[self._df["customerID"] == customer_id]
        if match.empty:
            return None
        return match.iloc[0].to_dict()

    def get_accounts_page(self, page=1, page_size=20, search="", risk_filter="all", contract_filter="all", sort_by="churn_probability", sort_order="desc"):
        if self._df is None:
            self.load_data()

        df = self._df.copy()

        # Search filter
        if search:
            search_str = str(search).strip().lower()
            df = df[df["customerID"].str.lower().str.contains(search_str)]

        # Contract filter
        if contract_filter and contract_filter != "all":
            df = df[df["Contract"] == contract_filter]

        return df

    @property
    def dataframe(self):
        if self._df is None:
            self.load_data()
        return self._df

account_service = AccountService()
