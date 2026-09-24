import pandas as pd
import numpy as np

# 1. Load the dataset
file_path = "Model/Dataset/Telco_customer_churn.xlsx"
df = pd.read_excel(file_path)

print("=== 1. DATASET OVERVIEW ===")
print(f"Shape: {df.shape} (Rows, Columns)\n")

print("=== 2. COLUMN DATA TYPES ===")
print(df.dtypes)
print()

print("=== 3. MISSING (NULL / NAN) VALUES ===")
null_counts = df.isnull().sum()
print(null_counts[null_counts > 0])
print()

print("=== 4. HIDDEN BLANK / WHITESPACE STRINGS ===")
# Checks for empty string representations disguised as text
for col in df.select_dtypes(include=["object", "str"]).columns:
    blank_count = (df[col].astype(str).str.strip() == "").sum()
    if blank_count > 0:
        print(f"'{col}': {blank_count} blank whitespace rows found")
print()

print("=== 5. INVESTIGATING THE 11 BLANK 'TOTAL CHARGES' ROWS ===")
blank_tc_rows = df[df["Total Charges"].astype(str).str.strip() == ""]
print(blank_tc_rows[["CustomerID", "Tenure Months", "Monthly Charges", "Total Charges", "Churn Value"]])
print()

print("=== 6. CARDINALITY & ZERO-VARIANCE (CONSTANT) COLUMNS ===")
for col in df.columns:
    n_unique = df[col].nunique()
    if n_unique == 1:
        print(f"CONSTANT (Zero-Variance): '{col}' has only 1 unique value -> {df[col].iloc[0]}")
    elif n_unique == len(df):
        print(f"UNIQUE IDENTIFIER: '{col}' has {n_unique} unique values (100% unique)")
print()

print("=== 7. TARGET DISTRIBUTION & CLASS IMBALANCE ===")
if "Churn Value" in df.columns:
    print("Churn Value proportions:")
    print(df["Churn Value"].value_counts(normalize=True).apply(lambda x: f"{x:.2%}"))
    print("\nChurn Label counts:")
    print(df["Churn Label"].value_counts())
print()

print("=== 8. TARGET LEAKAGE CHECKS ===")
# Check Churn Score distribution between churned and non-churned
print("Churn Score stats grouped by Churn Value:")
print(df.groupby("Churn Value")["Churn Score"].describe())
print()

# Check Churn Reason null distribution against Churn Value
print("Churn Reason missing count by Churn Value:")
print(df.groupby("Churn Value")["Churn Reason"].apply(lambda s: s.isnull().sum()))
print()

print("=== 9. CATEGORICAL SUB-VALUE REDUNDANCIES ===")
cat_cols = [
    "Multiple Lines", "Internet Service", "Online Security", "Online Backup", 
    "Device Protection", "Tech Support", "Streaming TV", "Streaming Movies", 
    "Contract", "Paperless Billing", "Payment Method"
]
for col in cat_cols:
    print(f"'{col}': {list(df[col].unique())}")
