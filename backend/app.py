# backend/app.py
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import json
import uuid
import joblib
from datetime import datetime
import shutil

from api.endpoints import router as api_router
from core.config import settings
from pipelines.ingestion import DataIngestion
from pipelines.validation import DataValidator
from pipelines.transformation import DataTransformer
from pipelines.training import ModelTrainer
from pipelines.evaluation import ModelEvaluator
from pipelines.registry import AlgorithmRegistry
from utils.file_handlers import save_uploaded_file, cleanup_temp_files

app = FastAPI(
    title="AutoML Pipeline API",
    description="Generic ML Pipeline for Regression & Classification",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routes
app.include_router(api_router, prefix="/api")

# Global state (in production, use Redis or database)
active_sessions = {}

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    if not os.path.exists(settings.UPLOAD_DIR):
        os.makedirs(settings.UPLOAD_DIR)
    if not os.path.exists(settings.MODEL_DIR):
        os.makedirs(settings.MODEL_DIR)

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    cleanup_temp_files(settings.UPLOAD_DIR)

@app.get("/")
async def root():
    return {"message": "AutoML Pipeline API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }