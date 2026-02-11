# backend/pipelines/registry.py
from typing import Dict, List, Any
from enum import Enum
from sklearn.cluster import (
    KMeans, MiniBatchKMeans, AgglomerativeClustering, DBSCAN, OPTICS,
    MeanShift, SpectralClustering, Birch, AffinityPropagation
)
from sklearn.mixture import GaussianMixture
from sklearn.linear_model import LinearRegression, Ridge, Lasso, LogisticRegression
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.naive_bayes import GaussianNB
from xgboost import XGBRegressor, XGBClassifier
import numpy as np
from distutils.version import LooseVersion

try:
    from lightgbm import LGBMRegressor, LGBMClassifier
except Exception:
    LGBMRegressor = None
    LGBMClassifier = None

class ProblemType(str, Enum):
    REGRESSION = "regression"
    CLASSIFICATION = "classification"
    CLUSTERING = "clustering"

class AlgorithmRegistry:
    def __init__(self):
        self.registry = {
            ProblemType.REGRESSION: self._get_regression_algorithms(),
            ProblemType.CLASSIFICATION: self._get_classification_algorithms(),
            ProblemType.CLUSTERING: self._get_clustering_algorithms()
        }
    
    def _get_regression_algorithms(self) -> Dict[str, Any]:
        """Get regression algorithms with default parameters"""
        algorithms = {
            "LinearRegression": {
                "model": LinearRegression(),
                "description": "Ordinary least squares linear regression",
                "parameters": {}
            },
            "Ridge": {
                "model": Ridge(random_state=42),
                "description": "Linear regression with L2 regularization",
                "parameters": {"alpha": 1.0}
            },
            "Lasso": {
                "model": Lasso(random_state=42),
                "description": "Linear regression with L1 regularization",
                "parameters": {"alpha": 1.0}
            },
            "DecisionTreeRegressor": {
                "model": DecisionTreeRegressor(random_state=42),
                "description": "Decision tree regressor",
                "parameters": {"max_depth": 5}
            },
            "RandomForestRegressor": {
                "model": RandomForestRegressor(
                    random_state=42,
                    n_estimators=50,
                    max_depth=12,
                    n_jobs=-1
                ),
                "description": "Random forest regressor",
                "parameters": {"n_estimators": 50, "max_depth": 12, "n_jobs": -1}
            },
            "GradientBoostingRegressor": {
                "model": GradientBoostingRegressor(random_state=42, n_estimators=100),
                "description": "Gradient boosting regressor",
                "parameters": {"n_estimators": 100, "learning_rate": 0.1}
            },
            "XGBRegressor": {
                "model": XGBRegressor(random_state=42, n_estimators=100),
                "description": "XGBoost regressor",
                "parameters": {"n_estimators": 100}
            },
        }

        if LGBMRegressor is not None and LooseVersion(np.__version__) < LooseVersion("2.0.0"):
            algorithms["LGBMRegressor"] = {
                "model": LGBMRegressor(random_state=42, n_estimators=100),
                "description": "LightGBM regressor",
                "parameters": {"n_estimators": 100}
            }

        return algorithms
    
    def _get_classification_algorithms(self) -> Dict[str, Any]:
        """Get classification algorithms with default parameters"""
        algorithms = {
            "LogisticRegression": {
                "model": LogisticRegression(random_state=42, max_iter=1000),
                "description": "Logistic regression classifier",
                "parameters": {"C": 1.0}
            },
            "KNeighborsClassifier": {
                "model": KNeighborsClassifier(),
                "description": "K-nearest neighbors classifier",
                "parameters": {"n_neighbors": 5}
            },
            "DecisionTreeClassifier": {
                "model": DecisionTreeClassifier(random_state=42),
                "description": "Decision tree classifier",
                "parameters": {"max_depth": 5}
            },
            "RandomForestClassifier": {
                "model": RandomForestClassifier(
                    random_state=42,
                    n_estimators=50,
                    max_depth=12,
                    n_jobs=-1
                ),
                "description": "Random forest classifier",
                "parameters": {"n_estimators": 50, "max_depth": 12, "n_jobs": -1}
            },
            "SVC": {
                "model": SVC(random_state=42, probability=True),
                "description": "Support Vector Classifier",
                "parameters": {"C": 1.0}
            },
            "GradientBoostingClassifier": {
                "model": GradientBoostingClassifier(random_state=42, n_estimators=100),
                "description": "Gradient boosting classifier",
                "parameters": {"n_estimators": 100, "learning_rate": 0.1}
            },
            "GaussianNB": {
                "model": GaussianNB(),
                "description": "Gaussian Naive Bayes",
                "parameters": {}
            },
            "XGBClassifier": {
                "model": XGBClassifier(random_state=42, n_estimators=100),
                "description": "XGBoost classifier",
                "parameters": {"n_estimators": 100}
            },
        }

        if LGBMClassifier is not None and LooseVersion(np.__version__) < LooseVersion("2.0.0"):
            algorithms["LGBMClassifier"] = {
                "model": LGBMClassifier(random_state=42, n_estimators=100),
                "description": "LightGBM classifier",
                "parameters": {"n_estimators": 100}
            }

        return algorithms
    
    def _get_clustering_algorithms(self) -> Dict[str, Any]:
        return {
            "KMeans": {
                "model": KMeans(),
                "description": "Partition-based clustering using centroids",
                "parameters": {"n_clusters": 3}
            },
            "MiniBatchKMeans": {
                "model": MiniBatchKMeans(),
                "description": "Faster KMeans using mini-batches",
                "parameters": {"n_clusters": 3}
            },
            "AgglomerativeClustering": {
                "model": AgglomerativeClustering(),
                "description": "Hierarchical bottom-up clustering",
                "parameters": {"n_clusters": 3}
            },
            "DBSCAN": {
                "model": DBSCAN(),
                "description": "Density-based clustering with noise detection",
                "parameters": {"eps": 0.5, "min_samples": 5}
            },
            "OPTICS": {
                "model": OPTICS(),
                "description": "Density-based clustering for varying densities",
                "parameters": {}
            },
            "MeanShift": {
                "model": MeanShift(),
                "description": "Centroid-based clustering using kernel density",
                "parameters": {}
            },
            "SpectralClustering": {
                "model": SpectralClustering(),
                "description": "Graph-based clustering using eigenvectors",
                "parameters": {"n_clusters": 3}
            },
            "Birch": {
                "model": Birch(),
                "description": "Hierarchical clustering for large datasets",
                "parameters": {"n_clusters": 3}
            },
            "GaussianMixture": {
                "model": GaussianMixture(),
                "description": "Probabilistic clustering using Gaussian distributions",
                "parameters": {"n_components": 3}
            },
            "AffinityPropagation": {
                "model": AffinityPropagation(),
                "description": "Message-passing based clustering",
                "parameters": {}
            }
        }
    
    def get_algorithms(self, problem_type: ProblemType) -> Dict[str, Any]:
        """Get algorithms for a specific problem type"""
        return self.registry.get(problem_type, {})
    
    def get_algorithm(self, problem_type: ProblemType, algorithm_name: str) -> Any:
        """Get specific algorithm"""
        algorithms = self.get_algorithms(problem_type)
        if algorithm_name not in algorithms:
            raise ValueError(f"Algorithm '{algorithm_name}' not found for problem type '{problem_type}'")
        return algorithms[algorithm_name]["model"]
    
    def get_algorithm_list(self, problem_type: ProblemType) -> List[str]:
        """Get list of algorithm names for a problem type"""
        algorithms = self.get_algorithms(problem_type)
        return list(algorithms.keys())