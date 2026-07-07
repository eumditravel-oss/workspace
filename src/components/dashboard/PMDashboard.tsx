import React from 'react';
import { SummaryCard } from './SummaryCard';
import { Calendar, AlertTriangle, CheckSquare, Clock } from 'lucide-react';

export const PMDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">PM 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="담당 프로젝트" value="3" icon={Calendar} colorClass="bg-purple-500" />
        <SummaryCard title="긴급 업무" value="2" icon={AlertTriangle} colorClass="bg-red-500" />
        <SummaryCard title="지연 업무" value="1" icon={Clock} colorClass="bg-orange-500" />
        <SummaryCard title="오늘 마감" value="4" icon={CheckSquare} colorClass="bg-green-500" />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4">프로젝트 진행 현황</h2>
        <p className="text-gray-500">프로젝트별 지표가 표시될 예정입니다.</p>
      </div>
    </div>
  );
};
