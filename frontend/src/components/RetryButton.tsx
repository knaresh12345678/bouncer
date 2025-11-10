import React from 'react';
import { RefreshCw } from 'lucide-react';

interface RetryButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  retryCount = 0,
  maxRetries = 3,
  className = ''
}) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          px-6 py-3 bg-indigo-600 hover:bg-indigo-700
          disabled:opacity-50 disabled:cursor-not-allowed
          rounded-lg transition-colors
          flex items-center justify-center space-x-2
          font-semibold text-white
          ${className}
        `}
      >
        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'Retrying...' : 'Retry'}</span>
      </button>

      {retryCount > 0 && (
        <div className="text-sm text-gray-400">
          Attempt {retryCount}/{maxRetries}
        </div>
      )}
    </div>
  );
};

export default RetryButton;
