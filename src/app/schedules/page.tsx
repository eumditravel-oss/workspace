'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useProjectStore } from '@/store/projectStore';
import { PersonalSchedule, Project } from '@/types/models';
import { getUserDisplayName } from '@/lib/localization';

export default function SchedulesPage() {
  const { currentUser, users } = useAuthStore();
  const { schedules } = useScheduleStore();
  const { projects } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'MONTHLY_MATRIX' | 'PROJECT_SCHEDULE' | 'USER_DETAIL'>('MONTHLY_MATRIX');
  
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;
  if (['WORKER'].includes(currentUser.role)) {
    return <div className="p-6 text-red-500 font-bold">권한이 없습니다. 관리자 및 PM만 전체 일정표를 볼 수 있습니다.</div>;
  }

  // Filter based on role
  const visibleSchedules = schedules.filter(s => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'DEPARTMENT_MANAGER') return s.departmentId === currentUser.departmentId;
    if (currentUser.role === 'PM') return s.visibility !== 'MANAGER_ONLY' && s.visibility !== 'SUPER_ADMIN_ONLY';
    return false;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const coversDate = (s: PersonalSchedule, d: number) => {
    const targetDate = new Date(year, month, d).setHours(0,0,0,0);
    const start = new Date(s.startDateTime).setHours(0,0,0,0);
    const end = new Date(s.endDateTime).setHours(0,0,0,0);
    return targetDate >= start && targetDate <= end;
  };

  const getScheduleColor = (type: string) => {
    if (type === 'OFF') return 'bg-red-100 text-red-800 border-red-200';
    if (type === 'MEETING' || type === 'CLIENT_MEETING') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type === 'PERSONAL_WORK') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold text-gray-800">통합 일정표</h1>
        
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'MONTHLY_MATRIX' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('MONTHLY_MATRIX')}
          >
            직원 월간 그리드
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'PROJECT_SCHEDULE' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('PROJECT_SCHEDULE')}
          >
            프로젝트 타임라인
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'USER_DETAIL' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('USER_DETAIL')}
          >
            직원별 상세
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        <div className="flex justify-between items-center">
          <button onClick={prevMonth} className="p-2 bg-gray-100 rounded hover:bg-gray-200">&lt; 이전 달</button>
          <h2 className="text-lg font-bold">{year}년 {month + 1}월</h2>
          <button onClick={nextMonth} className="p-2 bg-gray-100 rounded hover:bg-gray-200">다음 달 &gt;</button>
        </div>

        {activeTab === 'MONTHLY_MATRIX' && (
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gray-50 border p-2 text-sm text-gray-600 min-w-[120px] z-10">직원명</th>
                  {daysArray.map(d => (
                    <th key={d} className="border p-2 text-xs font-medium text-gray-500 text-center min-w-[40px]">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const userSchedules = visibleSchedules.filter(s => s.userId === user.id);
                  if (userSchedules.length === 0) return null;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white group-hover:bg-gray-50 border p-2 text-sm font-bold text-gray-800 z-10 shadow-[1px_0_0_0_#e5e7eb]">
                        {getUserDisplayName(user)}
                      </td>
                      {daysArray.map(d => {
                        const daySchedules = userSchedules.filter(s => coversDate(s, d));
                        return (
                          <td key={d} className="border p-1 align-top h-[40px]">
                            {daySchedules.map(ds => (
                              <div key={ds.id} className={`text-[10px] p-1 rounded border mb-1 truncate ${getScheduleColor(ds.scheduleType)}`} title={ds.title}>
                                {ds.scheduleType === 'OFF' ? 'OFF' : ds.title.substring(0, 4)}
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'PROJECT_SCHEDULE' && (
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gray-50 border p-2 text-sm text-gray-600 min-w-[200px] z-10">프로젝트명</th>
                  {daysArray.map(d => (
                    <th key={d} className="border p-2 text-xs font-medium text-gray-500 text-center min-w-[40px]">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.filter(p => !p.isDeleted && p.archiveStatus !== 'ARCHIVED').map(project => {
                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white border p-2 text-sm font-bold text-gray-800 z-10 shadow-[1px_0_0_0_#e5e7eb]">
                        {project.title}
                      </td>
                      {daysArray.map(d => {
                        const targetDate = new Date(year, month, d).setHours(0,0,0,0);
                        const start = project.startDate ? new Date(project.startDate).setHours(0,0,0,0) : null;
                        const end = project.deliveryDate ? new Date(project.deliveryDate).setHours(0,0,0,0) : (project.dueDate ? new Date(project.dueDate).setHours(0,0,0,0) : null);
                        
                        let isActive = false;
                        if (start && end && targetDate >= start && targetDate <= end) isActive = true;
                        
                        return (
                          <td key={d} className={`border p-1 ${isActive ? 'bg-indigo-100' : ''}`}>
                            {targetDate === start && <div className="text-[10px] font-bold text-indigo-700">시작</div>}
                            {targetDate === end && <div className="text-[10px] font-bold text-red-600">납품</div>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'USER_DETAIL' && (
          <div className="text-center p-12 text-gray-500">
            직원별 상세 목록 뷰 (준비 중)
          </div>
        )}
      </div>
    </div>
  );
}
