'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useImportStore } from '@/store/importStore';
import { AlertCircle, FileUp, Info, Play, AlertTriangle, ShieldAlert } from 'lucide-react';
import { applyImportData, WorkspaceExportData } from '@/lib/jsonHandoff';

export default function ImportPreviewPage() {
  const { currentUser } = useAuthStore();
  const { sessions, issues, updateSessionStatus, resolveIssue, ignoreIssue } = useImportStore();
  
  const [activeSessionId] = useState<string>(sessions[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ISSUES' | 'PERSONNEL_MATCH' | 'PROJECT_MATCH'>('OVERVIEW');

  if (!currentUser) return <div className="py-10 text-center text-[var(--color-text-sub)]">로그인이 필요합니다.</div>;
  if (!['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(currentUser.role)) {
    return <div className="py-10 text-center text-[var(--color-danger)] font-bold">접근 권한이 없습니다. (관리자 전용)</div>;
  }

  const session = sessions.find(s => s.id === activeSessionId);
  const sessionIssues = issues.filter(i => i.importSessionId === activeSessionId);

  const blockerCount = sessionIssues.filter(i => i.severity === 'BLOCKER' && i.status === 'OPEN').length;
  const warningCount = sessionIssues.filter(i => i.severity === 'WARNING' && i.status === 'OPEN').length;

  const handleApply = () => {
    if (blockerCount > 0) {
      alert('BLOCKER 레벨의 이슈가 남아있어 적용할 수 없습니다. 먼저 해결해주세요.');
      return;
    }
    const confirm = window.confirm('미리보기 검증이 완료되었습니다. 이 데이터를 시스템에 반영하시겠습니까? (이 작업은 되돌릴 수 없습니다)');
    if (confirm && session) {
      // In a real scenario, pendingData would be set when a file is uploaded.
      // Since it's mock for now, we only apply if pendingData exists.
      const { pendingData } = useImportStore.getState();
      if (pendingData) {
        applyImportData(pendingData as WorkspaceExportData);
      } else {
        // Fallback for mock demo: just set status without applying data
        alert('실제 파싱된 데이터(pendingData)가 없으므로 상태만 완료로 변경합니다.');
      }
      updateSessionStatus(session.id, 'APPLIED');
    }
  };

  return (
    <div className="w-full px-6 mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--color-surface)] p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-main)]">Excel Import 검증 (미리보기)</h1>
            <p className="text-xs text-[var(--color-text-sub)]">대량의 데이터를 시스템에 반영하기 전 오류와 매핑 상태를 확인합니다.</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg text-sm font-bold text-[var(--color-text-main)] hover:bg-[var(--color-bg)]">
            새 파일 업로드
          </button>
          <button 
            onClick={handleApply}
            disabled={!session || session.status === 'APPLIED' || blockerCount > 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-colors ${
              !session || session.status === 'APPLIED' || blockerCount > 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <Play className="w-4 h-4" />
            {session?.status === 'APPLIED' ? '적용 완료' : 'Seed Data에 반영'}
          </button>
        </div>
      </div>

      {!session ? (
        <div className="bg-[var(--color-surface)] p-12 rounded-xl border text-center text-[var(--color-text-sub)]">
          활성화된 Import 세션이 없습니다. 새 파일을 업로드하세요.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="col-span-1 space-y-4">
            <div className="bg-[var(--color-surface)] rounded-xl border shadow-sm p-4">
              <h3 className="font-bold text-[var(--color-text-main)] mb-4 border-b pb-2">세션 요약</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-sub)]">파일</span>
                  <span className="font-medium text-[var(--color-text-main)] truncate ml-2" title={session.fileName}>{session.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-sub)]">대상 시트</span>
                  <span className="font-medium text-[var(--color-text-main)]">{session.targetSheet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-sub)]">상태</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    session.status === 'APPLIED' ? 'bg-green-100 text-green-700' :
                    session.status === 'VALIDATED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold text-[var(--color-text-main)]">
                  <span>총 감지된 행</span>
                  <span>{session.totalRows.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-xl border shadow-sm p-2 flex flex-col gap-1">
              {[
                { id: 'OVERVIEW', label: '대시보드 요약' },
                { id: 'ISSUES', label: `오류 / 경고 (${sessionIssues.length})` },
                { id: 'PERSONNEL_MATCH', label: '직원 매칭' },
                { id: 'PROJECT_MATCH', label: '프로젝트 & Scope' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'OVERVIEW' | 'ISSUES' | 'PERSONNEL_MATCH' | 'PROJECT_MATCH')}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-[var(--color-text-sub)] hover:bg-[var(--color-bg)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-3 space-y-4">
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[var(--color-surface)] p-4 rounded-xl border shadow-sm">
                    <div className="text-[var(--color-text-sub)] text-xs font-bold mb-1">총 할당(일정) 건수</div>
                    <div className="text-2xl font-extrabold text-[var(--color-text-main)]">{session.totalAssignments.toLocaleString()}</div>
                  </div>
                  <div className="bg-[var(--color-surface)] p-4 rounded-xl border shadow-sm">
                    <div className="text-[var(--color-text-sub)] text-xs font-bold mb-1">인식된 직원</div>
                    <div className="text-2xl font-extrabold text-[var(--color-text-main)]">{session.totalPersonnel}</div>
                  </div>
                  <div className="bg-[var(--color-surface)] p-4 rounded-xl border shadow-sm">
                    <div className="text-[var(--color-text-sub)] text-xs font-bold mb-1">인식된 프로젝트</div>
                    <div className="text-2xl font-extrabold text-[var(--color-text-main)]">{session.totalProjects}</div>
                  </div>
                  <div className="bg-[var(--color-surface)] p-4 rounded-xl border shadow-sm bg-red-50/50">
                    <div className="text-red-500 text-xs font-bold mb-1">BLOCKER 이슈</div>
                    <div className="text-2xl font-extrabold text-red-600">{blockerCount}</div>
                  </div>
                </div>

                <div className="bg-[var(--color-surface)] rounded-xl border shadow-sm p-6">
                  <h3 className="font-bold text-[var(--color-text-main)] mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-500" />
                    다음 단계를 진행하세요
                  </h3>
                  <p className="text-sm text-[var(--color-text-sub)] mb-4 leading-relaxed">
                    시스템이 엑셀 파일을 읽고 임시 데이터 구조를 생성했습니다. <br/>
                    왼쪽의 <strong>[오류 / 경고]</strong> 탭을 클릭하여 매핑이 실패했거나 위험한 데이터(예: 존재하지 않는 직원, 정규화되지 않은 Scope 등)가 없는지 확인하세요.
                    모든 <strong>BLOCKER</strong> 이슈를 해결해야 시스템에 반영할 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'ISSUES' && (
              <div className="bg-[var(--color-surface)] rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-[var(--color-bg)] flex justify-between items-center">
                  <h3 className="font-bold text-[var(--color-text-main)]">오류 및 경고 목록</h3>
                  <div className="flex gap-4 text-sm font-medium">
                    <span className="text-red-600 flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> Blocker: {blockerCount}</span>
                    <span className="text-orange-500 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Warning: {warningCount}</span>
                  </div>
                </div>
                <div className="divide-y">
                  {sessionIssues.map(issue => (
                    <div key={issue.id} className={`p-4 transition-colors ${issue.status === 'RESOLVED' ? 'opacity-50 bg-[var(--color-bg)]' : 'hover:bg-[var(--color-bg)]'}`}>
                      <div className="flex gap-4">
                        <div className="pt-1">
                          {issue.severity === 'BLOCKER' ? <ShieldAlert className="w-5 h-5 text-red-500" /> :
                           issue.severity === 'ERROR' ? <AlertCircle className="w-5 h-5 text-orange-500" /> :
                           <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-bold text-sm ${issue.severity === 'BLOCKER' ? 'text-red-700' : 'text-[var(--color-text-main)]'}`}>
                              [{issue.issueType}] {issue.title}
                            </h4>
                            <div className="flex gap-2">
                              {issue.status === 'OPEN' && (
                                <>
                                  <button onClick={() => ignoreIssue(issue.id, currentUser.id)} className="text-xs px-2 py-1 rounded border text-[var(--color-text-sub)] hover:bg-gray-100">무시</button>
                                  <button onClick={() => resolveIssue(issue.id, currentUser.id)} className="text-xs px-2 py-1 rounded border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold">해결 처리</button>
                                </>
                              )}
                              {issue.status !== 'OPEN' && (
                                <span className="text-xs font-bold text-[var(--color-text-sub)] border px-2 py-1 rounded">{issue.status}</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-[var(--color-text-sub)] mt-1">{issue.description}</p>
                          {issue.suggestedFix && (
                            <div className="mt-3 text-xs bg-blue-50 text-blue-800 p-2 rounded border border-blue-100">
                              <span className="font-bold">가이드:</span> {issue.suggestedFix}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-[var(--color-text-sub)] font-mono">
                            위치: Sheet &quot;{issue.sourceSheet || 'N/A'}&quot;, Row {issue.sourceRow || 'N/A'} {issue.sourceColumn ? `, Col ${issue.sourceColumn}` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {sessionIssues.length === 0 && (
                    <div className="p-12 text-center text-[var(--color-text-sub)]">발견된 오류나 경고가 없습니다.</div>
                  )}
                </div>
              </div>
            )}

            {(activeTab === 'PERSONNEL_MATCH' || activeTab === 'PROJECT_MATCH') && (
              <div className="bg-[var(--color-surface)] p-12 rounded-xl border shadow-sm text-center text-[var(--color-text-sub)]">
                {activeTab === 'PERSONNEL_MATCH' ? '직원 매칭 목록(모의)' : '프로젝트 및 Scope 매칭 목록(모의)'} <br/> (데이터 시각화 준비 중)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
