import React from 'react';
import { SummaryCard } from './SummaryCard';
import { Briefcase, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { getDeliveryUrgencyBucket, getProjectOverallProgress } from '@/lib/selectors';

export const DepartmentManagerDashboard = ({ selectedMonth }: { selectedMonth: string | 'ALL' }) => {
  const { currentUser } = useAuthStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();

  const deptProjects = projects.filter(p => {
    if (p.isDeleted || p.archiveStatus === 'ARCHIVED' || p.departmentId !== currentUser?.departmentId) return false;
    if (selectedMonth === 'ALL') return true;
    const dateStr = p.projectSourceType === 'INTERNAL_DEVELOPMENT' ? p.targetDate : p.deliveryDate;
    if (!dateStr) return false;
    return dateStr.startsWith(selectedMonth);
  });
  const deptTasks = tasks.filter(t => deptProjects.some(p => p.id === t.projectId));

  const urgentProjectsCount = deptProjects.filter(p => getDeliveryUrgencyBucket(p) === 'WITHIN_1_WEEK').length;
  const pendingApprovalsCount = deptTasks.filter(t => t.approvalStatus === 'PENDING').length;
  
  const delayedTasksCount = deptTasks.filter(t => {
    if (t.status === 'DONE') return false;
    if (!t.dueDate) return false;
    return t.dueDate < new Date().toISOString().split('T')[0];
  }).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">부서장 대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="부서 진행 프로젝트" value={deptProjects.length.toString()} icon={Briefcase} colorClass="bg-teal-500" />
        <SummaryCard title="긴급 납품 프로젝트" value={urgentProjectsCount.toString()} icon={AlertTriangle} colorClass="bg-red-500" />
        <SummaryCard title="부서 승인 대기" value={pendingApprovalsCount.toString()} icon={CheckCircle} colorClass="bg-blue-500" />
        <SummaryCard title="부서 지연 업무" value={delayedTasksCount.toString()} icon={Clock} colorClass="bg-orange-500" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">부서 프로젝트 현황</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-sm font-semibold text-gray-600">프로젝트명</th>
                <th className="p-3 text-sm font-semibold text-gray-600">상태</th>
                <th className="p-3 text-sm font-semibold text-gray-600">공정률</th>
                <th className="p-3 text-sm font-semibold text-gray-600">납품 예정일</th>
              </tr>
            </thead>
            <tbody>
              {deptProjects.map(p => {
                const progress = getProjectOverallProgress(p, tasks);
                const urgency = getDeliveryUrgencyBucket(p);
                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{p.title}</td>
                    <td className="p-3 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-bold">{p.status}</span>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span>{progress}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <span className={`${urgency === 'WITHIN_1_WEEK' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        {p.deliveryDate || '미정'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {deptProjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">부서에 배정된 프로젝트가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
