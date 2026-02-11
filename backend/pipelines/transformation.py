# ml-pipeline-app/backend/pipelines/transformation.py

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple, Union
from scipy import sparse
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import (
    StandardScaler, LabelEncoder, OneHotEncoder,
    MinMaxScaler, RobustScaler
)
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import warnings

warnings.filterwarnings("ignore")


class OutlierCapper(BaseEstimator, TransformerMixin):
    def __init__(self, factor: float = 1.5):
        self.factor = factor
        self.lower_bounds_ = None
        self.upper_bounds_ = None

    def fit(self, X: Any, y: Any = None) -> "OutlierCapper":
        X_array = np.asarray(X)
        q1 = np.nanpercentile(X_array, 25, axis=0)
        q3 = np.nanpercentile(X_array, 75, axis=0)
        iqr = q3 - q1
        self.lower_bounds_ = q1 - self.factor * iqr
        self.upper_bounds_ = q3 + self.factor * iqr
        return self

    def transform(self, X: Any) -> np.ndarray:
        X_array = np.asarray(X)
        return np.clip(X_array, self.lower_bounds_, self.upper_bounds_)

    def get_feature_names_out(self, input_features: Optional[List[str]] = None) -> List[str]:
        if input_features is None:
            return []
        return list(input_features)

class DataTransformer:
    def __init__(self, target_column: Optional[str] = None, problem_type: str = "regression"):
        self.target_column = target_column
        self.problem_type = problem_type
        self.prepeocessor = None
        self.label_encoder = None
        self.feature_names = None

    def transform(self, df: pd.DataFrame) -> Union[Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series], 
                                                     Tuple[pd.DataFrame, None, None, None]]:
        """
        Transform dataset for ML training.
        For clustering (unsupervised), returns (X_transformed, None, None, None)
        For classification/regression (supervised), returns (X_train, X_test, y_train, y_test)
        """
        # For clustering, no target column needed
        if self.problem_type == "clustering":
            X = df
            y = None
        else:
            # For supervised learning, separate features and target
            if self.target_column is None:
                raise ValueError("Target column required for supervised learning")
            X = df.drop(columns=[self.target_column])
            y = df[self.target_column]

        # Store feature names
        self.feature_names = X.columns.tolist()

        # Encode target for classification
        if self.problem_type == "classification" and y is not None and not pd.api.types.is_numeric_dtype(y):
            self.label_encoder = LabelEncoder()
            y = pd.Series(self.label_encoder.fit_transform(y), name=self.target_column)

        # Identify column types
        numeric_features = X.select_dtypes(include=[np.number]).columns.tolist()
        categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()

        # Create preprocessing pipelines
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            # Cap outliers before scaling for more stable feature ranges.
            ('outliers', OutlierCapper(factor=1.5)),
            ('scaler', StandardScaler())
        ])

        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])

        # Create column transformer
        self.prepeocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features),
                ('cat', categorical_transformer, categorical_features)
            ],
            remainder='drop'
        )

        # For clustering, don't split data
        if self.problem_type == "clustering":
            # Fit and transform all data
            X_transformed = self.prepeocessor.fit_transform(X)
            all_feature_names = self._get_transformed_feature_names(numeric_features, categorical_features)
            X_df = self._to_dataframe(X_transformed, all_feature_names, X.index)
            return X_df, None, None, None
        
        # For supervised learning, split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, 
            stratify=y if self.problem_type == "classification" else None
        )

        # Fit and transform training data
        X_train_transformed = self.prepeocessor.fit_transform(X_train)
        X_test_transformed = self.prepeocessor.transform(X_test)

        # Get feature names after transformation
        all_feature_names = self._get_transformed_feature_names(numeric_features, categorical_features)

        # Convert back to DataFrame with feature names
        X_train_df = self._to_dataframe(X_train_transformed, all_feature_names, X_train.index)
        X_test_df = self._to_dataframe(X_test_transformed, all_feature_names, X_test.index)
        
        return X_train_df, X_test_df, y_train, y_test
    
    def _get_feature_names(self, numeric_features: List[str], categorical_features: List[str]) -> List[str]:
        """Extract feature names after transformation"""
        if categorical_features and self.prepeocessor is not None:
            ohe = self.prepeocessor.named_transformers_['cat'].named_steps['onehot']
            categorical_feature_names = ohe.get_feature_names_out(categorical_features)
            all_feature_names = numeric_features + list(categorical_feature_names)
        else:
            all_feature_names = numeric_features
        return all_feature_names

    def _get_transformed_feature_names(self, numeric_features: List[str], categorical_features: List[str]) -> List[str]:
        """Get feature names that match the transformed output"""
        if self.prepeocessor is None:
            return self._get_feature_names(numeric_features, categorical_features)

        if hasattr(self.prepeocessor, "get_feature_names_out"):
            try:
                return list(self.prepeocessor.get_feature_names_out())
            except Exception:
                return self._get_feature_names(numeric_features, categorical_features)

        return self._get_feature_names(numeric_features, categorical_features)

    def _to_dataframe(self, transformed: Any, feature_names: List[str], index: pd.Index) -> pd.DataFrame:
        """Create a DataFrame from transformed data, preserving sparsity when possible"""
        if sparse.issparse(transformed):
            return pd.DataFrame.sparse.from_spmatrix(transformed, columns=feature_names, index=index)
        return pd.DataFrame(transformed, columns=feature_names, index=index)
    
    def get_feature_names(self) -> List[str]:
        """Get feature names after transformation"""
        if self.prepeocessor is None:
            raise ValueError("Preprocessor not fitted yet")
        
        return self.feature_names
    
    def transform_new_data(self, X: pd.DataFrame) -> pd.DataFrame:
        """Transform new data using fitted preprocessor"""
        if self.prepeocessor is None:
            raise ValueError("Preprocessor not fitted yet")
        
        X_transformed = self.prepeocessor.transform(X)

        if hasattr(self.prepeocessor, "get_feature_names_out"):
            try:
                all_feature_names = list(self.prepeocessor.get_feature_names_out())
            except Exception:
                all_feature_names = []
        else:
            all_feature_names = []

        if not all_feature_names:
            numeric_features = []
            categorical_features = []

            for name, transformer, features in self.prepeocessor.transformers_:
                if name == 'num':
                    numeric_features = list(features)
                elif name == 'cat':
                    categorical_features = list(features)

            all_feature_names = self._get_feature_names(numeric_features, categorical_features)

        return self._to_dataframe(X_transformed, all_feature_names, X.index)
