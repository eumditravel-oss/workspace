'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { LayoutDashboard, Briefcase, Calendar, CheckSquare, Bell, Settings, ClipboardList, ChevronLeft, AlertTriangle, Menu } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  const { currentUser } = useAuthStore();
  const { sidebarMode, cycleSidebarMode } = useUiStore();

  const menuItems = [
    { name: '통합 대시보드', path: '/', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
    { name: '수주 프로젝트', path: '/projects/intake', icon: Briefcase, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER'] },
    { name: '프로젝트 보드', path: '/projects', icon: ClipboardList, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
    { name: '일정 승인', path: '/approvals', icon: CheckSquare, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER'] },
    { name: '충돌 관리', path: '/conflicts', icon: AlertTriangle, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM'] },
    { name: '내 업무', path: '/tasks/my', icon: CheckSquare, roles: ['PM', 'WORKER'] },
    { name: '직원 일정표', path: '/schedules', icon: Calendar, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM'] },
    { name: '알림 센터', path: '/notifications', icon: Bell, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
    { name: '설정', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
  ];

  const visibleMenus = menuItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  const isCompact = sidebarMode === 'COMPACT';
  const isExpanded = sidebarMode === 'EXPANDED';

  const widthClass = isExpanded ? 'w-64' : isCompact ? 'w-20' : 'w-12';

  return (
    <div className={`${widthClass} bg-gray-900 text-white min-h-screen flex flex-col transition-all duration-300 relative z-50`}>
      <div className={`p-4 ${!isExpanded ? 'text-center flex justify-center' : ''} min-h-16 flex items-center`}>
        <h1 className={`font-bold text-white transition-all ${isExpanded ? 'text-2xl' : isCompact ? 'text-lg' : 'text-xs truncate'}`}>
          {isExpanded ? 'EUMDI OS' : isCompact ? 'E' : 'E'}
        </h1>
      </div>
      {isExpanded && <div className="px-6 pb-2"><p className="text-xs text-gray-400">Project Management</p></div>}
      
      <nav className="flex-1 px-2 space-y-2 mt-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {visibleMenus.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path} className={`flex items-center rounded-lg transition-colors group relative ${!isExpanded ? 'justify-center py-3' : 'px-4 py-3'} ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <item.icon className={`flex-shrink-0 ${isExpanded ? 'w-5 h-5 mr-3' : isCompact ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {isExpanded && <span className="truncate">{item.name}</span>}
              
              {/* Tooltip for collapsed states */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap z-[100]">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={cycleSidebarMode}
        className="p-4 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 border-t border-gray-800 transition-colors"
        title="Toggle sidebar mode"
      >
        {!isExpanded ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </div>
  );
};
