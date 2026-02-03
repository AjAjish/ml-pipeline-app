import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronRight,
  BookOpen,
  Code,
  Zap,
  Shield,
  Database,
  BarChart3,
  Cpu,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../lib/utils';

const Documentation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'concepts', label: 'Core Concepts', icon: BookOpen },
    { id: 'workflow', label: 'Workflow Guide', icon: BarChart3 },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'features', label: 'Features', icon: Cpu },
    { id: 'deployment', label: 'Deployment', icon: Database },
  ];

  const codeExamples = {
    upload: `# Upload a CSV file
curl -X POST http://localhost:8000/api/upload \\
  -F "file=@your_dataset.csv"

# Response
{
  "file_id": "abc123def456",
  "filename": "your_dataset.csv",
  "size": 2048576,
  "rows": 1000,
  "columns": 15
}`,
    
    train: `# Start model training
curl -X POST http://localhost:8000/api/train \\
  -H "Content-Type: application/json" \\
  -d '{
    "file_id": "abc123def456",
    "target_column": "target",
    "problem_type": "classification",
    "selected_algorithms": ["RandomForest", "XGBoost"],
    "test_size": 0.2,
    "cv_folds": 5
  }'`,

    results: `# Get training results
curl http://localhost:8000/api/results/session123

# Response includes:
{
  "session_id": "session123",
  "best_model": "XGBClassifier",
  "models": [...],
  "metrics": {...}
}`,
  };

  const guides = [
    {
      id: 'guide-1',
      title: 'Your First AutoML Model',
      description: 'Get started with AutoML Pro in 5 minutes',
      steps: [
        '1. Upload a CSV file with your data',
        '2. Navigate to Dataset page to preview',
        '3. Go to Dashboard and select your target column',
        '4. Choose problem type and algorithms',
        '5. Click "Start Training" and wait for results',
      ],
      difficulty: 'Beginner',
      time: '5 min',
    },
    {
      id: 'guide-2',
      title: 'Understanding Results',
      description: 'Deep dive into model performance metrics',
      steps: [
        'Explore the Overview tab with model cards',
        'Check Detailed Metrics for comprehensive comparison',
        'Visualize performance with interactive charts',
        'Analyze feature importance in XAI section',
        'Download your best model for production',
      ],
      difficulty: 'Intermediate',
      time: '10 min',
    },
    {
      id: 'guide-3',
      title: 'Advanced Model Comparison',
      description: 'Compare multiple models side by side',
      steps: [
        'Train multiple algorithms simultaneously',
        'Click "Compare Models" on Results page',
        'Select models for comparison',
        'View side-by-side metrics and charts',
        'Export comparison report',
      ],
      difficulty: 'Advanced',
      time: '15 min',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Training',
      description: 'Train 12+ algorithms simultaneously with optimized performance',
    },
    {
      icon: BarChart3,
      title: 'Rich Visualizations',
      description: '6+ interactive charts for comprehensive analysis and insights',
    },
    {
      icon: Cpu,
      title: 'Explainable AI',
      description: 'Understand model decisions with SHAP and LIME analysis',
    },
    {
      icon: Shield,
      title: 'Data Validation',
      description: 'Automatic validation and cleaning of your datasets',
    },
    {
      icon: Database,
      title: 'Model Export',
      description: 'Download trained models for production deployment',
    },
    {
      icon: Shield,
      title: 'Dark Mode',
      description: 'Eye-friendly interface with automatic dark/light themes',
    },
  ];

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/upload',
      description: 'Upload a CSV dataset',
      params: ['file (multipart)'],
    },
    {
      method: 'GET',
      path: '/api/dataset/{file_id}/preview',
      description: 'Get dataset preview',
      params: ['file_id', 'limit (optional)'],
    },
    {
      method: 'POST',
      path: '/api/train',
      description: 'Start model training',
      params: ['file_id', 'target_column', 'problem_type', 'selected_algorithms'],
    },
    {
      method: 'GET',
      path: '/api/results/{session_id}',
      description: 'Get training results',
      params: ['session_id'],
    },
    {
      method: 'DELETE',
      path: '/api/delete-session/{session_id}',
      description: 'Delete training session',
      params: ['session_id'],
    },
  ];

  const filteredSections = sections.filter(section =>
    section.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Installation */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center space-x-2">
                <Zap className="h-8 w-8 text-blue-500" />
                <span>Quick Start</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Installation</h3>
                  <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-100 text-sm">
{`# Clone repository
git clone https://github.com/your-username/ml-pipeline-app.git
cd ml-pipeline-app

# Backend setup
cd backend
pip install -r ../requirements.txt
python app.py

# Frontend setup (in new terminal)
cd automl-pipeline
npm install
npm run dev`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">First Request</h3>
                  <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                    <button
                      onClick={() => copyToClipboard(codeExamples.upload, 'upload')}
                      className="absolute top-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      {copiedCode === 'upload' ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-white" />
                      )}
                    </button>
                    <pre className="text-gray-100 text-sm pr-12">
{codeExamples.upload}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Concepts */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Key Concepts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'File ID', desc: 'Unique identifier for uploaded datasets' },
                  { title: 'Session ID', desc: 'Unique identifier for training sessions' },
                  { title: 'Problem Type', desc: 'Classification or Regression task' },
                  { title: 'Target Column', desc: 'Column to predict or classify' },
                ].map((concept, i) => (
                  <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">{concept.title}</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">{concept.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        );

      case 'concepts':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <span>Core Concepts</span>
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  title: 'Automated Machine Learning',
                  content: 'AutoML Pro automates the entire machine learning pipeline, from data preprocessing to model selection and hyperparameter tuning. You just provide your data and let the system find the best model.',
                },
                {
                  title: 'Cross-Validation',
                  content: 'We use k-fold cross-validation to ensure robust model performance. This technique divides your data into k folds, training on k-1 and validating on 1, repeating k times. Default is 5 folds.',
                },
                {
                  title: 'Train/Test Split',
                  content: 'Your dataset is divided into training and testing portions. The model learns from training data and is evaluated on unseen test data. Default split is 80/20.',
                },
                {
                  title: 'Model Comparison',
                  content: 'AutoML Pro trains multiple algorithms simultaneously and automatically identifies the best performer based on your problem type and metrics.',
                },
                {
                  title: 'Hyperparameter Tuning',
                  content: 'Automatic optimization of model hyperparameters using grid search and randomized search techniques. This ensures peak performance on your specific data.',
                },
                {
                  title: 'Feature Engineering',
                  content: 'Automatic scaling, encoding of categorical variables, handling of missing values, and feature selection to optimize model input.',
                },
                {
                  title: 'Explainable AI (XAI)',
                  content: 'Understand model predictions with SHAP values and LIME explanations. Perfect for compliance, debugging, and stakeholder communication.',
                },
              ].map((concept, i) => (
                <div key={i} className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 transition-colors">
                  <h3 className="text-xl font-semibold mb-3">{concept.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{concept.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'workflow':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <span>Complete Workflow Guide</span>
            </h2>

            <section>
              <h3 className="text-2xl font-bold mb-6">Step-by-Step Process</h3>
              <div className="space-y-4">
                {[
                  {
                    num: '1',
                    title: 'Upload Your Dataset',
                    desc: 'Upload a CSV file containing your training data',
                    details: 'Supported formats: CSV (up to 1GB). Your data is processed securely and stored temporarily.'
                  },
                  {
                    num: '2',
                    title: 'Preview & Explore Data',
                    desc: 'View your dataset in tabular format and check data quality',
                    details: 'The Dataset page shows first 100 rows, column types, and basic statistics.'
                  },
                  {
                    num: '3',
                    title: 'Configure Training',
                    desc: 'Select target column, problem type, and algorithms',
                    details: 'Choose Classification or Regression. Select specific algorithms or use "Auto" for recommendations.'
                  },
                  {
                    num: '4',
                    title: 'Start Model Training',
                    desc: 'Train multiple models simultaneously',
                    details: 'System trains 12+ algorithms in parallel with cross-validation. Typically takes 2-10 minutes.'
                  },
                  {
                    num: '5',
                    title: 'Review Results',
                    desc: 'Analyze model performance with metrics and visualizations',
                    details: '4 tabs: Overview (best model), Metrics (detailed), Visualizations (6 charts), XAI (explanations).'
                  },
                  {
                    num: '6',
                    title: 'Deploy Your Model',
                    desc: 'Export and integrate the best model into production',
                    details: 'Download as .joblib file ready for REST APIs, batch processing, or microservices.'
                  },
                ].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{step.title}</h4>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{step.desc}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic border-t border-blue-200 dark:border-blue-800 pt-2">{step.details}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Detailed Guides */}
            <section className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Detailed Workflow Guides</h3>
              <div className="space-y-4">
                {guides.map((guide, index) => (
                  <motion.div
                    key={guide.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                      className="w-full p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-left flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{guide.title}</h3>
                          <span className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium',
                            guide.difficulty === 'Beginner' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                            guide.difficulty === 'Intermediate' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
                            guide.difficulty === 'Advanced' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                          )}>
                            {guide.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{guide.description}</p>
                      </div>
                      <ChevronRight className={cn(
                        'h-5 w-5 transition-transform',
                        expandedGuide === guide.id && 'rotate-90'
                      )} />
                    </button>

                    <AnimatePresence>
                      {expandedGuide === guide.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50"
                        >
                          <ol className="space-y-3">
                            {guide.steps.map((step, i) => (
                              <li key={i} className="flex items-start space-x-3">
                                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">
                                  {i + 1}
                                </span>
                                <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">⏱️ Estimated time: {guide.time}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        );

      case 'api':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-2">
              <Code className="h-8 w-8 text-blue-500" />
              <span>API Reference</span>
            </h2>

            <div className="space-y-6">
              {apiEndpoints.map((endpoint, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={cn(
                      'px-3 py-1 rounded font-semibold text-sm text-white',
                      endpoint.method === 'POST' && 'bg-blue-600',
                      endpoint.method === 'GET' && 'bg-green-600',
                      endpoint.method === 'DELETE' && 'bg-red-600',
                    )}>
                      {endpoint.method}
                    </span>
                    <code className="text-gray-900 dark:text-gray-100 font-mono text-sm flex-1">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{endpoint.description}</p>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Parameters:</span>
                    <div className="mt-2 space-y-1">
                      {endpoint.params.map((param, j) => (
                        <code key={j} className="block text-gray-600 dark:text-gray-400 ml-4">
                          • {param}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4">Example Requests</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Upload Dataset</h4>
                  <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                    <button
                      onClick={() => copyToClipboard(codeExamples.upload, 'upload')}
                      className="absolute top-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      {copiedCode === 'upload' ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-white" />
                      )}
                    </button>
                    <pre className="text-gray-100 text-sm pr-12">
{codeExamples.upload}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Start Training</h4>
                  <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                    <button
                      onClick={() => copyToClipboard(codeExamples.train, 'train')}
                      className="absolute top-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      {copiedCode === 'train' ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-white" />
                      )}
                    </button>
                    <pre className="text-gray-100 text-sm pr-12">
{codeExamples.train}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Get Results</h4>
                  <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                    <button
                      onClick={() => copyToClipboard(codeExamples.results, 'results')}
                      className="absolute top-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      {copiedCode === 'results' ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-white" />
                      )}
                    </button>
                    <pre className="text-gray-100 text-sm pr-12">
{codeExamples.results}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'features':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-2">
              <Cpu className="h-8 w-8 text-blue-500" />
              <span>Features</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <feature.icon className="h-8 w-8 text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'deployment':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-2">
              <Database className="h-8 w-8 text-blue-500" />
              <span>Deployment & Best Practices</span>
            </h2>

            {/* Production Checklist */}
            <section>
              <h3 className="text-2xl font-bold mb-6">Production Checklist</h3>
              <div className="space-y-3">
                {[
                  'Validate model performance on new test data',
                  'Set up monitoring and alerting for model predictions',
                  'Implement error handling and fallback mechanisms',
                  'Document model assumptions and limitations',
                  'Plan for model retraining schedule (monthly/quarterly)',
                  'Ensure data privacy and security compliance (GDPR, HIPAA)',
                  'Version control for models and datasets',
                  'Create rollback procedures for model failures',
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Deployment Options */}
            <section>
              <h3 className="text-2xl font-bold mb-6">Deployment Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'REST API with Flask',
                    desc: 'Deploy as REST API for real-time predictions',
                    code: `from flask import Flask, request
import joblib

app = Flask(__name__)
model = joblib.load('model.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    prediction = model.predict([data['features']])
    return {'prediction': float(prediction[0])}`
                  },
                  {
                    title: 'Batch Processing',
                    desc: 'Process large datasets offline',
                    code: `import pandas as pd
import joblib

model = joblib.load('model.joblib')
df = pd.read_csv('data.csv')

predictions = model.predict(df)
df['prediction'] = predictions
df.to_csv('predictions.csv', index=False)`
                  },
                  {
                    title: 'Docker Container',
                    desc: 'Containerize for scalable deployment',
                    code: `FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY model.joblib .
EXPOSE 8000
CMD ["python", "app.py"]`
                  },
                  {
                    title: 'AWS Lambda',
                    desc: 'Serverless predictions with auto-scaling',
                    code: `import json
import joblib

model = joblib.load('/tmp/model.joblib')

def handler(event, context):
    features = json.loads(event['body'])
    prediction = model.predict([features])
    
    return {
        'statusCode': 200,
        'body': json.dumps({'prediction': float(prediction[0])})
    }`
                  },
                ].map((option, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <h4 className="font-semibold text-lg">{option.title}</h4>
                      <p className="text-blue-100 text-sm mt-1">{option.desc}</p>
                    </div>
                    <div className="p-4">
                      <div className="bg-gray-900 dark:bg-gray-950 rounded p-3 overflow-x-auto">
                        <pre className="text-gray-100 text-xs">{option.code}</pre>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Development vs Production */}
            <section>
              <h3 className="text-2xl font-bold mb-6">Development vs Production</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    env: 'Development',
                    items: [
                      'Terminal 1: cd backend && python app.py',
                      'Terminal 2: cd automl-pipeline && npm run dev',
                      'Access at http://localhost:5173',
                      'Hot reload enabled for quick testing',
                      'Debug mode enabled',
                    ]
                  },
                  {
                    env: 'Production',
                    items: [
                      'Backend: gunicorn app:app --workers 4 --bind 0.0.0.0:8000',
                      'Frontend: npm run build && serve dist/',
                      'Use reverse proxy (Nginx/Apache)',
                      'Enable caching and compression',
                      'SSL/TLS certificates required',
                    ]
                  },
                ].map((config, i) => (
                  <div key={i} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{config.env}</h4>
                    <ul className="space-y-2">
                      {config.items.map((item, j) => (
                        <li key={j} className="flex items-start space-x-2 text-gray-700 dark:text-gray-300 text-sm">
                          <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Monitoring & Maintenance */}
            <section>
              <h3 className="text-2xl font-bold mb-6">Monitoring & Maintenance</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Performance Monitoring',
                    tips: ['Log all predictions', 'Compare with actual outcomes', 'Create dashboards', 'Alert on drops > 5%']
                  },
                  {
                    title: 'Data Drift Detection',
                    tips: ['Monitor feature distributions', 'Check for anomalies', 'Track data quality', 'Schedule reviews']
                  },
                  {
                    title: 'Model Versioning',
                    tips: ['Use semantic versioning', 'Keep last 3 versions', 'Document changes', 'Test before release']
                  },
                  {
                    title: 'Security & Compliance',
                    tips: ['Encrypt sensitive data', 'Audit trail logging', 'Access control', 'Regular backups']
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{item.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.tips.map((tip, j) => (
                        <span key={j} className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                          {tip}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Troubleshooting */}
            <section>
              <h3 className="text-2xl font-bold mb-6">Troubleshooting Guide</h3>
              <div className="space-y-4">
                {[
                  {
                    issue: 'Slow predictions',
                    solution: 'Optimize features, use lighter algorithms, or implement batch processing for better throughput.'
                  },
                  {
                    issue: 'Poor production accuracy',
                    solution: 'Check for data drift. Retrain with recent data. Monitor new data distribution closely.'
                  },
                  {
                    issue: 'Out of memory errors',
                    solution: 'Use batch processing, reduce features, or implement streaming predictions for large datasets.'
                  },
                  {
                    issue: 'Cannot load model',
                    solution: 'Verify joblib version, Python compatibility (3.8+), and model file integrity.'
                  },
                  {
                    issue: 'API timeouts',
                    solution: 'Chunk requests, increase timeout settings, or implement asynchronous processing.'
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <p className="font-semibold text-red-900 dark:text-red-100 mb-2">❌ {item.issue}</p>
                    <p className="text-red-700 dark:text-red-300 text-sm">{item.solution}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AutoML Pro Documentation
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">v1.0.0</div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 z-20 space-y-4">
            <nav className="space-y-2">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    whileHover={{ x: 4 }}
                    className={cn(
                      'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left',
                      activeSection === section.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-blue-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </motion.button>
                );
              })}
            </nav>

            {/* Quick Links */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="http://localhost:8000/docs" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1">
                    <span>API Swagger Docs</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="http://localhost:8000/redoc" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1">
                    <span>API ReDoc</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/AjAjish/ml-pipeline-app" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1">
                    <span>GitHub Repository</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AutoML Pro is a comprehensive machine learning platform that automates the entire ML pipeline.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="https://github.com/AjAjish/ml-pipeline-app" className="hover:text-blue-600">GitHub</a></li>
                <li><a href="https://scikit-learn.org" className="hover:text-blue-600">Scikit-learn Docs</a></li>
                <li><a href="https://xgboost.readthedocs.io" className="hover:text-blue-600">XGBoost Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="https://www.instagram.com/fw__ajish" className="hover:text-blue-600">Instagram</a></li>
                <li><a href="mailto:abiajsih2202@gmail.com?subject=AutoML Pro Inquiry" className="hover:text-blue-600">Email</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 AutoML Pro. All rights reserved. Made with ❤️</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
