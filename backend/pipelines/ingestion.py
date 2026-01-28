#ml-pipeline-app/backend/pipelines/ingestion.py
import pandas as pd
from typing import Dict, Any

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

    def get_data_info(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Get comprehensive dataset information"""
        from api.schemas import DatasetInfo, ColumnInfo
        columns_info = []
        for col in df.columns:
            col_info = ColumnInfo(
                name=col,
                dtype=str(df[col].dtype),
                unique_count=int(df[col].nunique()),
                missing_count=int(df[col].isnull().sum()),
                example_value=df[col].iloc[0] if len(df) > 0 else None,
            )
            columns_info.append(col_info)
        
        # Convert dtype keys to strings and values to integers
        dtypes_summary = {str(k): int(v) for k, v in df.dtypes.value_counts().items()}

        return DatasetInfo(
            file_id="",
            columns=columns_info,
            shape={'rows':df.shape[0],'columns':df.shape[1]},
            memory_usage=f"{int(df.memory_usage(deep=True).sum() / 1024 / 1024)} MB",
            dtypes_summary=dtypes_summary,
            )
    
    def dedect_problem_type(self, traget_column: str) ->str:
        #Detect if problem is classification or regression based on target column
        if self.df is None:
            raise Exception("Data not loaded. Call load_data() first.")
        
        target_series = self.df[traget_column] 

        # check if target is numeric
        if pd.api.types.is_numeric_dtype(target_series):
            unique_value = target_series.unique()
            # Heuristic: if unique values < 20% of total rows, likely classification
            if unique_value < 0.2 * len(target_series) and unique_value <= 50:
                return "classification"
            else:
                return "regression"
        else:
            return "classification"
        





