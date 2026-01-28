# backend/utils/visualization.py
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import base64
from io import BytesIO
from typing import Dict, List, Any
import json
from sklearn.metrics import r2_score

class VisualizationGenerator:
    def __init__(self):
        plt.style.use('seaborn-v0_8-darkgrid')
        sns.set_palette("husl")
    
    def plot_metrics_comparison(self, evaluation_results: Dict[str, Any]) -> str:
        """Create metrics comparison bar plot"""
        models = list(evaluation_results["models"].keys())
        
        if not models:
            return ""
        
        # Extract metrics
        metrics_data = {}
        for model in models:
            model_metrics = evaluation_results["models"][model].get("metrics", {})
            for metric_name, metric_value in model_metrics.items():
                if metric_name not in metrics_data:
                    metrics_data[metric_name] = []
                metrics_data[metric_name].append(metric_value)
        
        # Create subplots
        n_metrics = len(metrics_data)
        fig, axes = plt.subplots(1, n_metrics, figsize=(5*n_metrics, 6))
        
        if n_metrics == 1:
            axes = [axes]
        
        for idx, (metric_name, metric_values) in enumerate(metrics_data.items()):
            ax = axes[idx]
            
            # Create bar plot
            bars = ax.bar(models, metric_values, color=sns.color_palette("husl", len(models)))
            
            # Add value labels
            for bar, value in zip(bars, metric_values):
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height,
                        f'{value:.3f}', ha='center', va='bottom')
            
            ax.set_title(f'{metric_name.upper()} Comparison')
            ax.set_xlabel('Models')
            ax.set_ylabel(metric_name.upper())
            ax.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        # Convert to base64
        return self._fig_to_base64(fig)
    
    def plot_feature_importance(self, feature_importance: Dict[str, float]) -> str:
        """Create feature importance plot"""
        if not feature_importance:
            return ""
        
        features = list(feature_importance.keys())
        importance = list(feature_importance.values())
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Sort by importance
        sorted_idx = np.argsort(importance)
        features_sorted = [features[i] for i in sorted_idx]
        importance_sorted = [importance[i] for i in sorted_idx]
        
        # Create horizontal bar plot
        bars = ax.barh(features_sorted, importance_sorted)
        
        ax.set_xlabel('Feature Importance')
        ax.set_title('Top Feature Importances')
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def plot_confusion_matrix(self, cm: np.ndarray, class_names: List[str] = None) -> str:
        """Create confusion matrix heatmap"""
        fig, ax = plt.subplots(figsize=(8, 6))
        
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax,
                   xticklabels=class_names if class_names else range(cm.shape[0]),
                   yticklabels=class_names if class_names else range(cm.shape[1]))
        
        ax.set_xlabel('Predicted')
        ax.set_ylabel('True')
        ax.set_title('Confusion Matrix')
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def plot_actual_vs_predicted(self, y_true: np.ndarray, y_pred: np.ndarray) -> str:
        """Create actual vs predicted scatter plot"""
        fig, ax = plt.subplots(figsize=(8, 6))
        
        ax.scatter(y_true, y_pred, alpha=0.5)
        
        # Add perfect prediction line
        min_val = min(y_true.min(), y_pred.min())
        max_val = max(y_true.max(), y_pred.max())
        ax.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2)
        
        ax.set_xlabel('Actual Values')
        ax.set_ylabel('Predicted Values')
        ax.set_title('Actual vs Predicted')
        
        # Add R² score
        r2 = r2_score(y_true, y_pred)
        ax.text(0.05, 0.95, f'R² = {r2:.3f}', transform=ax.transAxes,
               fontsize=12, verticalalignment='top')
        
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def plot_correlation_heatmap(self, df: pd.DataFrame) -> str:
        """Create correlation heatmap"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Calculate correlation matrix
        corr = df.corr()
        
        # Create heatmap
        sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', 
                   center=0, square=True, linewidths=.5, ax=ax)
        
        ax.set_title('Feature Correlation Heatmap')
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def _fig_to_base64(self, fig) -> str:
        """Convert matplotlib figure to base64 string"""
        buf = BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        plt.close(fig)
        buf.seek(0)
        
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        return f"data:image/png;base64,{img_base64}"