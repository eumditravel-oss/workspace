'use client';
import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { mockUsers } from '@/data/mockData';
import { Bell, User, ListTodo, TrendingUp } from 'lucide-react';
import { getUserDisplayName } from '@/lib/localization';
import { NotificationPopover } from './NotificationPopover';

export const Header = () => {
  const { currentUser, loginAs } = useAuthStore();

  return (
    <header className="bg-white border-b h-14 flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {currentUser ? `${currentUser.departmentName} - ${currentUser.role}` : '로그인 필요'}
        </h2>
        {currentUser && ['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(currentUser.role) && (
          <div className="flex bg-gray-100 rounded-lg p-1 border">
            <button
              onClick={() => useAuthStore.getState().setAppMode('DAILY_WORK')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                useAuthStore.getState().appMode === 'DAILY_WORK'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              실사용 모드
            </button>
            <button
              onClick={() => useAuthStore.getState().setAppMode('ADMIN_VALIDATION')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                useAuthStore.getState().appMode === 'ADMIN_VALIDATION'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              운영 검증 모드
            </button>
          </div>
        )}
        <div className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded border border-blue-200">
          데이터: {useAuthStore.getState().dataSourceMode === 'JSON_OPERATION_DATA' ? 'JSON 운영' : 
                  useAuthStore.getState().dataSourceMode === 'DEMO_SEED_DATA' ? 'DEMO 시드' :
                  useAuthStore.getState().dataSourceMode === 'EXCEL_IMPORT_DATA' ? 'EXCEL 임포트' : 'EMPTY'}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* Mock Login Switcher */}
        <select
          className="border rounded px-3 py-1 text-sm bg-gray-50"
          value={currentUser?.id || ''}
          onChange={(e) => loginAs(e.target.value)}
        >
          {mockUsers.map(u => (
            <option key={u.id} value={u.id}>
              {getUserDisplayName(u)} ({u.jobTitle})
            </option>
          ))}
        </select>

        <Link href="/approvals" className="hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium text-gray-600">
          <ListTodo className="w-4 h-4" /> 결재함
        </Link>
        <Link href="/evaluation" className="hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium text-gray-600">
          <TrendingUp className="w-4 h-4" /> 성과 평가
        </Link>

        <NotificationPopover />
        <Link href="/settings" className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-gray-700">{getUserDisplayName(currentUser)}</span>
        </Link>
      </div>
    </header>
  );
};
