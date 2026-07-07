import React from 'react';

interface ProgressBarProps {
  progress: number;
  height?: string;
  colorClass?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  height = 'h-1.5', 
  colorClass = 'bg-blue-500',
  showLabel = false
}) => {
  const safeProgress = Math.min(Math.max(Math.round(progress), 0), 100);
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-gray-500">진행률</span>
          <span className="font-medium text-gray-700">{safeProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
        <div 
          className={`${colorClass} h-full transition-all duration-300 ease-in-out`} 
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};
