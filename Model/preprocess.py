"""
Data Preprocessing Pipeline for Telco Customer Churn
===================================================
Applies data cleaning and transformation based on audit findings:
1. Fixes 'Total Charges' missing values and casts to float64.
2. Removes target leakage columns: 'Churn Reason', 'Churn Score', 'Churn Label'.
3. Drops zero-variance constants: 'Count', 'Country', 'State'.
4. Drops geographic & identifier columns: 'CustomerID', 'Lat Long', 'City', 'Zip Code', 'Latitude', 'Longitude'.
5. Normalizes redundant sub-categories ('No internet service' -> 'No', 'No phone service' -> 'No').
6. Standardizes column names into clean snake_case format.
"""

from pathlib import Path
import pandas as pd
import numpy as np


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """Converts column names to lowercase snake_case."""
    df = df.copy()
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("-", "_")
    )
    return df


def preprocess_churn_data(
    input_path: str = "Model/Dataset/Telco_customer_churn.xlsx",
    output_path: str = "Model/Dataset/preprocessed_churn.csv",
) -> pd.DataFrame:
    """
    Loads raw Excel dataset, performs end-to-end cleaning and feature sanitization,
    and exports clean CSV dataset.
    """
    input_file = Path(input_path)
    output_file = Path(output_path)

    if not input_file.exists():
        raise FileNotFoundError(f"Input file not found at: {input_file.resolve()}")

    print(f"Loading raw dataset from: {input_file}")
    df = pd.read_excel(input_file)
    print(f"Raw shape: {df.shape[0]} rows, {df.shape[1]} columns")

    # --- 1. Drop Target Leakage, Constant, Geographic & ID Columns ---
    leakage_cols = ["Churn Reason", "Churn Score", "Churn Label"]
    constant_cols = ["Count", "Country", "State"]
    geo_and_id_cols = ["CustomerID", "Lat Long", "City", "Zip Code", "Latitude", "Longitude"]

    cols_to_drop = leakage_cols + constant_cols + geo_and_id_cols
    df = df.drop(columns=[col for col in cols_to_drop if col in df.columns])
    print(f"Dropped {len(cols_to_drop)} leakage, constant, geographic, and identifier columns.")

    # --- 2. Fix Total Charges (11 blank strings where Tenure Months == 0) ---
    df["Total Charges"] = pd.to_numeric(
        df["Total Charges"].astype(str).str.strip().replace("", "0.0"),
        errors="coerce"
    ).fillna(0.0)

    # --- 3. Normalize Categorical Sub-Values ---
    # 'No internet service' -> 'No' for internet-dependent features
    internet_dependent_cols = [
        "Online Security", "Online Backup", "Device Protection",
        "Tech Support", "Streaming TV", "Streaming Movies"
    ]
    for col in internet_dependent_cols:
        if col in df.columns:
            df[col] = df[col].replace({"No internet service": "No"})

    # 'No phone service' -> 'No' for phone-dependent feature
    if "Multiple Lines" in df.columns:
        df["Multiple Lines"] = df["Multiple Lines"].replace({"No phone service": "No"})

    # --- 4. Standardize Column Names to snake_case ---
    df = clean_column_names(df)

    # Ensure target column is named 'churn'
    if "churn_value" in df.columns:
        df = df.rename(columns={"churn_value": "churn"})

    # --- 5. Validation Checks ---
    null_count = df.isnull().sum().sum()
    if null_count > 0:
        raise ValueError(f"Unexpected missing values remaining:\n{df.isnull().sum()[df.isnull().sum() > 0]}")

    print(f"Preprocessed shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Cleaned column list ({len(df.columns)}): {list(df.columns)}")
    print(f"Missing values count: {null_count}")

    # --- 6. Save Preprocessed Data ---
    output_file.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_file, index=False)
    print(f"Successfully saved clean dataset to: {output_file.resolve()}\n")

    return df


if __name__ == "__main__":
    preprocess_churn_data()
