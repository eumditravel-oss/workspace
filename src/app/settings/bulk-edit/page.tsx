'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useBulkEditStore } from '@/store/bulkEditStore';
import { Database, Edit, History, AlertTriangle } from 'lucide-react';

export default function BulkEditPage() {
  const { currentUser } = useAuthStore();
  const { sessions, createSession, updateSessionStatus } = useBulkEditStore();
  
  const [targetEntity, setTargetEntity] = useState<string>('PROJECT');
  const [targetField, setTargetField] = useState<string>('PM_ASSIGNMENT');
  const [newValue, setNewValue] = useState<string>('');
  
  if (!currentUser) return <div className="py-10 text-center text-[var(--color-text-sub)]">로그인이 필요합니다.</div>;
  if (!['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(currentUser.role)) {
    return <div className="py-10 text-center text-[var(--color-danger)] font-bold">운영 설정을 볼 권한이 없습니다. (관리자 전용)</div>;
  }

  const activePreview = sessions.find(s => s.status === 'PREVIEW');

  const handleGeneratePreview = () => {
    if (!newValue) {
      alert('변경할 값을 입력하세요.');
      return;
    }
    
    // 모의 미리보기 생성
    createSession({
      targetEntityType: targetEntity,
      totalItems: targetEntity === 'PROJECT' ? 45 : 120,
      changedItems: Math.floor(Math.random() * 20) + 1,
      createdBy: currentUser.id,
    });
  };

  const handleApply = () => {
    if (!activePreview) return;
    const confirm = window.confirm('대량 수정을 실제 데이터에 반영하시겠습니까?\n평가 Lock이 걸린 데이터는 자동으로 제외됩니다.');
    if (confirm) {
      updateSessionStatus(activePreview.id, 'APPLIED', new Date().toISOString());
      alert('성공적으로 일괄 변경되었습니다. (AuditLog 저장 완료)');
      setNewValue('');
    }
  };

  const handleCancel = () => {
    if (!activePreview) return;
    updateSessionStatus(activePreview.id, 'CANCELLED');
  };

  return (
    <div className="max-w-6xl w-full mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-main)]">대량 수정 (Bulk Edit)</h1>
          <p className="text-sm text-[var(--color-text-sub)] mt-1">Excel import 이후 파편화된 데이터(PM, 부서, 납품일, Scope 등)를 일괄 수정합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="font-bold text-[var(--color-text-main)] border-b pb-2 flex items-center gap-2">
              <Edit className="w-4 h-4" /> 수정 대상 선택
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">대상 엔티티</label>
                <select 
                  value={targetEntity} onChange={e => setTargetEntity(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  disabled={!!activePreview}
                >
                  <option value="PROJECT">프로젝트 (Project)</option>
                  <option value="PERSONNEL">직원 (PersonnelCard)</option>
                  <option value="SCHEDULE">일정 (ScheduleAssignment)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">변경할 속성(필드)</label>
                <select 
                  value={targetField} onChange={e => setTargetField(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  disabled={!!activePreview}
                >
                  {targetEntity === 'PROJECT' && (
                    <>
                      <option value="PM_ASSIGNMENT">PM 일괄 변경</option>
                      <option value="DEPARTMENT">담당 부서 일괄 변경</option>
                      <option value="DUE_DATE">납품일 일괄 지정</option>
                    </>
                  )}
                  {targetEntity === 'PERSONNEL' && (
                    <>
                      <option value="DEPARTMENT">부서 이동</option>
                      <option value="ROLE">권한(Role) 변경</option>
                    </>
                  )}
                  {targetEntity === 'SCHEDULE' && (
                    <>
                      <option value="SCOPE_NORMALIZATION">Scope 정규화명 일괄 변경</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">변경될 새 값</label>
                <input 
                  type="text" 
                  value={newValue} onChange={e => setNewValue(e.target.value)}
                  placeholder="새로운 값 입력..."
                  className="w-full border rounded-lg p-2.5 text-sm"
                  disabled={!!activePreview}
                />
              </div>
            </div>

            {!activePreview ? (
              <button 
                onClick={handleGeneratePreview}
                className="w-full py-2.5 mt-2 bg-gray-800 hover:bg-black text-white rounded-lg font-bold shadow-sm transition-colors"
              >
                미리보기 생성
              </button>
            ) : (
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={handleApply}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-colors"
                >
                  실제 반영
                </button>
                <button 
                  onClick={handleCancel}
                  className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-[var(--color-text-main)] rounded-lg font-bold transition-colors"
                >
                  취소
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-3">
          {activePreview ? (
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border shadow-sm space-y-4">
              <h3 className="font-bold text-[var(--color-text-main)] border-b pb-2">변경 미리보기 (Preview)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--color-bg)] p-4 rounded-lg border text-center">
                  <div className="text-sm text-[var(--color-text-sub)] font-bold">전체 대상 항목</div>
                  <div className="text-3xl font-extrabold text-[var(--color-text-main)] mt-1">{activePreview.totalItems}</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-center">
                  <div className="text-sm text-emerald-600 font-bold">실제 변경될 항목</div>
                  <div className="text-3xl font-extrabold text-emerald-700 mt-1">{activePreview.changedItems}</div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4" /> 주의사항
                </div>
                이미 성과 평가가 종료되어 <strong>Lock이 걸린 데이터</strong>는 대량 수정 대상에서 자동으로 제외되었습니다.
                하단의 반영 버튼을 누르기 전에 수치가 의도와 맞는지 확인하세요.
              </div>

              <div className="mt-4 p-4 border rounded-lg bg-[var(--color-bg)] text-sm text-[var(--color-text-sub)] text-center">
                변경 전/후 상세 데이터 표 (Mock)
              </div>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border shadow-sm space-y-4">
              <h3 className="font-bold text-[var(--color-text-main)] border-b pb-2 flex items-center gap-2">
                <History className="w-4 h-4" /> 최근 대량 수정 이력
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {sessions.filter(s => s.status !== 'PREVIEW').map(session => (
                  <div key={session.id} className="p-4 border rounded-lg flex justify-between items-center bg-[var(--color-bg)]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${session.status === 'APPLIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-[var(--color-text-main)]'}`}>
                          {session.status}
                        </span>
                        <span className="text-sm font-bold text-[var(--color-text-main)]">엔티티: {session.targetEntityType}</span>
                      </div>
                      <div className="text-xs text-[var(--color-text-sub)]">
                        총 {session.totalItems}건 중 {session.changedItems}건 변경
                      </div>
                    </div>
                    <div className="text-xs text-right text-[var(--color-text-sub)]">
                      {new Date(session.createdAt).toLocaleString()} <br/>
                      By: {session.createdBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
