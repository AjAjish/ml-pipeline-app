# backend/pipelines/training.py
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple, Union, Optional
import time
from datetime import datetime
from sklearn.model_selection import cross_val_score, StratifiedKFold, KFold
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
import warnings
warnings.filterwarnings('ignore')

from pipelines.registry import AlgorithmRegistry, ProblemType

class ModelTrainer:
    def __init__(self, problem_type: str, selected_algorithms: List[str], 
                 test_size: float = 0.2, random_state: int = 42, cv_folds: int = 5):
        self.problem_type = ProblemType(problem_type)
        self.selected_algorithms = selected_algorithms
        self.test_size = test_size
        self.random_state = random_state
        self.cv_folds = cv_folds
        self.algorithm_registry = AlgorithmRegistry()
        self.trained_models = {}
        self.training_history = {}
    
    def train_models(self, X_train: pd.DataFrame, y_train: Optional[pd.Series] = None) -> Dict[str, Any]:
        """Train multiple models"""
        self.trained_models = {}
        
        for algo_name in self.selected_algorithms:
            try:
                print(f"Training {algo_name}...")
                
                # Get algorithm from registry
                algo_info = self.algorithm_registry.get_algorithm(
                    self.problem_type, algo_name
                )
                
                # Start timer
                start_time = time.time()
                
                # Different training for clustering vs supervised learning
                if self.problem_type == ProblemType.CLUSTERING:
                    # For clustering, no cross-validation needed
                    model = algo_info
                    model.fit(X_train)
                    cv_scores = np.array([silhouette_score(X_train, model.labels_)])
                else:
                    # Perform cross-validation for supervised learning
                    cv_scores = self._perform_cross_validation(algo_info, X_train, y_train)
                    
                    # Train final model
                    model = algo_info
                    model.fit(X_train, y_train)
                
                # End timer
                training_time = time.time() - start_time
                
                # Store results
                self.trained_models[algo_name] = model
                self.training_history[algo_name] = {
                    "training_time": training_time,
                    "cv_scores": cv_scores.tolist() if hasattr(cv_scores, 'tolist') else list(cv_scores),
                    "cv_mean": float(np.mean(cv_scores)),
                    "cv_std": float(np.std(cv_scores)),
                    "timestamp": datetime.now().isoformat()
                }
                
                print(f"  ✓ {algo_name} trained in {training_time:.2f}s (CV score: {np.mean(cv_scores):.3f})")
                
            except Exception as e:
                print(f"  ✗ Failed to train {algo_name}: {str(e)}")
                continue
        
        return self.trained_models
    
    def _perform_cross_validation(self, model, X: pd.DataFrame, y: pd.Series) -> np.ndarray:
        """Perform cross-validation"""
        # Choose scoring metric based on problem type
        if self.problem_type == ProblemType.REGRESSION:
            scoring = 'neg_mean_squared_error'
            cv = KFold(n_splits=self.cv_folds, shuffle=True, random_state=self.random_state)
        else:
            scoring = 'accuracy'
            cv = StratifiedKFold(n_splits=self.cv_folds, shuffle=True, random_state=self.random_state)
        
        # Perform cross-validation
        cv_scores = cross_val_score(
            model, X, y, 
            cv=cv, 
            scoring=scoring,
            n_jobs=-1
        )
        
        # Convert negative MSE to positive
        if scoring == 'neg_mean_squared_error':
            cv_scores = -cv_scores

        print(f"    Cross-validation scores: {cv_scores}")
        return cv_scores
    
    def get_training_history(self) -> Dict[str, Any]:
        """Get training history for all models"""

        print(f"     Training history: {self.training_history}")
        return self.training_history