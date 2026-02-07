# backend/api/endpoints.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from typing import List, Dict, Any
import pandas as pd
import numpy as np
import json
import uuid
import joblib
from datetime import datetime
import os

from api.schemas import *
from pipelines.ingestion import DataIngestion
from pipelines.validation import DataValidator
from pipelines.transformation import DataTransformer
from pipelines.training import ModelTrainer
from pipelines.evaluation import ModelEvaluator
from pipelines.registry import AlgorithmRegistry
from utils.file_handlers import save_uploaded_file
from core.config import settings

router = APIRouter()

# In-memory storage (use database in production)
datasets = {}
training_sessions = {}

@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """Upload CSV dataset"""
    try:
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Save uploaded file
        file_path = await save_uploaded_file(file, file_id)
        
        # Ingest data
        ingestor = DataIngestion(file_path)
        df = ingestor.load_data()
        
        # Store dataset info
        datasets[file_id] = {
            "file_path": file_path,
            "dataframe": df,
            "upload_time": datetime.now().isoformat()
        }
        
        return UploadResponse(
            filename=file.filename,
            file_id=file_id,
            rows=df.shape[0],
            columns=df.shape[1],
            message="Dataset uploaded successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/columns/{file_id}", response_model=DatasetInfo)
async def get_columns(file_id: str):
    """Get dataset columns and info"""
    if file_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = datasets[file_id]["dataframe"]
    ingestor = DataIngestion(datasets[file_id]["file_path"])
    dataset_info = ingestor.get_data_info(df, file_id=file_id)
    
    return dataset_info

@router.get("/dataset/{file_id}/preview")
async def get_dataset_preview(file_id: str, rows: int = 100):
    """Get dataset preview with specified number of rows"""
    if file_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = datasets[file_id]["dataframe"]
    
    # Limit rows to prevent large responses
    max_rows = min(rows, 1000)
    preview_df = df.head(max_rows)
    
    # Convert to JSON-serializable format
    data = preview_df.to_dict(orient='records')
    columns = list(df.columns)
    
    return {
        "file_id": file_id,
        "columns": columns,
        "data": data,
        "total_rows": len(df),
        "preview_rows": len(preview_df)
    }

@router.get("/datasets")
async def get_all_datasets():
    """Get list of all uploaded datasets"""
    dataset_list = []
    for file_id, info in datasets.items():
        df = info["dataframe"]
        dataset_list.append({
            "file_id": file_id,
            "rows": df.shape[0],
            "columns": df.shape[1],
            "upload_time": info["upload_time"]
        })
    
    return {"datasets": dataset_list}

@router.post("/validate/{file_id}")
async def validate_dataset(file_id: str, target_column: Optional[str] = None):
    """Validate dataset"""
    if file_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = datasets[file_id]["dataframe"]
    validator = DataValidator(df)
    
    validation_results = validator.validate_all(target_column)
    
    return {
        "file_id": file_id,
        "is_valid": validation_results["is_valid"],
        "validation_report": validation_results["report"],
        "warnings": validation_results["warnings"]
    }

@router.get("/algorithms/{problem_type}")
async def get_algorithms(problem_type: ProblemType):
    """Get available algorithms for problem type"""
    registry = AlgorithmRegistry()
    algorithms = registry.get_algorithms(problem_type)
    
    # Extract only serializable information
    serializable_algorithms = {}
    for name, info in algorithms.items():
        serializable_algorithms[name] = {
            "description": info["description"],
            "parameters": info["parameters"]
        }
    
    return {
        "problem_type": problem_type,
        "algorithms": serializable_algorithms,
        "count": len(serializable_algorithms)
    }

