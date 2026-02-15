# backend/api/endpoints.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from typing import List, Dict, Any, Optional
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
from pipelines.registry import AlgorithmRegistry, ProblemType as PipelineProblemType
from utils.file_handlers import save_uploaded_file
from utils.model_export import build_inference_pipeline, build_initial_types, build_metadata, export_onnx_model
from skl2onnx.common.data_types import FloatTensorType
from core.config import settings

router = APIRouter()

# Custom JSON encoder to handle numpy types
class NumpyEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles numpy types"""
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        if pd.isna(obj):
            return None
        return super().default(obj)

# In-memory storage (use database in production)
datasets = {}
training_sessions = {}
training_progress = {}  # Track training progress for each session
training_events = {}  # Event log for each session

def _serialize_example(value: Any) -> Any:
    if value is None or pd.isna(value):
        return None
    if isinstance(value, (np.generic,)):
        return value.item()
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    return value

def _convert_numpy_types(obj: Any) -> Any:
    """Recursively convert numpy types to native Python types"""
    # Handle None first (before pd.isna to avoid issues)
    if obj is None:
        return None
    
    # Handle numpy arrays (before pd.isna to avoid ambiguous truth value error)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    
    # Handle numpy scalar types
    if isinstance(obj, np.generic):
        return obj.item()
    
    # Check for NaN in scalar types only (wrapped in try-except for safety)
    try:
        if pd.isna(obj):
            return None
    except (ValueError, TypeError):
        # pd.isna() can fail on some types, just continue
        pass
    
    # Handle pandas Timestamp
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    
    # Handle dictionaries
    if isinstance(obj, dict):
        return {key: _convert_numpy_types(value) for key, value in obj.items()}
    
    # Handle lists and tuples
    if isinstance(obj, (list, tuple)):
        converted = [_convert_numpy_types(item) for item in obj]
        return converted if isinstance(obj, list) else tuple(converted)
    
    # Return as-is for other types
    return obj

def _build_input_schema(df: pd.DataFrame, target_column: Optional[str]) -> List[Dict[str, Any]]:
    schema = []
    for column in df.columns:
        if target_column and column == target_column:
            continue
        series = df[column].dropna()
        example = _serialize_example(series.iloc[0]) if not series.empty else None
        schema.append({
            "name": column,
            "dtype": str(df[column].dtype),
            "example": example
        })
    return schema

def _run_training_background(session_id: str, request: TrainingRequest, df: pd.DataFrame):
    """Run model training in background and track progress"""
    training_progress[session_id] = {
        "status": "training",
        "completed_models": [],
        "total_models": len(request.selected_algorithms),
        "current_model": None
    }
    training_events[session_id] = []
    
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
        
        # Model training with progress callback
        def on_model_complete(model_name: str):
            """Callback when a model training completes"""
            training_progress[session_id]["completed_models"].append(model_name)
            training_progress[session_id]["current_model"] = model_name
            training_events[session_id].append({
                "event": "model_completed",
                "model_name": model_name,
                "timestamp": datetime.now().isoformat()
            })
            print(f"[Session {session_id[:8]}] Model {model_name} completed")
        
        trainer = ModelTrainer(
            problem_type=request.problem_type,
            selected_algorithms=request.selected_algorithms,
            test_size=request.test_size,
            random_state=request.random_state,
            cv_folds=request.cv_folds,
            progress_callback=on_model_complete
        )
        
        # Train models (pass None for y_train in clustering)
        if request.problem_type == "clustering":
            trained_models = trainer.train_models(X_train, None)
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
        input_schema = _build_input_schema(df, request.target_column)

        training_sessions[session_id] = {
            "request": request.dict(),
            "results": evaluation_results,
            "models": trained_models,
            "transformer": transformer,
            "feature_names": X_train.columns.tolist(),
            "raw_feature_names": transformer.get_feature_names(),
            "input_schema": input_schema,
            "timestamp": datetime.now().isoformat()
        }
        
        # Mark training as completed
        training_progress[session_id]["status"] = "completed"
        training_events[session_id].append({
            "event": "training_completed",
            "timestamp": datetime.now().isoformat()
        })
        print(f"[Session {session_id[:8]}] Training completed successfully")
        
    except Exception as e:
        training_progress[session_id]["status"] = "failed"
        training_progress[session_id]["error"] = str(e)
        training_events[session_id].append({
            "event": "training_failed",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        })
        print(f"[Session {session_id[:8]}] Training failed: {str(e)}")

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

    cleaning_plan = validation_results.get("report", {}).get("cleaning_plan", {})
    if bool(cleaning_plan.get("changes_required")):
        cleaning_result = validator.apply_cleaning()
        datasets[file_id]["dataframe"] = cleaning_result["cleaned_df"]
        validation_results["report"]["cleaning_plan"]["changes_done"] = True
        validation_results["report"]["cleaning_plan"]["applied"] = cleaning_result["summary"]

    ingestor = DataIngestion(datasets[file_id]["file_path"])
    ingestor.df = datasets[file_id]["dataframe"]
    problem_type = ingestor.dedect_problem_type(target_column)

    registry = AlgorithmRegistry()
    suggested_algorithms = registry.get_algorithm_list(PipelineProblemType(problem_type))
    
    return {
        "file_id": file_id,
        "is_valid": validation_results["is_valid"],
        "validation_report": validation_results["report"],
        "warnings": validation_results["warnings"],
        "problem_type": problem_type,
        "suggested_algorithms": suggested_algorithms
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

@router.post("/train")
async def train_models(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train ML models - returns immediately, training runs in background"""
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
    
    # Add training task to background
    background_tasks.add_task(_run_training_background, session_id, request, df)
    
    # Return immediately with session ID
    return {
        "session_id": session_id,
        "status": "training_started",
        "total_models": len(request.selected_algorithms),
        "message": "Training started in background. Poll /api/training-progress/{session_id} for updates."
    }

