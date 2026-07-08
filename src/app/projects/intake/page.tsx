'use client';

import React, { useState } from 'react';
import { Project, PersonnelCard } from '@/types/models';
import { useAuthStore } from '@/store/authStore';
import { getUserDisplayName } from '@/lib/localization';
import { useProjectStore } from '@/store/projectStore';
import { mockUsers } from '@/data/mockData';

export default function IntakePage() {
  const { currentUser } = useAuthStore();
  const { projects, addProject, assignPM, updateProjectField } = useProjectStore();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'URGENT'|'HIGH'|'NORMAL'|'LOW'>('NORMAL');
  const [newDeliveryDate, setNewDeliveryDate] = useState('');

  // Authorization Check
  if (!currentUser) return <div className="py-10 text-center text-[var(--color-text-sub)]">로그인이 필요합니다.</div>;
  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'DEPARTMENT_MANAGER') {
    return <div className="py-10 text-center text-[var(--color-danger)] font-bold">권한이 없습니다. (최고관리자 및 부서장만 접근 가능)</div>;
  }

  const pms = mockUsers.filter(u => u.role === 'PM');
  const intakeProjects = projects.filter(p => p.status === 'INTAKE_RECEIVED' || p.status === 'MANAGER_REVIEW');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    addProject({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      departmentId: currentUser.departmentId,
      deliveryDate: newDeliveryDate || undefined,
    });
    setNewTitle('');
    setNewDesc('');
    setNewPriority('NORMAL');
    setNewDeliveryDate('');
    setShowForm(false);
  };

  return (
    <div className="max-w-5xl w-full mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-main)]">수주 프로젝트 관리</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          {showForm ? '취소' : '새 프로젝트 등록'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">프로젝트명</label>
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
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">납품 예정일</label>
            <input 
              type="date" 
              value={newDeliveryDate} onChange={e => setNewDeliveryDate(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold">
            등록하기
          </button>
        </form>
      )}

      <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg)] border-b">
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">프로젝트명</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">상태</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">우선순위</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">시작일</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">납품일</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">PM 배정</th>
            </tr>
          </thead>
          <tbody>
            {intakeProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[var(--color-text-sub)]">대기 중인 수주 프로젝트가 없습니다.</td>
              </tr>
            ) : (
              intakeProjects.map(p => (
                <tr key={p.id} className="border-b hover:bg-[var(--color-bg)]">
                  <td className="p-4 font-medium text-[var(--color-text-main)]">{p.title}</td>
                  <td className="p-4 text-sm text-[var(--color-text-sub)]">{p.status}</td>
                  <td className="p-4 text-sm text-[var(--color-text-sub)]">{p.priority}</td>
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
                      value={p.deliveryDate || ''}
                      onChange={(e) => updateProjectField(p.id, 'deliveryDate', e.target.value)}
                    />
                  </td>
                  <td className="p-4">
                    <select
                      className="border rounded px-2 py-1 text-sm bg-[var(--color-bg)]"
                      value={p.pmId || ''}
                      onChange={(e) => assignPM(p.id, e.target.value)}
                    >
                      <option value="" disabled>PM 배정 필요</option>
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
