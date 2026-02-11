# backend/utils/file_handlers.py
import os
import shutil
import uuid
from fastapi import UploadFile
from typing import Optional
import pandas as pd

async def save_uploaded_file(file: UploadFile, file_id: str, upload_dir: str = "uploads") -> str:
    """Save uploaded file to disk"""
    # Create upload directory if it doesn't exist
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{file_id}{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return file_path

def cleanup_temp_files(directory: str, max_age_hours: int = 24):
    """Cleanup temporary files older than max_age_hours"""
    import time
    current_time = time.time()
    
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        
        if os.path.isfile(file_path):
            file_age = current_time - os.path.getmtime(file_path)
            
            if file_age > max_age_hours * 3600:  # Convert hours to seconds
                os.remove(file_path)

def load_dataset(file_path: str) -> Optional[pd.DataFrame]:
    """Load dataset from file path"""
    try:
        # Detect file extension
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.csv':
            return pd.read_csv(file_path)
        elif file_extension in ['.xls', '.xlsx']:
            return pd.read_excel(file_path)
        elif file_extension == '.json':
            return pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    except Exception as e:
        raise Exception(f"Error loading dataset: {str(e)}")
    
def clear_upload_directory_files(upload_dir: str = "uploads/"):
    """Clear all files in the upload directory"""
    if os.path.exists(upload_dir):
        for filename in os.listdir(upload_dir):
            file_path = os.path.join(upload_dir, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)