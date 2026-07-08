'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSettingStore } from '@/store/settingStore';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { Settings, Save, Edit2 } from 'lucide-react';
import { exportWorkspaceData, downloadJson, saveDraftToLocalStorage, validateImportData, applyImportData } from '@/lib/jsonHandoff';

export default function WorkspaceSettingsPage() {
  const { currentUser } = useAuthStore();
  const { settings, updateSetting } = useSettingStore();
  const { projects, batchCloseOverdueProjects, loadDummyProjects } = useProjectStore();
  const { loadDummyTasks } = useTaskStore();
  
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState('');

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
      
      updateSetting(key, parsedValue, currentUser!.id);
      setEditingKey(null);
    } catch {
      alert('입력 형식이 올바르지 않습니다.');
    }
  };

  const handleSaveDraft = () => {
    saveDraftToLocalStorage();
    setSuccessMsg('로컬 임시 저장이 완료되었습니다.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExportJson = () => {
    const data = exportWorkspaceData();
    downloadJson(data, `workspace-export-${new Date().toISOString().slice(0,10)}.json`);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (validateImportData(json)) {
          applyImportData(json);
          setSuccessMsg('데이터 구조 확인 완료 (반영 로직은 미구현)');
        } else {
          alert('잘못된 형태의 JSON 파일입니다.');
        }
      } catch (err) {
        alert('JSON 파싱 실패');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const generateHandoffPackage = () => {
    const data = exportWorkspaceData();
    downloadJson(data, 'workspace-export.json');
    alert('다운로드된 workspace-export.json을 프로젝트의 /json 폴더에 덮어쓰기 해주세요.');
  };

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;
  if (!['SUPER_ADMIN', 'SYSTEM_ADMIN', 'DEPARTMENT_MANAGER', 'PM'].includes(currentUser.role)) {
    return <div className="p-6 text-red-600 font-bold">운영 설정을 볼 권한이 없습니다.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {successMsg && <div className="bg-green-100 text-green-700 p-3 rounded text-sm">{successMsg}</div>}
      <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border">
        <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">운영 설정을 볼 권한이 없습니다.</h1>
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
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">납품일이 경과한 프로젝트 일괄 완료 처리.</p>
          <button 
            onClick={() => {
              if (confirm('납품일이 지났고 미결 요청이 없는 프로젝트들을 완료 처리하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                batchCloseOverdueProjects(currentUser.id);
                setSuccessMsg('일괄 마감 처리가 완료되었습니다.');
                setTimeout(() => setSuccessMsg(''), 3000);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 transition"
          >
            일괄 마감 실행
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-200 mt-8">
        <h2 className="text-lg font-bold text-indigo-700 mb-2">개발/검증용 테스트 데이터 (Fixture)</h2>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">빈 화면(Empty State)을 채우기 위해, UI 시연을 위한 대량의 더미 프로젝트와 일정 데이터를 임시 주입합니다.</p>
          <button 
            onClick={() => {
              if (confirm('현재 편집 중인 데이터가 있을 경우 더미데이터와 혼합될 수 있습니다. 진행하시겠습니까?')) {
                loadDummyProjects();
                loadDummyTasks();
                setSuccessMsg('테스트 데이터 주입이 완료되었습니다.');
                setTimeout(() => setSuccessMsg(''), 3000);
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700 transition"
          >
            더미데이터 주입
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">데이터 관리 (Handoff)</h2>
        <p className="text-sm text-gray-500 mb-6">
          정적 웹 호스팅 환경(GitHub Pages 등)에서는 시스템 데이터를 저장소에 직접 쓸 수 없습니다.<br/>
          브라우저에서 작업한 데이터를 파일로 다운로드(Export)하여 프로젝트 내 <code>/json</code> 폴더에 넣고, 코드로 반영을 요청하세요.
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 border-b pb-6">
            <button onClick={handleSaveDraft} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
              브라우저 임시 저장
            </button>
            <button onClick={handleExportJson} className="px-4 py-2 border border-blue-500 text-blue-600 rounded text-sm hover:bg-blue-50">
              전체 JSON 내보내기
            </button>
            <label className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 cursor-pointer">
              JSON 불러오기
              <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
            </label>
            <button onClick={generateHandoffPackage} className="px-4 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-900">
              Antigravity 반영 패키지 생성
            </button>
          </div>
          
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded text-sm border border-yellow-200">
            <strong>안내:</strong> GitHub Pages 환경에서는 브라우저가 직접 저장소를 수정할 수 없습니다. 파일을 다운로드한 뒤 프로젝트의 <code>/json</code> 폴더에 복사하고 Antigravity에게 반영을 요청하세요.
          </div>
        </div>
      </div>
    </div>
  );
}
