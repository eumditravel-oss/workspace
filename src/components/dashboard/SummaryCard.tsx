import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  subtitle?: string;
  onClick?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, colorClass, subtitle, onClick }) => {
  return (
    <div 
      className={`p-5 rounded-[var(--radius-card)] shadow-sm border border-[var(--color-border)] bg-[var(--color-surface)] flex items-start gap-4 ${onClick ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <div className={`p-3.5 rounded-xl ${colorClass}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[var(--color-text-sub)] font-bold mb-1 truncate">{title}</p>
        <p className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight mb-1">{value}</p>
        {subtitle && <p className="text-[12px] text-[var(--color-text-sub)] truncate">{subtitle}</p>}
      </div>
    </div>
  );
};
