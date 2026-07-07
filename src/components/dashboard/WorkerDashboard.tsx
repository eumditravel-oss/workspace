import React from 'react';
import { SummaryCard } from './SummaryCard';
import { CheckSquare, AlertTriangle, Clock, List } from 'lucide-react';

export const WorkerDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">내 업무 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="내 작업" value="12" icon={List} colorClass="bg-blue-500" />
        <SummaryCard title="긴급" value="1" icon={AlertTriangle} colorClass="bg-red-500" />
        <SummaryCard title="오늘 마감" value="2" icon={CheckSquare} colorClass="bg-green-500" />
        <SummaryCard title="지연" value="0" icon={Clock} colorClass="bg-orange-500" />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4">오늘 할 일</h2>
        <p className="text-gray-500">할 일 목록이 표시될 예정입니다.</p>
      </div>
    </div>
  );
};
