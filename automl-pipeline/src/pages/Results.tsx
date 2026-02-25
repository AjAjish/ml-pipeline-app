import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  BarChart3, 
  Download, 
  Share2, 
  Eye, 
  Brain,
  TrendingUp,
  Clock,
  Cpu,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Target,
  X,
  Activity,
  CheckCircle
} from 'lucide-react';
import { useApi } from '../contexts/ApiContext';
import toast from 'react-hot-toast';
import { cn, formatNumber, formatPercentage, formatDuration, formatRegressionMetric } from '../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const Results = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    getSessionResults,
    downloadModel,
    deleteSession,
    predictModel,
    getExplainability,
    getFeatureImportance,
    isLoading
  } = useApi();
  
  const [results, setResults] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'visualizations' | 'xai' | 'preview'>('overview');
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  const [isComparing, setIsComparing] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [previewInputs, setPreviewInputs] = useState<Record<string, any>>({});
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [xaiData, setXaiData] = useState<any>(null);
  const [xaiImportance, setXaiImportance] = useState<any>(null);
  const [xaiLoading, setXaiLoading] = useState(false);
  const [xaiError, setXaiError] = useState<string | null>(null);
  const [xaiSampleIndex, setXaiSampleIndex] = useState(0);
  const [importanceMethod, setImportanceMethod] = useState<'ensemble' | 'shap' | 'model' | 'permutation'>('ensemble');

  useEffect(() => {
    if (sessionId) {
      loadResults();
    }
  }, [sessionId]);

  useEffect(() => {
    if (!results?.input_schema) {
      return;
    }
    const nextInputs: Record<string, any> = {};
    results.input_schema.forEach((column: any) => {
      nextInputs[column.name] = column.example ?? '';
    });
    setPreviewInputs(nextInputs);
  }, [results]);

  useEffect(() => {
    if (activeTab !== 'xai' || !sessionId) {
      return;
    }
    if (!xaiData || !xaiImportance) {
      loadXai();
    }
  }, [activeTab, sessionId]);

  useEffect(() => {
    if (activeTab !== 'xai' || !sessionId) {
      return;
    }
    if (xaiData || xaiImportance) {
      loadXai(xaiSampleIndex, importanceMethod);
    }
  }, [importanceMethod]);

  const loadResults = async () => {
    try {
      const data = await getSessionResults(sessionId!);
      setResults(data);
      if (data.best_model) {
        setSelectedModel(data.best_model);
      }
    } catch (error) {
      toast.error('Failed to load results');
      navigate('/');
    }
  };

  const handleDownload = async (modelName: string) => {
    try {
      await downloadModel(sessionId!, modelName);
    } catch (error) {
      toast.error('Failed to download model');
    }
  };

  const handleDeleteSession = async () => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(sessionId!);
        navigate('/');
      } catch (error) {
        toast.error('Failed to delete session');
      }
    }
  };

  const handleRunPreview = async () => {
    if (!sessionId) {
      return;
    }

    const schema = results?.input_schema || [];
    const inputs: Record<string, any> = {};

    schema.forEach((column: any) => {
      const rawValue = previewInputs[column.name];
      if (rawValue === '' || rawValue === undefined) {
        inputs[column.name] = null;
        return;
      }

      const dtype = String(column.dtype || '').toLowerCase();
      if (dtype.includes('int') || dtype.includes('float') || dtype.includes('double')) {
        const numericValue = Number(rawValue);
        inputs[column.name] = Number.isNaN(numericValue) ? null : numericValue;
      } else {
        inputs[column.name] = rawValue;
      }
    });

    setIsPreviewing(true);
    try {
      const response = await predictModel({
        session_id: sessionId,
        model_name: selectedModel || results?.best_model,
        inputs,
      });
      setPreviewResult(response);
    } catch (error) {
      toast.error('Failed to run preview');
    } finally {
      setIsPreviewing(false);
    }
  };

  const loadXai = async (
    sampleIndex: number = xaiSampleIndex,
    method: 'ensemble' | 'shap' | 'model' | 'permutation' = importanceMethod
  ) => {
    if (!sessionId) {
      return;
    }
    setXaiLoading(true);
    setXaiError(null);
    try {
      const [explanations, importance] = await Promise.all([
        getExplainability(sessionId, sampleIndex),
        getFeatureImportance(sessionId, method)
      ]);
      setXaiData(explanations);
      setXaiImportance(importance);
    } catch (error) {
      setXaiError('Failed to load explainability data');
    } finally {
      setXaiLoading(false);
    }
  };

  const handleCompleteWorkflow = () => {
    // Clear all session data from localStorage
    localStorage.removeItem('automl_file_id');
    localStorage.removeItem('automl_session_id');
    
    // Dispatch storage event for other components (e.g., DataSet.tsx)
    window.dispatchEvent(new Event('storage'));
    
    toast.success('Workflow completed! Ready for new dataset', {
      icon: '✅',
      duration: 2000,
    });
    
    // Navigate to home page immediately
    navigate('/', { replace: true });
  };

  const toggleModelExpansion = (modelName: string) => {
    setExpandedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelName)) {
        newSet.delete(modelName);
      } else {
        newSet.add(modelName);
      }
      return newSet;
    });
  };

  const toggleModelComparison = (modelName: string) => {
    setSelectedForCompare(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelName)) {
        newSet.delete(modelName);
      } else {
        newSet.add(modelName);
      }
      return newSet;
    });
  };

  if (isLoading || !results) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading results...</p>
        </motion.div>
      </div>
    );
  }

  const bestModel = results.models.find((m: any) => m.model_name === results.best_model);
  const problemType = results.problem_type;

  // Prepare chart data
  const metricsData = results.models.map((model: any) => ({
    name: model.model_name.replace(/Classifier|Regressor/g, '').substring(0, 15),
    fullName: model.model_name,
    accuracy: model.metrics.accuracy,
    f1: model.metrics.f1,
    precision: model.metrics.precision,
    recall: model.metrics.recall,
    r2: model.metrics.r2,
    rmse: model.metrics.rmse,
    mae: model.metrics.mae,
    trainingTime: model.training_time,
    cvMean: model.cv_mean,
    cvStd: model.cv_std,
  }));

  const comparisonData = Array.from(selectedForCompare).map(modelName => {
    const model = results.models.find((m: any) => m.model_name === modelName);
    return {
      name: modelName,
      ...model?.metrics,
      trainingTime: model?.training_time,
      cv_mean: model?.cv_mean,
    };
  });

  // Prepare radar chart data for classification
  const radarData = problemType === 'classification' ? [
    { metric: 'Accuracy', ...Object.fromEntries(metricsData.map(m => [m.fullName, m.accuracy * 100])) },
    { metric: 'Precision', ...Object.fromEntries(metricsData.map(m => [m.fullName, m.precision * 100])) },
    { metric: 'Recall', ...Object.fromEntries(metricsData.map(m => [m.fullName, m.recall * 100])) },
    { metric: 'F1 Score', ...Object.fromEntries(metricsData.map(m => [m.fullName, m.f1 * 100])) },
  ] : [
    { metric: 'R² Score', ...Object.fromEntries(metricsData.map(m => [m.fullName, Math.abs(m.r2) * 100])) },
    { metric: 'RMSE (inv)', ...Object.fromEntries(metricsData.map(m => [m.fullName, 100 - (m.rmse / 10)])) },
    { metric: 'MAE (inv)', ...Object.fromEntries(metricsData.map(m => [m.fullName, 100 - (m.mae / 10)])) },
  ];

  const shapSummary = xaiData?.global?.summary_data;
  const shapSummaryData = shapSummary?.features?.map((feature: string, idx: number) => ({
    feature,
    importance: shapSummary.importance[idx]
  })) || [];
  const importanceEntries = Object.entries(
    xaiImportance?.importance || xaiData?.global?.feature_importance_ensemble || {}
  ).sort((a, b) => Math.abs(b[1] as number) - Math.abs(a[1] as number));
  const localContributions = Object.entries(
    xaiData?.local?.shap_contributions || {}
  ).sort((a, b) => Math.abs(b[1] as number) - Math.abs(a[1] as number));

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Training Results
            </h1>
            <div className="px-3 py-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-500/20">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">✓ Completed</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Session ID: <span className="font-mono text-sm">{sessionId?.substring(0, 8)}...</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsComparing(!isComparing)}
            className={cn(
              "px-4 py-2 rounded-lg flex items-center space-x-2 transition-all",
              isComparing 
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>{isComparing ? 'Exit Compare' : 'Compare Models'}</span>
          </button>
          <button
            onClick={handleCompleteWorkflow}
            className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-green-500/30 transition-all flex items-center space-x-2 hover:scale-105"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Done</span>
          </button>
          <button
            onClick={handleDeleteSession}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Best Model Banner */}
      {bestModel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-orange-500/10"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full blur-lg opacity-40 animate-pulse" />
                <div className="relative p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <span>Best Performing Model</span>
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{bestModel.model_name}</span> achieved the highest score
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                  {problemType === 'classification' 
                    ? formatPercentage(bestModel.metrics.accuracy)
                    : formatNumber(bestModel.metrics.r2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {problemType === 'classification' ? 'Accuracy' : 'R² Score'}
                </div>
              </div>
              
              <div className="h-14 w-px bg-gray-300 dark:bg-gray-700" />
              
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {formatDuration(bestModel.training_time)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Training Time</span>
                </div>
              </div>
              
              <button
                onClick={() => handleDownload(bestModel.model_name)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center space-x-2 hover:scale-105"
              >
                <Download className="h-5 w-5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="glass-card">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex space-x-2 px-2">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'metrics', label: 'Detailed Metrics', icon: BarChart3 },
              { id: 'visualizations', label: 'Visualizations', icon: TrendingUp },
              { id: 'xai', label: 'Explainability', icon: Brain },
              { id: 'preview', label: 'Preview Model', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all relative",
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Models List */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <Cpu className="h-5 w-5 text-blue-500" />
                        <span>Trained Models</span>
                        <span className="text-sm font-normal text-gray-500">({results.models.length} models)</span>
                      </h3>
                      
                      {results.models.map((model: any, index: number) => (
                        <motion.div
                          key={model.model_name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "p-5 rounded-xl border-2 transition-all hover:shadow-lg",
                            selectedModel === model.model_name 
                              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" 
                              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50",
                            isComparing && selectedForCompare.has(model.model_name) && "ring-2 ring-purple-500"
                          )}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={cn(
                                "p-2 rounded-lg",
                                model.model_name === results.best_model
                                  ? "bg-gradient-to-br from-yellow-500 to-amber-500"
                                  : "bg-gradient-to-br from-blue-500 to-cyan-500"
                              )}>
                                {model.model_name === results.best_model ? (
                                  <Trophy className="h-5 w-5 text-white" />
                                ) : (
                                  <Cpu className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-base">{model.model_name}</h4>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDuration(model.training_time)}</span>
                                  </span>
                                  {model.model_name === results.best_model && (
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs rounded-full font-medium">
                                      ⭐ Best
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {isComparing && (
                                <button
                                  onClick={() => toggleModelComparison(model.model_name)}
                                  className={cn(
                                    "p-2 rounded-lg transition-all",
                                    selectedForCompare.has(model.model_name)
                                      ? "bg-purple-500 text-white"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                  )}
                                >
                                  <Layers className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => toggleModelExpansion(model.model_name)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                {expandedModels.has(model.model_name) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Main Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {problemType === 'classification' 
                                  ? formatPercentage(model.metrics.accuracy)
                                  : formatNumber(model.metrics.r2)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {problemType === 'classification' ? 'Accuracy' : 'R² Score'}
                              </div>
                            </div>
                            
                            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                {problemType === 'classification' 
                                  ? formatNumber(model.metrics.f1)
                                  : formatRegressionMetric(model.metrics.rmse, 'rmse')}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {problemType === 'classification' ? 'F1 Score' : 'RMSE'}
                              </div>
                            </div>
                            
                            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                {formatRegressionMetric(model.cv_mean, 'cv_mean')}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                CV Mean
                              </div>
                            </div>
                            
                            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                ±{formatRegressionMetric(model.cv_std, 'cv_std')}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                CV Std
                              </div>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {expandedModels.has(model.model_name) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-semibold mb-3 text-sm">All Metrics</h5>
                                    <div className="space-y-2">
                                      {Object.entries(model.metrics).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                          <span className="text-gray-600 dark:text-gray-400 capitalize">
                                            {key.replace(/_/g, ' ')}
                                          </span>
                                          <span className="font-medium">
                                            {typeof value === 'number' 
                                              ? (key.includes('accuracy') || key.includes('precision') || key.includes('recall') || key.includes('f1')
                                                ? formatPercentage(value as number)
                                                : formatRegressionMetric(value as number, key))
                                              : String(value)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-semibold mb-3 text-sm">Cross Validation</h5>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Mean Score</span>
                                        <span className="font-medium">{formatNumber(model.cv_mean)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Std Deviation</span>
                                        <span className="font-medium">±{formatNumber(model.cv_std)}</span>
                                      </div>
                                      {model.cv_scores && (
                                        <div className="mt-3">
                                          <span className="text-xs text-gray-600 dark:text-gray-400">Individual Fold Scores:</span>
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {model.cv_scores.map((score: number, idx: number) => (
                                              <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium">
                                                {formatNumber(score)}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-4">
                                  <button
                                    onClick={() => handleDownload(model.model_name)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center space-x-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    <span>Download</span>
                                  </button>
                                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors flex items-center space-x-2">
                                    <Share2 className="h-4 w-4" />
                                    <span>Share</span>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center space-x-2">
                          <Activity className="h-5 w-5 text-blue-500" />
                          <span>Training Summary</span>
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Problem Type</span>
                            <span className="font-semibold capitalize px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                              {problemType}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Target Column</span>
                            <span className="font-semibold text-sm">{results.target_column}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Models Trained</span>
                            <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">{results.models.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Time</span>
                            <span className="font-semibold">
                              {formatDuration(results.models.reduce((acc: number, m: any) => acc + m.training_time, 0))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Performance Chart */}
                      <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <h3 className="font-semibold mb-4 text-sm">Performance Overview</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metricsData.slice(0, 5)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                              <XAxis 
                                dataKey="name" 
                                fontSize={10}
                                stroke="var(--foreground)"
                              />
                              <YAxis fontSize={10} stroke="var(--foreground)" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'var(--background)',
                                  borderColor: 'var(--border)',
                                  borderRadius: '8px',
                                  fontSize: '12px'
                                }}
                              />
                              <Bar 
                                dataKey={problemType === 'classification' ? 'accuracy' : 'r2'} 
                                fill="#3B82F6"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Export Options */}
                      <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <h3 className="font-semibold mb-4 text-sm">Export Options</h3>
                        <div className="space-y-2">
                          <button className="w-full py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span>Download Report (PDF)</span>
                          </button>
                          <button className="w-full py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span>Export Metrics (CSV)</span>
                          </button>
                          <button className="w-full py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2">
                            <Share2 className="h-4 w-4" />
                            <span>Share Results</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Metrics Tab */}
              {activeTab === 'metrics' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Detailed Metrics Comparison</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-gray-800">
                          <th className="text-left py-3 px-4 font-semibold">Model</th>
                          {problemType === 'classification' ? (
                            <>
                              <th className="text-right py-3 px-4 font-semibold">Accuracy</th>
                              <th className="text-right py-3 px-4 font-semibold">Precision</th>
                              <th className="text-right py-3 px-4 font-semibold">Recall</th>
                              <th className="text-right py-3 px-4 font-semibold">F1 Score</th>
                            </>
                          ) : (
                            <>
                              <th className="text-right py-3 px-4 font-semibold">R² Score</th>
                              <th className="text-right py-3 px-4 font-semibold">RMSE</th>
                              <th className="text-right py-3 px-4 font-semibold">MAE</th>
                            </>
                          )}
                          <th className="text-right py-3 px-4 font-semibold">CV Mean</th>
                          <th className="text-right py-3 px-4 font-semibold">Training Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.models.map((model: any, index: number) => (
                          <motion.tr 
                            key={model.model_name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors",
                              model.model_name === results.best_model && "bg-yellow-50 dark:bg-yellow-900/10"
                            )}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                {model.model_name === results.best_model && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                                <span className="font-medium">{model.model_name}</span>
                              </div>
                            </td>
                            {problemType === 'classification' ? (
                              <>
                                <td className="text-right py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">
                                  {formatPercentage(model.metrics.accuracy)}
                                </td>
                                <td className="text-right py-3 px-4">{formatNumber(model.metrics.precision)}</td>
                                <td className="text-right py-3 px-4">{formatNumber(model.metrics.recall)}</td>
                                <td className="text-right py-3 px-4">{formatNumber(model.metrics.f1)}</td>
                              </>
                            ) : (
                              <>
                                <td className="text-right py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">
                                  {formatNumber(model.metrics.r2)}
                                </td>
                                <td className="text-right py-3 px-4">{formatRegressionMetric(model.metrics.rmse, 'rmse')}</td>
                                <td className="text-right py-3 px-4">{formatRegressionMetric(model.metrics.mae, 'mae')}</td>
                              </>
                            )}
                            <td className="text-right py-3 px-4">{formatRegressionMetric(model.cv_mean, 'cv_mean')}</td>
                            <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {formatDuration(model.training_time)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Comparison Charts */}
                  {isComparing && selectedForCompare.size > 0 && (
                    <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200 dark:border-purple-800">
                      <h4 className="text-lg font-semibold mb-4">Selected Models Comparison</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {problemType === 'classification' ? (
                          <>
                            <div>
                              <h5 className="text-sm font-medium mb-3 text-center">Accuracy Comparison</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={comparisonData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                  <XAxis dataKey="name" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                  <YAxis fontSize={11} />
                                  <Tooltip />
                                  <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-3 text-center">F1 Score Comparison</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={comparisonData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                  <XAxis dataKey="name" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                  <YAxis fontSize={11} />
                                  <Tooltip />
                                  <Bar dataKey="f1" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <h5 className="text-sm font-medium mb-3 text-center">R² Score Comparison</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={comparisonData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                  <XAxis dataKey="name" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                  <YAxis fontSize={11} />
                                  <Tooltip />
                                  <Bar dataKey="r2" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-3 text-center">RMSE Comparison</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={comparisonData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                  <XAxis dataKey="name" fontSize={11} angle={-45} textAnchor="end" height={80} />
                                  <YAxis fontSize={11} />
                                  <Tooltip />
                                  <Bar dataKey="rmse" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Visualizations Tab */}
              {activeTab === 'visualizations' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Performance Visualizations</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Bar Chart */}
                    <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <h4 className="font-semibold mb-4">Model Performance Comparison</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={metricsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={11}
                            stroke="var(--foreground)"
                          />
                          <YAxis fontSize={11} stroke="var(--foreground)" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey={problemType === 'classification' ? 'accuracy' : 'r2'} 
                            fill="#3B82F6" 
                            radius={[8, 8, 0, 0]}
                            name={problemType === 'classification' ? 'Accuracy' : 'R² Score'}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Training Time Comparison */}
                    <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <h4 className="font-semibold mb-4">Training Time Analysis</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={metricsData} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                          <XAxis type="number" fontSize={11} stroke="var(--foreground)" />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100}
                            fontSize={10}
                            stroke="var(--foreground)"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar 
                            dataKey="trainingTime" 
                            fill="#F59E0B"
                            radius={[0, 8, 8, 0]}
                            name="Training Time (s)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Multi-Metric Comparison */}
                    <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <h4 className="font-semibold mb-4">Multi-Metric Analysis</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={metricsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={11}
                            stroke="var(--foreground)"
                          />
                          <YAxis fontSize={11} stroke="var(--foreground)" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          {problemType === 'classification' ? (
                            <>
                              <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Accuracy" />
                              <Line type="monotone" dataKey="f1" stroke="#8B5CF6" strokeWidth={2} name="F1 Score" />
                              <Line type="monotone" dataKey="precision" stroke="#10B981" strokeWidth={2} name="Precision" />
                            </>
                          ) : (
                            <>
                              <Bar dataKey="r2" fill="#3B82F6" radius={[4, 4, 0, 0]} name="R² Score" />
                              <Line type="monotone" dataKey="rmse" stroke="#EF4444" strokeWidth={2} name="RMSE" />
                              <Line type="monotone" dataKey="mae" stroke="#F59E0B" strokeWidth={2} name="MAE" />
                            </>
                          )}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Radar Chart for Model Comparison */}
                    <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <h4 className="font-semibold mb-4">Model Strengths Radar</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="metric" fontSize={11} stroke="var(--foreground)" />
                          <PolarRadiusAxis fontSize={10} stroke="var(--foreground)" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          {metricsData.slice(0, 3).map((model, index) => (
                            <Radar
                              key={model.fullName}
                              name={model.name}
                              dataKey={model.fullName}
                              stroke={COLORS[index]}
                              fill={COLORS[index]}
                              fillOpacity={0.3}
                            />
                          ))}
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Performance Distribution Pie Chart */}
                    <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 lg:col-span-2">
                      <h4 className="font-semibold mb-4">Performance Distribution</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={metricsData}
                            dataKey={problemType === 'classification' ? 'accuracy' : 'r2'}
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${formatPercentage(entry[problemType === 'classification' ? 'accuracy' : 'r2'])}`}
                            labelLine={true}
                          >
                            {metricsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Cross Validation Scores */}
                    <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 lg:col-span-2">
                      <h4 className="font-semibold mb-4">Cross Validation Scores</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={metricsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={11}
                            stroke="var(--foreground)"
                          />
                          <YAxis fontSize={11} stroke="var(--foreground)" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="cvMean" fill="#10B981" radius={[4, 4, 0, 0]} name="CV Mean" />
                          <Line type="monotone" dataKey="cvStd" stroke="#EF4444" strokeWidth={2} name="CV Std Dev" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* XAI Tab */}
              {activeTab === 'xai' && (
                <div className="space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        <span>Explainable AI Insights</span>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SHAP and LIME explanations for the best model: {results.best_model}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => loadXai(xaiSampleIndex, importanceMethod)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                      >
                        Refresh XAI
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <h4 className="font-semibold mb-4 flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        <span>Controls</span>
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sample Index (local explanation)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={xaiSampleIndex}
                            onChange={(e) => setXaiSampleIndex(Math.max(0, Number(e.target.value) || 0))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            If index is out of range, the last sample is used.
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Feature Importance Method
                          </label>
                          <select
                            value={importanceMethod}
                            onChange={(e) => setImportanceMethod(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
                          >
                            <option value="ensemble">Ensemble (recommended)</option>
                            <option value="shap">SHAP</option>
                            <option value="model">Model-based</option>
                            <option value="permutation">Permutation</option>
                          </select>
                        </div>
                        <button
                          onClick={() => loadXai(xaiSampleIndex, importanceMethod)}
                          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                        >
                          Run Explainability
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-2 p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border border-violet-200 dark:border-violet-800">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-violet-600" />
                          <span>Global Feature Importance</span>
                        </h4>
                        <span className="text-xs text-violet-700 dark:text-violet-300 font-medium">
                          Method: {xaiImportance?.method || importanceMethod}
                        </span>
                      </div>
                      {xaiLoading && (
                        <div className="py-10 text-center text-sm text-gray-500">
                          Loading explainability data...
                        </div>
                      )}
                      {xaiError && (
                        <div className="py-10 text-center text-sm text-red-600">
                          {xaiError}
                        </div>
                      )}
                      {!xaiLoading && !xaiError && (
                        <div className="space-y-3">
                          {importanceEntries.slice(0, 12).map(([feature, score], index) => (
                            <div key={feature} className="flex items-center space-x-3">
                              <span className="text-xs text-gray-500 w-6">{index + 1}</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-gray-800 dark:text-gray-100 truncate">
                                    {feature}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {formatNumber(score as number)}
                                  </span>
                                </div>
                                <div className="h-2 bg-white/70 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                                    style={{ width: `${Math.min(100, Math.abs(score as number) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          {importanceEntries.length === 0 && (
                            <div className="text-sm text-gray-500">No importance data yet.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <h4 className="font-semibold mb-4 flex items-center space-x-2">
                        <Target className="h-4 w-4 text-emerald-500" />
                        <span>Local Explanation</span>
                      </h4>
                      {xaiData?.local?.prediction ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <div className="text-xs text-emerald-700 dark:text-emerald-300">Prediction</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {String(xaiData.local.prediction.value ?? xaiData.local.prediction)}
                            </div>
                            {xaiData.local.prediction.confidence !== undefined && (
                              <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                                Confidence: {formatPercentage(xaiData.local.prediction.confidence)}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2">Top SHAP Contributions</div>
                            <div className="space-y-2">
                              {localContributions.slice(0, 8).map(([feature, value]) => (
                                <div key={feature} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-300 truncate">{feature}</span>
                                  <span className={cn(
                                    "font-medium",
                                    (value as number) >= 0 ? "text-emerald-600" : "text-rose-500"
                                  )}>
                                    {formatNumber(value as number)}
                                  </span>
                                </div>
                              ))}
                              {localContributions.length === 0 && (
                                <div className="text-sm text-gray-500">No local contributions available.</div>
                              )}
                            </div>
                          </div>

                          {xaiData?.local?.lime_explanation?.top_features && (
                            <div>
                              <div className="text-sm font-medium mb-2">LIME Highlights</div>
                              <div className="space-y-2">
                                {xaiData.local.lime_explanation.top_features.slice(0, 6).map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-300 truncate">{item[0]}</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-100">{formatNumber(item[1])}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Run explainability to see local insights.</div>
                      )}
                    </div>

                    <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <h4 className="font-semibold mb-4 flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span>SHAP Summary</span>
                      </h4>
                      {shapSummaryData.length > 0 ? (
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={shapSummaryData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                              <XAxis type="number" fontSize={11} stroke="var(--foreground)" />
                              <YAxis type="category" dataKey="feature" fontSize={11} width={110} stroke="var(--foreground)" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'var(--background)',
                                  borderColor: 'var(--border)',
                                  borderRadius: '8px',
                                  fontSize: '12px'
                                }}
                              />
                              <Bar dataKey="importance" fill="#8B5CF6" radius={[4, 4, 4, 4]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No SHAP summary data available.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Preview Prediction</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enter feature values to test the trained model on a single row.
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Model: {selectedModel || results?.best_model}
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {results?.input_schema?.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {results.input_schema.map((column: any) => (
                            <div key={column.name}>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {column.name}
                              </label>
                              <input
                                type={String(column.dtype || '').toLowerCase().match(/int|float|double/) ? 'number' : 'text'}
                                value={previewInputs[column.name] ?? ''}
                                onChange={(e) =>
                                  setPreviewInputs(prev => ({
                                    ...prev,
                                    [column.name]: e.target.value
                                  }))
                                }
                                placeholder={column.example != null ? String(column.example) : 'Enter value'}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Input schema is not available for this session.
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={handleRunPreview}
                          disabled={isPreviewing || !results?.input_schema?.length}
                          className={cn(
                            "px-5 py-2 rounded-lg font-semibold transition-all",
                            "bg-gradient-to-r from-emerald-500 to-green-600 text-white",
                            "hover:shadow-lg hover:shadow-emerald-500/30",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          {isPreviewing ? 'Running...' : 'Run Preview'}
                        </button>
                        <button
                          onClick={() => {
                            setPreviewResult(null);
                          }}
                          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500 transition-colors"
                        >
                          Clear Result
                        </button>
                      </div>

                      {previewResult && (
                        <div className="mt-4 p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-900/20">
                          <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                            Prediction Result
                          </div>
                          <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {String(previewResult.prediction ?? 'N/A')}
                          </div>
                          {previewResult.probabilities && (
                            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                              {Object.entries(previewResult.probabilities).map(([label, score]) => (
                                <div key={label} className="flex items-center justify-between">
                                  <span>{label}</span>
                                  <span>{formatPercentage(score as number)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {previewResult.missing_inputs?.length > 0 && (
                            <div className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                              Missing values: {previewResult.missing_inputs.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Results;
