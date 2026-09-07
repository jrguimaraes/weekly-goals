import React from 'react';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  error: 'bg-rose-100 text-rose-800 border-rose-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  info: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
