import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Layers,
  Target,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useApi } from '../contexts/ApiContext';
import toast from 'react-hot-toast';
import { cn, formatNumber, formatPercentage, formatDuration } from '../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const Results = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getSessionResults, downloadModel, deleteSession, isLoading } = useApi();
  
  const [results, setResults] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'visualizations' | 'xai'>('overview');
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  const [isComparing, setIsComparing] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (sessionId) {
      loadResults();
    }
  }, [sessionId]);

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
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const bestModel = results.models.find((m: any) => m.model_name === results.best_model);
  const problemType = results.problem_type;

  // Prepare chart data
  const metricsData = results.models.map((model: any) => ({
    name: model.model_name,
    ...model.metrics,
    trainingTime: model.training_time,
  }));

  const comparisonData = Array.from(selectedForCompare).map(modelName => {
    const model = results.models.find((m: any) => m.model_name === modelName);
    return {
      name: modelName,
      ...model?.metrics,
      trainingTime: model?.training_time,
    };
  });

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
            <h1 className="text-3xl font-bold">Training Results</h1>
            <div className="px-3 py-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full">
              <span className="text-sm font-medium gradient-text">Completed</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Session ID: <span className="font-mono">{sessionId}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsComparing(!isComparing)}
            className={cn(
              "px-4 py-2 rounded-lg flex items-center space-x-2",
              isComparing 
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Compare Models</span>
          </button>
          <button
            onClick={handleDeleteSession}
            className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
          className="glass-card p-6 border-2 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-amber-500/5"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full blur opacity-30" />
                <Trophy className="relative h-12 w-12 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">🏆 Best Performing Model</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {bestModel.model_name} achieved the highest score
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">
                  {problemType === 'classification' 
                    ? formatPercentage(bestModel.metrics.accuracy)
                    : formatNumber(bestModel.metrics.r2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {problemType === 'classification' ? 'Accuracy' : 'R² Score'}
                </div>
              </div>
              
              <div className="h-12 w-px bg-gray-200 dark:bg-gray-700" />
              
              <div className="text-center">
                <div className="text-xl font-semibold">
                  {formatDuration(bestModel.training_time)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Training Time
                </div>
              </div>
              
              <button
                onClick={() => handleDownload(bestModel.model_name)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Download Model</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'metrics', label: 'Metrics', icon: BarChart3 },
            { id: 'visualizations', label: 'Visualizations', icon: TrendingUp },
            { id: 'xai', label: 'XAI', icon: Brain },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Models List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comparison Mode */}
          {isComparing && selectedForCompare.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Model Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-2">Model</th>
                      <th className="text-right py-2">
                        {problemType === 'classification' ? 'Accuracy' : 'R²'}
                      </th>
                      <th className="text-right py-2">Training Time</th>
                      <th className="text-right py-2">CV Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((model) => (
                      <tr key={model.name} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3">{model.name}</td>
                        <td className="text-right py-3 font-semibold">
                          {problemType === 'classification' 
                            ? formatPercentage(model.accuracy)
                            : formatNumber(model.r2)}
                        </td>
                        <td className="text-right py-3">{formatDuration(model.trainingTime)}</td>
                        <td className="text-right py-3">{formatNumber(model.cv_mean)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Models List */}
          <div className="space-y-4">
            {results.models.map((model: any) => (
              <motion.div
                key={model.model_name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "glass-card p-6 hover:shadow-xl transition-all",
                  selectedModel === model.model_name && "ring-2 ring-blue-500",
                  isComparing && selectedForCompare.has(model.model_name) && "ring-2 ring-purple-500"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Cpu className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{model.model_name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Training: {formatDuration(model.training_time)}
                        </span>
                        {model.model_name === results.best_model && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs rounded-full">
                            Best
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
                          "p-2 rounded-lg",
                          selectedForCompare.has(model.model_name)
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        )}
                      >
                        <Layers className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleModelExpansion(model.model_name)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <div className="text-2xl font-bold gradient-text">
                      {problemType === 'classification' 
                        ? formatPercentage(model.metrics.accuracy)
                        : formatNumber(model.metrics.r2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {problemType === 'classification' ? 'Accuracy' : 'R² Score'}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <div className="text-xl font-semibold">
                      {problemType === 'classification' 
                        ? formatNumber(model.metrics.f1)
                        : formatNumber(model.metrics.rmse)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {problemType === 'classification' ? 'F1 Score' : 'RMSE'}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <div className="text-xl font-semibold">
                      {formatNumber(model.cv_mean)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      CV Score
                    </div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10">
                    <div className="text-xl font-semibold">
                      {formatDuration(model.training_time)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Training Time
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedModels.has(model.model_name) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-gray-200 dark:border-gray-800"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Metrics</h4>
                        <div className="space-y-2">
                          {Object.entries(model.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{key}</span>
                              <span className="font-medium">
                                {typeof value === 'number' 
                                  ? (key.includes('accuracy') || key.includes('precision') || key.includes('recall') || key.includes('f1')
                                    ? formatPercentage(value as number)
                                    : formatNumber(value as number))
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Cross Validation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Mean</span>
                            <span className="font-medium">{formatNumber(model.cv_mean)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Std Dev</span>
                            <span className="font-medium">{formatNumber(model.cv_std)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Scores</span>
                            <span className="font-medium">
                              {model.cv_scores?.map((s: number) => formatNumber(s)).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => handleDownload(model.model_name)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column - Charts & Actions */}
        <div className="space-y-6">
          {/* Performance Chart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Performance Comparison</h3>
              <Filter className="h-4 w-4 text-gray-500" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
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
                    fill="url(#colorPrimary)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Training Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Problem Type</span>
                <span className="font-medium capitalize">{problemType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Target Column</span>
                <span className="font-medium">{results.target_column}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Models Trained</span>
                <span className="font-medium">{results.models.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Time</span>
                <span className="font-medium">
                  {formatDuration(results.models.reduce((acc: number, m: any) => acc + m.training_time, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* XAI Actions */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold">Explainable AI</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Get detailed explanations for model predictions
            </p>
            <div className="space-y-3">
              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                View SHAP Analysis
              </button>
              <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                LIME Explanations
              </button>
              <button className="w-full py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
                Feature Importance
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Export Results</h3>
            <div className="space-y-3">
              <button className="w-full py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download Full Report (PDF)</span>
              </button>
              <button className="w-full py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Metrics (CSV)</span>
              </button>
              <button className="w-full py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>Share Results</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;