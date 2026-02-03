import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Cpu, 
  Download, 
  Sparkles,
  CheckCircle,
  Brain,
  Database,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { uploadDataset } from '../services/api';
import { cn } from '../lib/utils';

const Home = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setIsUploading(true);
    
    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadDataset(file);
      clearInterval(interval);
      setUploadProgress(100);
      
      // Store file ID in localStorage
      localStorage.setItem('automl_file_id', result.file_id);
      // Clear any previous session ID on new upload
      localStorage.removeItem('automl_session_id');
      
      toast.success('Dataset uploaded successfully!');
      
      // Navigate to dashboard with dataset info
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { 
            fileId: result.file_id,
            fileInfo: result 
          } 
        });
      }, 500);
      
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const workflowSteps = [
    {
      icon: Upload,
      title: 'Upload Dataset',
      description: 'Drag & drop your CSV file',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Database,
      title: 'Auto Processing',
      description: 'Validation & preprocessing',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Cpu,
      title: 'Train Models',
      description: 'Multiple algorithms trained',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BarChart3,
      title: 'Analyze Results',
      description: 'Metrics & visualizations',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Download,
      title: 'Export Models',
      description: 'Download for production',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium gradient-text">
            No-Code Machine Learning
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Train ML Models
          <span className="block gradient-text">Without Writing Code</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          Upload your dataset, select target column, and let our AutoML pipeline 
          train, evaluate, and deploy machine learning models automatically.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => document.getElementById('upload-zone')?.click()}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 blur group-hover:blur-xl transition-all duration-300" />
            <div className="relative flex items-center justify-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Dataset</span>
            </div>
          </button>
          <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-blue-500 transition-colors">
            Try Sample Dataset
          </button>
        </div>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <div
          {...getRootProps()}
          className={cn(
            "glass-card p-12 border-2 border-dashed transition-all duration-300",
            isDragActive 
              ? "border-blue-500 bg-blue-500/5 scale-[1.02]" 
              : "border-gray-300 dark:border-gray-700 hover:border-blue-500",
            isUploading && "opacity-50"
          )}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="text-center">
              <div className="inline-block relative">
                <div className="h-24 w-24 rounded-full border-[6px] border-gray-200 dark:border-gray-800" />
                <div 
                  className="absolute top-0 left-0 h-24 w-24 rounded-full border-[6px] border-blue-500 border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                />
                <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-2">Processing Dataset</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Training models in progress...</p>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{uploadProgress}% Complete</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6">
                  <Upload className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your dataset'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Supports CSV, Excel files up to 100MB
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">CSV Format</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Database className="h-4 w-4" />
                    <span className="text-sm">Up to 1M Rows</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Fast Processing</span>
                  </div>
                </div>
                
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                  Browse Files
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Or click to select a file from your computer
                </p>
              </div>
              
              {/* Recent Datasets */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">SAMPLE DATASETS</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Iris Classification', rows: 150, features: 4 },
                    { name: 'Boston Housing', rows: 506, features: 13 },
                    { name: 'Titanic Survival', rows: 891, features: 11 },
                  ].map((dataset) => (
                    <div
                      key={dataset.name}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {dataset.name}
                        </h5>
                        <CheckCircle className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{dataset.rows.toLocaleString()} rows</span>
                        <span>{dataset.features} features</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Workflow Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative text-center"
              >
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} mb-4 mx-auto shadow-lg`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {step.description}
                  </p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">12+ ML Algorithms</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Automatic algorithm selection for regression & classification
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['Random Forest', 'XGBoost', 'Neural Nets', 'SVM', 'Linear Models'].map(algo => (
                      <span key={algo} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        {algo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Explainable AI (XAI)</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    SHAP, LIME, and feature importance for model transparency
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Real-time Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Live training progress, metrics visualization, and comparison
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Production Ready</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Export models with preprocessing pipeline for deployment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center py-12"
      >
        <div className="glass-card max-w-2xl mx-auto p-8">
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium gradient-text">
              Ready to Transform Your Data?
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Start Your ML Journey Today</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join thousands of data scientists and analysts using AutoML Pro
          </p>
          <button
            onClick={() => document.getElementById('upload-zone')?.click()}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 blur group-hover:blur-xl transition-all duration-300" />
            <div className="relative flex items-center justify-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Your First Dataset</span>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;