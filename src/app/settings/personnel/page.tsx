"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Users, Save, Download } from 'lucide-react';
import { PersonnelCard } from '@/types/models';

export default function PersonnelManagementPage() {
  const { currentUser, users, updateUser } = useAuthStore();
  const personnel = users;
  
  const [editingUser, setEditingUser] = useState<PersonnelCard | null>(null);
  
  if (!currentUser) return <div className="py-10 text-center text-[var(--color-text-sub)]">로그인이 필요합니다.</div>;
  if (!['SUPER_ADMIN', 'SYSTEM_ADMIN', 'DEPARTMENT_MANAGER'].includes(currentUser.role)) {
    return <div className="py-10 text-center text-[var(--color-danger)] font-bold">접근 권한이 없습니다.</div>;
  }

  const handleExport = () => {
    const data = {
      schemaVersion: "1.0.0",
      personnel
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personnel-cards.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-main)]">인사카드 관리</h1>
            <p className="text-sm text-[var(--color-text-sub)] mt-1">조직도 및 직원 상세 정보를 관리합니다.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border-strong)] rounded text-sm hover:bg-[var(--color-bg)]">
            <Download className="w-4 h-4" />
            JSON 내보내기
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border p-6 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--color-bg)] text-[var(--color-text-sub)]">
            <tr>
              <th className="p-3">사번</th>
              <th className="p-3">이름 (표시명)</th>
              <th className="p-3">소속 (회사/부서)</th>
              <th className="p-3">조직 직급</th>
              <th className="p-3">시스템 권한</th>
              <th className="p-3">대리 결재자</th>
              <th className="p-3">상태</th>
              <th className="p-3">작업</th>
            </tr>
          </thead>
          <tbody>
            {personnel.map(user => (
              <tr key={user.id} className="border-b hover:bg-[var(--color-bg)]">
                <td className="p-3">{user.employeeNumber || '-'}</td>
                <td className="p-3 font-bold">{user.displayName || user.name}</td>
                <td className="p-3 text-[var(--color-text-sub)]">
                  {user.companyId === 'CON_COST' ? 'CON-COST' : 'Viet_QS'} / {user.departmentId}
                </td>
                <td className="p-3">{user.organizationRank || '-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.systemRole === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.systemRole === 'PM' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-[var(--color-text-main)]'
                  }`}>
                    {user.systemRole || user.role}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={user.deputyApproverId || ''}
                    onChange={(e) => updateUser(user.id, { deputyApproverId: e.target.value })}
                    className="border rounded p-1 text-xs outline-none"
                  >
                    <option value="">지정 안함</option>
                    {users.filter(u => u.id !== user.id).map(u => (
                      <option key={u.id} value={u.id}>{u.displayName || u.name}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${user.employmentStatus === 'ACTIVE' || user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.employmentStatus || (user.isActive ? 'ACTIVE' : 'INACTIVE')}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => setEditingUser(user)} className="text-indigo-600 hover:underline text-xs font-bold">수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-[var(--color-surface)] rounded-[20px] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50">
              <h2 className="text-lg font-bold">인사카드 수정</h2>
            </div>
            <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">이름(표시명)</label>
                <input 
                  type="text" 
                  value={editingUser.displayName || editingUser.name || ''} 
                  onChange={e => setEditingUser({...editingUser, displayName: e.target.value})}
                  className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">회사</label>
                <select 
                  value={editingUser.companyId || ''} 
                  onChange={e => setEditingUser({...editingUser, companyId: e.target.value as PersonnelCard['companyId']})}
                  className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                >
                  <option value="">선택 안함</option>
                  <option value="CON_COST">CON-COST (한국)</option>
                  <option value="VIET_QS">Viet_QS (베트남)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">공통 부서</label>
                <select 
                  value={editingUser.departmentId || ''} 
                  onChange={e => setEditingUser({...editingUser, departmentId: e.target.value})}
                  className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                >
                  <option value="">선택 안함</option>
                  <option value="FINISH">마감 (Finishing)</option>
                  <option value="STRUCTURE">구조 (Structure)</option>
                  <option value="CIVIL">토목 (Civil)</option>
                  <option value="DEVELOP">개발 (Develop)</option>
                </select>
              </div>
              {editingUser.companyId === 'VIET_QS' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">세부 부서 (Viet_QS)</label>
                  <select 
                    value={editingUser.subDepartmentId || ''} 
                    onChange={e => setEditingUser({...editingUser, subDepartmentId: e.target.value})}
                    className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                  >
                    <option value="">선택 안함</option>
                    <optgroup label="마감">
                      <option value="INTERNAL_1">Internal1</option>
                      <option value="INTERNAL_2">Internal2</option>
                      <option value="INTERNAL_3">Internal3</option>
                      <option value="EXTERNAL">External</option>
                      <option value="PARTITION_OPENING">Partition & Opening</option>
                    </optgroup>
                    <optgroup label="구조">
                      <option value="VERTICAL">Vertical</option>
                      <option value="HORIZONTAL_FOUNDATION">Horizontal & Foundation</option>
                    </optgroup>
                    <optgroup label="토목">
                      <option value="CIVIL_SUB">Civil</option>
                    </optgroup>
                    <optgroup label="개발">
                      <option value="DEVELOP_SUB">Develop</option>
                    </optgroup>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">조직 직급</label>
                <select 
                  value={editingUser.organizationRank || ''} 
                  onChange={e => setEditingUser({...editingUser, organizationRank: e.target.value as PersonnelCard['organizationRank']})}
                  className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                >
                  <option value="">선택 안함</option>
                  <option value="CEO">CEO</option>
                  <option value="VICE_PRESIDENT">Vice President</option>
                  <option value="MANAGER">Manager (부서장)</option>
                  <option value="PM">PM (Project Manager)</option>
                  <option value="TEAM_LEADER">팀장</option>
                  <option value="DEPUTY_TEAM_LEADER">부팀장</option>
                  <option value="STAFF">사원 (Staff)</option>
                  <option value="TRAINEE">수습 (Trainee)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">시스템 권한</label>
                <select 
                  value={editingUser.systemRole || editingUser.role} 
                  onChange={e => setEditingUser({...editingUser, systemRole: e.target.value as PersonnelCard['systemRole'], role: e.target.value as PersonnelCard['role']})}
                  className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
                  <option value="DEPARTMENT_MANAGER">DEPARTMENT_MANAGER</option>
                  <option value="PM">PM</option>
                  <option value="WORKER">WORKER</option>
                  <option value="EVALUATION_ADMIN">EVALUATION_ADMIN</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">상태</label>
                <select 
                  value={editingUser.employmentStatus || (editingUser.isActive ? 'ACTIVE' : 'INACTIVE')} 
                  onChange={e => setEditingUser({...editingUser, employmentStatus: e.target.value})}
                  className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                >
                  <option value="ACTIVE">재직 중 (ACTIVE)</option>
                  <option value="ON_LEAVE">휴직 (ON_LEAVE)</option>
                  <option value="RESIGNED">퇴사 (RESIGNED)</option>
                  <option value="INACTIVE">비활성 (INACTIVE)</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex justify-end gap-2">
              <button 
                onClick={() => setEditingUser(null)} 
                className="px-4 py-2 border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-main)] rounded-lg text-sm font-medium hover:bg-[var(--color-bg)] transition-colors"
              >
                취소
              </button>
              <button 
                onClick={() => {
                  if (!editingUser.departmentId) {
                    alert("공통 부서를 선택해주세요.");
                    return;
                  }
                  const updatedUser = { ...editingUser };
                  if (updatedUser.companyId === 'CON_COST') {
                    updatedUser.subDepartmentId = undefined; // CON_COST shouldn't have sub dept
                  }
                  if (
                    (updatedUser.systemRole === 'SUPER_ADMIN' || updatedUser.role === 'SUPER_ADMIN') && 
                    currentUser.role !== 'SUPER_ADMIN'
                  ) {
                    alert("SUPER_ADMIN 권한은 SUPER_ADMIN 만이 부여할 수 있습니다.");
                    return;
                  }
                  updateUser(updatedUser.id, updatedUser);
                  setEditingUser(null);
                }} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-1 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" /> 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
