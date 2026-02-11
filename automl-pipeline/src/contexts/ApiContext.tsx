import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/api';

interface ApiState {
  isLoading: boolean;
  error: string | null;
  trainingProgress: number;
  activeSessions: string[];
}

interface ApiContextType extends ApiState {
  uploadDataset: (file: File) => Promise<any>;
  getDatasetInfo: (fileId: string) => Promise<any>;
  validateDataset: (fileId: string, targetColumn?: string) => Promise<any>;
  getAlgorithms: (problemType: 'classification' | 'regression' | 'clustering') => Promise<any>;
  trainModels: (trainingData: any) => Promise<any>;
  getSessionResults: (sessionId: string) => Promise<any>;
  downloadModel: (sessionId: string, modelName: string) => Promise<void>;
  clearError: () => void;
  clearTrainingProgress: () => void;
  deleteSession: (sessionId: string) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [state, setState] = useState<ApiState>({
    isLoading: false,
    error: null,
    trainingProgress: 0,
    activeSessions: [],
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setTrainingProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, trainingProgress: progress }));
  }, []);

  const addSession = useCallback((sessionId: string) => {
    setState(prev => ({
      ...prev,
      activeSessions: [...prev.activeSessions, sessionId]
    }));
  }, []);

  const removeSession = useCallback((sessionId: string) => {
    setState(prev => ({
      ...prev,
      activeSessions: prev.activeSessions.filter(id => id !== sessionId)
    }));
  }, []);

  const uploadDataset = useCallback(async (file: File): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.uploadDataset(file);
      toast.success('Dataset uploaded successfully!');
      return result;
    } catch (error: any) {
      const message = error.message || 'Failed to upload dataset';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getDatasetInfo = useCallback(async (fileId: string): Promise<any> => {
    setLoading(true);
    try {
      const result = await api.getDatasetInfo(fileId);
      return result;
    } catch (error: any) {
      const message = error.message || 'Failed to get dataset info';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const validateDataset = useCallback(async (fileId: string, targetColumn?: string): Promise<any> => {
    setLoading(true);
    try {
      const result = await api.validateDataset(fileId, targetColumn);
      if (result.is_valid) {
        toast.success('Dataset validation passed!');
      } else {
        toast.error('Dataset validation failed');
      }
      return result;
    } catch (error: any) {
      const message = error.message || 'Failed to validate dataset';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getAlgorithms = useCallback(async (problemType: 'classification' | 'regression' | 'clustering'): Promise<any> => {
    setLoading(true);
    try {
      // For development, return mock data if API fails
      try {
        const result = await api.getAlgorithms(problemType);
        return result;
      } catch {
        return {
          problem_type: problemType,
          algorithms: api.mockAlgorithms[problemType],
          count: Object.keys(api.mockAlgorithms[problemType]).length
        };
      }
    } catch (error: any) {
      const message = error.message || 'Failed to get algorithms';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const trainModels = useCallback(async (trainingData: any): Promise<any> => {
    setLoading(true);
    setTrainingProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 500);

    try {
      const result = await api.trainModels(trainingData);
      clearInterval(progressInterval);
      setTrainingProgress(100);
      
      addSession(result.session_id);
      toast.success('Training completed successfully!');
      
      return result;
    } catch (error: any) {
      clearInterval(progressInterval);
      const message = error.message || 'Failed to train models';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
      setTimeout(() => setTrainingProgress(0), 1000);
    }
  }, [setLoading, setError, setTrainingProgress, addSession]);

  const getSessionResults = useCallback(async (sessionId: string): Promise<any> => {
    setLoading(true);
    try {
      const result = await api.getSessionResults(sessionId);
      return result;
    } catch (error: any) {
      const message = error.message || 'Failed to get session results';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const downloadModel = useCallback(async (sessionId: string, modelName: string): Promise<void> => {
    try {
      await api.downloadModel(sessionId, modelName);
    } catch (error: any) {
      const message = error.message || 'Failed to download model';
      setError(message);
      throw error;
    }
  }, [setError]);

  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await api.deleteSession(sessionId);
      removeSession(sessionId);
      toast.success('Session deleted successfully');
    } catch (error: any) {
      const message = error.message || 'Failed to delete session';
      setError(message);
      throw error;
    }
  }, [removeSession, setError]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const clearTrainingProgress = useCallback(() => {
    setTrainingProgress(0);
  }, [setTrainingProgress]);

  const contextValue: ApiContextType = {
    ...state,
    uploadDataset,
    getDatasetInfo,
    validateDataset,
    getAlgorithms,
    trainModels,
    getSessionResults,
    downloadModel,
    clearError,
    clearTrainingProgress,
    deleteSession,
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};