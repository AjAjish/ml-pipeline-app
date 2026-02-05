import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, Sparkles, Zap, Target, TrendingUp, BookOpen, Award } from 'lucide-react';

interface AlgorithmDetail {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  parameters: Record<string, string>;
  outputs: string[];
  useCases: string[];
  pros: string[];
  cons: string[];
}

const algorithms: Record<string, AlgorithmDetail[]> = {
  classification: [
    {
      id: 'logistic-regression',
      name: 'Logistic Regression',
      description: 'A linear model for binary classification that outputs probability scores.',
      inputs: ['Features (X)', 'Target labels (y) - binary or multiclass'],
      parameters: {
        'Learning Rate': 'Controls step size in gradient descent (0.001 - 0.1)',
        'Max Iterations': 'Maximum number of iterations (100 - 1000)',
        'Regularization': 'L1 or L2 to prevent overfitting',
      },
      outputs: ['Predicted class', 'Probability scores'],
      useCases: ['Email spam detection', 'Disease diagnosis', 'Customer churn prediction'],
      pros: ['Fast training', 'Interpretable', 'Works well with small datasets'],
      cons: ['Assumes linear relationship', 'Poor with non-linear data', 'Sensitive to outliers'],
    },
    {
      id: 'decision-tree',
      name: 'Decision Tree',
      description: 'A tree-like model that makes decisions by splitting features recursively.',
      inputs: ['Features (X)', 'Target labels (y)'],
      parameters: {
        'Max Depth': 'Maximum depth of the tree (1 - 20)',
        'Min Samples Split': 'Minimum samples to split node (2 - 20)',
        'Min Samples Leaf': 'Minimum samples in leaf (1 - 10)',
      },
      outputs: ['Predicted class', 'Decision path'],
      useCases: ['Credit approval', 'Medical diagnosis', 'Customer segmentation'],
      pros: ['Interpretable', 'Fast prediction', 'Handles non-linear relationships'],
      cons: ['Prone to overfitting', 'Biased with imbalanced data', 'Unstable with small changes'],
    },
    {
      id: 'random-forest',
      name: 'Random Forest',
      description: 'Ensemble of decision trees that vote on the final prediction.',
      inputs: ['Features (X)', 'Target labels (y)'],
      parameters: {
        'Number of Trees': 'Number of trees in forest (50 - 500)',
        'Max Depth': 'Maximum depth per tree (1 - 20)',
        'Min Samples Split': 'Minimum samples to split (2 - 20)',
      },
      outputs: ['Predicted class', 'Feature importance'],
      useCases: ['Bank loan approval', 'Customer retention', 'Fraud detection'],
      pros: ['Reduces overfitting', 'Handles non-linear data', 'Feature importance ranking'],
      cons: ['Slower training', 'Hard to interpret', 'High memory usage'],
    },
    {
      id: 'svm',
      name: 'Support Vector Machine (SVM)',
      description: 'Finds optimal hyperplane that maximizes margin between classes.',
      inputs: ['Features (X)', 'Target labels (y)'],
      parameters: {
        'Kernel': 'linear, rbf, poly - determines decision boundary',
        'C': 'Regularization parameter (0.1 - 100)',
        'Gamma': 'Kernel coefficient (0.001 - 1)',
      },
      outputs: ['Predicted class', 'Distance to hyperplane'],
      useCases: ['Text classification', 'Image recognition', 'Handwriting recognition'],
      pros: ['Works well in high dimensions', 'Memory efficient', 'Effective with non-linear kernel'],
      cons: ['Slow with large datasets', 'Needs feature scaling', 'Hard to interpret'],
    },
    {
      id: 'naive-bayes',
      name: 'Naive Bayes',
      description: 'Probabilistic classifier based on Bayes theorem with independence assumption.',
      inputs: ['Features (X)', 'Target labels (y)'],
      parameters: {
        'Alpha': 'Smoothing parameter (0.1 - 1.0)',
      },
      outputs: ['Predicted class', 'Class probabilities'],
      useCases: ['Spam filtering', 'Sentiment analysis', 'Text categorization'],
      pros: ['Fast training', 'Works with small data', 'Probabilistic predictions'],
      cons: ['Independence assumption', 'Biased estimates', 'Simple model'],
    },
    {
      id: 'knn',
      name: 'K-Nearest Neighbors',
      description: 'Classifies based on majority vote of k nearest training examples.',
      inputs: ['Features (X)', 'Target labels (y)', 'Query point'],
      parameters: {
        'K': 'Number of neighbors (1 - 20)',
        'Distance Metric': 'euclidean, manhattan, or other distance',
        'Weights': 'uniform or distance-based weighting',
      },
      outputs: ['Predicted class', 'Distance scores'],
      useCases: ['Recommendation systems', 'Pattern recognition', 'Data imputation'],
      pros: ['Simple to implement', 'No training phase', 'Flexible decision boundary'],
      cons: ['Slow prediction', 'Sensitive to outliers', 'High memory usage'],
    },
    {
      id: 'gradient-boosting',
      name: 'Gradient Boosting',
      description: 'Sequential boosting approach that builds trees to correct previous errors.',
      inputs: ['Features (X)', 'Target labels (y)'],
      parameters: {
        'Learning Rate': 'Step size (0.01 - 0.3)',
        'N Estimators': 'Boosting stages (50 - 500)',
        'Max Depth': 'Tree depth (1 - 10)',
      },
      outputs: ['Predicted class', 'Feature importance'],
      useCases: ['Kaggle competitions', 'Risk scoring', 'Classification tasks'],
      pros: ['High accuracy', 'Handles non-linear', 'Feature importance'],
      cons: ['Slow training', 'Risk of overfitting', 'Complex tuning'],
    },
  ],
  regression: [
    {
      id: 'linear-regression',
      name: 'Linear Regression',
      description: 'Finds linear relationship between features and target variable.',
      inputs: ['Features (X)', 'Target values (y)'],
      parameters: {
        'Fit Intercept': 'Whether to add intercept term (True/False)',
        'Normalize': 'Feature normalization (True/False)',
      },
      outputs: ['Predicted values', 'Regression coefficients'],
      useCases: ['Sales forecasting', 'House price prediction', 'Trend analysis'],
      pros: ['Fast', 'Interpretable', 'Low computational cost'],
      cons: ['Assumes linear relationship', 'Sensitive to outliers', 'Poor with non-linear'],
    },
    {
      id: 'polynomial-regression',
      name: 'Polynomial Regression',
      description: 'Extends linear regression with polynomial features for non-linear relationships.',
      inputs: ['Features (X)', 'Target values (y)'],
      parameters: {
        'Degree': 'Polynomial degree (2 - 5)',
        'Regularization': 'Alpha value for ridge penalty',
      },
      outputs: ['Predicted values', 'Polynomial coefficients'],
      useCases: ['Curved trends', 'Non-linear relationships', 'Physics modeling'],
      pros: ['Flexible', 'Captures curves', 'Better fit than linear'],
      cons: ['Prone to overfitting', 'Computational cost', 'Complex to interpret'],
    },
    {
      id: 'ridge-regression',
      name: 'Ridge Regression',
      description: 'Linear regression with L2 regularization to prevent overfitting.',
      inputs: ['Features (X)', 'Target values (y)'],
      parameters: {
        'Alpha': 'Regularization strength (0.001 - 10)',
        'Solver': 'auto, svd, cholesky, lsqr',
      },
      outputs: ['Predicted values', 'Regularized coefficients'],
      useCases: ['Multicollinearity handling', 'Overfitting prevention', 'Stable predictions'],
      pros: ['Handles multicollinearity', 'Reduces overfitting', 'Stable'],
      cons: ['Shrinks coefficients', 'Not zero coefficients', 'Less interpretable'],
    },
    {
      id: 'lasso-regression',
      name: 'Lasso Regression',
      description: 'Linear regression with L1 regularization for feature selection.',
      inputs: ['Features (X)', 'Target values (y)'],
      parameters: {
        'Alpha': 'Regularization strength (0.001 - 1)',
        'Max Iter': 'Maximum iterations (1000 - 10000)',
      },
      outputs: ['Predicted values', 'Sparse coefficients'],
      useCases: ['Feature selection', 'Sparse models', 'Interpretability'],
      pros: ['Feature selection', 'Sparse solutions', 'Interpretable'],
      cons: ['Unstable with correlated', 'Slower convergence', 'One solution path'],
    },
    {
      id: 'dt-regression',
      name: 'Decision Tree Regression',
      description: 'Tree-based model that predicts continuous values through recursive splits.',
      inputs: ['Features (X)', 'Target values (y)'],
      parameters: {
        'Max Depth': 'Maximum depth (1 - 20)',
        'Min Samples Split': 'Minimum to split (2 - 20)',
        'Min Samples Leaf': 'Minimum in leaf (1 - 10)',
      },
      outputs: ['Predicted values', 'Split information'],
      useCases: ['Non-linear regression', 'Time series', 'Mixed data types'],
      pros: ['Interpretable', 'Non-linear', 'No scaling needed'],
      cons: ['Prone to overfitting', 'Unstable', 'Not smooth predictions'],
    },
    {
      id: 'random-forest-reg',
      name: 'Random Forest Regression',
      description: 'Ensemble of decision trees that average predictions for continuous values.',
      inputs: ['Features (X)', 'Target values (y)'],
      parameters: {
        'Number of Trees': 'Number of trees (50 - 500)',
        'Max Depth': 'Maximum depth per tree (1 - 20)',
        'Min Samples Split': 'Minimum samples to split (2 - 20)',
      },
      outputs: ['Predicted values', 'Feature importance'],
      useCases: ['Real estate valuation', 'Energy consumption', 'Stock price prediction'],
      pros: ['Reduces overfitting', 'Handles non-linear data', 'Feature importance'],
      cons: ['Slower training', 'Memory intensive', 'Hard to interpret'],
    },
    {
      id: 'svr',
      name: 'Support Vector Regression (SVR)',
      description: 'SVM adapted for regression with epsilon-tube loss.',
      inputs: ['Features (X)', 'Target values (y)'],
      parameters: {
        'Kernel': 'linear, rbf, poly',
        'C': 'Regularization (0.1 - 100)',
        'Epsilon': 'Tolerance margin (0.01 - 1)',
      },
      outputs: ['Predicted values', 'Support vectors'],
      useCases: ['Time series forecasting', 'Financial prediction', 'System modeling'],
      pros: ['Non-linear capability', 'Memory efficient', 'Good in high dimensions'],
      cons: ['Requires scaling', 'Hyperparameter tuning', 'Slow with large data'],
    },
    {
      id: 'gradient-boosting-reg',
      name: 'Gradient Boosting Regression',
      description: 'Sequential boosting approach for continuous value prediction.',
      inputs: ['Features (X)', 'Target values (y)'],
      parameters: {
        'Learning Rate': 'Step size (0.01 - 0.3)',
        'N Estimators': 'Boosting stages (50 - 500)',
        'Subsample': 'Training data fraction (0.5 - 1.0)',
      },
      outputs: ['Predicted values', 'Residual errors'],
      useCases: ['Kaggle competitions', 'Demand forecasting', 'Risk modeling'],
      pros: ['High accuracy', 'Flexible', 'Feature importance ranking'],
      cons: ['Slow training', 'Overfitting risk', 'Complex tuning'],
    },
  ],
};

