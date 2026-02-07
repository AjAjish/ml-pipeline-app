# backend/pipelines/explainability.py
import shap
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import base64
from io import BytesIO
from typing import Dict, List, Any, Optional
import lime
import lime.lime_tabular
from sklearn.preprocessing import StandardScaler
from pipelines.registry import ProblemType

class XAIExplainer:
    """Main XAI explanation engine"""
    
    def __init__(self, model, preprocessor, feature_names):
        self.model = model
        self.preprocessor = preprocessor
        self.feature_names = feature_names
        self.explainer = None
        self.shap_values = None
        
    def compute_shap_values(self, X_train, X_test):
        """Compute SHAP values for model explanation"""
        try:
            # Initialize SHAP explainer based on model type
            if hasattr(self.model, 'predict_proba'):
                # For tree-based models
                self.explainer = shap.TreeExplainer(self.model)
                self.shap_values = self.explainer.shap_values(X_test)
            else:
                # For linear models and others
                background = shap.sample(X_train, 100)  # Use sample for background
                self.explainer = shap.KernelExplainer(self.model.predict, background)
                self.shap_values = self.explainer.shap_values(X_test)
            
            return True
        except Exception as e:
            print(f"SHAP computation failed: {e}")
            # Fallback to permutation importance
            return False
    
    def generate_global_explanations(self, X_test) -> Dict[str, Any]:
        """Generate global feature importance explanations"""
        explanations = {}
        
        # 1. SHAP Summary Plot
        explanations['summary_plot'] = self._create_summary_plot(X_test)
        
        # 2. Feature Importance Bar Plot
        explanations['feature_importance'] = self._create_feature_importance_plot()
        
        # 3. Dependence Plots (top 3 features)
        explanations['dependence_plots'] = self._create_dependence_plots(X_test)
        
        return explanations
    
    def generate_local_explanations(self, X_sample, sample_index: int) -> Dict[str, Any]:
        """Generate explanations for individual predictions"""
        explanations = {}
        
        # 1. SHAP Force Plot
        explanations['force_plot'] = self._create_force_plot(X_sample, sample_index)
        
        # 2. SHAP Waterfall Plot
        explanations['waterfall_plot'] = self._create_waterfall_plot(X_sample, sample_index)
        
        # 3. Decision Plot
        explanations['decision_plot'] = self._create_decision_plot(X_sample, sample_index)
        
        # 4. Feature Contribution Table
        explanations['feature_contributions'] = self._get_feature_contributions(X_sample, sample_index)
        
        return explanations
    
    def _create_summary_plot(self, X_test) -> str:
        """Create SHAP summary plot"""
        plt.figure(figsize=(10, 6))
        shap.summary_plot(self.shap_values, X_test, feature_names=self.feature_names, show=False)
        plt.tight_layout()
        return self._fig_to_base64(plt)
    
    def _create_feature_importance_plot(self) -> str:
        """Create feature importance bar plot"""
        shap_values_mean = np.abs(self.shap_values).mean(0)
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': shap_values_mean
        }).sort_values('importance', ascending=False)
        
        plt.figure(figsize=(10, 6))
        plt.barh(feature_importance['feature'][:15], feature_importance['importance'][:15])
        plt.xlabel('Mean |SHAP value|')
        plt.title('Feature Importance (SHAP)')
        plt.gca().invert_yaxis()
        plt.tight_layout()
        return self._fig_to_base64(plt)
    

class LIMEExplainer:
    """LIME explanations for individual predictions"""
    
    def __init__(self, model, X_train, feature_names, class_names=None):
        self.model = model
        self.X_train = X_train
        self.feature_names = feature_names
        self.class_names = class_names
        self.explainer = lime.lime_tabular.LimeTabularExplainer(
            training_data=X_train.values,
            feature_names=feature_names,
            class_names=class_names,
            mode='classification' if class_names else 'regression',
            discretize_continuous=True
        )
    
    def explain_instance(self, instance, num_features=10):
        """Explain individual prediction"""
        exp = self.explainer.explain_instance(
            data_row=instance.values[0],
            predict_fn=self.model.predict_proba if hasattr(self.model, 'predict_proba') else self.model.predict,
            num_features=num_features
        )
        
        # Generate visualization
        fig = exp.as_pyplot_figure()
        plt.tight_layout()
        plot_base64 = self._fig_to_base64(fig)
        plt.close()
        
        # Generate explanation text
        explanation_text = self._generate_explanation_text(exp)
        
        # Feature importance list
        feature_importance = [(self.feature_names[i], weight) 
                              for i, weight in exp.as_list()]
        
        return {
            'plot': plot_base64,
            'explanation': explanation_text,
            'feature_importance': feature_importance,
            'prediction': float(self.model.predict(instance)[0])
        }


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
