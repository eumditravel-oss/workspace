'use client';
import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { DepartmentManagerDashboard } from '@/components/dashboard/DepartmentManagerDashboard';
import { PMDashboard } from '@/components/dashboard/PMDashboard';
import { WorkerDashboard } from '@/components/dashboard/WorkerDashboard';
import { useProjectStore } from '@/store/projectStore';
import { Download, Upload } from 'lucide-react';

export default function Home() {
  const { currentUser } = useAuthStore();
  const { projects } = useProjectStore();
  const [selectedMonth, setSelectedMonth] = useState<string | 'ALL'>('ALL');

  const getDeptName = () => {
    if (!currentUser) return '';
    if (currentUser.departmentName) return currentUser.departmentName;
    if (currentUser.teamName) return currentUser.teamName;
    if (currentUser.companyId === 'CON_COST') return '본사';
    if (currentUser.companyId === 'VIET_QS') return 'Viet_QS';
    return '소속 없음';
  };

  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      SUPER_ADMIN: '최고관리자',
      SYSTEM_ADMIN: '시스템관리자',
      DEPARTMENT_MANAGER: '부서장',
      PM: 'PM',
      WORKER: '작업자'
    };
    return roleMap[role] || role;
  };

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    projects.forEach(p => {
      const dateStr = p.deliveryDate || p.targetDate;
      if (dateStr && dateStr.length >= 7) {
        months.add(dateStr.substring(0, 7)); // "YYYY-MM"
      }
    });
    return Array.from(months).sort().reverse(); // 최신 월 순서로
  }, [projects]);

  if (!currentUser) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">통합 대시보드</h1>
          <p className="text-[var(--color-text-sub)] text-sm mt-1 font-medium">
            {getDeptName()} · {getRoleName(currentUser.role)} 기준 전체 업무 현황
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select 
            className="border border-[var(--color-border)] rounded-md px-3 py-1.5 bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-main)] shadow-sm outline-none focus:border-[var(--color-primary)] transition-colors"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="ALL">전체 월 조회</option>
            {availableMonths.map(m => {
              const [year, month] = m.split('-');
              return (
                <option key={m} value={m}>{year}년 {parseInt(month, 10)}월</option>
              );
            })}
          </select>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm font-medium text-[var(--color-text-main)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)] shadow-sm transition-colors">
            <Upload className="w-4 h-4 text-[var(--color-text-sub)]" />
            <span>JSON 불러오기</span>
          </button>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm font-medium text-[var(--color-text-main)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)] shadow-sm transition-colors">
            <Download className="w-4 h-4 text-[var(--color-text-sub)]" />
            <span>JSON 내보내기</span>
          </button>
        </div>
      </div>
      
      {currentUser.role === 'SUPER_ADMIN' && <SuperAdminDashboard selectedMonth={selectedMonth} />}
      {currentUser.role === 'DEPARTMENT_MANAGER' && <DepartmentManagerDashboard selectedMonth={selectedMonth} />}
      {currentUser.role === 'PM' && <PMDashboard selectedMonth={selectedMonth} />}
      {currentUser.role === 'WORKER' && <WorkerDashboard selectedMonth={selectedMonth} />}
    </div>
  );
}
