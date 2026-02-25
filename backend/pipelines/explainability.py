# backend/pipelines/explainability.py
"""
Comprehensive Model Explainability Module
Features: SHAP, LIME, Feature Importance, and model-agnostic explanations
Optimized for performance with large datasets
"""

import shap
import numpy as np
import pandas as pd
import logging
try:
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    import matplotlib.pyplot as plt
    MATPLOTLIB_AVAILABLE = True
except Exception:
    MATPLOTLIB_AVAILABLE = False
    plt = None
import base64
from io import BytesIO
from typing import Dict, List, Any, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')

try:
    import lime
    import lime.lime_tabular
    LIME_AVAILABLE = True
except ImportError:
    LIME_AVAILABLE = False

from sklearn.preprocessing import StandardScaler
from sklearn.inspection import permutation_importance, partial_dependence
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
import time

logger = logging.getLogger(__name__)
if not MATPLOTLIB_AVAILABLE:
    logger.warning("Matplotlib unavailable for explainability plots. Install a NumPy-compatible build.")

class XAIExplainer:
    """Optimized XAI explanation engine with SHAP, LIME, and feature importance"""
    
    def __init__(self, model, X_data: pd.DataFrame, feature_names: List[str], 
                 model_type: str = 'regression', max_samples: int = 1000):
        """
        Initialize explainer with performance optimization
        
        Args:
            model: Trained ML model
            X_data: Training/reference data
            feature_names: List of feature names
            model_type: 'regression' or 'classification'
            max_samples: Maximum samples for SHAP calculation (for performance)
        """
        self.model = model
        self.X_data = X_data if len(X_data) <= max_samples else X_data.sample(n=max_samples, random_state=42)
        self.X_full = X_data  # Keep full dataset for reference
        self.feature_names = feature_names
        self.model_type = model_type
        self.max_samples = max_samples
        
        # Explainers (lazy-loaded)
        self.shap_explainer = None
        self.shap_values = None
        self.lime_explainer = None
        
        # Cache for expensive computations
        self.feature_importance_cache = None
        self.pdp_cache = {}
        
    def get_SHAP_values(self, X_test: pd.DataFrame = None, force_recompute: bool = False) -> np.ndarray:
        """
        Get SHAP values with intelligent model-type handling
        
        Args:
            X_test: Test data (defaults to X_data)
            force_recompute: Force recomputation even if cached
            
        Returns:
            SHAP values array
        """
        if X_test is None:
            X_test = self.X_data
        else:
            # Limit test data for performance
            if len(X_test) > 100:
                X_test = X_test.sample(n=100, random_state=42)
        
        if self.shap_values is not None and not force_recompute:
            return self.shap_values
        
        try:
            model_name = type(self.model).__name__
            
            # Use TreeExplainer for tree-based models (fastest)
            if any(x in model_name for x in ['Forest', 'XGB', 'LGBM', 'Decision', 'Gradient']):
                logger.info(f"Using TreeExplainer for {model_name}")
                self.shap_explainer = shap.TreeExplainer(self.model)
                
            # Use LinearExplainer for linear models
            elif any(x in model_name for x in ['Linear', 'Ridge', 'Lasso', 'LogisticRegression']):
                logger.info(f"Using LinearExplainer for {model_name}")
                self.shap_explainer = shap.LinearExplainer(
                    self.model, 
                    shap.sample(self.X_data, min(len(self.X_data), 100))
                )
            else:
                # Fallback to KernelExplainer (slowest but model-agnostic)
                logger.info(f"Using KernelExplainer for {model_name}")
                background_data = shap.sample(self.X_data, min(len(self.X_data), 50))
                self.shap_explainer = shap.KernelExplainer(
                    self.model.predict if hasattr(self.model, 'predict') else self.model,
                    background_data
                )
            
            self.shap_values = self.shap_explainer.shap_values(X_test)
            return self.shap_values
            
        except Exception as e:
            logger.warning(f"SHAP computation failed ({type(e).__name__}): {e}")
            logger.info("Falling back to permutation importance")
            return None
    
    def get_feature_importance(self, method: str = 'shap') -> Dict[str, float]:
        """
        Get feature importance using multiple methods
        
        Args:
            method: 'shap', 'permutation', 'model', or 'multi' for weighted average
            
        Returns:
            Dictionary of feature names to importance scores
        """
        if method == 'shap':
            return self._get_shap_importance()
        elif method == 'permutation':
            return self._get_permutation_importance()
        elif method == 'model':
            return self._get_model_importance()
        elif method == 'multi':
            return self._get_ensemble_importance()
        else:
            logger.warning(f"Unknown method: {method}, using multi")
            return self._get_ensemble_importance()
    
    def _get_shap_importance(self) -> Dict[str, float]:
        """Get importance from SHAP values"""
        try:
            shap_vals = self.get_SHAP_values()
            if shap_vals is None:
                return {}
            
            # Handle both binary and multiclass
            if isinstance(shap_vals, list):
                shap_vals = np.array(shap_vals[0])
            
            importance = np.abs(shap_vals).mean(axis=0)
            return dict(zip(self.feature_names, importance.tolist()))
        except Exception as e:
            logger.warning(f"SHAP importance failed: {e}")
            return {}
    
    def _get_model_importance(self) -> Dict[str, float]:
        """Get importance from model if available (e.g., tree-based)"""
        try:
            if hasattr(self.model, 'feature_importances_'):
                importance = self.model.feature_importances_
                return dict(zip(self.feature_names, importance.tolist()))
            elif hasattr(self.model, 'coef_'):
                importance = np.abs(self.model.coef_).flatten()
                return dict(zip(self.feature_names, importance.tolist()))
            return {}
        except Exception as e:
            logger.warning(f"Model importance failed: {e}")
            return {}
    
    def _get_permutation_importance(self) -> Dict[str, float]:
        """Get permutation importance (model-agnostic)"""
        try:
            if self.model_type == 'classification' and hasattr(self.model, 'predict_proba'):
                scoring_func = 'accuracy'
            else:
                scoring_func = 'r2' if self.model_type == 'regression' else 'accuracy'
            
            result = permutation_importance(
                self.model, 
                self.X_data, 
                getattr(self, 'y_data', None),  # Will use model prediction if y_data not set
                n_repeats=5,
                random_state=42,
                n_jobs=-1
            )
            return dict(zip(self.feature_names, result.importances_mean.tolist()))
        except Exception as e:
            logger.warning(f"Permutation importance failed: {e}")
            return {}
    
    def _get_ensemble_importance(self) -> Dict[str, float]:
        """Get weighted average of multiple importance methods"""
        methods = ['shap', 'model', 'permutation']
        importances = []
        weights = []
        
        for method in methods:
            try:
                imp = self.get_feature_importance(method=method)
                if imp:
                    importances.append(imp)
                    weights.append(1.0)
            except:
                pass
        
        if not importances:
            return dict(zip(self.feature_names, [0.0] * len(self.feature_names)))
        
        # Normalize weights
        total_weight = sum(weights)
        weights = [w / total_weight for w in weights]
        
        # Compute weighted average
        ensemble_imp = {}
        for feature in self.feature_names:
            weighted_val = sum(
                float(imp.get(feature, 0)) * w 
                for imp, w in zip(importances, weights)
            )
            ensemble_imp[feature] = weighted_val
        
        return ensemble_imp
    
    def generate_global_explanations(self, X_test=None) -> Dict[str, Any]:
        """Generate comprehensive global feature importance explanations"""
        if X_test is None:
            X_test = self.X_data
        
        explanations = {
            'feature_importance_shap': self._get_shap_importance(),
            'feature_importance_model': self._get_model_importance(),
            'feature_importance_ensemble': self._get_ensemble_importance(),
        }
        
        # Add visualizations if SHAP values available
        try:
            shap_vals = self.get_SHAP_values(X_test)
            if shap_vals is not None:
                explanations['summary_data'] = self._create_shap_summary_data(X_test, shap_vals)
        except Exception as e:
            logger.warning(f"Summary visualization failed: {e}")
        
        return explanations
    
    def generate_local_explanations(self, X_sample: pd.Series, sample_index: int = 0) -> Dict[str, Any]:
        """Generate explanations for individual predictions"""
        explanations = {
            'prediction': self._get_prediction(X_sample),
            'feature_values': dict(zip(self.feature_names, X_sample.values if isinstance(X_sample, pd.Series) else X_sample[0])),
        }
        
        # Get SHAP contribution for this sample
        try:
            shap_vals = self.get_SHAP_values(X_sample.to_frame().T if isinstance(X_sample, pd.Series) else X_sample)
            if shap_vals is not None:
                explanations['shap_contributions'] = self._extract_shap_contributions(shap_vals[0] if isinstance(shap_vals, list) else shap_vals[0])
        except Exception as e:
            logger.warning(f"SHAP contributions failed: {e}")
        
        # Get LIME explanation if available
        if LIME_AVAILABLE:
            try:
                explanations['lime_explanation'] = self._get_lime_explanation(X_sample)
            except Exception as e:
                logger.warning(f"LIME explanation failed: {e}")
        
        return explanations
    
    def _get_prediction(self, X_sample):
        """Get model prediction for a sample"""
        try:
            if isinstance(X_sample, pd.Series):
                X = X_sample.to_frame().T
            else:
                X = X_sample
            
            pred = self.model.predict(X)[0]
            
            # Add probability for classification
            if hasattr(self.model, 'predict_proba'):
                proba = self.model.predict_proba(X)[0]
                return {'value': float(pred), 'confidence': float(np.max(proba))}
            return {'value': float(pred)}
        except Exception as e:
            logger.warning(f"Prediction failed: {e}")
            return None
    
    def _extract_shap_contributions(self, shap_row) -> Dict[str, float]:
        """Extract feature contributions from SHAP values"""
        return dict(zip(self.feature_names, shap_row.tolist()))
    
    def _get_lime_explanation(self, X_sample, num_features: int = 10) -> Dict[str, Any]:
        """Get LIME explanation if available"""
        if not LIME_AVAILABLE:
            return {}
        
        try:
            if self.lime_explainer is None:
                mode = 'classification' if self.model_type == 'classification' else 'regression'
                self.lime_explainer = lime.lime_tabular.LimeTabularExplainer(
                    training_data=self.X_data.values,
                    feature_names=self.feature_names,
                    mode=mode,
                    discretize_continuous=True
                )
            
            if isinstance(X_sample, pd.Series):
                X_array = X_sample.values
            else:
                X_array = X_sample[0] if isinstance(X_sample, (list, np.ndarray)) and len(X_sample.shape) > 1 else X_sample
            
            pred_fn = self.model.predict_proba if hasattr(self.model, 'predict_proba') else self.model.predict
            exp = self.lime_explainer.explain_instance(X_array, pred_fn, num_features=num_features)
            
            lime_data = {
                'top_features': exp.as_list(),
                'score': float(exp.score)
            }
            return lime_data
        except Exception as e:
            logger.warning(f"LIME explanation error: {e}")
            return {}
    
    def _create_shap_summary_data(self, X_test, shap_vals) -> Dict[str, Any]:
        """Create SHAP summary data without matplotlib"""
        try:
            if isinstance(shap_vals, list):
                shap_matrix = np.array(shap_vals[0])
            else:
                shap_matrix = shap_vals
            
            # Compute feature importance
            feature_importance = np.abs(shap_matrix).mean(axis=0)
            
            # Sort features
            sorted_idx = np.argsort(feature_importance)[::-1]
            
            return {
                'features': [self.feature_names[i] for i in sorted_idx[:15]],
                'importance': feature_importance[sorted_idx[:15]].tolist(),
                'top_k': 15
            }
        except Exception as e:
            logger.warning(f"SHAP summary creation failed: {e}")
            return {}
    
    @staticmethod
    def _fig_to_base64(fig) -> str:
        """Convert matplotlib figure to base64 string"""
        if not MATPLOTLIB_AVAILABLE or plt is None:
            return ""
        buffer = BytesIO()
        fig.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        buffer.close()
        plt.close(fig)
        return f"data:image/png;base64,{image_base64}"
    