export default function Algorithm() {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmDetail | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>('classification');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    hover: {
      scale: 1.06,
      y: -8,
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.7, y: 100 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.7,
      y: 100,
      transition: { duration: 0.25 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-40 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-40 -z-10"></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-16"
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent mb-4 leading-tight">
            ML Algorithms Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
            Discover the perfect algorithm for your machine learning problem. From classification to regression.
          </p>
        </motion.div>

        {/* Problem Type Guide */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-8 mb-20"
        >
          {/* Classification Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-700/40 dark:to-cyan-700/40 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-300"></div>
            <div className="relative bg-white dark:bg-slate-900/80 rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Classification</h2>
              </div>
              <p className="text-gray-700 dark:text-slate-300 mb-6 leading-relaxed text-lg">
                Predict which category or class an item belongs to. Perfect for categorical predictions.
              </p>
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-slate-200 text-sm uppercase tracking-wide text-blue-600 dark:text-blue-300">Best Use Cases:</h3>
                {['Spam detection', 'Disease diagnosis', 'Customer churn', 'Image recognition', 'Credit approval'].map(
                  (item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-center gap-3 text-gray-700 dark:text-slate-300"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                      <span className="font-medium">{item}</span>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          </motion.div>

          {/* Regression Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 dark:from-emerald-700/40 dark:to-teal-700/40 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-300"></div>
            <div className="relative bg-white dark:bg-slate-900/80 rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-emerald-100 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-4 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Regression</h2>
              </div>
              <p className="text-gray-700 dark:text-slate-300 mb-6 leading-relaxed text-lg">
                Predict continuous numerical values. Ideal for forecasting and estimation problems.
              </p>
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-slate-200 text-sm uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Best Use Cases:</h3>
                {['House price prediction', 'Stock forecasting', 'Temperature prediction', 'Sales forecasting', 'Risk assessment'].map(
                  (item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-center gap-3 text-gray-700 dark:text-slate-300"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                      <span className="font-medium">{item}</span>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Algorithm Sections */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Classification Section */}
          <motion.div variants={itemVariants} className="group">
            <motion.button
              onClick={() => toggleSection('classification')}
              whileHover={{ x: 5 }}
              className="w-full"
            >
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-2xl px-8 py-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-300 text-white group/btn cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg group-hover/btn:bg-white/30 transition-all">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold">Classification Algorithms</h2>
                </div>
                <motion.div
                  animate={{
                    rotate: expandedSection === 'classification' ? 180 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/20 backdrop-blur-sm p-3 rounded-lg"
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.div>
              </div>
            </motion.button>

            <AnimatePresence>
              {expandedSection === 'classification' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {algorithms.classification.map((algo) => (
                      <motion.div
                        key={algo.id}
                        variants={cardVariants}
                        whileHover="hover"
                        onClick={() => setSelectedAlgo(algo)}
                        className="group/card cursor-pointer"
                      >
                        <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-blue-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-400 h-full flex flex-col">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-3 text-lg group-hover/card:text-blue-600 dark:group-hover/card:text-blue-300 transition-colors">
                              {algo.name}
                            </h3>
                            <p className="text-gray-600 dark:text-slate-300 text-sm mb-5 line-clamp-3 leading-relaxed">
                              {algo.description}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ x: 5 }}
                            className="text-sm font-semibold text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 flex items-center gap-2 group-hover/card:gap-3 transition-all"
                          >
                            <Info className="w-4 h-4" /> View Details
                            <motion.span
                              animate={{ x: [0, 3, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              →
                            </motion.span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Regression Section */}
          <motion.div variants={itemVariants} className="group">
            <motion.button
              onClick={() => toggleSection('regression')}
              whileHover={{ x: 5 }}
              className="w-full"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl px-8 py-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-300 text-white group/btn cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg group-hover/btn:bg-white/30 transition-all">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold">Regression Algorithms</h2>
                </div>
                <motion.div
                  animate={{
                    rotate: expandedSection === 'regression' ? 180 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/20 backdrop-blur-sm p-3 rounded-lg"
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.div>
              </div>
            </motion.button>

            <AnimatePresence>
              {expandedSection === 'regression' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {algorithms.regression.map((algo) => (
                      <motion.div
                        key={algo.id}
                        variants={cardVariants}
                        whileHover="hover"
                        onClick={() => setSelectedAlgo(algo)}
                        className="group/card cursor-pointer"
                      >
                        <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-emerald-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-400 h-full flex flex-col">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-3 text-lg group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-300 transition-colors">
                              {algo.name}
                            </h3>
                            <p className="text-gray-600 dark:text-slate-300 text-sm mb-5 line-clamp-3 leading-relaxed">
                              {algo.description}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ x: 5 }}
                            className="text-sm font-semibold text-emerald-600 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 flex items-center gap-2 group-hover/card:gap-3 transition-all"
                          >
                            <Info className="w-4 h-4" /> View Details
                            <motion.span
                              animate={{ x: [0, 3, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              →
                            </motion.span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAlgo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAlgo(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700"
            >
              {/* Modal Header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 flex items-center justify-between rounded-t-3xl"
              >
                <div className="flex items-center gap-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="bg-white/20 p-3 rounded-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">{selectedAlgo.name}</h3>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  onClick={() => setSelectedAlgo(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </motion.div>

              {/* Modal Content */}
              <div className="p-8 space-y-8">
                {/* Description */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded"></div>
                    Overview
                  </h4>
                  <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-lg">{selectedAlgo.description}</p>
                </motion.div>

                {/* Use Cases */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Use Cases
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedAlgo.useCases.map((useCase, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border-l-4 border-blue-500"
                      >
                        <p className="text-sm text-gray-800 dark:text-slate-200 font-medium">{useCase}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Inputs & Outputs */}
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Inputs</h4>
                    <div className="space-y-2">
                      {selectedAlgo.inputs.map((input, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + idx * 0.05 }}
                          className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                          {input}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Outputs</h4>
                    <div className="space-y-2">
                      {selectedAlgo.outputs.map((output, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.05 }}
                          className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                          {output}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Parameters */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Key Parameters</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedAlgo.parameters).map(([param, desc], idx) => (
                      <motion.div
                        key={param}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.05 }}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 rounded-lg border-l-4 border-indigo-500"
                      >
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">{param}:</span>
                        <p className="text-gray-700 dark:text-slate-300 text-sm mt-1">{desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Pros & Cons */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Advantages
                    </h4>
                    <ul className="space-y-2">
                      {selectedAlgo.pros.map((pro, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 + idx * 0.05 }}
                          className="text-sm text-gray-700 dark:text-slate-300 flex gap-3 bg-green-50 dark:bg-green-900/30 p-2 rounded-lg"
                        >
                          <span className="text-green-600 font-bold mt-0.5">+</span>
                          <span>{pro}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Limitations
                    </h4>
                    <ul className="space-y-2">
                      {selectedAlgo.cons.map((con, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 + idx * 0.05 }}
                          className="text-sm text-gray-700 dark:text-slate-300 flex gap-3 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg"
                        >
                          <span className="text-red-600 font-bold mt-0.5">−</span>
                          <span>{con}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
