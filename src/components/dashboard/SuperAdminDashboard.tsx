import React from 'react';
import { SummaryCard } from './SummaryCard';
import { CheckCircle, AlertTriangle, Clock, Users } from 'lucide-react';

export const SuperAdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">최고관리자 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="승인 대기" value="5" icon={CheckCircle} colorClass="bg-blue-500" />
        <SummaryCard title="긴급 업무" value="2" icon={AlertTriangle} colorClass="bg-red-500" />
        <SummaryCard title="지연 업무" value="3" icon={Clock} colorClass="bg-orange-500" />
        <SummaryCard title="부서 요약" value="4개 부서" icon={Users} colorClass="bg-indigo-500" />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4">전체 프로젝트 현황</h2>
        <p className="text-gray-500">통합 지표가 표시될 예정입니다.</p>
      </div>
    </div>
  );
};
