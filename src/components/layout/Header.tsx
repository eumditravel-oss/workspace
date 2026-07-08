'use client';
import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { mockUsers } from '@/data/mockData';
import { Bell, User, ListTodo, TrendingUp } from 'lucide-react';
import { getUserDisplayName } from '@/lib/localization';
import { NotificationPopover } from './NotificationPopover';

export const Header = () => {
  const { currentUser, loginAs, appMode, dataSourceMode, setAppMode } = useAuthStore();

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

  const getDeptName = () => {
    if (!currentUser) return '';
    if (currentUser.departmentName) return currentUser.departmentName;
    if (currentUser.teamName) return currentUser.teamName;
    if (currentUser.companyId === 'CON_COST') return '본사';
    if (currentUser.companyId === 'VIET_QS') return 'Viet_QS';
    return '소속 없음';
  };

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] h-14 flex items-center justify-between px-6 z-40 sticky top-0">
      <div className="flex items-center gap-3">
        <h2 className="text-[15px] font-semibold text-[var(--color-text-main)]">
          {currentUser ? `${getDeptName()} · ${getRoleName(currentUser.role)}` : '로그인 필요'}
        </h2>
        {currentUser && ['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(currentUser.role) && (
          <div className="flex bg-gray-100/80 rounded p-1 border border-[var(--color-border)] gap-1 ml-2">
            <button
              onClick={() => setAppMode('DAILY_WORK')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-colors ${
                appMode === 'DAILY_WORK'
                  ? 'bg-[var(--color-surface)] text-indigo-600 shadow-sm border border-[var(--color-border)]'
                  : 'text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]'
              }`}
            >
              실사용 모드
            </button>
            <button
              onClick={() => setAppMode('ADMIN_VALIDATION')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-colors ${
                appMode === 'ADMIN_VALIDATION'
                  ? 'bg-[var(--color-surface)] text-rose-600 shadow-sm border border-[var(--color-border)]'
                  : 'text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]'
              }`}
            >
              운영 검증
            </button>
          </div>
        )}
        <div className="ml-1 px-2 py-1 bg-[var(--color-bg)] text-[var(--color-text-sub)] text-[11px] font-semibold rounded border border-[var(--color-border)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          데이터: {dataSourceMode === 'JSON_OPERATION_DATA' ? 'JSON 운영' : 
                  dataSourceMode === 'DEMO_SEED_DATA' ? 'Demo Seed' :
                  dataSourceMode === 'EXCEL_IMPORT_DATA' ? 'Excel 임포트' : '비어 있음'}
        </div>
      </div>
      <div className="flex items-center gap-5">
        {/* Mock Login Switcher */}
        <select
          className="border border-[var(--color-border)] rounded-md px-2 py-1 text-xs bg-[var(--color-bg)] text-[var(--color-text-sub)] outline-none focus:border-indigo-500"
          value={currentUser?.id || ''}
          onChange={(e) => loginAs(e.target.value)}
        >
          {mockUsers.map(u => (
            <option key={u.id} value={u.id}>
              {getUserDisplayName(u)} ({u.jobTitle})
            </option>
          ))}
        </select>

        <div className="flex items-center gap-4 border-l border-[var(--color-border)] pl-4">
          <Link href="/approvals" className="hover:text-[var(--color-primary)] transition-colors flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-sub)]">
            <ListTodo className="w-4 h-4" /> 결재함
          </Link>
          <Link href="/evaluation" className="hover:text-[var(--color-primary)] transition-colors flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-sub)]">
            <TrendingUp className="w-4 h-4" /> 성과 평가
          </Link>

          <NotificationPopover />
        </div>

        <Link href="/settings" className="flex items-center gap-2 cursor-pointer hover:bg-[var(--color-bg)] px-2 py-1.5 rounded-md transition-colors ml-1">
          <div className="w-7 h-7 bg-indigo-50 text-[var(--color-primary)] rounded-full flex items-center justify-center font-bold border border-indigo-100">
            <User className="w-4 h-4" />
          </div>
          <span className="text-[13px] font-semibold text-[var(--color-text-main)]">{getUserDisplayName(currentUser)}</span>
        </Link>
      </div>
    </header>
  );
};
