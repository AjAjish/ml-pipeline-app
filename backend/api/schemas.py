# backend/api/schemas.py
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional, Union
from enum import Enum
import numpy as np

class ProblemType(str, Enum):
    REGRESSION = "regression"
    CLASSIFICATION = "classification"
    CLUSTERING = "clustering"

class UploadResponse(BaseModel):
    filename: str
    file_id: str
    rows: int
    columns: int
    message: str

class ColumnInfo(BaseModel):
    name: str
    dtype: str
    unique_count: int
    missing_count: int
    example_value: Any

class DatasetInfo(BaseModel):
    file_id: str
    columns: List[ColumnInfo]
    shape: Dict[str, int]
    memory_usage: str
    dtypes_summary: Dict[str, int]

class TrainingRequest(BaseModel):
    file_id: str
    target_column: Optional[str] = None
    selected_features: Optional[List[str]] = None
    problem_type: ProblemType
    selected_algorithms: List[str]
    test_size: float = Field(0.2, ge=0.1, le=0.5)
    random_state: int = 42
    cv_folds: int = Field(5, ge=2, le=10)

class ModelMetrics(BaseModel):
    model_name: str
    training_time: float
    metrics: Dict[str, Union[float, str]]
    cv_scores: Optional[List[float]] = None
    cv_mean: Optional[float] = None
    cv_std: Optional[float] = None

    @validator('cv_scores', pre=True)
    def convert_numpy_array(cls, v):
        if v is not None and hasattr(v, 'tolist'):
            return v.tolist()
        return v
    
    @validator('metrics', pre=True)
    def convert_metrics(cls, v):
        if isinstance(v, dict):
            return {k: float(val) if isinstance(val, (np.floating, float, int)) else str(val) 
                   for k, val in v.items()}
        return v

class EvaluationResults(BaseModel):
    session_id: str
    problem_type: ProblemType
    target_column: str
    models: List[ModelMetrics]
    best_model: str
    feature_importance: Optional[Dict[str, float]]
    timestamp: str

class DownloadRequest(BaseModel):
    session_id: str
    model_name: str
    format: Optional[str] = "onnx"
    allow_fallback: bool = True

class PredictRequest(BaseModel):
    session_id: str
    model_name: Optional[str] = None
    inputs: Dict[str, Any]