# backend/pipelines/validation.py
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

class DataValidator:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.validation_report = {}
        self.warnings = []
    
    def validate_all(self, target_column: Optional[str] = None) -> Dict[str, Any]:
        """Run all validation checks"""
        basic_checks = self._validate_basic()
        missing_values = self._validate_missing_values()
        outliers = self._detect_outliers()

        self.validation_report = {
            "basic_checks": basic_checks,
            "data_types": self._validate_data_types(),
            "missing_values": missing_values,
            "outliers": outliers,
            "target_column": self._validate_target_column(target_column) if target_column else None,
            "cleaning_plan": self._build_cleaning_plan(basic_checks, missing_values, outliers)
        }
        
        # Check overall validity
        self.validation_report["is_valid"] = self._check_overall_validity()
        
        return {
            "report": self.validation_report,
            "warnings": self.warnings,
            "is_valid": self.validation_report["is_valid"]
        }

    def apply_cleaning(self) -> Dict[str, Any]:
        """Apply cleaning steps and return cleaned dataframe with summary"""
        df_clean = self.df.copy()

        duplicates_removed = int(df_clean.duplicated().sum())
        if duplicates_removed > 0:
            df_clean = df_clean.drop_duplicates()

        imputed_missing = 0
        for col in df_clean.columns:
            missing_count = int(df_clean[col].isnull().sum())
            if missing_count == 0:
                continue

            if pd.api.types.is_numeric_dtype(df_clean[col]):
                mean_value = df_clean[col].mean()
                if pd.isna(mean_value):
                    continue
                df_clean[col] = df_clean[col].fillna(mean_value)
                imputed_missing += missing_count
            else:
                modes = df_clean[col].mode(dropna=True)
                if modes.empty:
                    continue
                df_clean[col] = df_clean[col].fillna(modes.iloc[0])
                imputed_missing += missing_count

        outliers_capped = 0
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns.tolist()
        for col in numeric_cols:
            series = df_clean[col]
            if series.dropna().empty:
                continue

            q1 = np.nanpercentile(series, 25)
            q3 = np.nanpercentile(series, 75)
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            outlier_mask = (series < lower) | (series > upper)
            outlier_count = int(outlier_mask.sum())
            if outlier_count > 0:
                df_clean[col] = series.clip(lower, upper)
                outliers_capped += outlier_count

        return {
            "cleaned_df": df_clean,
            "summary": {
                "duplicates_removed": duplicates_removed,
                "missing_imputed": imputed_missing,
                "outliers_capped": outliers_capped
            }
        }
    
    def _validate_basic(self) -> Dict[str, Any]:
        """Basic dataset validation"""
        checks = {}
        
        # Check if dataframe is empty
        checks["is_empty"] = bool(self.df.empty)
        if self.df.empty:
            self.warnings.append("Dataset is empty")
        
        # Check shape
        checks["shape"] = self.df.shape
        
        # Check for duplicate rows
        duplicate_rows = int(self.df.duplicated().sum())
        checks["duplicate_rows"] = duplicate_rows
        if duplicate_rows > 0:
            self.warnings.append(f"Found {duplicate_rows} duplicate rows")
        
        return checks
    
    def _validate_data_types(self) -> Dict[str, Any]:
        """Validate data types"""
        dtype_info = {}
        
        for col in self.df.columns:
            dtype_info[col] = {
                "dtype": str(self.df[col].dtype),
                "is_numeric": bool(pd.api.types.is_numeric_dtype(self.df[col])),
                "is_categorical": bool(pd.api.types.is_categorical_dtype(self.df[col])),
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
            missing_count = int(self.df[col].isnull().sum())
            missing_percentage = (missing_count / len(self.df)) * 100
            
            missing_stats[col] = {
                "missing_count": missing_count,
                "missing_percentage": float(missing_percentage)
            }
            
            total_missing += missing_count
            
            if missing_percentage > 50:
                self.warnings.append(f"Column '{col}' has {missing_percentage:.1f}% missing values")
        
        missing_stats["total_missing"] = int(total_missing)
        missing_stats["missing_percentage_overall"] = (total_missing / (len(self.df) * len(self.df.columns))) * 100
        missing_stats["has_missing"] = bool(total_missing > 0)
        
        return missing_stats

    def _detect_outliers(self) -> Dict[str, Any]:
        """Detect outliers using IQR for numeric columns"""
        outlier_info: Dict[str, Any] = {}
        total_outliers = 0

        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        for col in numeric_cols:
            series = self.df[col]
            if series.dropna().empty:
                outlier_info[col] = {"outlier_count": 0}
                continue

            q1 = np.nanpercentile(series, 25)
            q3 = np.nanpercentile(series, 75)
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            outlier_count = int(((series < lower) | (series > upper)).sum())
            outlier_info[col] = {"outlier_count": outlier_count}
            total_outliers += outlier_count

        outlier_info["total_outliers"] = int(total_outliers)
        outlier_info["has_outliers"] = bool(total_outliers > 0)
        return outlier_info

    def _build_cleaning_plan(
        self,
        basic_checks: Dict[str, Any],
        missing_values: Dict[str, Any],
        outliers: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Describe intended cleaning steps and whether changes are required"""
        duplicate_rows = int(basic_checks.get("duplicate_rows", 0))
        total_missing = int(missing_values.get("total_missing", 0))
        total_outliers = int(outliers.get("total_outliers", 0))

        changes_required = (duplicate_rows > 0) or (total_missing > 0) or (total_outliers > 0)

        return {
            "missing_values": {
                "numeric_strategy": "mean",
                "categorical_strategy": "mode",
                "has_missing": bool(missing_values.get("has_missing", False))
            },
            "duplicates": {
                "will_drop": True,
                "count": duplicate_rows
            },
            "outliers": {
                "method": "iqr",
                "will_cap": True,
                "count": total_outliers
            },
            "changes_required": bool(changes_required),
            "changes_done": False
        }
    
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
        
        if bool(basic_checks.get("is_empty", True)):
            return False
        
        if self.validation_report.get("target_column") and \
            int(self.validation_report["target_column"]["missing_values"]) == len(self.df):
            return False
        
        return True