'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { TaskCard } from '@/types/models';

export default function MyTasksPage() {
  const { currentUser } = useAuthStore();
  const { tasks, requestTaskCompletion, reviewTaskCompletion } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(null);
  const [memo, setMemo] = useState('');

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;
  if (!['WORKER', 'PM'].includes(currentUser.role)) {
    return <div className="p-6 text-red-500 font-bold">권한이 없습니다. 작업 담당자만 접근 가능합니다.</div>;
  }

  // Tasks assigned to me
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);

  // If PM, tasks I need to review
  const pendingReviews = tasks.filter(t => t.pmId === currentUser.id && t.completionStatus === 'PM_REVIEWING');

  const handleRequestCompletion = () => {
    if (selectedTask && memo) {
      requestTaskCompletion(selectedTask.id, memo);
      setSelectedTask(null);
      setMemo('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">내 할 일 목록</h1>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden p-6">
          {myTasks.length === 0 ? (
            <p className="text-gray-500 text-center">할당된 업무가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {myTasks.map(t => (
                <div key={t.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-800">{t.title}</h3>
                    <p className="text-sm text-gray-500">상태: {t.status} | 완료 진행: {t.completionStatus || 'NOT_STARTED'}</p>
                  </div>
                  {t.status === 'IN_PROGRESS' && (
                    <button 
                      onClick={() => setSelectedTask(t)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
                    >
                      완료 요청
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {currentUser.role === 'PM' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">내 검토 대기열 (PM)</h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden p-6">
            {pendingReviews.length === 0 ? (
              <p className="text-gray-500 text-center">검토할 업무가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map(t => (
                  <div key={t.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <h3 className="font-bold text-gray-800">{t.title}</h3>
                      <p className="text-sm text-gray-500 max-w-lg truncate">{t.description}</p>
                    </div>
                    <div className="space-x-2 flex">
                      <button 
                        onClick={() => reviewTaskCompletion(t.id, true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                      >
                        승인
                      </button>
                      <button 
                        onClick={() => reviewTaskCompletion(t.id, false)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                      >
                        반려
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="text-xl font-bold mb-4">완료 요청: {selectedTask.title}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">완료 메모 (필수)</label>
              <textarea 
                className="w-full border rounded-lg p-2" rows={4}
                value={memo} onChange={e => setMemo(e.target.value)}
                placeholder="산출물 링크 및 결과 요약을 입력하세요."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button 
                onClick={handleRequestCompletion}
                disabled={!memo.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                요청하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
