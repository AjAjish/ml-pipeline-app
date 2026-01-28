import React from 'react';
import { Settings, Sliders } from 'lucide-react';
import { cn } from '../lib/utils';

interface TrainingConfigProps {
  config: {
    testSize: number;
    randomState: number;
    cvFolds: number;
  };
  onConfigChange: (key: string, value: number) => void;
}

const TrainingConfig: React.FC<TrainingConfigProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-4">
      {/* Test Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Test Size: {config.testSize * 100}%</span>
          </div>
        </label>
        <input
          type="range"
          min="10"
          max="50"
          step="5"
          value={config.testSize * 100}
          onChange={(e) => onConfigChange('testSize', parseInt(e.target.value) / 100)}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10%</span>
          <span>30%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Random State */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Random Seed
        </label>
        <input
          type="number"
          value={config.randomState}
          onChange={(e) => onConfigChange('randomState', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
          min="0"
          max="9999"
        />
      </div>

      {/* CV Folds */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4" />
            <span>Cross-Validation Folds: {config.cvFolds}</span>
          </div>
        </label>
        <div className="flex space-x-2">
          {[3, 5, 7, 10].map((folds) => (
            <button
              key={folds}
              onClick={() => onConfigChange('cvFolds', folds)}
              className={cn(
                "flex-1 py-2 text-center rounded-lg border transition-colors",
                config.cvFolds === folds
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "border-gray-200 dark:border-gray-800 hover:border-blue-500"
              )}
            >
              {folds}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainingConfig;