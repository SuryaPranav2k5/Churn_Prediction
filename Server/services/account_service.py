"""Account lookup, filtering, pagination and portfolio aggregates."""

import json

from config import ACCOUNTS_CACHE_PATH

VALID_RISK = {"ALL", "CRITICAL", "ELEVATED", "LOW"}


class AccountService:
    def __init__(self, model_service):
        self.ms = model_service
        self.accounts: list[dict] = json.loads(
            ACCOUNTS_CACHE_PATH.read_text(encoding="utf-8")
        )
        self.by_id: dict[str, dict] = {a["account_id"]: a for a in self.accounts}
        self.accounts_sorted = sorted(
            self.accounts, key=lambda a: a["churn_probability"], reverse=True
        )

    def stats(self) -> dict:
        total = len(self.accounts)
        tiers = {"CRITICAL": 0, "ELEVATED": 0, "LOW": 0}
        churn_sum = 0.0
        at_risk_mrr = 0.0
        at_risk_cltv = 0.0
        total_mrr = 0.0
        for a in self.accounts:
            tiers[a["risk_level"]] += 1
            churn_sum += a["churn_probability"]
            total_mrr += a["monthly_charges"]
            if a["risk_level"] != "LOW":
                at_risk_mrr += a["monthly_charges"]
                at_risk_cltv += a["cltv"]
        return {
            "total_accounts": total,
            "avg_churn_probability": round(churn_sum / total, 4),
            "risk_counts": tiers,
            "total_mrr": round(total_mrr, 2),
            "at_risk_mrr": round(at_risk_mrr, 2),
            "at_risk_cltv": round(at_risk_cltv, 2),
        }

    def query(self, risk: str = "ALL", search: str = "", page: int = 1, limit: int = 10) -> dict:
        risk = (risk or "ALL").upper()
        if risk not in VALID_RISK:
            raise ValueError(f"risk_level must be one of {sorted(VALID_RISK)}")
        term = (search or "").strip().lower()

        rows = self.accounts_sorted
        if risk != "ALL":
            rows = [a for a in rows if a["risk_level"] == risk]
        if term:
            rows = [
                a
                for a in rows
                if term in a["account_id"].lower()
                or term in a.get("payment_method", "").lower()
                or term in a.get("contract", "").lower()
            ]

        total = len(rows)
        pages = max(1, -(-total // limit))
        page = max(1, min(page, pages))
        start = (page - 1) * limit
        items = [self._public(a) for a in rows[start : start + limit]]
        return {"total": total, "page": page, "limit": limit, "pages": pages, "accounts": items}

    @staticmethod
    def _public(a: dict) -> dict:
        return {k: v for k, v in a.items() if k != "raw_features"}
