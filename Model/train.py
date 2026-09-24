"""
LightGBM Training & SHAP Explainability Pipeline for Customer Churn
===================================================================
Rigorous Out-Of-Sample Methodology:
1. Performs an 80/20 Stratified Train/Test Split on the preprocessed dataset.
2. Fits categorical encoders strictly on the Training set (80%).
3. Runs 5-Fold Stratified Cross-Validation on the Training set.
4. Trains the final production LightGBM model on the Training set only.
5. Evaluates genuine out-of-sample metrics (ROC-AUC, PR-AUC, F1, Recall) on the Test set (20%).
6. Computes SHAP values and feature attributions exclusively on held-out Test data (X_test).
7. Generates account cache and global/local explainability artifacts from unseen test accounts.
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, train_test_split
import shap


def format_raw_features(row: pd.Series, num_cols: list[str], feature_cols: list[str]) -> dict:
    """Formats a single account record into clean types for JSON serialization."""
    formatted = {}
    for col in feature_cols:
        val = row[col]
        if col in ["monthly_charges", "total_charges"]:
            formatted[col] = round(float(val), 2)
        elif col in num_cols:
            formatted[col] = int(val)
        else:
            formatted[col] = str(val)
    return formatted


def train_and_export_pipeline(
    data_path: str = "Model/Dataset/preprocessed_churn.csv",
    artifacts_dir: str = "Model/artifacts",
) -> None:
    data_file = Path(data_path)
    out_dir = Path(artifacts_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if not data_file.exists():
        raise FileNotFoundError(f"Preprocessed data not found: {data_file.resolve()}")

    print(f"Loading data from {data_file}...")
    df = pd.read_csv(data_file)
    print(f"Total dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")

    target_col = "churn"
    feature_cols = [c for c in df.columns if c != target_col]

    # --- 1. Genuine 80/20 Stratified Holdout Split BEFORE ANY ENCODING ---
    print("\nSplitting dataset into 80% Train and 20% Held-Out Test sets...")
    df_train, df_test = train_test_split(
        df, test_size=0.20, stratify=df[target_col], random_state=42
    )
    df_train = df_train.reset_index(drop=True)
    df_test = df_test.reset_index(drop=True)

    y_train = df_train[target_col].values
    y_test = df_test[target_col].values

    print(f" - Train set: {len(df_train)} rows ({sum(y_train)} churned, {sum(y_train)/len(y_train):.2%})")
    print(f" - Test set:  {len(df_test)} rows ({sum(y_test)} churned, {sum(y_test)/len(y_test):.2%})")

    # Categorical & Numerical feature separation
    cat_cols = df_train[feature_cols].select_dtypes(include=["object", "str"]).columns.tolist()
    num_cols = df_train[feature_cols].select_dtypes(include=[np.number]).columns.tolist()

    # --- 2. Fit Bidirectional Categorical Mappings Strictly on Training Set ---
    category_mappings = {}
    X_train = df_train[feature_cols].copy()
    X_test = df_test[feature_cols].copy()

    for col in cat_cols:
        unique_vals = sorted(df_train[col].astype(str).unique().tolist())
        val_to_int = {val: idx for idx, val in enumerate(unique_vals)}
        int_to_val = {idx: val for idx, val in enumerate(unique_vals)}
        category_mappings[col] = {
            "val_to_int": val_to_int,
            "int_to_val": int_to_val,
            "categories": unique_vals,
        }
        X_train[col] = df_train[col].astype(str).map(val_to_int)
        # Apply mapping to test set with fallback for unseen categories
        X_test[col] = df_test[col].astype(str).map(lambda v: val_to_int.get(v, -1))

    # Clean display names for frontend presentation
    display_names = {
        "gender": "Gender",
        "senior_citizen": "Senior Citizen",
        "partner": "Partner",
        "dependents": "Dependents",
        "tenure_months": "Tenure (Months)",
        "phone_service": "Phone Service",
        "multiple_lines": "Multiple Lines",
        "internet_service": "Internet Service",
        "online_security": "Online Security",
        "online_backup": "Online Backup",
        "device_protection": "Device Protection",
        "tech_support": "Tech Support",
        "streaming_tv": "Streaming TV",
        "streaming_movies": "Streaming Movies",
        "contract": "Contract Term",
        "paperless_billing": "Paperless Billing",
        "payment_method": "Payment Method",
        "monthly_charges": "Monthly Charges ($)",
        "total_charges": "Total Charges ($)",
        "cltv": "Customer Lifetime Value (CLTV)",
    }

    # Hyperparameters
    scale_pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)
    lgbm_params = {
        "n_estimators": 180,
        "learning_rate": 0.04,
        "max_depth": 5,
        "num_leaves": 31,
        "min_child_samples": 25,
        "subsample": 0.85,
        "colsample_bytree": 0.85,
        "scale_pos_weight": scale_pos_weight,
        "random_state": 42,
        "verbose": -1,
    }

    # --- 3. 5-Fold Stratified Cross-Validation on Training Set Only ---
    print("\n" + "=" * 55)
    print("5-FOLD STRATIFIED CV EVALUATION (ON TRAIN SET ONLY)")
    print("=" * 55)

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_metrics = {"roc_auc": [], "pr_auc": [], "f1": [], "recall": [], "precision": []}

    for fold, (train_idx, val_idx) in enumerate(skf.split(X_train, y_train), 1):
        X_tr, y_tr = X_train.iloc[train_idx], y_train[train_idx]
        X_va, y_val = X_train.iloc[val_idx], y_train[val_idx]

        fold_model = LGBMClassifier(**lgbm_params)
        fold_model.fit(X_tr, y_tr, categorical_feature=cat_cols)

        val_probs = fold_model.predict_proba(X_va)[:, 1]
        val_preds = (val_probs >= 0.5).astype(int)

        roc = roc_auc_score(y_val, val_probs)
        pr = average_precision_score(y_val, val_probs)
        f1 = f1_score(y_val, val_preds)
        rec = recall_score(y_val, val_preds)
        prec = precision_score(y_val, val_preds)

        cv_metrics["roc_auc"].append(roc)
        cv_metrics["pr_auc"].append(pr)
        cv_metrics["f1"].append(f1)
        cv_metrics["recall"].append(rec)
        cv_metrics["precision"].append(prec)

        print(f"Fold {fold}: ROC-AUC={roc:.4f} | PR-AUC={pr:.4f} | F1={f1:.4f} | Recall={rec:.4f}")

    print("-" * 55)
    print(f"CV Mean ROC-AUC:   {np.mean(cv_metrics['roc_auc']):.4f} (+/- {np.std(cv_metrics['roc_auc']):.4f})")
    print(f"CV Mean PR-AUC:    {np.mean(cv_metrics['pr_auc']):.4f} (+/- {np.std(cv_metrics['pr_auc']):.4f})")
    print(f"CV Mean F1-Score:  {np.mean(cv_metrics['f1']):.4f} (+/- {np.std(cv_metrics['f1']):.4f})")
    print("=" * 55)

    # --- 4. Fit Final Production Model on Train Set (80%) ---
    print("\nFitting final model on the 80% Training Split...")
    final_model = LGBMClassifier(**lgbm_params)
    final_model.fit(X_train, y_train, categorical_feature=cat_cols)

    # --- 5. Genuine Held-Out Test Evaluation ---
    test_probs = final_model.predict_proba(X_test)[:, 1]
    test_preds = (test_probs >= 0.5).astype(int)

    test_roc_auc = roc_auc_score(y_test, test_probs)
    test_pr_auc = average_precision_score(y_test, test_probs)
    test_f1 = f1_score(y_test, test_preds)
    test_recall = recall_score(y_test, test_preds)
    test_precision = precision_score(y_test, test_preds)
    test_acc = accuracy_score(y_test, test_preds)

    print("\n" + "=" * 55)
    print(f"GENUINE HELD-OUT TEST SET PERFORMANCE ({len(df_test)} UNSEEN ACCOUNTS)")
    print("=" * 55)
    print(f"Test ROC-AUC:      {test_roc_auc:.4f}")
    print(f"Test PR-AUC:       {test_pr_auc:.4f}")
    print(f"Test F1-Score:     {test_f1:.4f}")
    print(f"Test Recall:       {test_recall:.4f} (Churn Catch Rate)")
    print(f"Test Precision:    {test_precision:.4f}")
    print(f"Test Accuracy:     {test_acc:.4f}")
    print("\nConfusion Matrix (Test Set):")
    print(confusion_matrix(y_test, test_preds))
    print("=" * 55)

    # --- 6. SHAP Explainability strictly on Test Set ---
    print(f"\nFitting shap.TreeExplainer & computing SHAP attributions on Test Set ({len(X_test)} accounts)...")
    explainer = shap.TreeExplainer(final_model)
    shap_values = explainer.shap_values(X_test)

    # Standardize SHAP matrix for positive class (churn=1)
    if isinstance(shap_values, list):
        shap_matrix = shap_values[1]
    elif len(shap_values.shape) == 3:
        shap_matrix = shap_values[:, :, 1]
    else:
        shap_matrix = shap_values

    # Base value (log-odds transformed to expected probability)
    base_value = float(
        explainer.expected_value[1]
        if isinstance(explainer.expected_value, (list, np.ndarray))
        else explainer.expected_value
    )
    base_prob = float(1 / (1 + np.exp(-base_value)))

    # Compute Global Feature Importance (Mean Absolute SHAP on Test Set)
    mean_abs_shap = np.abs(shap_matrix).mean(axis=0)
    global_importance = []
    for idx, col in enumerate(feature_cols):
        global_importance.append({
            "feature": col,
            "display_name": display_names.get(col, col),
            "mean_abs_shap": round(float(mean_abs_shap[idx]), 4),
            "type": "categorical" if col in cat_cols else "numerical",
        })
    global_importance = sorted(global_importance, key=lambda x: x["mean_abs_shap"], reverse=True)

    print("\nTop 10 Global Feature Drivers (from Held-Out Test Set):")
    for rank, item in enumerate(global_importance[:10], 1):
        print(f" {rank:2d}. {item['display_name']:<32} | {item['mean_abs_shap']:.4f}")

    # --- 7. Build Unseen Test Account Records for Frontend ---
    account_records = []
    for idx in range(len(df_test)):
        prob = float(test_probs[idx])
        if prob >= 0.70:
            risk = "CRITICAL"
        elif prob >= 0.35:
            risk = "ELEVATED"
        else:
            risk = "LOW"

        row = df_test.iloc[idx]
        record = {
            "account_id": f"ACC-{1001 + idx}",
            "churn_probability": round(prob, 4),
            "actual_churn": int(y_test[idx]),
            "risk_level": risk,
            "tenure_months": int(row["tenure_months"]),
            "monthly_charges": round(float(row["monthly_charges"]), 2),
            "total_charges": round(float(row["total_charges"]), 2),
            "contract": str(row["contract"]),
            "internet_service": str(row["internet_service"]),
            "tech_support": str(row["tech_support"]),
            "payment_method": str(row["payment_method"]),
            "cltv": int(row["cltv"]),
            "raw_features": format_raw_features(row, num_cols, feature_cols),
        }
        account_records.append(record)

    # --- 8. Save Feature Metadata & Model Artifacts ---
    feature_metadata = {
        "feature_cols": feature_cols,
        "cat_cols": cat_cols,
        "num_cols": num_cols,
        "display_names": display_names,
        "category_mappings": category_mappings,
        "base_prob": round(base_prob, 4),
        "base_value_raw": round(base_value, 4),
        "train_size": len(df_train),
        "test_size": len(df_test),
        "feature_defaults": {
            col: (float(df_train[col].median()) if col in num_cols else str(df_train[col].mode()[0]))
            for col in feature_cols
        },
        "model_metrics": {
            "test_roc_auc": round(float(test_roc_auc), 4),
            "test_pr_auc": round(float(test_pr_auc), 4),
            "test_f1": round(float(test_f1), 4),
            "test_recall": round(float(test_recall), 4),
            "test_precision": round(float(test_precision), 4),
            "test_accuracy": round(float(test_acc), 4),
            "cv_mean_roc_auc": round(float(np.mean(cv_metrics["roc_auc"])), 4),
            "cv_mean_pr_auc": round(float(np.mean(cv_metrics["pr_auc"])), 4),
            "cv_mean_f1": round(float(np.mean(cv_metrics["f1"])), 4),
        },
    }

    print("\nSerializing artifacts to Model/artifacts/ ...")
    joblib.dump(final_model, out_dir / "model.joblib")
    joblib.dump(explainer, out_dir / "explainer.joblib")

    with open(out_dir / "global_shap.json", "w") as f:
        json.dump({"base_prob": round(base_prob, 4), "features": global_importance}, f, indent=2)

    with open(out_dir / "feature_metadata.json", "w") as f:
        json.dump(feature_metadata, f, indent=2)

    with open(out_dir / "accounts_cache.json", "w") as f:
        json.dump(account_records, f, indent=2)

    print(f"Successfully generated all artifacts in {out_dir.resolve()}:")
    print(f" - model.joblib          (Trained strictly on 80% Train split)")
    print(f" - explainer.joblib      (SHAP TreeExplainer)")
    print(f" - global_shap.json      (Global ranking on unseen {len(df_test)} Test accounts)")
    print(f" - feature_metadata.json (Metrics, category mappings, baseline stats)")
    print(f" - accounts_cache.json   ({len(account_records)} test accounts with genuine out-of-sample predictions)")
    print("\nTraining & Explainability Pipeline Complete!\n")


if __name__ == "__main__":
    train_and_export_pipeline()
