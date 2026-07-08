'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSettingStore } from '@/store/settingStore';
import { useProjectStore } from '@/store/projectStore';
import { Settings, Save, Edit2 } from 'lucide-react';

export default function WorkspaceSettingsPage() {
  const { currentUser } = useAuthStore();
  const { settings, updateSetting } = useSettingStore();
  
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;
  if (!['SUPER_ADMIN', 'SYSTEM_ADMIN', 'DEPARTMENT_MANAGER', 'PM'].includes(currentUser.role)) {
    return <div className="p-6 text-red-600 font-bold">운영 설정을 볼 권한이 없습니다.</div>;
  }

  const handleEditClick = (key: string, value: unknown) => {
    setEditingKey(key);
    setEditValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
  };

  const handleSave = (key: string, originalValue: unknown) => {
    try {
      let parsedValue: string | number | boolean | Record<string, string> = editValue;
      if (typeof originalValue === 'number') parsedValue = Number(editValue);
      if (typeof originalValue === 'boolean') parsedValue = editValue === 'true';
      if (typeof originalValue === 'object') parsedValue = JSON.parse(editValue);
      
      updateSetting(key, parsedValue, currentUser.id);
      setEditingKey(null);
    } catch {
      alert('입력 형식이 올바르지 않습니다.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border">
        <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">운영 설정 (Workspace Settings)</h1>
          <p className="text-sm text-gray-500 mt-1">시스템의 주요 정책 및 기준값을 변경합니다. (AuditLog 자동 기록)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden divide-y">
        {settings.map(setting => {
          const canEdit = setting.editableByRoles.includes(currentUser.role);
          const isEditing = editingKey === setting.key;
          
          return (
            <div key={setting.id} className="p-6 flex flex-col gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded mb-2">
                    {setting.category}
                  </span>
                  <h3 className="font-bold text-gray-800">{setting.key}</h3>
                  <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                </div>
                
                {canEdit && !isEditing && (
                  <button onClick={() => handleEditClick(setting.key, setting.value)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between items-center">
                {isEditing ? (
                  <div className="w-full flex gap-3">
                    {typeof setting.value === 'object' ? (
                      <textarea 
                        value={editValue} onChange={e => setEditValue(e.target.value)}
                        className="w-full border rounded p-2 text-sm font-mono h-24"
                      />
                    ) : (
                      <input 
                        type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
                        className="w-full border rounded p-2 text-sm font-mono"
                      />
                    )}
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => handleSave(setting.key, setting.value)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded shadow-sm hover:bg-indigo-700 flex items-center justify-center gap-1">
                        <Save className="w-3 h-3" /> 저장
                      </button>
                      <button onClick={() => setEditingKey(null)} className="px-3 py-1.5 border text-gray-600 text-xs font-bold rounded hover:bg-gray-100">
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex justify-between items-end">
                    <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                      {typeof setting.value === 'object' ? JSON.stringify(setting.value, null, 2) : String(setting.value)}
                    </pre>
                    <div className="text-[10px] text-gray-400 font-mono text-right shrink-0">
                      Last Updated: {new Date(setting.updatedAt).toLocaleString()}<br/>
                      By: {setting.updatedBy}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 mt-8">
        <h2 className="text-lg font-bold text-red-700 mb-2">위험 작업 (Danger Zone)</h2>
        <p className="text-sm text-gray-600 mb-4">납품일이 경과한 진행 중 프로젝트를 일괄적으로 완료(COMPLETED) 처리합니다. 이 작업은 Project.status를 강제로 변경하며 AuditLog가 남습니다.</p>
        <button 
          onClick={() => {
            const { projects, batchCloseOverdueProjects } = useProjectStore.getState();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const overdueCount = projects.filter(p => {
              if (['COMPLETED', 'ARCHIVED'].includes(p.status)) return false;
              if (!p.deliveryDate) return false;
              const delivery = new Date(p.deliveryDate);
              delivery.setHours(0, 0, 0, 0);
              const diffTime = delivery.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays < 0;
            }).length;

            if (overdueCount === 0) {
              alert('현재 납품일이 경과하여 마감 처리가 필요한 프로젝트가 없습니다.');
              return;
            }

            if (confirm(`납품일이 경과한 프로젝트 ${overdueCount}건 중, 미결 요청이 없는 프로젝트를 찾아 일괄 완료 처리하시겠습니까?`)) {
              const result = batchCloseOverdueProjects(currentUser.id);
              alert(`${result.totalClosed}건의 프로젝트가 일괄 마감 처리되었습니다.`);
            }
          }}
          className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 font-bold rounded shadow-sm hover:bg-red-100 transition-colors"
        >
          일괄 마감 미리보기 및 실행
        </button>
      </div>
    </div>
  );
}
