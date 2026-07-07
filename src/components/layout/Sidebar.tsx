'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Briefcase, Calendar, CheckSquare, Bell, Settings, ClipboardList } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  const { currentUser } = useAuthStore();

  const menuItems = [
    { name: '통합 대시보드', path: '/', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
    { name: '수주 프로젝트', path: '/projects/intake', icon: Briefcase, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER'] },
    { name: '프로젝트 보드', path: '/projects', icon: ClipboardList, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
    { name: '일정 승인', path: '/approvals', icon: CheckSquare, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER'] },
    { name: '내 업무', path: '/tasks/my', icon: CheckSquare, roles: ['PM', 'WORKER'] },
    { name: '직원 일정표', path: '/schedules', icon: Calendar, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM'] },
    { name: '알림 센터', path: '/notifications', icon: Bell, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
    { name: '설정', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
  ];

  const visibleMenus = menuItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">EUMDI OS</h1>
        <p className="text-xs text-gray-400 mt-1">Project Management</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {visibleMenus.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
