'use client';

import React, { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useEvaluationStore } from '@/store/evaluationStore';
import { mockEvaluationPolicy } from '@/data/seed/evaluationSeed';
import { generatePerformanceEvaluation } from '@/lib/evaluation/engine';
import { WorkloadUnit, PerformanceEvaluationResult } from '@/lib/evaluation/types';
import { ShieldAlert, CheckCircle2, Lock, Unlock, Search, TrendingUp } from 'lucide-react';

export default function EvaluationPage() {
  const { currentUser, users } = useAuthStore();
  const { qcIssues, appeals, updateAppealStatus, updateQcIssueWeight } = useEvaluationStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  // MVP: Generate mock workload units (assuming each worker has 100 base workload)
  const mockWorkloads = useMemo(() => {
    return users.map(u => ({
      id: `wl_${u.id}`,
      evaluationPeriodId: 'default_period',
      userId: u.id,
      workloadType: 'MANUAL',
      baseWorkload: 100,
      finalWorkload: 100,
      source: 'MANUAL',
      createdAt: new Date().toISOString()
    } as WorkloadUnit));
  }, [users]);

  // Generate results on the fly
  const evalResults = useMemo(() => {
    const results: PerformanceEvaluationResult[] = users.map(user => 
      generatePerformanceEvaluation(
        user.id, 
        'default_period', 
        user.departmentId, 
        qcIssues, 
        mockWorkloads, 
        mockEvaluationPolicy
      )
    );
    return results;
  }, [users, qcIssues, mockWorkloads]);

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;

  // Filter based on roles
  const visibleResults = evalResults.filter(res => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'DEPARTMENT_MANAGER') return res.departmentId === currentUser.departmentId;
    return res.userId === currentUser.id;
  });

  const filteredResults = visibleResults.filter(res => 
    res.userId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    res.departmentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgScore = filteredResults.length > 0 
    ? filteredResults.reduce((sum, r) => sum + r.qualityScore, 0) / filteredResults.length
    : 0;

  const myResult = evalResults.find(r => r.userId === currentUser.id);

  const pendingAppeals = appeals.filter(a => a.status === 'PENDING');
  
  const handleReviewAppeal = (appealId: string, isAccepted: boolean) => {
    const appeal = appeals.find(a => a.id === appealId);
    if (!appeal) return;

    const comment = window.prompt(isAccepted ? '수용 사유를 입력하세요.' : '기각 사유를 입력하세요.');
    if (comment === null) return;

    if (isAccepted) {
      const newWeightStr = window.prompt('조정할 새 가중치(%)를 입력하세요. (예: 50, 0)', '0');
      if (newWeightStr && !isNaN(Number(newWeightStr))) {
        if (appeal.targetIssueId) {
          updateQcIssueWeight(appeal.targetIssueId, Number(newWeightStr));
        }
      }
    }

    updateAppealStatus(appealId, isAccepted ? 'ACCEPTED' : 'REJECTED', currentUser.id, comment);
    alert('이의신청이 처리되었습니다.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" /> 성과 평가 (2026 1차 운영안)
          </h1>
          <p className="text-sm text-gray-500 mt-1">QC 오류율 및 작업량 기반 다면 평가 현황</p>
        </div>
        
        {currentUser.role === 'SUPER_ADMIN' && (
          <button 
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${isLocked ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {isLocked ? '평가 결과 잠금 해제' : '평가 확정 및 잠금'}
          </button>
        )}
      </div>

      {(currentUser.role === 'WORKER' || currentUser.role === 'PM') && myResult && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
          <h2 className="text-lg font-bold text-blue-900 mb-4">나의 평가 요약</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 mb-1">인정 작업량</div>
              <div className="text-2xl font-bold text-gray-800">{myResult.totalWorkload}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 mb-1">가중 오류 건수</div>
              <div className="text-2xl font-bold text-red-600">{myResult.totalWeightedErrorCount.toFixed(1)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 mb-1">QC 오류율</div>
              <div className="text-2xl font-bold text-orange-600">{myResult.weightedErrorRate.toFixed(2)}%</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-blue-200">
              <div className="text-xs text-gray-500 mb-1">최종 품질 점수</div>
              <div className="text-3xl font-black text-blue-700">{myResult.qualityScore}점</div>
            </div>
          </div>
        </div>
      )}

      {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'DEPARTMENT_MANAGER') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">부서원 평가 목록</h2>
            <div className="flex gap-4 items-center">
              <span className="text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full border">
                평균 점수: {avgScore.toFixed(1)}점
              </span>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="사용자명/부서 검색"
                  className="pl-9 pr-4 py-1.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="p-4">작업자</th>
                  <th className="p-4">부서</th>
                  <th className="p-4 text-right">작업량</th>
                  <th className="p-4 text-right">단순 오류</th>
                  <th className="p-4 text-right">가중 오류</th>
                  <th className="p-4 text-right">오류율(%)</th>
                  <th className="p-4 text-right">품질 점수</th>
                  <th className="p-4 text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredResults.map(res => (
                  <tr key={res.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{res.userId}</td>
                    <td className="p-4 text-gray-600">{res.departmentId}</td>
                    <td className="p-4 text-right font-mono">{res.totalWorkload}</td>
                    <td className="p-4 text-right font-mono">{res.totalRawErrorCount}</td>
                    <td className="p-4 text-right font-mono text-red-600">{res.totalWeightedErrorCount.toFixed(1)}</td>
                    <td className="p-4 text-right font-mono text-orange-600 font-medium">{res.weightedErrorRate.toFixed(2)}%</td>
                    <td className="p-4 text-right font-bold text-blue-700">{res.qualityScore}점</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isLocked ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {isLocked ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {isLocked ? '확정' : '계산중'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">결과가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'DEPARTMENT_MANAGER') && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden mt-6">
          <div className="p-5 border-b border-orange-100 bg-orange-50 flex justify-between items-center">
            <h2 className="font-bold text-orange-800">대기 중인 이의신청 건 ({pendingAppeals.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-orange-50/50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="p-4">신청자</th>
                  <th className="p-4">관련 오류(대상)</th>
                  <th className="p-4">이의신청 사유</th>
                  <th className="p-4 text-center">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingAppeals.map(appeal => {
                  const issue = qcIssues.find(i => i.id === appeal.targetIssueId);
                  return (
                    <tr key={appeal.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 font-medium text-gray-800">{appeal.requestedBy}</td>
                      <td className="p-4 text-gray-600">
                        {issue ? `[${issue.issueStage}] ${issue.title} (기존 가중치: ${issue.weightPercent}%)` : '알 수 없음'}
                      </td>
                      <td className="p-4 text-gray-800 max-w-sm truncate" title={appeal.reason}>{appeal.reason}</td>
                      <td className="p-4 text-center space-x-2">
                        <button onClick={() => handleReviewAppeal(appeal.id, true)} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700">수용</button>
                        <button onClick={() => handleReviewAppeal(appeal.id, false)} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700">기각</button>
                      </td>
                    </tr>
                  );
                })}
                {pendingAppeals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">대기 중인 이의신청이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
