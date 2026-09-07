import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  description: string;
  percentage?: number;
  variant?: 'emerald' | 'indigo' | 'amber' | 'slate';
  icon?: React.ReactNode;
}

export function MetricsCard({
  title,
  value,
  description,
  percentage,
  variant = 'indigo',
  icon,
}: MetricsCardProps) {
  const variantStyles = {
    emerald: {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/50',
      text: 'text-emerald-800',
      bar: 'bg-emerald-500',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    indigo: {
      border: 'border-indigo-200',
      bg: 'bg-indigo-50/50',
      text: 'text-indigo-800',
      bar: 'bg-indigo-600',
      iconBg: 'bg-indigo-100 text-indigo-700',
    },
    amber: {
      border: 'border-amber-200',
      bg: 'bg-amber-50/50',
      text: 'text-amber-800',
      bar: 'bg-amber-500',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    slate: {
      border: 'border-slate-200',
      bg: 'bg-white',
      text: 'text-slate-900',
      bar: 'bg-slate-500',
      iconBg: 'bg-slate-100 text-slate-700',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`rounded-xl border p-5 shadow-xs transition-all ${style.border} ${style.bg}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">{title}</p>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${style.iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className={`text-3xl font-bold tracking-tight ${style.text}`}>{value}</p>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      {percentage !== undefined && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
            <div
              className={`h-full transition-all duration-500 ${style.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
