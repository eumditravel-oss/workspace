'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { LayoutDashboard, Briefcase, Calendar, CheckSquare, Bell, Settings, ClipboardList, ChevronLeft, AlertTriangle, Menu, ShieldCheck, Database, FileUp } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  const { currentUser, appMode } = useAuthStore();
  const { sidebarMode, cycleSidebarMode } = useUiStore();

  const dailyWorkMenuItems = [
    { name: '대시보드', path: '/', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
    { name: '프로젝트', path: '/projects/intake', icon: Briefcase, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER'] },
    { name: '보드', path: '/projects', icon: ClipboardList, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
    { name: '결재', path: '/approvals', icon: CheckSquare, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER'] },
    { name: '충돌', path: '/conflicts', icon: AlertTriangle, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM'] },
    { name: '내 업무', path: '/tasks/my', icon: CheckSquare, roles: ['PM', 'WORKER'] },
    { name: '일정표', path: '/schedules', icon: Calendar, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM'] },
    { name: '알림', path: '/notifications', icon: Bell, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
    { name: '설정', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM', 'WORKER'] },
  ];

  const adminValidationMenuItems = [
    { name: '운영 설정', path: '/settings/workspace', icon: Settings, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
    { name: 'Excel 검증', path: '/settings/import', icon: FileUp, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
    { name: '데이터 품질', path: '/settings/data-quality', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
    { name: '대량 수정', path: '/settings/bulk-edit', icon: Database, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
    { name: '권한 검증', path: '/settings/permissions', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
  ];

  const menuItems = appMode === 'ADMIN_VALIDATION' ? adminValidationMenuItems : dailyWorkMenuItems;

  const visibleMenus = menuItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  const isCompact = sidebarMode === 'COMPACT';
  const isExpanded = sidebarMode === 'EXPANDED';

  const widthClass = isExpanded ? 'w-[220px]' : isCompact ? 'w-16' : 'w-12';

  return (
    <div className={`${widthClass} bg-slate-50 border-r border-[var(--color-border)] text-[var(--color-text-main)] min-h-screen flex flex-col transition-all duration-300 relative z-50`}>
      <div className={`p-4 ${!isExpanded ? 'text-center flex justify-center' : ''} h-14 flex items-center border-b border-[var(--color-border)] bg-slate-50`}>
        <h1 className={`font-bold text-[var(--color-primary)] transition-all ${isExpanded ? 'text-xl tracking-tight' : isCompact ? 'text-lg' : 'text-xs truncate'}`}>
          {isExpanded ? 'EUMDI OS' : isCompact ? 'E' : 'E'}
        </h1>
      </div>
      {isExpanded && <div className="px-5 pt-4 pb-2"><p className="text-[11px] font-semibold text-[var(--color-text-sub)] uppercase tracking-wider">Workspace</p></div>}
      
      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {visibleMenus.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path} className={`flex items-center rounded-lg transition-all group relative ${!isExpanded ? 'justify-center py-3' : 'px-3 py-2.5'} ${isActive ? 'bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)]/50 text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-sub)] hover:bg-gray-200/50 hover:text-[var(--color-text-main)] font-medium border border-transparent'}`}>
              <item.icon className={`flex-shrink-0 ${isExpanded ? 'w-4 h-4 mr-3' : isCompact ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? 'text-[var(--color-primary)]' : ''}`} />
              {isExpanded && <span className="truncate text-[13px]">{item.name}</span>}
              
              {/* Tooltip for collapsed states */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap z-[100] shadow-lg">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={cycleSidebarMode}
        className="p-3 m-3 flex items-center justify-center text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] hover:bg-gray-100 rounded-md border border-[var(--color-border)] transition-colors"
        title="Toggle sidebar mode"
      >
        {!isExpanded ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );
};
