import React from 'react';
import { Check, Cpu, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface AlgorithmSelectorProps {
  algorithms: Record<string, any>;
  selectedAlgorithms: string[];
  onAlgorithmToggle: (algorithm: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  algorithms,
  selectedAlgorithms,
  onAlgorithmToggle,
  onSelectAll,
  onDeselectAll,
}) => {
  const algorithmCount = Object.keys(algorithms || {}).length;
  const selectedCount = selectedAlgorithms.length;
  
  const algorithmGroups = {
    'Tree-based': ['RandomForest', 'GradientBoosting', 'XGBoost', 'DecisionTree'],
    'Linear Models': ['LinearRegression', 'LogisticRegression', 'Ridge', 'Lasso'],
    'Other': ['SVC', 'KNeighbors', 'GaussianNB'],
  };

  return (
    <div className="space-y-4">
      {/* Selection Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">
            {selectedCount} of {algorithmCount} algorithms selected
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onSelectAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Algorithm Groups */}
      {Object.entries(algorithmGroups).map(([group, groupAlgos]) => {
        const groupItems = Object.entries(algorithms || {}).filter(([name]) =>
          groupAlgos.some(algo => name.includes(algo))
        );

        if (groupItems.length === 0) return null;

        return (
          <div key={group} className="space-y-2">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">{group}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {groupItems.map(([name, info]) => (
                <button
                  key={name}
                  onClick={() => onAlgorithmToggle(name)}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-left",
                    selectedAlgorithms.includes(name)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-800 hover:border-blue-500"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "p-1.5 rounded",
                        selectedAlgorithms.includes(name)
                          ? "bg-blue-500"
                          : "bg-gray-100 dark:bg-gray-800"
                      )}>
                        <Cpu className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {info.description}
                        </div>
                      </div>
                    </div>
                    {selectedAlgorithms.includes(name) && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlgorithmSelector;