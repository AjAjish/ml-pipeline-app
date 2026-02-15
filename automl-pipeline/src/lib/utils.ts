import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatNumber(num: number, decimals = 3): string {
  if (num === null || num === undefined) return 'N/A';
  return Number(num).toFixed(decimals);
}

export function formatRegressionMetric(num: number, metricName: string = ''): string {
  if (num === null || num === undefined) return 'N/A';
  
  // Format large numbers (RMSE, MAE, CV Mean) with fewer decimals
  if (num > 100 || ['rmse', 'mae', 'cv_mean', 'cv_std'].some(m => metricName.toLowerCase().includes(m))) {
    // For large values (>100), use 2 decimals
    if (num > 10000) {
      return Number(num).toFixed(2);
    }
    return Number(num).toFixed(3);
  }
  
  // For small values (like R²), use standard formatting
  return Number(num).toFixed(3);
}

export function formatPercentage(num: number, decimals = 1): string {
  if (num === null || num === undefined) return 'N/A';
  return (num * 100).toFixed(decimals) + '%';
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return seconds.toFixed(1) + 's';
  } else if (seconds < 3600) {
    return (seconds / 60).toFixed(1) + 'm';
  } else {
    return (seconds / 3600).toFixed(1) + 'h';
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getContrastColor(hexColor: string): 'black' | 'white' {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? 'black' : 'white';
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadFile(content: string, filename: string, type = 'text/plain'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}