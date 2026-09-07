import React from 'react';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
  title?: string;
  message: string | string[];
  variant?: AlertVariant;
  className?: string;
  onDismiss?: () => void;
}

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: string; title: string; text: string }
> = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-500',
    title: 'text-red-900',
    text: 'text-red-700',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: 'text-amber-500',
    title: 'text-amber-900',
    text: 'text-amber-700',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: 'text-emerald-500',
    title: 'text-emerald-900',
    text: 'text-emerald-700',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-900',
    text: 'text-blue-700',
  },
};

export function Alert({
  title,
  message,
  variant = 'info',
  className = '',
  onDismiss,
}: AlertProps) {
  const styles = variantStyles[variant];
  const messages = Array.isArray(message) ? message : [message];

  return (
    <div
      role="alert"
      className={`rounded-lg border p-4 ${styles.container} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {title && (
            <h4 className={`text-sm font-semibold ${styles.title} mb-1`}>
              {title}
            </h4>
          )}
          {messages.length === 1 ? (
            <p className={`text-sm ${styles.text}`}>{messages[0]}</p>
          ) : (
            <ul className={`list-disc list-inside text-sm ${styles.text} space-y-1`}>
              {messages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fechar alerta"
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <span aria-hidden="true" className="text-base font-bold">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
}
