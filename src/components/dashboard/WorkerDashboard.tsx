import React from 'react';
import { SummaryCard } from './SummaryCard';
import { CheckCircle, AlertTriangle, Clock, List } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';

export const WorkerDashboard = () => {
  const { currentUser } = useAuthStore();
  const { tasks } = useTaskStore();

  const myTasks = tasks.filter(t => !t.isDeleted && t.assigneeId === currentUser?.id);
  const inProgressCount = myTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'READY').length;
  const reviewCount = myTasks.filter(t => t.status === 'REVIEW').length;
  
  const delayedCount = myTasks.filter(t => {
    if (t.status === 'DONE') return false;
    if (!t.dueDate) return false;
    return t.dueDate < new Date().toISOString().split('T')[0];
  }).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">내 작업 대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="내 전체 업무" value={myTasks.length.toString()} icon={List} colorClass="bg-blue-500" />
        <SummaryCard title="진행/대기 중" value={inProgressCount.toString()} icon={AlertTriangle} colorClass="bg-indigo-500" />
        <SummaryCard title="검토 진행 중" value={reviewCount.toString()} icon={CheckCircle} colorClass="bg-green-500" />
        <SummaryCard title="지연된 업무" value={delayedCount.toString()} icon={Clock} colorClass="bg-red-500" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">내 업무 현황 요약</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-sm font-semibold text-gray-600">업무 제목</th>
                <th className="p-3 text-sm font-semibold text-gray-600">상태</th>
                <th className="p-3 text-sm font-semibold text-gray-600">마감 예정일</th>
                <th className="p-3 text-sm font-semibold text-gray-600">진척도</th>
              </tr>
            </thead>
            <tbody>
              {myTasks.slice(0, 10).map(t => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{t.title}</td>
                  <td className="p-3 text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-bold">{t.status}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {t.dueDate || '-'}
                  </td>
                  <td className="p-3 text-sm font-bold text-indigo-600">
                    {t.progress || 0}%
                  </td>
                </tr>
              ))}
              {myTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">할당된 업무가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
