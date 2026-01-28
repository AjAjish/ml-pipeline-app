# backend/pipelines/evaluation.py
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    confusion_matrix, classification_report,
    mean_squared_error, mean_absolute_error, r2_score
)
import json
from datetime import datetime

from pipelines.registry import ProblemType

class ModelEvaluator:
    def __init__(self, problem_type: str, models: Dict[str, Any], training_history: Dict[str, Any] = None):
        self.problem_type = ProblemType(problem_type)
        self.models = models
        self.training_history = training_history or {}
        self.evaluation_results = {}
    
    def evaluate_all(self, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
        """Evaluate all trained models"""
        self.evaluation_results = {"models": {}, "best_model": None}
        
        best_score = -np.inf if self.problem_type == ProblemType.REGRESSION else 0
        best_model = None
        
        for model_name, model in self.models.items():
            try:
                # Make predictions
                y_pred = model.predict(X_test)
                
                # Calculate metrics
                metrics = self._calculate_metrics(y_test, y_pred, model_name)
                
                # Get training metadata if available
                training_info = self.training_history.get(model_name, {})
                
                # Store results with training metadata
                result_entry = metrics.copy()
                result_entry["training_time"] = training_info.get("training_time", 0)
                result_entry["cv_mean"] = training_info.get("cv_mean", None)
                result_entry["cv_std"] = training_info.get("cv_std", None)
                
                self.evaluation_results["models"][model_name] = result_entry
                
                # Update best model
                if self.problem_type == ProblemType.REGRESSION:
                    # For regression, use R2 score (higher is better)
                    score = metrics["metrics"].get("r2", -np.inf)
                else:
                    # For classification, use F1 score
                    score = metrics["metrics"].get("f1", 0)
                
                if (self.problem_type == ProblemType.REGRESSION and score > best_score) or \
                   (self.problem_type == ProblemType.CLASSIFICATION and score > best_score):
                    best_score = score
                    best_model = model_name
                    
            except Exception as e:
                print(f"Error evaluating {model_name}: {str(e)}")
                continue
        
        self.evaluation_results["best_model"] = best_model
        
        return self.evaluation_results
    
    def _calculate_metrics(self, y_true: pd.Series, y_pred: np.ndarray, model_name: str) -> Dict[str, Any]:
        """Calculate evaluation metrics"""
        metrics = {}
        
        if self.problem_type == ProblemType.REGRESSION:
            # Regression metrics
            metrics = {
                "mse": float(mean_squared_error(y_true, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
                "mae": float(mean_absolute_error(y_true, y_pred)),
                "r2": float(r2_score(y_true, y_pred)),
                "mape": float(self._calculate_mape(y_true, y_pred))
            }
        else:
            # Classification metrics
            metrics = {
                "accuracy": float(accuracy_score(y_true, y_pred)),
                "precision": float(precision_score(y_true, y_pred, average='weighted', zero_division=0)),
                "recall": float(recall_score(y_true, y_pred, average='weighted', zero_division=0)),
                "f1": float(f1_score(y_true, y_pred, average='weighted', zero_division=0))
            }
            
            # Confusion matrix
            try:
                cm = confusion_matrix(y_true, y_pred)
                metrics["confusion_matrix"] = cm.tolist()
                
                # Classification report
                report = classification_report(y_true, y_pred, output_dict=True)
                metrics["classification_report"] = report
            except:
                pass
        
        return {"metrics": metrics}
    
    def _calculate_mape(self, y_true: pd.Series, y_pred: np.ndarray) -> float:
        """Calculate Mean Absolute Percentage Error"""
        y_true, y_pred = np.array(y_true), np.array(y_pred)
        
        # Avoid division by zero
        mask = y_true != 0
        if np.sum(mask) == 0:
            return np.nan
            
        return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
    
    def get_detailed_report(self) -> Dict[str, Any]:
        """Get detailed evaluation report"""
        return self.evaluation_results