class LIMEExplainer:
    """Optimized LIME explainer for local interpretability"""
    
    def __init__(self, model, X_train: pd.DataFrame, feature_names: List[str], 
                 model_type: str = 'regression', kernel_width: float = 0.75):
        """Initialize LIME explainer"""
        if not LIME_AVAILABLE:
            raise ImportError("LIME not installed. Run: pip install lime")
        
        self.model = model
        self.X_train = X_train
        self.feature_names = feature_names
        self.model_type = model_type
        
        # Create explainer
        self.explainer = lime.lime_tabular.LimeTabularExplainer(
            training_data=X_train.values,
            feature_names=feature_names,
            mode='classification' if model_type == 'classification' else 'regression',
            discretize_continuous=True,
            kernel_width=kernel_width,
            random_state=42
        )
    
    def explain_instance(self, instance: pd.Series, num_features: int = 10) -> Dict[str, Any]:
        """
        Explain individual prediction
        
        Args:
            instance: Single data instance as pandas Series or array
            num_features: Number of top features to show
            
        Returns:
            Explanation with feature importance and prediction
        """
        try:
            if isinstance(instance, pd.Series):
                X_array = instance.values
            else:
                X_array = instance[0] if hasattr(instance, 'shape') and len(instance.shape) > 1 else instance
            
            # Get prediction function
            pred_fn = self.model.predict_proba if hasattr(self.model, 'predict_proba') else self.model.predict
            
            # Generate explanation
            exp = self.explainer.explain_instance(
                data_row=X_array,
                predict_fn=pred_fn,
                num_features=num_features
            )
            
            # Extract explanation data
            feature_importance = exp.as_list()
            prediction = float(self.model.predict(np.array([X_array]))[0])
            
            # Add confidence for classification
            confidence = None
            if hasattr(self.model, 'predict_proba'):
                proba = self.model.predict_proba(np.array([X_array]))[0]
                confidence = float(np.max(proba))
            
            return {
                'feature_importance': feature_importance,
                'prediction': prediction,
                'confidence': confidence,
                'local_features': exp.as_dict()
            }
        except Exception as e:
            logger.warning(f"LIME explanation failed: {e}")
            return {'error': str(e)}


