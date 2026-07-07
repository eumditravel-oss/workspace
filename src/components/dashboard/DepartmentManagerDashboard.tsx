import React from 'react';
import { SummaryCard } from './SummaryCard';
import { CheckCircle, AlertTriangle, Clock, Briefcase } from 'lucide-react';

export const DepartmentManagerDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">부서장 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="부서 승인 대기" value="3" icon={CheckCircle} colorClass="bg-blue-500" />
        <SummaryCard title="부서 긴급 업무" value="1" icon={AlertTriangle} colorClass="bg-red-500" />
        <SummaryCard title="부서 지연 업무" value="2" icon={Clock} colorClass="bg-orange-500" />
        <SummaryCard title="진행 프로젝트" value="8" icon={Briefcase} colorClass="bg-teal-500" />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4">부서 업무 현황</h2>
        <p className="text-gray-500">부서 통합 지표가 표시될 예정입니다.</p>
      </div>
    </div>
  );
};
