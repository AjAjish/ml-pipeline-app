#ml-pipeline-app/backend/pipelines/ingestion.py
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

class DataIngestion:
    def __init__(self,file_path: str):
        self.file_path = file_path
        self.df = None

    def load_data(self) -> pd.DataFrame:
        # Load data from a CSV file
        try:
            self.df = pd.read_csv(self.file_path)
            return self.df
        except Exception as e:
            print(f"Error loading data: {e}")

    def get_data_info(self, df: pd.DataFrame, file_id: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive dataset information"""
        from api.schemas import DatasetInfo, ColumnInfo
        columns_info = []
        for col in df.columns:
            raw_value = df[col].iloc[0] if len(df) > 0 else None
            if pd.isna(raw_value):
                example_value = None
            elif isinstance(raw_value, (np.generic,)):
                example_value = raw_value.item()
            elif isinstance(raw_value, (pd.Timestamp, pd.Timedelta)):
                example_value = raw_value.isoformat()
            else:
                example_value = raw_value
            col_info = ColumnInfo(
                name=col,
                dtype=str(df[col].dtype),
                unique_count=int(df[col].nunique()),
                missing_count=int(df[col].isnull().sum()),
                example_value=example_value,
            )
            columns_info.append(col_info)
        
        # Convert dtype keys to strings and values to integers
        dtypes_summary = {str(k): int(v) for k, v in df.dtypes.value_counts().items()}

        return DatasetInfo(
            file_id=file_id or "",
            columns=columns_info,
            shape={'rows': int(df.shape[0]), 'columns': int(df.shape[1])},
            memory_usage=f"{int(df.memory_usage(deep=True).sum() / 1024 / 1024)} MB",
            dtypes_summary=dtypes_summary,
            )
    
    def dedect_problem_type(self, traget_column: str = None) -> str:
        #Detect if problem is classification, regression, or clustering based on target column
        if self.df is None:
            raise Exception("Data not loaded. Call load_data() first.")
        
        # If no target column, it's clustering (unsupervised learning)
        if traget_column is None:
            return "clustering"
        
        target_series = self.df[traget_column] 

        # check if target is numeric
        if pd.api.types.is_numeric_dtype(target_series):
            unique_values = target_series.dropna().unique()
            unique_count = len(unique_values)
            # Heuristic: if unique values < 20% of total rows, likely classification
            if unique_count < 0.2 * len(target_series) and unique_count <= 50:
                return "classification"
            else:
                return "regression"
        else:
            return "classification"
        





