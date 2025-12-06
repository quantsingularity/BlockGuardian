import pandas as pd
from datetime import timedelta
import os
import logging

from core.logging import get_logger

logger = get_logger(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Define the expected path for the raw data files
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
RESOURCES_DIR = os.path.join(BASE_DIR, "resources", "datasets")
TRANSACTION_FILE = os.path.join(RESOURCES_DIR, "transaction_history.csv")
FRAUD_FILE = os.path.join(RESOURCES_DIR, "fraud_patterns.csv")


def load_data(file_path: str) -> pd.DataFrame:
    """Loads data from a CSV file with error handling."""
    logger.info(f"Attempting to load data from {file_path}")
    try:
        df = pd.read_csv(file_path)
        logger.info(f"Data loaded successfully. Shape: {df.shape}")
        return df
    except FileNotFoundError:
        logger.error(
            f"Error: File not found at {file_path}. Please ensure the file exists."
        )
        return pd.DataFrame()
    except Exception as e:
        logger.error(f"An error occurred while loading data from {file_path}: {e}")
        return pd.DataFrame()


def preprocess_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """
    Performs comprehensive preprocessing on the transaction history data.
    - Cleans column names.
    - Converts data types (datetime, categorical).
    - Feature engineering for time-series and user behavior analysis.
    """
    if df.empty:
        return df

    logger.info("Starting transaction data preprocessing and feature engineering.")

    # 1. Clean column names (e.g., lowercase, replace spaces with underscores)
    df.columns = df.columns.str.lower().str.replace(" ", "_")

    # 2. Convert data types
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce", utc=True)
        df = df.dropna(subset=["timestamp"])

    if "user_id" in df.columns:
        df["user_id"] = df["user_id"].astype("category")

    if "amount" in df.columns:
        # Ensure amount is numeric, coercing errors to NaN
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
        df = df.dropna(subset=["amount"])

    # 3. Feature Engineering (Time-based)
    if "timestamp" in df.columns:
        df["hour_of_day"] = df["timestamp"].dt.hour
        df["day_of_week"] = df["timestamp"].dt.dayofweek
        df["is_weekend"] = df["day_of_week"].apply(lambda x: 1 if x >= 5 else 0)
        df["transaction_month"] = df["timestamp"].dt.month

    # 4. Feature Engineering (Behavioral/Aggregated)
    # Sort by user and time for rolling window features
    df = df.sort_values(["user_id", "timestamp"]).reset_index(drop=True)

    # Time since last transaction for the user
    df["time_since_last_txn"] = (
        df.groupby("user_id")["timestamp"].diff().dt.total_seconds().fillna(0)
    )

    # Rolling window features (e.g., last 1 hour, last 24 hours)
    for window in [timedelta(hours=1), timedelta(hours=24), timedelta(days=7)]:
        window_str = f"{int(window.total_seconds() / 3600)}h"

        # Count of transactions in the window
        df[f"txn_count_{window_str}"] = (
            df.groupby("user_id")["timestamp"]
            .rolling(window=window, on="timestamp", closed="left")
            .count()
            .reset_index(level=0, drop=True)
            .fillna(0)
        )

        # Mean amount in the window
        df[f"mean_amount_{window_str}"] = (
            df.groupby("user_id")["amount"]
            .rolling(window=window, on="timestamp", closed="left")
            .mean()
            .reset_index(level=0, drop=True)
            .fillna(0)
        )

        # Max amount in the window
        df[f"max_amount_{window_str}"] = (
            df.groupby("user_id")["amount"]
            .rolling(window=window, on="timestamp", closed="left")
            .max()
            .reset_index(level=0, drop=True)
            .fillna(0)
        )

    # 5. Handling Missing Values (Post-Feature Engineering)
    # Fill remaining NaNs with 0 (assuming features like mean_amount_Xh will be 0 if no prior transactions)
    df = df.fillna(0)

    logger.info(f"Preprocessing complete. Final shape: {df.shape}")
    return df


def main():
    """Main function to load, preprocess, and demonstrate data readiness."""

    # Load transaction data
    transaction_df = load_data(TRANSACTION_FILE)

    if transaction_df.empty:
        logger.warning("No transaction data loaded. Cannot proceed with preprocessing.")
        return

    # Preprocess transaction data
    processed_df = preprocess_transactions(transaction_df.copy())

    # Load fraud patterns data (for reference/joining in later analysis steps)
    fraud_df = load_data(FRAUD_FILE)

    logger.info("\n--- Processed Transaction Data Sample ---")
    logger.info(processed_df.head().to_markdown(index=False))
    logger.info("\n--- Fraud Patterns Data Sample ---")
    if not fraud_df.empty:
        logger.info(fraud_df.head().to_markdown(index=False))
    else:
        logger.info("No fraud patterns data loaded.")
    # Example of saving the processed data (optional, but good practice)
    # PROCESSED_FILE = os.path.join(RESOURCES_DIR, 'processed_transactions.csv')
    # processed_df.to_csv(PROCESSED_FILE, index=False)
    # logger.info(f"\nProcessed data saved to {PROCESSED_FILE}")


if __name__ == "__main__":
    # Note: The original repository structure suggests data files are in resources/datasets.
    # The script assumes this structure.
    main()