class ExplainabilityFactory:
    """Factory for creating appropriate explainability tools"""
    
    @staticmethod
    def create_xai_explainer(model, X_data: pd.DataFrame, feature_names: List[str],
                            model_type: str = 'regression', **kwargs) -> XAIExplainer:
        """Create XAI explainer"""
        return XAIExplainer(model, X_data, feature_names, model_type, **kwargs)
    
    @staticmethod
    def create_lime_explainer(model, X_train: pd.DataFrame, feature_names: List[str],
                             model_type: str = 'regression', **kwargs) -> Optional[LIMEExplainer]:
        """Create LIME explainer if available"""
        if not LIME_AVAILABLE:
            logger.warning("LIME not available. Install with: pip install lime")
            return None
        try:
            return LIMEExplainer(model, X_train, feature_names, model_type, **kwargs)
        except Exception as e:
            logger.warning(f"Failed to create LIME explainer: {e}")
            return None
    
    @staticmethod
    def get_model_explanations(model, X_data: pd.DataFrame, feature_names: List[str],
                              model_type: str = 'regression', sample_index: int = 0) -> Dict[str, Any]:
        """
        Get comprehensive explanations for a model
        
        Returns:
            Dictionary with global and local explanations
        """
        explainers = {}
        explanations = {}
        
        try:
            # Global explanations
            xai = ExplainabilityFactory.create_xai_explainer(
                model, X_data, feature_names, model_type
            )
            explanations['global'] = xai.generate_global_explanations()
            explainers['xai'] = xai
            
            # Local explanations (for first sample by default)
            if len(X_data) > sample_index:
                sample = X_data.iloc[sample_index]
                explanations['local'] = xai.generate_local_explanations(sample, sample_index)
            
            # LIME explanations if available
            if LIME_AVAILABLE and len(X_data) > sample_index:
                lime_exp = ExplainabilityFactory.create_lime_explainer(
                    model, X_data, feature_names, model_type
                )
                if lime_exp:
                    sample = X_data.iloc[sample_index]
                    explanations['lime'] = lime_exp.explain_instance(sample)
                    explainers['lime'] = lime_exp
            
        except Exception as e:
            logger.error(f"Explanation generation failed: {e}")
            explanations['error'] = str(e)
        
        return explanations