@router.get("/training-progress/{session_id}")
async def get_training_progress(session_id: str):
    """Get training progress for a session"""
    if session_id not in training_progress:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return training_progress[session_id]

@router.get("/training-results/{session_id}")
async def get_training_results(session_id: str):
    """Get training results once completed"""
    if session_id not in training_progress:
        raise HTTPException(status_code=404, detail="Session not found")
    
    progress = training_progress[session_id]
    
    # Check if training is still in progress
    if progress.get("status") == "training":
        raise HTTPException(status_code=202, detail="Training still in progress")
    
    # Check if training failed
    if progress.get("status") == "failed":
        raise HTTPException(status_code=500, detail=f"Training failed: {progress.get('error', 'Unknown error')}")
    
    # Get the session results
    if session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Results not found")
    
    session = training_sessions[session_id]
    evaluation_results = session["results"]
    
    # Prepare response
    models_metrics = []
    for model_name, metrics in evaluation_results["models"].items():
        if model_name != "best_model":
            models_metrics.append({
                "model_name": model_name,
                "training_time": metrics.get("training_time", 0),
                "metrics": metrics.get("metrics", {}),
                "cv_scores": metrics.get("cv_scores"),
                "cv_mean": metrics.get("cv_mean"),
                "cv_std": metrics.get("cv_std")
            })
    
    # Get feature importance
    feature_importance = None
    best_model = session["models"].get(evaluation_results["best_model"])
    if not session["request"].get("problem_type") == "clustering" and best_model and hasattr(best_model, 'feature_importances_'):
        importance_dict = dict(zip(
            session["feature_names"],
            best_model.feature_importances_
        ))
        feature_importance = dict(sorted(
            importance_dict.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10])
    
    # Build response data
    response_data = {
        "session_id": session_id,
        "problem_type": session["request"].get("problem_type"),
        "target_column": session["request"].get("target_column", "N/A (Clustering)"),
        "models": models_metrics,
        "best_model": evaluation_results["best_model"],
        "feature_importance": feature_importance,
        "input_schema": session["input_schema"],
        "timestamp": session["timestamp"]
    }
    # Properly encode with custom encoder
    return json.loads(json.dumps(response_data, cls=NumpyEncoder))

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
    
    os.makedirs(settings.MODEL_DIR, exist_ok=True)

    model = session["models"][request.model_name]
    transformer = session["transformer"]
    format_choice = (request.format or "onnx").lower()

    def _build_joblib_response():
        model_path = os.path.join(
            settings.MODEL_DIR,
            f"{request.session_id}_{request.model_name}.pkl"
        )

        pipeline = build_inference_pipeline(transformer, model)
        model_package = {
            "pipeline": pipeline,
            "label_encoder": transformer.label_encoder,
            "raw_feature_names": session.get("raw_feature_names", []),
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
            filename=f"{request.model_name}.pkl"
        )

    if format_choice == "joblib":
        return _build_joblib_response()

    if format_choice != "onnx":
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'onnx' or 'joblib'.")

    try:
        pipeline = build_inference_pipeline(transformer, model)
        input_schema = session.get("input_schema", [])
        initial_types = build_initial_types(input_schema)

        if not initial_types:
            raw_feature_names = session.get("raw_feature_names", [])
            initial_types = [(name, FloatTensorType([None, 1])) for name in raw_feature_names]

        label_mapping = None
        if session["request"]["problem_type"] == "classification" and transformer.label_encoder is not None:
            label_mapping = transformer.label_encoder.classes_.tolist()

        metadata = build_metadata(
            session,
            request.model_name,
            request.session_id,
            label_mapping=label_mapping
        )
        onnx_path = os.path.join(
            settings.MODEL_DIR,
            f"{request.session_id}_{request.model_name}.onnx"
        )

        export_onnx_model(pipeline, initial_types, metadata, onnx_path)

        response = FileResponse(
            onnx_path,
            media_type="application/octet-stream",
            filename=f"{request.model_name}.onnx"
        )
        response.headers["X-Model-Format"] = "onnx"
        return response
    except Exception as e:
        if not request.allow_fallback:
            raise HTTPException(status_code=500, detail=f"ONNX export failed: {str(e)}")

        response = _build_joblib_response()
        response.headers["X-Model-Format"] = "joblib"
        response.headers["X-Model-Warning"] = (
            "ONNX export failed; returning joblib artifact that requires the same Python modules."
        )
        return response

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
    
    if not session.get("input_schema"):
        file_id = session["request"].get("file_id")
        target_column = session["request"].get("target_column")
        if file_id in datasets:
            df = datasets[file_id]["dataframe"]
            session["input_schema"] = _build_input_schema(df, target_column)

    # Return only serializable data (exclude models and transformer objects)
    return {
        "session_id": session_id,
        "problem_type": session["request"].get("problem_type"),
        "target_column": session["request"].get("target_column"),
        "models": models_array,
        "best_model": results.get("best_model"),
        "feature_names": session["feature_names"],
        "input_schema": session.get("input_schema", []),
        "timestamp": session["timestamp"]
    }

