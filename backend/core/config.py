# backend/core/config.py
import os
from pydantic_settings import BaseSettings
from typing import List, Dict, Any

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AutoML Pipeline"
    DEBUG: bool = True
    
    # Paths
    UPLOAD_DIR: str = "uploads"
    MODEL_DIR: str = "models"
    STATIC_DIR: str = "static"
    
    # ML Settings
    TEST_SIZE: float = 0.2
    RANDOM_STATE: int = 42
    CV_FOLDS: int = 5
    
    # Algorithms
    REGRESSION_ALGORITHMS: List[str] = [
        "LinearRegression",
        "Ridge",
        "Lasso",
        "DecisionTreeRegressor",
        "RandomForestRegressor",
        "GradientBoostingRegressor"
    ]
    
    CLASSIFICATION_ALGORITHMS: List[str] = [
        "LogisticRegression",
        "KNeighborsClassifier",
        "DecisionTreeClassifier",
        "RandomForestClassifier",
        "SVC",
        "GradientBoostingClassifier"
    ]
    
    # Feature Engineering
    MAX_CATEGORICAL_UNIQUE: int = 20
    
    class Config:
        env_file = ".env"

settings = Settings()