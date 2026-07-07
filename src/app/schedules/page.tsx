'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useScheduleStore } from '@/store/scheduleStore';

export default function SchedulesPage() {
  const { currentUser } = useAuthStore();
  const { schedules } = useScheduleStore();

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;
  if (['WORKER'].includes(currentUser.role)) {
    return <div className="p-6 text-red-500 font-bold">권한이 없습니다. 관리자 및 PM만 전체 일정표를 볼 수 있습니다.</div>;
  }

  // Filter based on role
  const visibleSchedules = schedules.filter(s => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'DEPARTMENT_MANAGER') return s.departmentId === currentUser.departmentId;
    if (currentUser.role === 'PM') return s.visibility !== 'MANAGER_ONLY' && s.visibility !== 'SUPER_ADMIN_ONLY';
    return false;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">직원 일정표</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 text-sm font-semibold text-gray-600">제목</th>
              <th className="p-4 text-sm font-semibold text-gray-600">작성자 Role</th>
              <th className="p-4 text-sm font-semibold text-gray-600">시작 일시</th>
              <th className="p-4 text-sm font-semibold text-gray-600">종료 일시</th>
              <th className="p-4 text-sm font-semibold text-gray-600">상태</th>
            </tr>
          </thead>
          <tbody>
            {visibleSchedules.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">등록된 일정이 없습니다.</td>
              </tr>
            ) : (
              visibleSchedules.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{s.title}</td>
                  <td className="p-4 text-sm text-gray-500">{s.ownerRole}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(s.startDateTime).toLocaleString()}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(s.endDateTime).toLocaleString()}</td>
                  <td className="p-4 text-sm font-bold text-indigo-600">{s.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
