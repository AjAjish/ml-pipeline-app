import json
from typing import Any, Dict, List, Optional, Tuple

from sklearn.pipeline import Pipeline

from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType, StringTensorType
import onnx
from onnx import helper

from pipelines.transformation import DataTransformer


def build_inference_pipeline(transformer: DataTransformer, model: Any) -> Pipeline:
    return Pipeline([
        ("preprocessor", transformer.prepeocessor),
        ("model", model)
    ])


def _dtype_to_onnx_type(dtype: str):
    dtype_lower = dtype.lower()
    if any(token in dtype_lower for token in ["object", "category", "string"]):
        return StringTensorType([None, 1])
    return FloatTensorType([None, 1])


def build_initial_types(input_schema: List[Dict[str, Any]]) -> List[Tuple[str, Any]]:
    initial_types: List[Tuple[str, Any]] = []
    for column in input_schema:
        name = str(column.get("name"))
        dtype = str(column.get("dtype", ""))
        if name:
            initial_types.append((name, _dtype_to_onnx_type(dtype)))
    return initial_types


def build_metadata(
    session: Dict[str, Any],
    model_name: str,
    session_id: str,
    label_mapping: Optional[List[Any]] = None
) -> Dict[str, str]:
    metadata = {
        "session_id": str(session_id),
        "model_name": model_name,
        "problem_type": str(session.get("request", {}).get("problem_type", "")),
        "target_column": str(session.get("request", {}).get("target_column", "")),
        "training_date": str(session.get("timestamp", "")),
        "input_schema": json.dumps(session.get("input_schema", [])),
        "raw_feature_names": json.dumps(session.get("raw_feature_names", []))
    }
    if label_mapping is not None:
        metadata["label_mapping"] = json.dumps(label_mapping)
    return metadata


def export_onnx_model(
    pipeline: Pipeline,
    initial_types: List[Tuple[str, Any]],
    metadata: Dict[str, str],
    output_path: str
) -> None:
    onnx_model = convert_sklearn(pipeline, initial_types=initial_types)

    if metadata:
        existing_keys = {prop.key for prop in onnx_model.metadata_props}
        for key, value in metadata.items():
            if key in existing_keys:
                continue
            onnx_model.metadata_props.append(
                helper.StringStringEntryProto(key=key, value=str(value))
            )

    onnx.save_model(onnx_model, output_path)
