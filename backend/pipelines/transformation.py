# ml-pipeline-app/backend/pipelines/transformation.py

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import (
    StandardScaler,LabelEncoder, OneHotEncoder,
    MinMaxScaler, RobustScaler
)
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import warnings

warnings.filterwarnings("ignore")

class DataTransformer:
    def __init__(self, target_column: str, problem_type: str):
        self.target_column = target_column
        self.problem_type = problem_type
        self.prepeocessor = None
        self.label_encoder = None
        self.feature_names = None

    def transform(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        # Transform dataset for ML training
        X = df.drop(columns=[self.target_column])
        y = df[self.target_column]

        # Store feature names
        self.feature_names = X.columns.tolist()

        # Encode target for classification
        if self.problem_type == "classfication" and not pd.api.types.is_numeric_dtype(y):
            self.label_encoder = LabelEncoder()
            y = pd.Series(self.label_encoder.fit_transform(y), name=self.target_column)

        # Identify column types
        numeric_features = X.select_dtypes(include=[np.number]).columns.tolist()
        categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()

        # Create preprocessing pipelines
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
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

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y if self.problem_type == "classification" else None
        )

        # Fit and transform training data
        X_train_transformed = self.prepeocessor.fit_transform(X_train)
        X_test_transformed = self.prepeocessor.transform(X_test)

        # Get feature names after transformation
        if categorical_features:
            ohe = self.preprocessor.named_transformers_['cat'].named_steps['encoder']
            categorical_feature_names = ohe.get_feature_names_out(categorical_features)
            all_feature_names = numeric_features + list(categorical_feature_names)
        else:
            all_feature_names = numeric_features

        # Convert back to DataFrame with feature names
        X_train_df = pd.DataFrame(X_train_transformed, columns=all_feature_names, index=X_train.index)
        X_test_df = pd.DataFrame(X_test_transformed, columns=all_feature_names, index=X_test.index)
        
        return X_train_df, X_test_df, y_train, y_test
    
    def get_feature_names(self) -> List[str]:
        """Get feature names after transformation"""
        if self.preprocessor is None:
            raise ValueError("Preprocessor not fitted yet")
        
        return self.feature_names
    
    def transform_new_data(self, X: pd.DataFrame) -> pd.DataFrame:
        """Transform new data using fitted preprocessor"""
        if self.preprocessor is None:
            raise ValueError("Preprocessor not fitted yet")
        
        X_transformed = self.preprocessor.transform(X)
        
        # Get feature names
        numeric_features = []
        categorical_features = []
        
        for name, transformer, features in self.preprocessor.transformers_:
            if name == 'num':
                numeric_features = features
            elif name == 'cat':
                categorical_features = features
        
        if categorical_features:
            ohe = self.preprocessor.named_transformers_['cat'].named_steps['encoder']
            categorical_feature_names = ohe.get_feature_names_out(categorical_features)
            all_feature_names = numeric_features + list(categorical_feature_names)
        else:
            all_feature_names = numeric_features
        
        return pd.DataFrame(X_transformed, columns=all_feature_names)