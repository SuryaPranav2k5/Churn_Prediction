import os
import csv
from typing import Dict, Any, List, Optional
from backend.config import Config

class DatasetService:
    def __init__(self):
        self.rows: List[Dict[str, Any]] = []
        self.dataset_available: bool = False
        self.load_dataset()

    def load_dataset(self) -> None:
        path_to_load = None
        if os.path.exists(Config.RAW_DATA_PATH):
            path_to_load = Config.RAW_DATA_PATH
        elif os.path.exists(Config.FALLBACK_DATA_PATH):
            path_to_load = Config.FALLBACK_DATA_PATH

        if not path_to_load:
            self.dataset_available = False
            self.rows = []
            return

        try:
            rows = []
            with open(path_to_load, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for r in reader:
                    # Clean tenure
                    try:
                        r['tenure'] = int(r.get('tenure', 0))
                    except (ValueError, TypeError):
                        r['tenure'] = 0

                    # Clean MonthlyCharges
                    try:
                        r['MonthlyCharges'] = float(r.get('MonthlyCharges', 0.0))
                    except (ValueError, TypeError):
                        r['MonthlyCharges'] = 0.0

                    # Clean TotalCharges: 11 blank entries for tenure=0 are filled with 0.0
                    raw_total = r.get('TotalCharges', '').strip()
                    if not raw_total:
                        r['TotalCharges'] = 0.0
                    else:
                        try:
                            r['TotalCharges'] = float(raw_total)
                        except (ValueError, TypeError):
                            r['TotalCharges'] = 0.0

                    # SeniorCitizen string mapping
                    if 'SeniorCitizen' in r:
                        try:
                            sc = int(r['SeniorCitizen'])
                            r['SeniorCitizen_Display'] = 'Yes' if sc == 1 else 'No'
                        except (ValueError, TypeError):
                            r['SeniorCitizen_Display'] = str(r['SeniorCitizen'])

                    rows.append(r)

            self.rows = rows
            self.dataset_available = True
        except Exception as e:
            print(f"Error loading dataset: {e}")
            self.dataset_available = False
            self.rows = []

    def get_summary(self) -> Dict[str, Any]:
        if not self.dataset_available or not self.rows:
            return {
                "dataset_label": Config.DATASET_LABEL,
                "dataset_available": False,
                "total_customers": 0,
                "actual_churned": 0,
                "actual_non_churned": 0,
                "actual_churn_rate": 0.0,
                "predicted_risk_counts": None,
                "model_available": False
            }

        total = len(self.rows)
        actual_churned = sum(1 for r in self.rows if r.get('Churn') == 'Yes')
        actual_non_churned = sum(1 for r in self.rows if r.get('Churn') == 'No')
        actual_churn_rate = round(actual_churned / total, 4) if total > 0 else 0.0

        contract_dist = {}
        internet_dist = {}
        payment_dist = {}
        churn_by_contract = {}

        for r in self.rows:
            c = r.get('Contract', 'Unknown')
            i = r.get('InternetService', 'Unknown')
            p = r.get('PaymentMethod', 'Unknown')
            is_churn = r.get('Churn') == 'Yes'

            contract_dist[c] = contract_dist.get(c, 0) + 1
            internet_dist[i] = internet_dist.get(i, 0) + 1
            payment_dist[p] = payment_dist.get(p, 0) + 1

            if is_churn:
                churn_by_contract[c] = churn_by_contract.get(c, 0) + 1

        return {
            "dataset_label": Config.DATASET_LABEL,
            "dataset_available": True,
            "total_customers": total,
            "actual_churned": actual_churned,
            "actual_non_churned": actual_non_churned,
            "actual_churn_rate": actual_churn_rate,
            "contract_distribution": contract_dist,
            "internet_distribution": internet_dist,
            "payment_distribution": payment_dist,
            "churn_by_contract": churn_by_contract,
            "predicted_risk_counts": None,
            "model_available": False,
            "data_cleaning_note": "11 blank TotalCharges entries for tenure=0 customers filled with 0.0."
        }

    def get_customers(
        self,
        search: Optional[str] = None,
        contract: Optional[str] = None,
        internet_service: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        if not self.dataset_available or not self.rows:
            return {
                "total": 0,
                "page": page,
                "page_size": page_size,
                "total_pages": 0,
                "customers": []
            }

        filtered = self.rows

        if search:
            search_str = search.strip().lower()
            filtered = [r for r in filtered if search_str in str(r.get('customerID', '')).lower()]

        if contract and contract != "All":
            filtered = [r for r in filtered if r.get('Contract') == contract]

        if internet_service and internet_service != "All":
            filtered = [r for r in filtered if r.get('InternetService') == internet_service]

        total_records = len(filtered)
        total_pages = (total_records + page_size - 1) // page_size if total_records > 0 else 1
        page = max(1, min(page, total_pages))
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        page_rows = filtered[start_idx:end_idx]

        customers = []
        for r in page_rows:
            item = {}
            for col in Config.SAFE_DISPLAY_FIELDS:
                if col in r:
                    item[col] = r[col]

            # In demo mode prediction fields are null
            item['churn_probability'] = None
            item['risk_band'] = None
            customers.append(item)

        return {
            "total": total_records,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "customers": customers
        }

    def get_customer_by_id(self, customer_id: str) -> Optional[Dict[str, Any]]:
        if not self.dataset_available or not self.rows:
            return None

        cid_target = customer_id.strip().upper()
        for r in self.rows:
            if str(r.get('customerID', '')).strip().upper() == cid_target:
                item = {}
                for col in Config.SAFE_DISPLAY_FIELDS:
                    if col in r:
                        item[col] = r[col]
                item['churn_probability'] = None
                item['risk_band'] = None
                return item

        return None

dataset_service = DatasetService()
