# ml-pipeline-pipelines

Installable standalone package for the `backend/pipelines` modules in `ml-pipeline-app`.

## Install from GitHub

```bash
pip install "git+https://github.com/AjAjish/ml-pipeline-app.git@main#subdirectory=backend/pipelines"
```

## Optional extras

```bash
pip install "ml-pipeline-pipelines[xai]"
pip install "ml-pipeline-pipelines[lightgbm]"
```

## Import examples

```python
from pipelines.ingestion import DataIngestion
from pipelines.validation import DataValidator
from pipelines.transformation import DataTransformer
from pipelines.training import ModelTrainer
from pipelines.evaluation import ModelEvaluator
```