@router.post("/predict")
async def predict_model(request: PredictRequest):
    """Generate a prediction using a trained model"""
    if request.session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = training_sessions[request.session_id]
    model_name = request.model_name or session["results"].get("best_model")

    if not model_name or model_name not in session["models"]:
        raise HTTPException(status_code=404, detail="Model not found")

    raw_feature_names = session.get("raw_feature_names") or []
    if not raw_feature_names:
        raise HTTPException(status_code=400, detail="Input schema not available")

    row = {}
    missing_inputs = []
    for name in raw_feature_names:
        if name in request.inputs:
            row[name] = request.inputs[name]
        else:
            row[name] = None
            missing_inputs.append(name)

    input_df = pd.DataFrame([row])
    transformer = session["transformer"]
    X_transformed = transformer.transform_new_data(input_df)

    model = session["models"][model_name]
    problem_type = session["request"].get("problem_type")

    if problem_type == "clustering" and not hasattr(model, "predict"):
        raise HTTPException(status_code=400, detail="Selected model does not support prediction")

    prediction = model.predict(X_transformed)
    if hasattr(prediction, "tolist"):
        prediction_list = prediction.tolist()
    else:
        prediction_list = list(prediction)

    prediction_value = prediction_list[0] if prediction_list else None

    if problem_type == "classification" and transformer.label_encoder is not None:
        try:
            prediction_value = transformer.label_encoder.inverse_transform([prediction_value])[0]
        except Exception:
            pass

    probabilities = None
    if problem_type == "classification" and hasattr(model, "predict_proba"):
        proba = model.predict_proba(X_transformed)
        class_labels = getattr(model, "classes_", [])
        if transformer.label_encoder is not None and len(class_labels) > 0:
            try:
                class_labels = transformer.label_encoder.inverse_transform(class_labels)
            except Exception:
                class_labels = [str(label) for label in class_labels]
        else:
            class_labels = [str(label) for label in class_labels]

        probabilities = {
            str(label): float(score)
            for label, score in zip(class_labels, proba[0])
        }

    return {
        "model_name": model_name,
        "prediction": _serialize_example(prediction_value),
        "probabilities": probabilities,
        "missing_inputs": missing_inputs
    }