@router.post("/train", response_model=EvaluationResults)
async def train_models(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train ML models"""
    if request.file_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Get dataset
    df = datasets[request.file_id]["dataframe"]
    
    # Validate target column for supervised learning
    if request.problem_type != "clustering" and request.target_column not in df.columns:
        raise HTTPException(
            status_code=400, 
            detail=f"Target column '{request.target_column}' not found in dataset"
        )
    
    # Generate session ID
    session_id = str(uuid.uuid4())
    
    try:
        # Data transformation
        transformer = DataTransformer(
            target_column=request.target_column,
            problem_type=request.problem_type
        )
        
        transform_result = transformer.transform(df)
        
        # Handle both clustering (returns 4 Nones) and supervised learning (returns train/test splits)
        if len(transform_result) == 4:
            X_train, X_test, y_train, y_test = transform_result
        else:
            X_train, _, _, _ = transform_result
            X_test = None
            y_train = None
            y_test = None
        
        # Model training
        trainer = ModelTrainer(
            problem_type=request.problem_type,
            selected_algorithms=request.selected_algorithms,
            test_size=request.test_size,
            random_state=request.random_state,
            cv_folds=request.cv_folds
        )
        
        # Train models (pass None for y_train in clustering)
        if request.problem_type == "clustering":
            trained_models = trainer.train_models(X_train, None)
            # For clustering, use full data for evaluation
            X_eval = X_train
            y_eval = None
        else:
            trained_models = trainer.train_models(X_train, y_train)
            X_eval = X_test
            y_eval = y_test
        
        training_history = trainer.get_training_history()
        
        # Evaluate models
        evaluator = ModelEvaluator(
            problem_type=request.problem_type,
            models=trained_models,
            training_history=training_history
        )
        
        evaluation_results = evaluator.evaluate_all(X_eval, y_eval)
        
        # Get feature importance for best model (only for tree-based supervised models)
        feature_importance = None
        best_model = trained_models.get(evaluation_results["best_model"])
        if request.problem_type != "clustering" and best_model and hasattr(best_model, 'feature_importances_'):
            importance_dict = dict(zip(
                X_train.columns,
                best_model.feature_importances_
            ))
            feature_importance = dict(sorted(
                importance_dict.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:10])  # Top 10 features
        
        # Store session
        training_sessions[session_id] = {
            "request": request.dict(),
            "results": evaluation_results,
            "models": trained_models,
            "transformer": transformer,
            "feature_names": X_train.columns.tolist(),
            "timestamp": datetime.now().isoformat()
        }
        
        # Prepare response
        models_metrics = []
        for model_name, metrics in evaluation_results["models"].items():
            if model_name != "best_model":
                models_metrics.append(ModelMetrics(
                    model_name=model_name,
                    training_time=metrics.get("training_time", 0),
                    metrics=metrics.get("metrics", {}),
                    cv_scores=metrics.get("cv_scores"),
                    cv_mean=metrics.get("cv_mean"),
                    cv_std=metrics.get("cv_std")
                ))
        
        return EvaluationResults(
            session_id=session_id,
            problem_type=request.problem_type,
            target_column=request.target_column or "N/A (Clustering)",
            models=models_metrics,
            best_model=evaluation_results["best_model"],
            feature_importance=feature_importance,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        print(f"Error during training: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/visualizations/{session_id}")
async def get_visualizations(session_id: str, plot_type: str = "all"):
    """Generate visualizations for training session"""
    if session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = training_sessions[session_id]
    results = session["results"]
    
    from utils.visualization import VisualizationGenerator
    
    viz_gen = VisualizationGenerator()
    plots = {}
    
    if plot_type in ["metrics", "all"]:
        plots["metrics_comparison"] = viz_gen.plot_metrics_comparison(results)
    
    if plot_type in ["importance", "all"] and session.get("feature_importance"):
        plots["feature_importance"] = viz_gen.plot_feature_importance(
            session["feature_importance"]
        )
    
    return plots

@router.post("/download-model")
async def download_model(request: DownloadRequest):
    """Download trained model"""
    if request.session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = training_sessions[request.session_id]
    
    if request.model_name not in session["models"]:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Save model to file
    model_path = os.path.join(
        settings.MODEL_DIR, 
        f"{request.session_id}_{request.model_name}.joblib"
    )
    
    # Save model with pipeline
    model_package = {
        "model": session["models"][request.model_name],
        "transformer": session["transformer"],
        "feature_names": session["feature_names"],
        "metadata": {
            "session_id": request.session_id,
            "model_name": request.model_name,
            "problem_type": session["request"]["problem_type"],
            "target_column": session["request"]["target_column"],
            "training_date": session["timestamp"]
        }
    }
    
    joblib.dump(model_package, model_path)
    
    return FileResponse(
        model_path,
        media_type="application/octet-stream",
        filename=f"{request.model_name}.joblib"
    )

@router.get("/session/{session_id}")
async def get_session_results(session_id: str):
    """Get results for a training session"""
    if session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = training_sessions[session_id]
    results = session["results"]
    
    # Transform models dict to array format for frontend
    models_array = []
    for model_name, model_data in results.get("models", {}).items():
        models_array.append({
            "model_name": model_name,
            "metrics": model_data.get("metrics", {}),
            "training_time": model_data.get("training_time", 0),
            "cv_mean": model_data.get("cv_mean"),
            "cv_std": model_data.get("cv_std")
        })
    
    # Return only serializable data (exclude models and transformer objects)
    return {
        "session_id": session_id,
        "problem_type": session["request"].get("problem_type"),
        "target_column": session["request"].get("target_column"),
        "models": models_array,
        "best_model": results.get("best_model"),
        "feature_names": session["feature_names"],
        "timestamp": session["timestamp"]
    }