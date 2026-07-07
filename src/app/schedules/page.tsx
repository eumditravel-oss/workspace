'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { PersonalSchedule, Project, TaskCard } from '@/types/models';
import { getUserDisplayName } from '@/lib/localization';
import { canViewSchedule, canViewEmployeeSchedule } from '@/lib/permissions';
import { LeaveRegistrationModal } from '@/components/schedule/LeaveRegistrationModal';

export default function SchedulesPage() {
  const { currentUser, users } = useAuthStore();
  const { schedules } = useScheduleStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  
  const [activeTab, setActiveTab] = useState<'MONTHLY_MATRIX' | 'PROJECT_SCHEDULE' | 'USER_DETAIL'>('MONTHLY_MATRIX');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;

  const visibleUsers = users.filter(u => canViewEmployeeSchedule(currentUser, u));

  // Filter based on role and rules
  const visibleSchedules = schedules.filter(s => {
    const targetUser = users.find(u => u.id === s.userId);
    return canViewSchedule(currentUser, s, targetUser);
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

  const coversDateTask = (t: TaskCard, d: number) => {
    if (!t.startDate || !t.dueDate) return false;
    const targetDate = new Date(year, month, d).setHours(0,0,0,0);
    const start = new Date(t.startDate).setHours(0,0,0,0);
    const end = new Date(t.dueDate).setHours(0,0,0,0);
    return targetDate >= start && targetDate <= end;
  };

  const getScheduleColor = (type: string) => {
    if (type === 'OFF') return 'bg-red-100 text-red-800 border-red-200';
    if (type === 'MEETING' || type === 'CLIENT_MEETING') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type === 'PERSONAL_WORK') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const isToday = (d: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  };

  const getDayType = (d: number) => {
    const date = new Date(year, month, d);
    const day = date.getDay(); // 0 is Sunday, 6 is Saturday
    if (day === 0) return 'SUN';
    if (day === 6) return 'SAT';
    return 'WEEKDAY';
  };

  const getDayHeaderClass = (d: number) => {
    if (isToday(d)) return 'bg-yellow-100 text-yellow-800 border-yellow-400 font-bold shadow-inner';
    const type = getDayType(d);
    if (type === 'SUN') return 'bg-red-50 text-red-500';
    if (type === 'SAT') return 'bg-blue-50 text-blue-500';
    return 'bg-gray-50 text-gray-500 font-medium';
  };

  const getDayCellClass = (d: number) => {
    if (isToday(d)) return 'bg-yellow-50/30 border-yellow-200';
    const type = getDayType(d);
    if (type === 'SUN') return 'bg-red-50/30';
    if (type === 'SAT') return 'bg-blue-50/30';
    return 'bg-white';
  };

  const getTaskBarClass = (t: TaskCard, d: number) => {
    if (!t.startDate || !t.dueDate) return '';
    const targetDate = new Date(year, month, d).setHours(0,0,0,0);
    const start = new Date(t.startDate).setHours(0,0,0,0);
    const end = new Date(t.dueDate).setHours(0,0,0,0);
    
    let classes = "text-[10px] p-1 mb-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-default transition-all ";
    
    // Status colors
    if (t.status === 'DONE') classes += "bg-green-100 text-green-800 border-green-200 ";
    else if (t.status === 'IN_PROGRESS') classes += "bg-indigo-100 text-indigo-800 border-indigo-200 ";
    else if (t.status === 'REVIEW') classes += "bg-purple-100 text-purple-800 border-purple-200 ";
    else if (t.priority === 'URGENT') classes += "bg-orange-100 text-orange-800 border-orange-200 ";
    else classes += "bg-white text-gray-700 border-gray-200 ";

    // Bar ends logic
    if (targetDate === start && targetDate === end) {
      classes += "rounded border mx-0.5 ";
    } else if (targetDate === start) {
      classes += "rounded-l border-y border-l ml-0.5 border-r-0 ";
    } else if (targetDate === end) {
      classes += "rounded-r border-y border-r mr-0.5 border-l-0 ";
    } else {
      classes += "border-y border-x-0 mx-0 ";
    }
    
    return classes;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold text-gray-800">통합 일정표</h1>
        
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'MONTHLY_MATRIX' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('MONTHLY_MATRIX')}
          >
            직원 월간 그리드
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'PROJECT_SCHEDULE' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('PROJECT_SCHEDULE')}
          >
            프로젝트 타임라인
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'USER_DETAIL' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('USER_DETAIL')}
          >
            직원별 상세
          </button>
          
          <button 
            className="px-4 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 ml-4 shadow-sm"
            onClick={() => setShowLeaveModal(true)}
          >
            + 휴가/일정 등록
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-sm font-medium transition-colors">&lt; 이전 달</button>
            <select
              className="border rounded-lg p-2 bg-white text-sm font-bold border-gray-300 focus:ring-2 focus:ring-indigo-500"
              value={month}
              onChange={(e) => setCurrentDate(new Date(year, Number(e.target.value), 1))}
            >
              {[0, 1, 2, 3, 4, 5, 6].map(m => (
                <option key={m} value={m}>2026년 {m + 1}월</option>
              ))}
            </select>
            <button onClick={nextMonth} className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-sm font-medium transition-colors">다음 달 &gt;</button>
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">{year}년 {month + 1}월</h2>
        </div>

        {activeTab === 'MONTHLY_MATRIX' && (
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className="sticky left-0 bg-white border-b-2 border-r-2 border-gray-200 p-3 text-sm font-bold text-gray-700 min-w-[140px] z-30 shadow-[1px_0_0_0_#e5e7eb]">
                    직원명
                  </th>
                  {daysArray.map(d => (
                    <th key={d} className={`border-b-2 border-r p-2 text-xs text-center min-w-[48px] ${getDayHeaderClass(d)}`}>
                      <div className="flex flex-col items-center gap-0.5">
                        <span>{d}</span>
                        <span className="text-[9px] opacity-70">
                          {['일', '월', '화', '수', '목', '금', '토'][new Date(year, month, d).getDay()]}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map(user => {
                  const userSchedules = visibleSchedules.filter(s => s.userId === user.id);
                  const userTasks = tasks.filter(t => t.assigneeId === user.id && !t.isDeleted);
                  if (userSchedules.length === 0 && userTasks.length === 0) return null;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="sticky left-0 bg-white group-hover:bg-gray-50/50 border-b border-r-2 p-3 text-sm font-bold text-gray-800 z-10 shadow-[1px_0_0_0_#e5e7eb]">
                        {getUserDisplayName(user)}
                        <div className="text-[10px] font-normal text-gray-500">{user.teamName || user.departmentName}</div>
                      </td>
                      {daysArray.map(d => {
                        const daySchedules = userSchedules.filter(s => coversDate(s, d));
                        const dayTasks = userTasks.filter(t => coversDateTask(t, d));
                        
                        return (
                          <td key={d} className={`border-b border-r p-1 align-top h-[60px] ${getDayCellClass(d)} transition-colors hover:bg-gray-100/50`}>
                            {daySchedules.map(ds => (
                              <div key={ds.id} className={`text-[10px] p-1 font-bold rounded border mb-1 truncate shadow-sm cursor-help ${getScheduleColor(ds.scheduleType)}`} title={`[${ds.scheduleType}] ${ds.title}\n${ds.startDateTime.substring(0,10)} ~ ${ds.endDateTime.substring(0,10)}\n${ds.description || ''}`}>
                                {ds.scheduleType === 'OFF' ? '휴가' : (ds.scheduleType === 'MEETING' ? '미팅' : ds.title.substring(0, 4))}
                              </div>
                            ))}
                            {dayTasks.map(dt => {
                              const isStart = new Date(dt.startDate!).setHours(0,0,0,0) === new Date(year, month, d).setHours(0,0,0,0);
                              return (
                                <div 
                                  key={dt.id} 
                                  className={getTaskBarClass(dt, d)} 
                                  title={`[${dt.status}] ${dt.title}\n기간: ${dt.startDate} ~ ${dt.dueDate}\n진행률: ${dt.progress || 0}%`}
                                >
                                  <div className="truncate px-1">
                                    {isStart ? dt.title : '\u00A0'}
                                  </div>
                                </div>
                              );
                            })}
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
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className="sticky left-0 bg-gray-50 border-b-2 border-r p-2 text-sm font-bold text-gray-700 min-w-[200px] z-30 shadow-[1px_0_0_0_#e5e7eb]">프로젝트명</th>
                  {daysArray.map(d => (
                    <th key={d} className={`border-b-2 border-r p-2 text-xs font-medium text-center min-w-[40px] ${getDayHeaderClass(d)}`}>
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.filter(p => !p.isDeleted && p.archiveStatus !== 'ARCHIVED').map(project => {
                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white border-b border-r p-2 text-sm font-bold text-gray-800 z-10 shadow-[1px_0_0_0_#e5e7eb]">
                        {project.title}
                      </td>
                      {daysArray.map(d => {
                        const targetDate = new Date(year, month, d).setHours(0,0,0,0);
                        const start = project.startDate ? new Date(project.startDate).setHours(0,0,0,0) : null;
                        const end = project.deliveryDate ? new Date(project.deliveryDate).setHours(0,0,0,0) : (project.dueDate ? new Date(project.dueDate).setHours(0,0,0,0) : null);
                        
                        let isActive = false;
                        if (start && end && targetDate >= start && targetDate <= end) isActive = true;
                        
                        return (
                          <td key={d} className={`border-b border-r p-1 ${isActive ? 'bg-indigo-100/50' : getDayCellClass(d)}`}>
                            {targetDate === start && <div className="text-[10px] font-bold text-indigo-700 bg-white px-1 rounded border border-indigo-200">시작</div>}
                            {targetDate === end && <div className="text-[10px] font-bold text-red-600 bg-white px-1 rounded border border-red-200">납품</div>}
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

      <LeaveRegistrationModal 
        isOpen={showLeaveModal} 
        onClose={() => setShowLeaveModal(false)} 
      />
    </div>
  );
}
