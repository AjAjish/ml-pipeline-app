import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Database, 
  Cpu, 
  BarChart3, 
  Target, 
  Settings,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getDatasetInfo, 
  validateDataset, 
  getAlgorithms, 
  trainModels 
} from '../services/api';
import AlgorithmSelector from '../components/AlgorithmSelector';
import TrainingConfig from '../components/TrainingConfig';
import DatasetOverview from '../components/DatasetOverview';
import { cn } from '../lib/utils';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fileId, setFileId] = useState<string | null>(null);
  const [datasetInfo, setDatasetInfo] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [problemType, setProblemType] = useState<'classification' | 'regression'>('classification');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
  const [algorithms, setAlgorithms] = useState<any>({});
  const [isTraining, setIsTraining] = useState(false);
  const [config, setConfig] = useState({
    testSize: 0.2,
    randomState: 42,
    cvFolds: 5,
  });

  useEffect(() => {
    const state = location.state as { fileId?: string; fileInfo?: any };
    if (state?.fileId) {
      setFileId(state.fileId);
      loadDatasetInfo(state.fileId);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  const loadDatasetInfo = async (id: string) => {
    try {
      const info = await getDatasetInfo(id);
      setDatasetInfo(info);
      // Auto-select last column as target (common convention)
      if (info.columns?.length > 0) {
        setSelectedTarget(info.columns[info.columns.length - 1].name);
      }
    } catch (error) {
      toast.error('Failed to load dataset info');
    }
  };

  const handleValidate = async () => {
    if (!selectedTarget) {
      toast.error('Please select a target column');
      return;
    }

    try {
      const result = await validateDataset(fileId!, selectedTarget);
      setValidationResult(result);
      
      if (result.is_valid) {
        toast.success('Dataset validation passed!');
        // Load algorithms for the problem type
        const algoData = await getAlgorithms(problemType);
        setAlgorithms(algoData.algorithms);
      } else {
        toast.error('Dataset validation failed');
      }
    } catch (error) {
      toast.error('Validation failed');
    }
  };

  const handleTrain = async () => {
    if (!selectedTarget) {
      toast.error('Please select a target column');
      return;
    }

    if (selectedAlgorithms.length === 0) {
      toast.error('Please select at least one algorithm');
      return;
    }

    setIsTraining(true);
    const trainingToast = toast.loading('Training models... This may take a few minutes.');
    
    try {
      const trainingData = {
        file_id: fileId!,
        target_column: selectedTarget,
        problem_type: problemType,
        selected_algorithms: selectedAlgorithms,
        test_size: config.testSize,
        random_state: config.randomState,
        cv_folds: config.cvFolds,
      };

      const results = await trainModels(trainingData);
      toast.dismiss(trainingToast);
      toast.success('Training completed successfully!');
      
      // Store session ID in localStorage
      localStorage.setItem('automl_session_id', results.session_id);
      
      navigate(`/results/${results.session_id}`, { 
        state: { results } 
      });
    } catch (error: any) {
      toast.dismiss(trainingToast);
      const errorMessage = error.response?.data?.detail || error.message || 'Training failed. Please try again.';
      toast.error(errorMessage, { duration: 6000 });
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
    }
  };

  if (!datasetInfo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          <p className="mt-4 text-gray-600">Loading dataset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Dataset Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure and train machine learning models
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">
              {datasetInfo.shape?.rows?.toLocaleString()} rows × {datasetInfo.shape?.columns} columns
            </span>
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Dataset Overview Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold">Dataset Overview</h2>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                Ready
              </span>
            </div>
            
            <DatasetOverview 
              datasetInfo={datasetInfo}
              selectedTarget={selectedTarget}
              onTargetChange={setSelectedTarget}
            />
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleValidate}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Validate Dataset</span>
              </button>
            </div>
          </div>

          {/* Problem Type Selection */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Problem Type</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setProblemType('classification')}
                className={cn(
                  "p-6 rounded-xl border-2 transition-all",
                  problemType === 'classification'
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-800 hover:border-purple-500"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${problemType === 'classification' ? 'bg-purple-500' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Classification</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Predict categories</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setProblemType('regression')}
                className={cn(
                  "p-6 rounded-xl border-2 transition-all",
                  problemType === 'regression'
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-800 hover:border-blue-500"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${problemType === 'regression' ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Regression</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Predict continuous values</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">ML Algorithms</h2>
            </div>
            
            <AlgorithmSelector
              algorithms={algorithms}
              selectedAlgorithms={selectedAlgorithms}
              onAlgorithmToggle={(algo) => {
                setSelectedAlgorithms(prev =>
                  prev.includes(algo)
                    ? prev.filter(a => a !== algo)
                    : [...prev, algo]
                );
              }}
              onSelectAll={() => {
                setSelectedAlgorithms(Object.keys(algorithms));
              }}
              onDeselectAll={() => {
                setSelectedAlgorithms([]);
              }}
            />
          </div>
        </motion.div>

        {/* Right Column - Training & Validation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Training Configuration */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Training Config</h2>
            </div>
            
            <TrainingConfig
              config={config}
              onConfigChange={(key, value) => {
                setConfig(prev => ({ ...prev, [key]: value }));
              }}
            />
          </div>

          {/* Validation Results */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Validation</h2>
            </div>
            
            {validationResult ? (
              <div className="space-y-4">
                <div className={cn(
                  "p-4 rounded-lg",
                  validationResult.is_valid
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                )}>
                  <div className="flex items-center space-x-2">
                    {validationResult.is_valid ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <span className="font-medium">
                      {validationResult.is_valid ? 'Dataset is Valid' : 'Dataset Issues Found'}
                    </span>
                  </div>
                </div>
                
                {validationResult.warnings?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Warnings:</h4>
                    <div className="space-y-2">
                      {validationResult.warnings.slice(0, 3).map((warning: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm text-amber-600 dark:text-amber-400">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Run validation to check dataset quality
                </p>
              </div>
            )}
          </div>

          {/* Start Training */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500">
                <PlayCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Start Training</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Selected Algorithms</span>
                <span className="font-semibold">{selectedAlgorithms.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Problem Type</span>
                <span className="font-semibold capitalize">{problemType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Target Column</span>
                <span className="font-semibold">{selectedTarget}</span>
              </div>
              
              <button
                onClick={handleTrain}
                disabled={isTraining || selectedAlgorithms.length === 0 || !validationResult?.is_valid}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold transition-all mt-6",
                  "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
                  "hover:shadow-2xl hover:shadow-blue-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isTraining ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Training Models...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Start Training</span>
                  </div>
                )}
              </button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  Estimated time: ~{Math.ceil(datasetInfo.shape?.rows / 10000)} minutes
                </p>
              </div>
            </div>
          </div>

          {/* XAI Feature */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Explainable AI</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Get SHAP and LIME explanations for model transparency
            </p>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Included with every model</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;