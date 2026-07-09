'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { canViewProject, canViewEmployeeSchedule } from '@/lib/permissions';
import { ShieldCheck, UserCircle, LayoutDashboard, CalendarDays, Eye, EyeOff } from 'lucide-react';
import { PermissionSimulationResult } from '@/types/models';

export default function PermissionSimulatorPage() {
  const { currentUser, users: personnel } = useAuthStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [targetScreen, setTargetScreen] = useState<'PROJECT_BOARD' | 'SCHEDULE'>('PROJECT_BOARD');
  
  const [result, setResult] = useState<PermissionSimulationResult | null>(null);

  if (!currentUser) return <div className="py-10 text-center text-[var(--color-text-sub)]">로그인이 필요합니다.</div>;
  if (!['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(currentUser.role)) {
    return <div className="py-10 text-center text-[var(--color-danger)] font-bold">접근 권한이 없습니다. (관리자 전용)</div>;
  }

  const handleSimulate = () => {
    if (!selectedUserId) return;
    const simUser = personnel.find(p => p.id === selectedUserId);
    if (!simUser) return;

    const visibleProjects: string[] = [];
    const hiddenProjects: string[] = [];
    const visibleEmployees: string[] = [];
    const hiddenEmployees: string[] = [];
    const warnings: string[] = [];

    if (targetScreen === 'PROJECT_BOARD') {
      projects.forEach(p => {
        if (canViewProject(simUser, p)) {
          // Worker-specific logic check: Worker can view project but actually sees only their tasks
          if (simUser.role === 'WORKER') {
            const hasMyTasks = tasks.some(t => t.projectId === p.id && t.assigneeId === simUser.id);
            if (hasMyTasks) visibleProjects.push(p.title);
            else {
              hiddenProjects.push(p.title);
              warnings.push(`[${p.title}] 부서 프로젝트이나, 워커 권한으로 할당된 업무가 없어 표시 차단됨.`);
            }
          } else {
            visibleProjects.push(p.title);
          }
        } else {
          hiddenProjects.push(p.title);
        }
      });
    } else if (targetScreen === 'SCHEDULE') {
      personnel.forEach(emp => {
        if (canViewEmployeeSchedule(simUser, emp)) {
          visibleEmployees.push(emp.name);
        } else {
          hiddenEmployees.push(emp.name);
        }
      });
      if (simUser.role === 'PM') warnings.push('PM은 프로젝트 멤버의 상세 개인 일정을 조회할 수 없습니다.');
    }

    setResult({
      id: `sim-${Date.now()}`,
      simulatedUserId: simUser.id,
      simulatedBy: currentUser.id,
      targetScreen,
      visibleProjects,
      hiddenProjects,
      visibleEmployees,
      hiddenEmployees,
      visibleSchedules: [],
      hiddenSchedules: [],
      warnings,
      createdAt: new Date().toISOString()
    });
  };

  const simUser = personnel.find(p => p.id === selectedUserId);

  return (
    <div className="w-full px-6 mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-main)]">권한 시뮬레이터</h1>
          <p className="text-sm text-[var(--color-text-sub)] mt-1">특정 사용자 계정으로 로그인했을 때 볼 수 있는 화면과 데이터를 미리 확인합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-[var(--color-surface)] p-5 rounded-xl border shadow-sm space-y-4">
            <h3 className="font-bold text-[var(--color-text-main)] border-b pb-2">시뮬레이션 조건 설정</h3>
            
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">대상 사용자</label>
              <select 
                value={selectedUserId} 
                onChange={e => setSelectedUserId(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-sm"
              >
                <option value="">사용자 선택...</option>
                {personnel.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">대상 화면</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setTargetScreen('PROJECT_BOARD')}
                  className={`flex items-center justify-center gap-2 py-2 border rounded-lg text-sm font-bold transition-colors ${targetScreen === 'PROJECT_BOARD' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'text-[var(--color-text-sub)] hover:bg-[var(--color-bg)]'}`}
                >
                  <LayoutDashboard className="w-4 h-4" /> 프로젝트 보드
                </button>
                <button 
                  onClick={() => setTargetScreen('SCHEDULE')}
                  className={`flex items-center justify-center gap-2 py-2 border rounded-lg text-sm font-bold transition-colors ${targetScreen === 'SCHEDULE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'text-[var(--color-text-sub)] hover:bg-[var(--color-bg)]'}`}
                >
                  <CalendarDays className="w-4 h-4" /> 직원 일정표
                </button>
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={!selectedUserId}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm transition-colors disabled:bg-gray-300"
            >
              시뮬레이션 실행
            </button>
          </div>

          {simUser && (
            <div className="bg-[var(--color-bg)] p-5 rounded-xl border">
              <h4 className="text-xs font-bold text-[var(--color-text-sub)] mb-3">선택된 사용자 프로필</h4>
              <div className="flex items-center gap-3 mb-2">
                <UserCircle className="w-10 h-10 text-[var(--color-text-sub)]" />
                <div>
                  <div className="font-bold text-[var(--color-text-main)]">{simUser.name}</div>
                  <div className="text-xs text-[var(--color-text-sub)]">{simUser.role} · {simUser.departmentId}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2">
          {!result ? (
            <div className="bg-[var(--color-surface)] rounded-xl border border-dashed border-[var(--color-border-strong)] h-full min-h-[400px] flex flex-col items-center justify-center text-[var(--color-text-sub)]">
              <ShieldCheck className="w-12 h-12 mb-3 text-gray-300" />
              <p>좌측에서 조건을 설정하고 시뮬레이션을 실행하세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {result.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm">
                  <h4 className="font-bold text-yellow-800 mb-2">⚠️ 권한 특이사항 (Warnings)</h4>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    {result.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-green-100 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-green-700 mb-4 border-b border-green-50 pb-2">
                    <Eye className="w-5 h-5" /> 열람 가능한 데이터
                  </h3>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                    {targetScreen === 'PROJECT_BOARD' ? (
                      result.visibleProjects.length ? result.visibleProjects.map((p, i) => (
                        <div key={i} className="text-sm px-2 py-1 bg-green-50 text-green-800 rounded">{p}</div>
                      )) : <div className="text-sm text-[var(--color-text-sub)]">열람 가능한 프로젝트가 없습니다.</div>
                    ) : (
                      result.visibleEmployees.length ? result.visibleEmployees.map((e, i) => (
                        <div key={i} className="text-sm px-2 py-1 bg-green-50 text-green-800 rounded">{e}</div>
                      )) : <div className="text-sm text-[var(--color-text-sub)]">조회 가능한 일정이 없습니다.</div>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-red-100 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-red-700 mb-4 border-b border-red-50 pb-2">
                    <EyeOff className="w-5 h-5" /> 접근 차단된 데이터
                  </h3>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                    {targetScreen === 'PROJECT_BOARD' ? (
                      result.hiddenProjects.length ? result.hiddenProjects.map((p, i) => (
                        <div key={i} className="text-sm px-2 py-1 bg-red-50 text-red-800 rounded">{p}</div>
                      )) : <div className="text-sm text-[var(--color-text-sub)]">차단된 프로젝트가 없습니다.</div>
                    ) : (
                      result.hiddenEmployees.length ? result.hiddenEmployees.map((e, i) => (
                        <div key={i} className="text-sm px-2 py-1 bg-red-50 text-red-800 rounded">{e}</div>
                      )) : <div className="text-sm text-[var(--color-text-sub)]">차단된 일정이 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
