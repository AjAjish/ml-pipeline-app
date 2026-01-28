# backend/pipelines/validation.py
import pandas as pd
from typing import Dict, Any, Optional

class DataValidator:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.validation_report = {}
        self.warnings = []
    
    def validate_all(self, target_column: Optional[str] = None) -> Dict[str, Any]:
        """Run all validation checks"""
        self.validation_report = {
            "basic_checks": self._validate_basic(),
            "data_types": self._validate_data_types(),
            "missing_values": self._validate_missing_values(),
            "target_column": self._validate_target_column(target_column) if target_column else None
        }
        
        # Check overall validity
        self.validation_report["is_valid"] = self._check_overall_validity()
        
        return {
            "report": self.validation_report,
            "warnings": self.warnings,
            "is_valid": self.validation_report["is_valid"]
        }
    
    def _validate_basic(self) -> Dict[str, Any]:
        """Basic dataset validation"""
        checks = {}
        
        # Check if dataframe is empty
        checks["is_empty"] = self.df.empty
        if self.df.empty:
            self.warnings.append("Dataset is empty")
        
        # Check shape
        checks["shape"] = self.df.shape
        
        # Check for duplicate rows
        duplicate_rows = self.df.duplicated().sum()
        checks["duplicate_rows"] = int(duplicate_rows)
        if duplicate_rows > 0:
            self.warnings.append(f"Found {duplicate_rows} duplicate rows")
        
        return checks
    
    def _validate_data_types(self) -> Dict[str, Any]:
        """Validate data types"""
        dtype_info = {}
        
        for col in self.df.columns:
            dtype_info[col] = {
                "dtype": str(self.df[col].dtype),
                "is_numeric": pd.api.types.is_numeric_dtype(self.df[col]),
                "is_categorical": pd.api.types.is_categorical_dtype(self.df[col]),
                "unique_values": int(self.df[col].nunique())
            }
            
            # Check for mixed data types
            try:
                self.df[col].astype(str).value_counts()
            except Exception:
                self.warnings.append(f"Column '{col}' may have mixed data types")
        
        return dtype_info
    
    def _validate_missing_values(self) -> Dict[str, Any]:
        """Check for missing values"""
        missing_stats = {}
        total_missing = 0
        
        for col in self.df.columns:
            missing_count = self.df[col].isnull().sum()
            missing_percentage = (missing_count / len(self.df)) * 100
            
            missing_stats[col] = {
                "missing_count": int(missing_count),
                "missing_percentage": float(missing_percentage)
            }
            
            total_missing += missing_count
            
            if missing_percentage > 50:
                self.warnings.append(f"Column '{col}' has {missing_percentage:.1f}% missing values")
        
        missing_stats["total_missing"] = int(total_missing)
        missing_stats["missing_percentage_overall"] = (total_missing / (len(self.df) * len(self.df.columns))) * 100
        
        return missing_stats
    
    def _validate_target_column(self, target_column: str) -> Dict[str, Any]:
        """Validate target column"""
        if target_column not in self.df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset")
        
        target_info = {
            "exists": True,
            "dtype": str(self.df[target_column].dtype),
            "unique_values": int(self.df[target_column].nunique()),
            "missing_values": int(self.df[target_column].isnull().sum()),
            "value_distribution": self._get_value_distribution(target_column)
        }
        
        # Check if target has enough non-missing values
        if target_info["missing_values"] > len(self.df) * 0.5:
            self.warnings.append(f"Target column '{target_column}' has >50% missing values")
        
        return target_info
    
    def _get_value_distribution(self, column: str) -> Dict[str, Any]:
        """Get value distribution for a column"""
        value_counts = self.df[column].value_counts()
        
        return {
            "top_values": value_counts.head(10).to_dict(),
            "unique_count": int(value_counts.shape[0])
        }
    
    def _check_overall_validity(self) -> bool:
        """Check if dataset is valid for ML"""
        basic_checks = self.validation_report.get("basic_checks", {})
        
        if basic_checks.get("is_empty", True):
            return False
        
        if self.validation_report.get("target_column") and \
           self.validation_report["target_column"]["missing_values"] == len(self.df):
            return False
        
        return True