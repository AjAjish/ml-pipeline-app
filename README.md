# 🚀 AutoML Pro - Intelligent Machine Learning Pipeline

<a id="top"></a>

<div align="center">

![AutoML Pro](https://img.shields.io/badge/AutoML-Pro-blue?style=for-the-badge&logo=python)
![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)

**Automated Machine Learning Made Simple & Powerful**

Transform your data into actionable insights with our cutting-edge AutoML platform.

[Getting Started](#installation) • [Features](#key-features) • [Architecture](#system-architecture) • [Workflow](#workflow-guide)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start (5 Minutes)](#quick-start)
- [How to Understand Results](#understand-results)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [New Developer Guide](#new-developer-guide)
- [Installation & Setup](#installation)
- [Workflow Guide](#workflow-guide)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Configuration](#configuration)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

<a id="overview"></a>
## 🎯 Overview

**AutoML Pro** is a comprehensive, web-based machine learning platform that automates the entire ML pipeline from data upload to model evaluation. Designed for both beginners and advanced practitioners, it eliminates the complexity of machine learning while providing powerful insights through interactive visualizations and explainable AI.

### What Makes AutoML Pro Special?

✨ **No Coding Required** - Upload CSV → Select Target → Get Results  
⚡ **Lightning Fast** - Train multiple algorithms simultaneously  
📊 **Rich Visualizations** - 12+ interactive charts and metrics  
🔍 **Explainable AI** - Understand why models make predictions  
📥 **Model Export** - Download trained models for production use  
🎨 **Modern UI** - Beautiful, responsive design with dark mode  

[⬆ Back to Table of Contents](#top)

---

<a id="quick-start"></a>
## ⚡ Quick Start (5 Minutes)

If you are new to AutoML Pro, follow this exact path:

1. **Run backend** → `cd backend` then `python app.py`
2. **Run frontend** → `cd automl-pipeline` then `npm run dev`
3. Open **http://localhost:5173**
4. Upload a CSV file on **Home**
5. Choose a target column on **Dashboard**
6. Select 2-3 algorithms first (faster feedback)
7. Click **Start Training**
8. Review best model + metrics in **Results**

💡 **Beginner tip:** Start with smaller datasets (or fewer algorithms), confirm pipeline works, then scale up.

[⬆ Back to Table of Contents](#top)

---

<a id="understand-results"></a>
## 🧠 How to Understand Results

Use this cheat sheet to decide which model is actually better:

### For Classification
- **Accuracy**: Overall correctness
- **Precision**: Among predicted positives, how many are truly positive
- **Recall**: Among true positives, how many were found
- **F1 Score**: Balance between precision and recall

### For Regression
- **R² Score**: Higher is better (closer to 1)
- **RMSE**: Lower is better (penalizes larger errors)
- **MAE**: Lower is better (average absolute error)

### Practical Decision Rule
- If classes are imbalanced, prioritize **F1/Recall** over plain accuracy.
- For business forecasting, prioritize **MAE/RMSE** based on tolerance to large errors.
- Prefer models with stable **cross-validation mean** and low **cv_std**.

[⬆ Back to Table of Contents](#top)

---

<a id="key-features"></a>
## ✨ Key Features

### 1. **Dataset Management**
- ✅ CSV file upload with drag-and-drop support
- ✅ Automatic data validation and cleaning
- ✅ Dataset preview with row/column information
- ✅ Column statistics and data type detection
- ✅ Missing value detection and handling

### 2. **Smart Training Configuration**
- ✅ **Multi-Algorithm Support** (12+ ML algorithms)
  - **Classification**: Logistic Regression, Random Forest, SVM, XGBoost, Gradient Boosting, etc.
  - **Regression**: Linear Regression, Ridge, Lasso, Random Forest, XGBoost, etc.
- ✅ Automatic problem type detection (Classification/Regression)
- ✅ Configurable hyperparameters
- ✅ Cross-validation support (3-5 folds)
- ✅ Train/test split customization
- ✅ Real-time training progress tracking

### 3. **Comprehensive Results Analysis**
- ✅ **Performance Metrics**
  - Accuracy, Precision, Recall, F1 Score (Classification)
  - R² Score, RMSE, MAE (Regression)
  - Cross-validation statistics
- ✅ **Multi-Tab Interface**
  - Overview: Model cards with expandable details
  - Detailed Metrics: Comparison table with all metrics
  - Visualizations: 6+ interactive charts
  - Explainability: AI interpretability features
- ✅ **Model Comparison** - Compare selected models side-by-side
- ✅ **Best Model Highlighting** - Automatically identifies top performer

### 4. **Advanced Visualizations**
- 📊 Bar Charts - Performance comparison
- 📈 Line Charts - Trend analysis
- 🔄 ComposedCharts - Multi-metric analysis
- 🎡 Radar Charts - Model strengths visualization
- 🥧 Pie Charts - Performance distribution
- 📊 Cross-Validation - CV score analysis

### 5. **Explainable AI (XAI)**
- 🔍 SHAP Analysis - Global and local explanations
- 🎯 LIME Explanations - Instance-level interpretability
- 📊 Feature Importance - Identify key drivers
- 📋 Top Features List - Most influential features

### 6. **Session Management**
- 💾 Persistent session storage
- 📥 Model download functionality
- 🗑️ Session deletion with confirmation
- ✅ Workflow completion with Done button
- 🔄 Complete data clearing on workflow reset

### 7. **User Experience**
- 🎨 **Dark Mode Support** - Eye-friendly interface
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Real-time Loading States** - Smooth animations
- 🔔 **Toast Notifications** - User feedback
- 🧭 **Smart Navigation** - Context-aware Results link

---

## 🏗️ System Architecture

<a id="system-architecture"></a>

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + TypeScript)          │
├─────────────────────────────────────────────────────────────┤
│  Pages: Home | Dataset | Dashboard | Results                │
│  Components: Layout | AlgorithmSelector | TrainingConfig    │
│  Services: API client with Axios interceptors               │
│  State: React Hooks + LocalStorage                          │
└─────────────────────────────────────────────────────────────┘
                           ↕↕↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI + Python)               │
├─────────────────────────────────────────────────────────────┤
│  Pipelines:                                                  │
│  ├── Data Ingestion (CSV loading, parsing)                  │
│  ├── Data Validation (Schema, missing values)               │
│  ├── Data Transformation (Encoding, scaling)                │
│  ├── Model Training (Multi-algorithm)                       │
│  ├── Model Evaluation (Metrics calculation)                 │
│  ├── Model Explainability (SHAP, LIME)                      │
│  └── Model Registry (Version control)                       │
│                                                              │
│  Database: In-memory storage with file persistence          │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

<a id="technology-stack"></a>

### Frontend
```
Technology          Version    Purpose
────────────────────────────────────────────────────
React              18.x        UI Framework
TypeScript         5.x         Type Safety
Vite               5.x         Build Tool
React Router       6.x         Navigation
TailwindCSS        3.x         Styling
Framer Motion      10.x        Animations
Recharts           2.x         Charts & Graphs
Lucide Icons       Latest      Icons
React Hot Toast    2.x         Notifications
Axios              1.x         HTTP Client
```

### Backend
```
Technology          Version    Purpose
────────────────────────────────────────────────────
FastAPI            0.100+      Web Framework
Python             3.8+        Programming Language
Pandas             1.x         Data Processing
Scikit-learn       1.x         ML Algorithms
XGBoost            1.x         Boosting
SHAP               Latest      Explainability
LIME               Latest      Interpretability
Joblib             1.x         Model Serialization
NumPy              Latest      Numerical Computing
```

---

## 📁 Project Structure

<a id="project-structure"></a>

```
ml-pipeline-app/
├── README.md                          # This file
├── LICENSE
├── requirements.txt                   # Python dependencies
│
├── backend/                           # FastAPI Backend
│   ├── app.py                        # Main application entry
│   ├── api/
│   │   ├── endpoints.py             # API routes
│   │   ├── schemas.py               # Pydantic models
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py                # Configuration
│   │   ├── exceptions.py            # Custom exceptions
│   │   └── __init__.py
│   ├── models/
│   │   ├── ml_models.py             # ML model definitions
│   │   └── __init__.py
│   ├── pipelines/
│   │   ├── ingestion.py             # Data ingestion
│   │   ├── validation.py            # Data validation
│   │   ├── transformation.py        # Data preprocessing
│   │   ├── training.py              # Model training
│   │   ├── evaluation.py            # Model evaluation
│   │   ├── explainability.py        # XAI features
│   │   ├── registry.py              # Model registry
│   │   └── __init__.py
│   ├── utils/
│   │   ├── file_handlers.py         # File operations
│   │   ├── visualization.py         # Plotting utilities
│   │   └── __init__.py
│   ├── uploads/                     # Uploaded CSV files
│   ├── static/                      # Static files
│   └── __pycache__/
│
└── automl-pipeline/                 # React Frontend
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── eslint.config.js
    │
    ├── src/
    │   ├── main.tsx                 # App entry point
    │   ├── App.tsx                  # Main app component
    │   ├── App.css
    │   ├── index.css
    │   │
    │   ├── pages/
    │   │   ├── Home.tsx             # Landing & upload page
    │   │   ├── DataSet.tsx          # Dataset preview
    │   │   ├── Dashboard.tsx        # Training config
    │   │   ├── Results.tsx          # Results & analysis
    │   │   └── NotFound.tsx         # 404 page
    │   │
    │   ├── components/
    │   │   ├── Layout.tsx           # Main layout
    │   │   ├── ThemeToggle.tsx      # Dark mode
    │   │   ├── theme-provider.tsx   # Theme context
    │   │   ├── AlgorithmSelector.tsx # Algorithm selection
    │   │   ├── TrainingConfig.tsx   # Config panel
    │   │   ├── DatasetOverview.tsx  # Dataset info
    │   │   └── theme-provider.tsx
    │   │
    │   ├── contexts/
    │   │   └── ApiContext.tsx       # API context provider
    │   │
    │   ├── services/
    │   │   └── api.ts              # API client
    │   │
    │   ├── lib/
    │   │   └── utils.ts            # Utility functions
    │   │
    │   └── assets/
    │
    └── public/

```

---

<a id="new-developer-guide"></a>
## 🧭 New Developer Guide

This section helps new contributors understand how the project works end-to-end and where to make changes safely.

### 1) Mental Model: How Data Moves Through the App

1. User uploads CSV in frontend (**Home** page)
2. Frontend calls backend `POST /api/upload`
3. Backend stores file in `backend/uploads/` and returns `file_id`
4. Frontend saves `file_id` in localStorage (`automl_file_id`)
5. Dashboard fetches dataset info + algorithms
6. User submits training config to `POST /api/train`
7. Backend pipeline runs ingestion → validation → transformation → training → evaluation → explainability
8. Backend returns `session_id` + results summary
9. Frontend saves `session_id` (`automl_session_id`) and renders Results page
10. User can download model or delete session

### 2) Request Lifecycle (Frontend → Backend)

- UI action starts in `automl-pipeline/src/pages/*.tsx`
- API call is centralized in `automl-pipeline/src/services/api.ts`
- FastAPI route is handled in `backend/api/endpoints.py`
- Request/response contracts are defined in `backend/api/schemas.py`
- Core ML logic is delegated to modules in `backend/pipelines/`
- Output is sent back as JSON and rendered in corresponding frontend page/components

### 3) Backend Pipeline Responsibilities

- `ingestion.py`: Reads and prepares raw CSV data
- `validation.py`: Checks schema, target validity, missing/invalid patterns
- `transformation.py`: Encodes/scales features
- `training.py`: Trains selected algorithms
- `evaluation.py`: Computes metrics and rankings
- `explainability.py`: SHAP/LIME + feature importance
- `registry.py`: Stores session/model artifacts and metadata

### 4) Frontend Page Responsibilities

- `Home.tsx`: Upload + initial dataset intake
- `DataSet.tsx`: Preview table and column visibility
- `Dashboard.tsx`: Target + algorithm + hyperparameter setup
- `Results.tsx`: Model comparison, metrics, visualizations, export
- `Layout.tsx`: Global navigation and smart routing behavior

### 5) Where to Add New Features

- **New API endpoint**: add route in `backend/api/endpoints.py`, schema in `backend/api/schemas.py`, then API client method in `automl-pipeline/src/services/api.ts`
- **New ML algorithm**: register model in `backend/models/ml_models.py`, connect training/evaluation paths in pipeline modules
- **New chart/result widget**: add UI block in `automl-pipeline/src/pages/Results.tsx` or reusable component in `automl-pipeline/src/components/`
- **New config option**: wire field in `Dashboard.tsx` + `TrainingConfig.tsx`, then include in train payload and backend schema

### 6) Local Development Workflow (Recommended)

1. Run backend first and verify `/api/health`
2. Run frontend and verify upload screen appears
3. Test with a small CSV (fast feedback)
4. Train with 1-2 algorithms first
5. Confirm results tabs render without console/API errors
6. Expand to full algorithm set after basic flow passes

### 7) Common Debug Path (Fastest Way)

- If upload fails: check backend logs and CSV format/encoding
- If dashboard is empty: verify `automl_file_id` exists in localStorage
- If training fails: inspect `/api/train` payload (target column, problem type, selected algorithms)
- If results page is blank: verify `automl_session_id` and `/api/results/{session_id}` response
- If download fails: test `/api/download-model/{session_id}/{model_name}` directly

### 8) Data Contracts New Devs Should Know

- Upload response returns `file_id`, `rows`, `columns`
- Train request needs: `file_id`, `target_column`, `problem_type`, `selected_algorithms`, `test_size`, `random_state`, `cv_folds`
- Results response includes `best_model`, per-model metrics, and feature metadata

### 9) New Contributor Checklist (Before PR)

- Keep API schema changes backward-compatible when possible
- Update README/API docs when changing request or response shape
- Validate both classification and regression flows if affected
- Confirm Done/Delete workflow still clears session state correctly
- Test dark/light mode readability for new UI elements

### 10) Safe First Tasks for New Contributors

- Improve error messages in upload/train/result states
- Add loading skeletons or clearer empty states
- Add metric tooltips explaining model quality signals
- Add frontend validation to prevent avoidable backend errors
- Improve dataset preview usability for wide tables

[⬆ Back to Table of Contents](#top)

---

<a id="installation"></a>
## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
# 1. Navigate to project root
cd ml-pipeline-app

# 2. Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Start FastAPI server
cd backend
python app.py

# Server runs on: http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd automl-pipeline

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# Server runs on: http://localhost:5173
```

### Access the Application

- **Web App**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/api/health

---

<a id="workflow-guide"></a>
## 🔄 Workflow Guide

### Step 1: Upload Dataset

```
Home Page
├── Drag & Drop CSV file
├── System validates file
├── File stored in backend
├── FileID generated
└── Navigate to Dataset page
```

**What Happens:**
- CSV file is parsed using Pandas
- Data types are automatically detected
- Missing values are identified
- File ID is saved to localStorage
- Data preview is generated

### Step 2: View Dataset

```
Dataset Page
├── Display uploaded data
├── Show column information
├── Show row count
├── Display data sample
└── Navigation buttons (Upload/Dashboard)
```

**Available Actions:**
- View first N rows of data
- Check column names and types
- See dataset statistics
- Go back to upload or proceed to training

### Step 3: Configure Training

```
Dashboard Page
├── Select target column
├── Choose problem type
├── Select algorithms
├── Set hyperparameters
└── Start training
```

**Configuration Options:**
- **Target Column**: The column to predict
- **Problem Type**: Classification or Regression
- **Algorithms**: Select 1 or more from available options
- **Test Size**: Train/test split ratio (0.1-0.5)
- **CV Folds**: Cross-validation folds (3-5)
- **Random State**: Reproducibility seed

### Step 4: Monitor Training

```
While Training
├── Real-time progress bar
├── Model training status
├── Estimated time remaining
└── Auto-timeout prevention (10 minutes)
```

**Features:**
- Live progress updates
- Model selection progress
- Error handling with detailed messages
- Automatic timeout management

### Step 5: Analyze Results

```
Results Page
├── Best model banner
├── Navigation tabs
│   ├── Overview
│   │   ├── Model cards
│   │   ├── Expandable details
│   │   ├── Training summary
│   │   └── Quick stats
│   ├── Detailed Metrics
│   │   ├── Comparison table
│   │   ├── Model comparison charts
│   │   └── Detailed statistics
│   ├── Visualizations
│   │   ├── 6+ interactive charts
│   │   ├── Performance plots
│   │   ├── Distribution graphs
│   │   └── Radar charts
│   └── Explainability
│       ├── SHAP features
│       ├── LIME explanations
│       └── Feature importance
└── Action buttons (Done/Delete)
```

### Step 6: Complete Workflow

```
Done Button Click
├── Clear localStorage data
├── Remove all session info
├── Navigate to Home
└── Ready for new dataset
```

**Data Cleared:**
- automl_file_id
- automl_session_id
- Session results
- Training history

---

<a id="api-endpoints"></a>
## 🔌 API Endpoints

### Dataset Management

```http
POST /api/upload
Content-Type: multipart/form-data
Body: file (CSV)
Response: { file_id, filename, size, rows, columns }
```

```http
GET /api/dataset/{file_id}/preview?limit=100
Response: { file_id, columns, data, total_rows, preview_rows }
```

```http
GET /api/datasets
Response: { datasets: [{ file_id, filename, upload_time, size }] }
```

### Dataset Info & Validation

```http
POST /api/dataset-info
Body: { file_id }
Response: { columns: [{ name, type, missing }], rows, features }
```

```http
POST /api/validate-dataset
Body: { file_id, target_column }
Response: { valid, message, columns_info }
```

### Model Training

```http
GET /api/algorithms
Response: { classification: [...], regression: [...] }
```

```http
POST /api/train
Body: {
  file_id,
  target_column,
  problem_type,
  selected_algorithms,
  test_size,
  random_state,
  cv_folds
}
Timeout: 600 seconds (10 minutes)
Response: { session_id, best_model, models, metrics }
```

### Results Management

```http
GET /api/results/{session_id}
Response: {
  session_id,
  best_model,
  models: [{ model_name, metrics, training_time, cv_mean, cv_std }],
  target_column,
  problem_type,
  feature_names
}
```

```http
GET /api/download-model/{session_id}/{model_name}
Response: Binary model file (joblib)
```

```http
DELETE /api/delete-session/{session_id}
Response: { message: "Session deleted" }
```

---

<a id="frontend-components"></a>
## 🎨 Frontend Components

### Pages

#### **Home.tsx**
- Hero section with feature highlights
- CSV upload area (drag & drop)
- Upload progress indicator
- Sample dataset carousel
- Feature showcase

#### **DataSet.tsx**
- Responsive data table
- Column headers with sticky position
- Row numbers
- Horizontal scrolling
- Empty state handling
- Navigation buttons

#### **Dashboard.tsx**
- Dataset overview card
- Target column selector
- Problem type toggle (Classification/Regression)
- Algorithm selector with descriptions
- Training configuration panel
- Validation before training
- Training progress display

#### **Results.tsx**
- Best model banner with trophy icon
- Four-tab interface:
  - **Overview**: Model cards with metrics
  - **Metrics**: Comparison table
  - **Visualizations**: Interactive charts
  - **XAI**: Explainability features
- Model comparison mode
- Download functionality
- Session management

### Components

#### **Layout.tsx**
- Fixed header with branding
- Navigation bar with Results link
- Mobile sidebar
- Theme toggle
- User profile placeholder
- Main outlet for page content

#### **AlgorithmSelector.tsx**
- Checkbox list of algorithms
- Problem type filtering
- Algorithm descriptions
- Selection indicators

#### **TrainingConfig.tsx**
- Slider controls for parameters
- Test size configuration
- CV folds selection
- Random state input

#### **DatasetOverview.tsx**
- Column statistics
- Data type information
- Missing value indicators
- Row/column counts

---

<a id="configuration"></a>
## ⚙️ Configuration

### Environment Variables

```bash
# Backend (.env)
PYTHON_ENV=development
API_HOST=0.0.0.0
API_PORT=8000
UPLOAD_FOLDER=./backend/uploads
MODEL_FOLDER=./backend/models
CORS_ORIGINS=["http://localhost:5173"]
```

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=AutoML Pro
VITE_API_TIMEOUT=600000
```

### Training Parameters

```python
# Default configuration
DEFAULT_TEST_SIZE = 0.2           # 20% test set
DEFAULT_CV_FOLDS = 5               # 5-fold CV
DEFAULT_RANDOM_STATE = 42          # Reproducibility
MAX_TRAINING_TIME = 600            # 10 minutes
```

### Supported Algorithms

**Classification:**
- Logistic Regression
- Random Forest Classifier
- Support Vector Machine (SVM)
- XGBoost Classifier
- Gradient Boosting Classifier
- K-Nearest Neighbors
- Naive Bayes
- Decision Tree Classifier

**Regression:**
- Linear Regression
- Ridge Regression
- Lasso Regression
- Random Forest Regressor
- XGBoost Regressor
- Gradient Boosting Regressor
- Support Vector Regression

---

<a id="advanced-features"></a>
## 🔥 Advanced Features

### Smart Navigation with Results Link

```typescript
// Navbar Results button routing logic
- No data → Home page (Upload prompt)
- Data uploaded → Dashboard (Train prompt)
- Model trained → Results page (Show results)
```

### LocalStorage State Management

```typescript
// Persistent user session
localStorage:
  - automl_file_id: Currently uploaded file ID
  - automl_session_id: Latest training session ID
```

### Real-time Updates

```typescript
// Storage event listening
window.addEventListener('storage', () => {
  // Auto-refresh components on localStorage change
})
```

### Error Handling

```typescript
// Comprehensive error management
- Network errors with retry logic
- API validation errors with user messages
- Training timeout with graceful fallback
- File upload validation
- Missing data handling
```

---

## 📊 Supported File Formats

- **CSV** (.csv) - Primary format
- **Delimiter Detection** - Auto-detects comma, semicolon, tab
- **Encoding** - UTF-8, UTF-16, Latin-1
- **Max Size** - 100MB (configurable)

---

## 🎯 Use Cases

### 1. Classification Problems
- Customer churn prediction
- Email spam detection
- Disease diagnosis
- Sentiment analysis
- Image classification

### 2. Regression Problems
- House price prediction
- Stock price forecasting
- Demand forecasting
- Temperature prediction
- Salary estimation

### 3. Business Applications
- Marketing analytics
- Risk assessment
- Quality control
- Customer segmentation
- Anomaly detection

---

## 🔍 Performance Optimization

### Frontend
- Code splitting with Vite
- Lazy loading of routes
- Memoized components with React.memo
- Optimized re-renders
- Efficient state management

### Backend
- Batch processing for multiple algorithms
- Caching of dataset previews
- Model serialization with joblib
- Async request handling
- Database connection pooling

### Data Processing
- Pandas vectorized operations
- NumPy acceleration
- Efficient memory usage
- Streaming for large files

---

<a id="troubleshooting"></a>
## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Backend (FastAPI)
lsof -i :8000          # Find process
kill -9 <PID>          # Kill process
# Or use different port: python app.py --port 8001

# Frontend (Vite)
npm run dev -- --port 5174
```

#### 2. CORS Errors
```bash
# Update CORS_ORIGINS in backend .env
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

#### 3. Training Timeout
```bash
# Training takes too long?
# Reduce number of algorithms
# Use smaller dataset (first N rows)
# Increase timeout in api.ts (trainModels function)
```

#### 4. Dataset Upload Fails
```bash
# Check file format (must be CSV)
# Check file size (max 100MB)
# Check encoding (UTF-8 recommended)
# Check for special characters in filename
```

#### 5. Models Not Downloading
```bash
# Clear browser cache
# Check firewall/antivirus
# Verify backend is running
# Check available disk space
```

---

## 📈 Monitoring & Logging

### Backend Logs
```bash
# Structured logging with timestamps
# INFO: API calls and data processing
# WARNING: Data validation issues
# ERROR: Training failures
# DEBUG: Detailed operation info
```

### Frontend Monitoring
```typescript
// Console logging for development
// Toast notifications for user feedback
// Error boundaries for crash prevention
// Performance metrics in dev tools
```

---

## 🔐 Security Considerations

- ✅ Input validation on all API endpoints
- ✅ File type verification
- ✅ SQL injection prevention (ORM usage)
- ✅ CORS configuration
- ✅ Secure file upload handling
- ✅ Session isolation
- ⚠️ Note: Add authentication for production use

---

## 🚀 Deployment

### Development
```bash
# Terminal 1: Backend
cd backend && python app.py

# Terminal 2: Frontend
cd automl-pipeline && npm run dev
```

### Production
```bash
# Backend
pip install gunicorn
gunicorn app:app --workers 4 --bind 0.0.0.0:8000

# Frontend
npm run build
# Serve dist/ folder with Nginx/Apache
```

---

## 📚 Documentation

- **API Swagger Docs**: http://localhost:8000/docs
- **API ReDoc Docs**: http://localhost:8000/redoc
- **Code Comments**: Inline documentation throughout
- **Type Hints**: Full TypeScript and Python type hints

---

<a id="contributing"></a>
## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<a id="license"></a>
## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Ajish** - ML Pipeline Developer

---

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Frontend powered by [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- ML powered by [Scikit-learn](https://scikit-learn.org/) & [XGBoost](https://xgboost.readthedocs.io/)
- UI Components from [Lucide Icons](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Styling with [TailwindCSS](https://tailwindcss.com/)

---

## 📞 Support

For issues, questions, or suggestions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review API documentation at `/docs`
3. Check console logs for detailed error messages
4. Open an issue on GitHub

---

<div align="center">

**Made with ❤️ for Machine Learning Enthusiasts**

⭐ If you find this helpful, please consider giving it a star!

</div>
