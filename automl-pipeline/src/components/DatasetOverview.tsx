import React from 'react';
import { Database, Hash, Type, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface DatasetOverviewProps {
  datasetInfo: any;
  selectedTarget: string;
  onTargetChange: (target: string) => void;
}

const DatasetOverview: React.FC<DatasetOverviewProps> = ({
  datasetInfo,
  selectedTarget,
  onTargetChange,
}) => {
  const columns = datasetInfo.columns || [];
  const shape = datasetInfo.shape || { rows: 0, columns: 0 };

  const getDataTypeIcon = (dtype: string) => {
    if (dtype.includes('int') || dtype.includes('float')) return Hash;
    if (dtype.includes('object') || dtype.includes('str')) return Type;
    if (dtype.includes('datetime')) return Calendar;
    return Database;
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 rounded-xl">
          <div className="text-2xl font-bold">{shape.rows?.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rows</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-xl">
          <div className="text-2xl font-bold">{shape.columns}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Columns</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 rounded-xl">
          <div className="text-2xl font-bold">{datasetInfo.memory_usage}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Memory</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4 rounded-xl">
          <div className="text-2xl font-bold">
            {columns.filter((c: any) => c.missing_count > 0).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Columns with Missing</div>
        </div>
      </div>

      {/* Target Column Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Target Column
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
          {columns.map((column: any) => {
            const Icon = getDataTypeIcon(column.dtype);
            return (
              <button
                key={column.name}
                onClick={() => onTargetChange(column.name)}
                className={cn(
                  "p-3 rounded-lg border transition-all text-left",
                  selectedTarget === column.name
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-800 hover:border-blue-500"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{column.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {column.dtype} • {column.unique_count} unique
                      </div>
                    </div>
                  </div>
                  {column.missing_count > 0 && (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DatasetOverview;