"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Users, Save, Download, Upload } from 'lucide-react';
import { PersonnelCard } from '@/types/models';

export default function PersonnelManagementPage() {
  const { currentUser, users, loginAs, updateUser } = useAuthStore();
  const personnel = users;
  
  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;
  if (!['SUPER_ADMIN', 'SYSTEM_ADMIN', 'DEPARTMENT_MANAGER'].includes(currentUser.role)) {
    return <div className="p-6 text-red-600 font-bold">접근 권한이 없습니다.</div>;
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">인사카드 관리</h1>
            <p className="text-sm text-gray-500 mt-1">조직도 및 직원 상세 정보를 관리합니다.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
            <Download className="w-4 h-4" />
            JSON 내보내기
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
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
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.employeeNumber || '-'}</td>
                <td className="p-3 font-bold">{user.displayName || user.name}</td>
                <td className="p-3 text-gray-600">
                  {user.companyId === 'CON_COST' ? 'CON-COST' : 'Viet_QS'} / {user.departmentId}
                </td>
                <td className="p-3">{user.organizationRank || '-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.systemRole === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.systemRole === 'PM' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
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
                  <button className="text-indigo-600 hover:underline text-xs font-bold">수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
