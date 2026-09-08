import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  label = 'Carregando...',
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      role="status"
      className={`inline-flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-500 ${sizeClasses[size]}`}
      />
      {label && <span className="text-sm font-medium">{label}</span>}
      <span className="sr-only">{label}</span>
    </div>
  );
}
