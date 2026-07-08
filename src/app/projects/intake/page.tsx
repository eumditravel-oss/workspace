'use client';

import React, { useState } from 'react';
import { Project, PersonnelCard, ProjectSourceType } from '@/types/models';
import { useAuthStore } from '@/store/authStore';
import { getUserDisplayName, useTranslation } from '@/lib/localization';
import { useProjectStore } from '@/store/projectStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useTranslationStore } from '@/store/translationStore';
import { mockUsers } from '@/data/mockData';

export default function IntakePage() {
  const { currentUser } = useAuthStore();
  const { settings } = useTranslationStore();
  const t = useTranslation(settings.uiLanguage);
  const { projects, addProject, assignPM, updateProjectField } = useProjectStore();
  const { addNotification } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState<ProjectSourceType>('CLIENT_ORDER');
  const [showForm, setShowForm] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'URGENT'|'HIGH'|'NORMAL'|'LOW'>('NORMAL');
  const [newStartDate, setNewStartDate] = useState('');
  const [newDeliveryDate, setNewDeliveryDate] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newClientName, setNewClientName] = useState(''); // for requester

  // Authorization Check
  if (!currentUser) return <div className="py-10 text-center text-[var(--color-text-sub)]">로그인이 필요합니다.</div>;
  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'DEPARTMENT_MANAGER') {
    return <div className="py-10 text-center text-[var(--color-danger)] font-bold">권한이 없습니다. (최고관리자 및 부서장만 접근 가능)</div>;
  }

  const pms = mockUsers.filter(u => u.role === 'PM');
  const intakeProjects = projects.filter(p => (p.status === 'INTAKE_RECEIVED' || p.status === 'MANAGER_REVIEW') && (p.projectSourceType || 'CLIENT_ORDER') === activeTab);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    
    const payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'progress'> = {
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      departmentId: currentUser.departmentId,
      startDate: newStartDate || undefined,
      projectSourceType: activeTab,
    };

    if (activeTab === 'CLIENT_ORDER') {
      payload.deliveryDate = newDeliveryDate || undefined;
    } else {
      payload.targetDate = newTargetDate || undefined;
      payload.clientName = newClientName || undefined;
    }

    addProject(payload);
    console.log(`[AuditLog] Project created: ${newTitle} (Source: ${activeTab}) by ${currentUser?.name}`);
    
    setNewTitle('');
    setNewDesc('');
    setNewPriority('NORMAL');
    setNewStartDate('');
    setNewDeliveryDate('');
    setNewTargetDate('');
    setNewClientName('');
    setShowForm(false);
  };

  const handleAssignPM = (projectId: string, pmId: string) => {
    assignPM(projectId, pmId);
    console.log(`[AuditLog] PM ${pmId} assigned to project ${projectId} by ${currentUser?.name}`);
    
    addNotification({
      userId: pmId,
      type: 'PROJECT_ASSIGNED',
      title: '새 프로젝트 PM 배정',
      message: `새로운 프로젝트에 PM으로 배정되었습니다. 보드를 확인하세요.`,
      priority: 'HIGH',
      relatedProjectId: projectId,
    });
  };

  const isClient = activeTab === 'CLIENT_ORDER';

  return (
    <div className="max-w-5xl w-full mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* Tabs */}
      <div className="flex gap-4 mb-4 mt-8">
        <button
          onClick={() => { setActiveTab('CLIENT_ORDER'); setShowForm(false); }}
          className={`px-4 py-2 font-medium rounded-md transition-colors ${
            activeTab === 'CLIENT_ORDER'
              ? 'bg-[var(--color-primary)] text-[var(--color-surface)] shadow-md'
              : 'bg-[var(--color-bg-sub)] text-[var(--color-text-sub)] hover:bg-gray-200'
          }`}
        >
          {t('orderProjectManagement')}
        </button>
        <button
          onClick={() => { setActiveTab('INTERNAL_DEVELOPMENT'); setShowForm(false); }}
          className={`px-4 py-2 font-medium rounded-md transition-colors ${
            activeTab === 'INTERNAL_DEVELOPMENT'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-[var(--color-bg-sub)] text-[var(--color-text-sub)] hover:bg-gray-200'
          }`}
        >
          {t('devTaskListManagement')}
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-main)]">
          {isClient ? '수주 프로젝트 관리' : '개발팀 업무 리스트 관리'}
        </h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-bold"
        >
          {showForm ? '취소' : isClient ? '새 프로젝트 등록' : '새 개발팀 업무 등록'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">{isClient ? '프로젝트명' : '업무명'}</label>
            <input 
              type="text" required 
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">설명</label>
            <textarea 
              value={newDesc} onChange={e => setNewDesc(e.target.value)}
              className="w-full border rounded-lg p-2" rows={3}
            />
          </div>
          {!isClient && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">요청자 또는 담당 부서</label>
              <input 
                type="text" 
                value={newClientName} onChange={e => setNewClientName(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="예: 영업팀, 홍길동 매니저"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">우선순위</label>
              <select 
                value={newPriority} onChange={e => setNewPriority(e.target.value as 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW')}
                className="w-full border rounded-lg p-2"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">{isClient ? '시작일' : '시작 예정일'}</label>
              <input 
                type="date" 
                value={newStartDate} onChange={e => setNewStartDate(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">{isClient ? '납품 예정일' : '목표일'}</label>
              <input 
                type="date" 
                value={isClient ? newDeliveryDate : newTargetDate} 
                onChange={e => isClient ? setNewDeliveryDate(e.target.value) : setNewTargetDate(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold mt-4">
            등록하기
          </button>
        </form>
      )}

      <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg)] border-b">
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">{isClient ? '프로젝트명' : '업무명'}</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">상태</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">우선순위</th>
              {!isClient && <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">요청자/부서</th>}
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">시작일</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">{isClient ? '납품일' : '목표일'}</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">{isClient ? 'PM 배정' : 'PM 또는 책임자 배정'}</th>
            </tr>
          </thead>
          <tbody>
            {intakeProjects.length === 0 ? (
              <tr>
                <td colSpan={isClient ? 6 : 7} className="p-6 text-center text-[var(--color-text-sub)]">
                  {isClient ? '대기 중인 수주 프로젝트가 없습니다.' : '대기 중인 개발팀 업무가 없습니다.'}
                </td>
              </tr>
            ) : (
              intakeProjects.map(p => (
                <tr key={p.id} className="border-b hover:bg-[var(--color-bg)]">
                  <td className="p-4 font-medium text-[var(--color-text-main)]">{p.title}</td>
                  <td className="p-4 text-sm text-[var(--color-text-sub)]">{p.status}</td>
                  <td className="p-4 text-sm text-[var(--color-text-sub)]">{p.priority}</td>
                  {!isClient && (
                    <td className="p-4 text-sm text-[var(--color-text-sub)]">
                      {p.clientName || '-'}
                    </td>
                  )}
                  <td className="p-4">
                    <input 
                      type="date" 
                      className="border rounded p-2 text-sm"
                      value={p.startDate || ''}
                      onChange={(e) => updateProjectField(p.id, 'startDate', e.target.value)}
                    />
                  </td>
                  <td className="p-4">
                    <input 
                      type="date" 
                      className="border rounded p-2 text-sm"
                      value={isClient ? (p.deliveryDate || '') : (p.targetDate || '')}
                      onChange={(e) => updateProjectField(p.id, isClient ? 'deliveryDate' : 'targetDate', e.target.value)}
                    />
                  </td>
                  <td className="p-4">
                    <select
                      className="border rounded px-2 py-1 text-sm bg-[var(--color-bg)]"
                      value={p.pmId || ''}
                      onChange={(e) => handleAssignPM(p.id, e.target.value)}
                    >
                      <option value="" disabled>{isClient ? 'PM 배정 필요' : '책임자 배정 필요'}</option>
                      {pms.map(pm => (
                        <option key={pm.id} value={pm.id}>{getUserDisplayName(pm)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

