import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Table, 
  Upload, 
  FileText, 
  ArrowLeft, 
  Loader2,
  Database,
  AlertCircle,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDatasetPreview, getAllDatasets } from '../services/api';
import { cn } from '../lib/utils';

interface DatasetPreview {
  file_id: string;
  columns: string[];
  data: any[];
  total_rows: number;
  preview_rows: number;
}

const DataSet: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [datasetPreview, setDatasetPreview] = useState<DatasetPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadDataset = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check localStorage first for fileId
        const storedFileId = localStorage.getItem('automl_file_id');

        // If no stored fileId, no dataset
        if (!storedFileId) {
          setError('no_dataset');
          setDatasetPreview(null);
          setIsLoading(false);
          return;
        }

        // Check if fileId is passed from navigation state
        const fileId = location.state?.fileId || storedFileId;

        if (fileId) {
          try {
            // Load preview for dataset
            const preview = await getDatasetPreview(fileId, 100);
            setDatasetPreview(preview);
            setError(null);
          } catch (err: any) {
            if (err.response?.status === 404) {
              setError('no_dataset');
              setDatasetPreview(null);
            } else {
              setError('Failed to load dataset. Please try again.');
              toast.error('Failed to load dataset');
            }
          }
        } else {
          setError('no_dataset');
        }
      } catch (err: any) {
        console.error('Error loading dataset:', err);
        setError('Failed to load dataset. Please try again.');
        toast.error('Failed to load dataset');
      } finally {
        setIsLoading(false);
      }
    };

    loadDataset();
  }, [location.state, refreshTrigger]);

  // Listen for storage changes (when Done button clears localStorage in another component)
  useEffect(() => {
    const handleStorageChange = () => {
      const fileId = localStorage.getItem('automl_file_id');
      if (!fileId) {
        setError('no_dataset');
        setDatasetPreview(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleNavigateToUpload = () => {
    navigate('/');
  };

  const handleNavigateToDashboard = () => {
    if (datasetPreview) {
      navigate('/dashboard', { 
        state: { 
          fileId: datasetPreview.file_id 
        } 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading dataset...</p>
        </motion.div>
      </div>
    );
  }

  if (error === 'no_dataset') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="glass-card p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-orange-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                No Dataset Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't uploaded any dataset yet. Please upload a CSV file to get started.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleNavigateToUpload}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Upload className="h-5 w-5" />
                <span>Upload Dataset</span>
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="w-full py-3 px-6 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error && error !== 'no_dataset') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="glass-card p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Error Loading Dataset
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              Retry
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!datasetPreview) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  Dataset Preview
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Viewing {datasetPreview.preview_rows.toLocaleString()} of {datasetPreview.total_rows.toLocaleString()} rows
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleNavigateToUpload}
                className="py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload New</span>
              </button>
              
              <button
                onClick={handleNavigateToDashboard}
                className="py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>Process Dataset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dataset Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Table className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Rows</p>
                <p className="text-2xl font-bold">{datasetPreview.total_rows.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Columns</p>
                <p className="text-2xl font-bold">{datasetPreview.columns.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 col-span-2 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Database className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Preview Size</p>
                <p className="text-2xl font-bold">{datasetPreview.preview_rows}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Data Table</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Scroll horizontally to see all columns
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-800">
                    #
                  </th>
                  {datasetPreview.columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {datasetPreview.data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800">
                      {rowIndex + 1}
                    </td>
                    {datasetPreview.columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
                      >
                        {row[column] !== null && row[column] !== undefined
                          ? String(row[column])
                          : <span className="text-gray-400 italic">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {datasetPreview.total_rows > datasetPreview.preview_rows && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> Only showing first {datasetPreview.preview_rows} rows. 
                Total dataset contains {datasetPreview.total_rows.toLocaleString()} rows.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DataSet;
