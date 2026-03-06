# ml-pipeline-pipelines

Installable standalone package for the `backend/pipelines` modules in `ml-pipeline-app`.

## Why This Package Exists

Downloaded `.pkl`/`joblib` models include custom classes from `pipelines` (for example, custom preprocessing steps). When you load that model in another project, Python must be able to import those classes.

This package provides those imports in a reusable form.

## Install

### Install from GitHub

```bash
pip install "git+https://github.com/AjAjish/ml-pipeline-app.git@main#subdirectory=backend/pipelines"
```

### Optional extras

```bash
pip install "ml-pipeline-pipelines[xai]"
pip install "ml-pipeline-pipelines[lightgbm]"
```

## Full Guide: Use Downloaded Model in Another Project

### For New Users (Step-by-step)

#### 1. Create a clean environment

```bash
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
```

#### 2. Install required packages

```bash
pip install joblib pandas scikit-learn
pip install "git+https://github.com/AjAjish/ml-pipeline-app.git@main#subdirectory=backend/pipelines"
```

#### 3. Copy your downloaded model file

Place your downloaded model file (example: `demo.pkl`) in your project folder.

Important:
- Use a newly downloaded model generated from the latest backend code.
- Old artifacts may still contain legacy module references.

#### 4. Create a test script (`test_model.py`)

```python
import joblib
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.metrics import accuracy_score, classification_report

# Load exported package
pkg = joblib.load("demo.pkl")
pipeline = pkg["pipeline"]
metadata = pkg.get("metadata", {})
raw_feature_names = pkg.get("raw_feature_names", [])

print("Metadata:", metadata)

# Load sample data (Iris)
iris = load_iris(as_frame=True)
X = iris.data.copy()
y_true = iris.target

# Keep same feature order as training, when available
if raw_feature_names:
	X = X[raw_feature_names]

# Predict
y_pred = pipeline.predict(X)

# Evaluate
acc = accuracy_score(y_true, y_pred)
print(f"Accuracy: {acc:.4f}")
print(classification_report(y_true, y_pred))
```

#### 5. Run it

```bash
python test_model.py
```

If script prints predictions and metrics without import errors, your setup is correct.

### For Experienced Users (Fast path)

#### Setup

```bash
pip install -U joblib pandas scikit-learn "git+https://github.com/AjAjish/ml-pipeline-app.git@main#subdirectory=backend/pipelines"
```

#### Minimal load + predict

```python
import joblib
import pandas as pd

pkg = joblib.load("demo.pkl")
pipe = pkg["pipeline"]

X = pd.DataFrame([
	{"sepal_length": 5.1, "sepal_width": 3.5, "petal_length": 1.4, "petal_width": 0.2}
])

raw_feature_names = pkg.get("raw_feature_names") or X.columns.tolist()
pred = pipe.predict(X[raw_feature_names])
print(pred)
```

## Common Errors and Fixes

### `ModuleNotFoundError: No module named 'pipelines'`

Cause:
- `pipelines` package not installed in the target project environment.

Fix:
- Install this package in the same Python environment used to run your script.

### `ModuleNotFoundError: No module named 'api'`

Cause:
- Usually loading an old `.pkl` exported before serialization fixes.

Fix:
- Retrain/re-export model from latest backend and download again.

### Version mismatch errors

Cause:
- Different `scikit-learn`/`numpy` versions between training and inference.

Fix:
- Align dependency versions with training environment as closely as possible.

## Production Recommendation

For cross-language and long-term portability, prefer ONNX export when possible.

- Joblib/PKL: best for Python-only workflows and fast iteration.
- ONNX: best for deployment portability and fewer Python import dependencies.

## Import examples

```python
from pipelines.ingestion import DataIngestion
from pipelines.validation import DataValidator
from pipelines.transformation import DataTransformer
from pipelines.training import ModelTrainer
from pipelines.evaluation import ModelEvaluator
```