# Backward compatibility
class ClusteringExplainer:
    """Explanations for clustering results"""
    
    def __init__(self, model, X_data, feature_names):
        self.model = model
        self.X_data = X_data
        self.feature_names = feature_names
        self.cluster_labels = None
        
    def compute_cluster_characteristics(self) -> Dict[str, Any]:
        """Compute characteristics for each cluster"""
        if not hasattr(self.model, 'labels_'):
            self.model.fit(self.X_data)
        
        self.cluster_labels = self.model.labels_
        characteristics = {}
        
        n_clusters = len(np.unique(self.cluster_labels))
        
        for cluster_id in range(n_clusters):
            cluster_mask = self.cluster_labels == cluster_id
            cluster_data = self.X_data[cluster_mask]
            
            characteristics[f"Cluster_{cluster_id}"] = {
                "size": int(cluster_mask.sum()),
                "percentage": float(100 * cluster_mask.sum() / len(self.cluster_labels)),
                "mean_features": dict(zip(self.feature_names, cluster_data.mean(axis=0).tolist())),
                "std_features": dict(zip(self.feature_names, cluster_data.std(axis=0).tolist())),
            }
        
        return characteristics
    
    def get_cluster_centers(self) -> Optional[Dict[str, List[float]]]:
        """Get cluster centers if available"""
        if hasattr(self.model, 'cluster_centers_'):
            centers = {}
            for idx, center in enumerate(self.model.cluster_centers_):
                centers[f"Cluster_{idx}"] = center.tolist()
            return centers
        return None
    
    def get_feature_importance_per_cluster(self) -> Dict[str, Dict[str, float]]:
        """Get feature importance per cluster based on variance"""
        if not hasattr(self.model, 'labels_'):
            self.model.fit(self.X_data)
        
        importance_per_cluster = {}
        n_clusters = len(np.unique(self.model.labels_))
        
        for cluster_id in range(n_clusters):
            cluster_mask = self.model.labels_ == cluster_id
            cluster_data = self.X_data[cluster_mask]
            
            # Use variance as importance metric
            variance = cluster_data.var(axis=0)
            importance = variance / (variance.sum() + 1e-8)
            
            importance_per_cluster[f"Cluster_{cluster_id}"] = dict(
                zip(self.feature_names, importance.tolist())
            )
        
        return importance_per_cluster
