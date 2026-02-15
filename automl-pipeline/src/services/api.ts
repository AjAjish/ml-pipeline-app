import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Show loading indicator for non-GET requests (skip training requests)
    const isTrainingEndpoint = config.url?.includes('/api/train');
    if (config.method !== 'get' && !isTrainingEndpoint) {
      const loadingId = toast.loading('Processing...');
      (config as any).loadingId = loadingId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Dismiss loading toast if exists
    const loadingId = (response.config as any).loadingId;
    if (loadingId) {
      toast.dismiss(loadingId);
    }
    
    return response.data;
  },
  (error) => {
    // Dismiss loading toast if exists
    const loadingId = (error.config as any)?.loadingId;
    if (loadingId) {
      toast.dismiss(loadingId);
    }
    
    // Handle errors
    const message = error.response?.data?.detail || 
                    error.response?.data?.message || 
                    error.message || 
                    'An error occurred';
    
    // Don't show automatic toast for 401 errors or training endpoint (handled manually)
    const isTrainingEndpoint = error.config?.url?.includes('/api/train');
    if (error.response?.status !== 401 && !isTrainingEndpoint) {
      toast.error(message, {
        duration: 5000,
      });
    }
    
    return Promise.reject(error);
  }
);

// API Endpoints
export const uploadDataset = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      // You can dispatch this to a state manager if needed
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });
  
  return response.data;
};

export const getDatasetInfo = async (fileId: string): Promise<any> => {
  return api.get(`/api/columns/${fileId}`);
};

export const getDatasetPreview = async (fileId: string, rows: number = 100): Promise<any> => {
  return api.get(`/api/dataset/${fileId}/preview`, {
    params: { rows },
  });
};

export const getAllDatasets = async (): Promise<any> => {
  return api.get('/api/datasets');
};

export const validateDataset = async (fileId: string, targetColumn?: string): Promise<any> => {
  return api.post(`/api/validate/${fileId}`, null, {
    params: targetColumn ? { target_column: targetColumn } : {},
  });
};

export const getAlgorithms = async (problemType: 'classification' | 'regression' | 'clustering'): Promise<any> => {
  return api.get(`/api/algorithms/${problemType}`);
};

export const trainModels = async (trainingData: {
  file_id: string;
  target_column?: string;
  problem_type: 'classification' | 'regression' | 'clustering';
  selected_algorithms: string[];
  test_size?: number;
  random_state?: number;
  cv_folds?: number;
}): Promise<any> => {
  // Returns immediately with session_id
  return api.post('/api/train', trainingData, {
    timeout: 5000,  // Short timeout since it returns immediately
  });
};

export const getTrainingProgress = async (sessionId: string): Promise<any> => {
  return api.get(`/api/training-progress/${sessionId}`);
};

export const getTrainingResults = async (sessionId: string): Promise<any> => {
  return api.get(`/api/training-results/${sessionId}`);
};

export const getVisualizations = async (sessionId: string, plotType = 'all'): Promise<any> => {
  return api.get(`/api/visualizations/${sessionId}`, {
    params: { plot_type: plotType },
  });
};

export const downloadModel = async (sessionId: string, modelName: string): Promise<void> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/download-model`,
    {
      session_id: sessionId,
      model_name: modelName,
    },
    {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${modelName}.pkl`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  toast.success(`Model ${modelName} downloaded successfully`);
};

export const getSessionResults = async (sessionId: string): Promise<any> => {
  return api.get(`/api/session/${sessionId}`);
};

export const predictModel = async (payload: {
  session_id: string;
  model_name?: string;
  inputs: Record<string, any>;
}): Promise<any> => {
  return api.post('/api/predict', payload);
};

export const getXAIExplanations = async (
  sessionId: string, 
  modelName: string, 
  explanationType: 'global' | 'local' = 'global',
  instanceIndex?: number
): Promise<any> => {
  return api.post(`/api/xai/explain/${sessionId}/${modelName}`, {
    explanation_type: explanationType,
    instance_index: instanceIndex,
  });
};

export const getTrainingHistory = async (): Promise<any> => {
  return api.get('/api/training-history');
};

export const deleteSession = async (sessionId: string): Promise<any> => {
  return api.delete(`/api/session/${sessionId}`);
};

export const healthCheck = async (): Promise<any> => {
  return api.get('/health');
};

// Mock data for development
export const mockAlgorithms = {
  classification: {
    'LogisticRegression': {
      model: 'LogisticRegression',
      description: 'Logistic regression classifier',
      parameters: { C: 1.0 }
    },
    'RandomForestClassifier': {
      model: 'RandomForestClassifier',
      description: 'Random forest classifier',
      parameters: { n_estimators: 50, max_depth: 10 }
    },
    'GradientBoostingClassifier': {
      model: 'GradientBoostingClassifier',
      description: 'Gradient boosting classifier',
      parameters: { n_estimators: 100, learning_rate: 0.1 }
    },
    'SVC': {
      model: 'SVC',
      description: 'Support Vector Classifier',
      parameters: { C: 1.0 }
    },
    'KNeighborsClassifier': {
      model: 'KNeighborsClassifier',
      description: 'K-nearest neighbors classifier',
      parameters: { n_neighbors: 5 }
    },
    'DecisionTreeClassifier': {
      model: 'DecisionTreeClassifier',
      description: 'Decision tree classifier',
      parameters: { max_depth: 5 }
    },
  },
  regression: {
    'LinearRegression': {
      model: 'LinearRegression',
      description: 'Ordinary least squares linear regression',
      parameters: {}
    },
    'RandomForestRegressor': {
      model: 'RandomForestRegressor',
      description: 'Random forest regressor',
      parameters: { n_estimators: 100, max_depth: 10 }
    },
    'GradientBoostingRegressor': {
      model: 'GradientBoostingRegressor',
      description: 'Gradient boosting regressor',
      parameters: { n_estimators: 100, learning_rate: 0.1 }
    },
    'Ridge': {
      model: 'Ridge',
      description: 'Linear regression with L2 regularization',
      parameters: { alpha: 1.0 }
    },
    'Lasso': {
      model: 'Lasso',
      description: 'Linear regression with L1 regularization',
      parameters: { alpha: 1.0 }
    },
    'DecisionTreeRegressor': {
      model: 'DecisionTreeRegressor',
      description: 'Decision tree regressor',
      parameters: { max_depth: 5 }
    },
  }
};

export const mockDatasetInfo = {
  file_id: 'mock-file-123',
  columns: [
    { name: 'feature1', dtype: 'float64', unique_count: 100, missing_count: 0, example_value: 5.1 },
    { name: 'feature2', dtype: 'float64', unique_count: 85, missing_count: 2, example_value: 3.5 },
    { name: 'feature3', dtype: 'object', unique_count: 10, missing_count: 0, example_value: 'category_a' },
    { name: 'target', dtype: 'int64', unique_count: 2, missing_count: 0, example_value: 1 },
  ],
  shape: { rows: 1000, columns: 4 },
  memory_usage: '156.8 KB',
  dtypes_summary: { 'float64': 2, 'object': 1, 'int64': 1 }
};

export default api;