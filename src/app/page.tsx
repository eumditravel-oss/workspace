'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { DepartmentManagerDashboard } from '@/components/dashboard/DepartmentManagerDashboard';
import { PMDashboard } from '@/components/dashboard/PMDashboard';
import { WorkerDashboard } from '@/components/dashboard/WorkerDashboard';

export default function Home() {
  const { currentUser } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');

  if (!currentUser) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">통합 대시보드</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">조회 월 선택:</span>
          <select 
            className="border rounded px-3 py-1.5 bg-gray-50 text-sm font-medium"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          >
            <option value="ALL">전체 월</option>
            {[6, 7, 8].map(m => (
              <option key={m} value={m}>2026년 {m}월</option>
            ))}
          </select>
        </div>
      </div>
      
      {currentUser.role === 'SUPER_ADMIN' && <SuperAdminDashboard selectedMonth={selectedMonth} />}
      {currentUser.role === 'DEPARTMENT_MANAGER' && <DepartmentManagerDashboard selectedMonth={selectedMonth} />}
      {currentUser.role === 'PM' && <PMDashboard selectedMonth={selectedMonth} />}
      {currentUser.role === 'WORKER' && <WorkerDashboard selectedMonth={selectedMonth} />}
    </div>
  );
}
