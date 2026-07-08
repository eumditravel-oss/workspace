import React, { useState } from 'react';
import { TaskCard, ProgressUpdate } from '@/types/models';
import { useTaskStore } from '@/store/taskStore';
import { useEvaluationStore } from '@/store/evaluationStore';
import { useAuthStore } from '@/store/authStore';
import { useApprovalStore } from '@/store/approvalStore';
import { X, CheckSquare, Clock, FileText, History, ListTodo, AlertCircle, CheckCircle2, ShieldAlert, Plus, CalendarClock, Zap, CalendarDays } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QcIssueModal } from '@/components/evaluation/QcIssueModal';
import { calculateTaskHealthScore } from '@/lib/selectors';

interface TaskDetailModalProps {
  task: TaskCard;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [newProgress, setNewProgress] = useState(task.progress || 0);
  const [memo, setMemo] = useState('');
  const [newBlocker, setNewBlocker] = useState('');
  const [error, setError] = useState('');
  const [showQcModal, setShowQcModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const currentUser = useAuthStore(state => state.currentUser);
  const { updateTaskProgress, progressUpdates, checklists, artifacts, blockers, addBlocker, resolveBlocker, workSegments, addWorkSegment, deleteWorkSegment } = useTaskStore();
  const { qcIssues, appeals, addAppeal } = useEvaluationStore();
  const { addRequest } = useApprovalStore();

  const taskUpdates = progressUpdates.filter(u => u.taskId === task.id);
  const taskChecklists = checklists.filter(c => c.taskId === task.id);
  const taskArtifacts = artifacts.filter(a => a.taskId === task.id);
  const taskBlockers = blockers.filter(b => b.taskId === task.id);
  const taskQcIssues = qcIssues.filter(q => q.taskId === task.id);
  const taskSegments = workSegments.filter(w => w.taskId === task.id);

  const [newSegmentDesc, setNewSegmentDesc] = useState('');
  const [newSegmentStart, setNewSegmentStart] = useState('');
  const [newSegmentEnd, setNewSegmentEnd] = useState('');
  
  const healthScore = calculateTaskHealthScore(task, blockers, progressUpdates);
  const healthColor = healthScore >= 80 ? 'text-green-600 bg-green-50' 
                    : healthScore >= 50 ? 'text-yellow-600 bg-yellow-50' 
                    : 'text-red-600 bg-red-50';

  const handleUpdateProgress = () => {
    const currentProgress = task.progress || 0;
    const diff = Math.abs(newProgress - currentProgress);
    
    if (diff >= 20 && memo.trim().length < 5) {
      setError('진행률이 크게 변경되었습니다. 진행 내용을 자세히 메모해주세요 (5자 이상).');
      return;
    }

    if (!currentUser) return;

    updateTaskProgress(task.id, newProgress, currentUser.id, memo);
    setMemo('');
    setError('');
    alert('진행 내용이 기록되었습니다.');
  };

  const handleAddBlocker = () => {
    if (newBlocker.trim() === '') return;
    if (!currentUser) return;
    addBlocker({
      taskId: task.id,
      reporterId: currentUser.id,
      description: newBlocker
    });
    setNewBlocker('');
  };

  const handleAddSegment = () => {
    if (!newSegmentDesc || !newSegmentStart || !newSegmentEnd || !currentUser) return;
    
    // validate date range
    const tStart = task.startDate ? new Date(task.startDate).setHours(0,0,0,0) : 0;
    const tEnd = task.dueDate ? new Date(task.dueDate).setHours(23,59,59,999) : Infinity;
    const sStart = new Date(newSegmentStart).setHours(0,0,0,0);
    const sEnd = new Date(newSegmentEnd).setHours(23,59,59,999);
    
    if (tStart > 0 && sStart < tStart) {
      alert('세부 작업 시작일은 카드의 시작일보다 빠를 수 없습니다.');
      return;
    }
    if (tEnd !== Infinity && sEnd > tEnd) {
      alert('세부 작업 종료일은 카드의 마감일보다 늦을 수 없습니다.');
      return;
    }
    
    addWorkSegment({
      taskId: task.id,
      workerId: currentUser.id,
      description: newSegmentDesc,
      startDate: newSegmentStart,
      endDate: newSegmentEnd,
      progress: 0,
      status: 'RECORDED',
      isOvertime: false
    });
    setNewSegmentDesc('');
    setNewSegmentStart('');
    setNewSegmentEnd('');
  };

  const handleRequest = (type: 'OVERTIME_REQUEST' | 'DEADLINE_EXTENSION' | 'MANPOWER_SUPPORT') => {
    if (!currentUser) return;
    const reason = window.prompt(`신청 사유를 입력하세요.`);
    if (!reason) return;

    addRequest({
      type,
      taskId: task.id,
      projectId: task.projectId,
      requestedBy: currentUser.id,
      pmId: task.pmId,
      managerId: task.managerId,
      title: `[${type}] ${task.title} 관련 신청`,
      reason,
    });
    alert('신청이 완료되었습니다.');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!currentUser) return;
    handleFiles(Array.from(e.dataTransfer.files));
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files) return;
    handleFiles(Array.from(e.target.files));
  };

  const handleFiles = (files: File[]) => {
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`'${file.name}'의 용량이 10MB를 초과합니다.`);
        continue;
      }
      const allowedExtensions = /\.(pdf|jpe?g|png|xlsx|docx)$/i;
      if (!allowedExtensions.test(file.name)) {
        alert(`'${file.name}'은 지원하지 않는 파일 형식입니다. (PDF, JPG, PNG, XLSX, DOCX 허용)`);
        continue;
      }
      
      const objectUrl = URL.createObjectURL(file);
      useTaskStore.getState().addArtifact({
        taskId: task.id,
        title: file.name,
        url: objectUrl,
        type: 'FILE',
        addedBy: currentUser!.id
      });
    }
  };

  const handleAppeal = (issueId: string) => {
    if (!currentUser) return;
    const reason = window.prompt("해당 QC 결과(가중치 등)에 대한 이의신청 사유를 구체적으로 작성해주세요.");
    if (!reason) return;
    
    addAppeal({
      evaluationPeriodId: 'current',
      userId: currentUser.id,
      evaluationResultId: 'dummy_result_id',
      targetIssueId: issueId,
      reason,
      requestedBy: currentUser.id,
    });
    alert('이의신청이 접수되었습니다. 관리자가 검토 후 재조정 여부를 결정합니다.');
  };

  const tabs = [
    { id: 'OVERVIEW', label: '개요', icon: <FileText className="w-4 h-4" /> },
    { id: 'WORK_SEGMENTS', label: '세부 작업내역', icon: <ListTodo className="w-4 h-4" /> },
    { id: 'PROGRESS', label: '진행 내용', icon: <Clock className="w-4 h-4" /> },
    { id: 'CHECKLIST', label: '체크리스트', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'APPROVALS', label: '승인/신청', icon: <CalendarClock className="w-4 h-4" /> },
    { id: 'ARTIFACTS', label: '산출물', icon: <FileText className="w-4 h-4" /> },
    { id: 'EVALUATION', label: 'QC/평가', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'HISTORY', label: '이력', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-medium">Project {task.projectId} · {task.status}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${healthColor}`}>
                ♥ Health: {healthScore}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4 bg-white">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 custom-scrollbar">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">설명</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description || '설명이 없습니다.'}</p>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-12">
                <div>
                  <div className="text-xs text-gray-500 mb-1">담당자</div>
                  <div className="font-medium text-sm">{task.assigneeId || '미배정'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">마감일</div>
                  <div className="font-medium text-sm text-red-600">{task.dueDate || '-'}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-2">진행률</div>
                  <ProgressBar progress={task.progress || 0} showLabel colorClass="bg-blue-500" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PROGRESS' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Update Form */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4">진행 상황 업데이트</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">새 진행률</span>
                    <span className="font-bold text-blue-600">{newProgress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" step="5"
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-600 font-medium mb-2">진행 메모 (작업 내용, 특이사항)</label>
                  <textarea 
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className={`w-full p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors ${error ? 'border-red-400' : 'border-gray-200'}`}
                    rows={3}
                    placeholder="오늘 진행한 작업 내용이나 막힌 부분을 작성해주세요."
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleUpdateProgress}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    기록 저장
                  </button>
                </div>
              </div>

              {/* Blockers */}
              <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                <h3 className="text-sm font-bold text-red-700 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> 
                  장애 요소 (Blockers)
                </h3>
                
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={newBlocker}
                    onChange={(e) => setNewBlocker(e.target.value)}
                    placeholder="작업 진행을 막고 있는 장애물을 입력하세요"
                    className="flex-1 p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                  />
                  <button 
                    onClick={handleAddBlocker}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    추가
                  </button>
                </div>

                <div className="space-y-2">
                  {taskBlockers.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-2">등록된 장애 요소가 없습니다.</p>
                  ) : (
                    taskBlockers.map(blocker => (
                      <div key={blocker.id} className={`p-3 border rounded-lg flex justify-between items-start ${blocker.status === 'OPEN' ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50 opacity-60'}`}>
                        <div>
                          <p className={`text-sm ${blocker.status === 'OPEN' ? 'text-red-800 font-medium' : 'text-green-800 line-through'}`}>
                            {blocker.description}
                          </p>
                          <div className="text-xs mt-1 text-gray-500">
                            {blocker.reporterId} · {new Date(blocker.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {blocker.status === 'OPEN' && (
                          <button 
                            onClick={() => currentUser && resolveBlocker(blocker.id, currentUser.id)}
                            className="text-xs bg-white text-green-600 px-2 py-1 border border-green-200 rounded font-medium hover:bg-green-50"
                          >
                            해결 완료
                          </button>
                        )}
                        {blocker.status === 'RESOLVED' && (
                          <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> 해결됨
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 border-b pb-2">진행 이력 ({taskUpdates.length})</h3>
                {taskUpdates.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">기록된 진행 내용이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {taskUpdates.map(update => (
                      <div key={update.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-800">{update.authorId}</span>
                            <span className="text-xs text-gray-400">{new Date(update.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {update.progressBefore}% → <span className="text-blue-600">{update.progressAfter}%</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">{update.workSummary || '내용 없음'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'WORK_SEGMENTS' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4">세부 작업 등록</h3>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="date" 
                    value={newSegmentStart} 
                    onChange={e => setNewSegmentStart(e.target.value)} 
                    className="border rounded p-2 text-sm w-32" 
                  />
                  <span className="self-center">~</span>
                  <input 
                    type="date" 
                    value={newSegmentEnd} 
                    onChange={e => setNewSegmentEnd(e.target.value)} 
                    className="border rounded p-2 text-sm w-32" 
                  />
                  <input 
                    type="text" 
                    value={newSegmentDesc} 
                    onChange={e => setNewSegmentDesc(e.target.value)} 
                    placeholder="세부 작업 내용" 
                    className="flex-1 border rounded p-2 text-sm" 
                  />
                  <button onClick={handleAddSegment} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">
                    추가
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {taskSegments.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">등록된 세부 작업이 없습니다.</p>
                ) : (
                  taskSegments.map(seg => (
                    <div key={seg.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center shadow-sm">
                      <div>
                        <div className="text-sm font-semibold">{seg.description}</div>
                        <div className="text-xs text-gray-500">{seg.startDate} ~ {seg.endDate}</div>
                      </div>
                      <button onClick={() => deleteWorkSegment(seg.id)} className="text-red-500 text-xs hover:underline">
                        삭제
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'CHECKLIST' && (
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">체크리스트</h3>
              {taskChecklists.length === 0 ? (
                <p className="text-sm text-gray-400">등록된 항목이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {taskChecklists.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <input type="checkbox" checked={item.isCompleted} readOnly className="w-4 h-4 accent-blue-600" />
                      <span className={`text-sm ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {item.content}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'APPROVALS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => handleRequest('OVERTIME_REQUEST')}
                  className="p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition flex flex-col items-center text-orange-700"
                >
                  <Clock className="w-8 h-8 mb-2" />
                  <span className="font-bold">야근 / 연장근무 신청</span>
                </button>
                
                <button 
                  onClick={() => handleRequest('DEADLINE_EXTENSION')}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition flex flex-col items-center text-red-700"
                >
                  <CalendarDays className="w-8 h-8 mb-2" />
                  <span className="font-bold">일정 연장 신청</span>
                </button>
                
                <button 
                  onClick={() => handleRequest('MANPOWER_SUPPORT')}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition flex flex-col items-center text-purple-700"
                >
                  <Zap className="w-8 h-8 mb-2" />
                  <span className="font-bold">인력 지원 요청</span>
                </button>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">신청 내역</h3>
                <p className="text-sm text-gray-500">결재 관리 페이지에서 확인하실 수 있습니다.</p>
              </div>
            </div>
          )}

          {activeTab === 'ARTIFACTS' && (
            <div className="space-y-4">
              <div 
                className={`bg-white p-8 rounded-xl border-2 border-dashed transition-colors text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex justify-center mb-3 text-gray-400">
                  <FileText className="w-10 h-10" />
                </div>
                <h4 className="text-sm font-bold text-gray-700 mb-1">여기로 파일을 드래그하여 첨부하세요</h4>
                <p className="text-xs text-gray-500 mb-4">최대 10MB, PDF/JPG/PNG/XLSX/DOCX 지원</p>
                <label className="bg-blue-50 text-blue-700 px-4 py-2 rounded font-semibold text-sm cursor-pointer hover:bg-blue-100 transition">
                  파일 선택
                  <input type="file" multiple className="hidden" onChange={handleFileInput} accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx" />
                </label>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">산출물 목록</h3>
              {taskArtifacts.length === 0 ? (
                <p className="text-sm text-gray-400">등록된 산출물이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {taskArtifacts.map(art => (
                    <div key={art.id} className="flex justify-between items-center p-3 border rounded-lg hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{art.type}</span>
                        <a href={art.url} target="_blank" rel="noreferrer" className="text-sm text-gray-800 hover:text-blue-600 font-medium">
                          {art.title}
                        </a>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(art.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {activeTab === 'EVALUATION' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-red-800 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> QC 오류 목록
                  </h3>
                  <button 
                    onClick={() => setShowQcModal(true)}
                    className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors border border-red-200"
                  >
                    <Plus className="w-4 h-4" /> 오류 등록
                  </button>
                </div>
                
                {taskQcIssues.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">등록된 QC 오류가 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {taskQcIssues.map(issue => (
                      <div key={issue.id} className="p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors relative bg-gray-50/50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2 items-center">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">{issue.issueStage}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700">{issue.severity}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">가중치 {issue.weightPercent}%</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${issue.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {issue.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">{issue.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{issue.description}</p>
                        
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">보고자: {issue.reportedBy}</span>
                          <div className="flex gap-2 items-center">
                            {appeals.filter(a => a.targetIssueId === issue.id).map(appeal => (
                              <span key={appeal.id} className={`text-xs px-2 py-0.5 rounded font-bold ${
                                appeal.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                appeal.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                이의신청: {appeal.status}
                              </span>
                            ))}
                            {issue.assigneeId === currentUser?.id && !appeals.some(a => a.targetIssueId === issue.id && a.status === 'PENDING') && (
                              <button onClick={() => handleAppeal(issue.id)} className="text-xs text-indigo-600 font-bold hover:underline">
                                이의신청
                              </button>
                            )}
                            <span className="text-xs text-gray-400 font-mono ml-2">{new Date(issue.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="text-center py-10 text-sm text-gray-500">
              AuditLog 통합 이력 뷰 준비 중
            </div>
          )}

        </div>
      </div>
      {showQcModal && <QcIssueModal task={task} onClose={() => setShowQcModal(false)} />}
    </div>
  );
};
