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
    container: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300',
    icon: 'text-red-500 dark:text-red-400',
    title: 'text-red-900 dark:text-red-200',
    text: 'text-red-700 dark:text-red-300',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300',
    icon: 'text-amber-500 dark:text-amber-400',
    title: 'text-amber-900 dark:text-amber-200',
    text: 'text-amber-700 dark:text-amber-300',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300',
    icon: 'text-emerald-500 dark:text-emerald-400',
    title: 'text-emerald-900 dark:text-emerald-200',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-300',
    icon: 'text-blue-500 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-200',
    text: 'text-blue-700 dark:text-blue-300',
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
            className="text-slate-400 hover:text-slate-600 focus:outline-none dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <span aria-hidden="true" className="text-base font-bold">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
}
