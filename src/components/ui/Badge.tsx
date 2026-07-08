import React from 'react';

type BadgeVariant = 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO' | 'DEFAULT';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'DEFAULT', className = '' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'SUCCESS':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'WARNING':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
      case 'ERROR':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
      case 'INFO':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300';
      case 'DEFAULT':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <span className={`inline-flex items-center justify-center text-xs px-2 py-1 rounded-full font-semibold ${getVariantStyles()} ${className}`}>
      {children}
    </span>
  );
};
