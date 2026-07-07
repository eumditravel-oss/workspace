'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { User, Shield, Briefcase, Mail } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser } = useAuthStore();

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">설정 및 내 정보</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
        <h2 className="text-lg font-bold border-b pb-2">기본 정보</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1 flex items-center"><User className="w-4 h-4 mr-1" />이름</label>
            <div className="font-medium text-gray-900">{currentUser.name}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1 flex items-center"><Shield className="w-4 h-4 mr-1" />권한 (Role)</label>
            <div className="font-medium text-gray-900">{currentUser.role}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1 flex items-center"><Briefcase className="w-4 h-4 mr-1" />부서</label>
            <div className="font-medium text-gray-900">{currentUser.departmentName}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1 flex items-center"><Mail className="w-4 h-4 mr-1" />이메일 (Mock)</label>
            <div className="font-medium text-gray-900">{currentUser.id}@eumdi.com</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
        <h2 className="text-lg font-bold border-b pb-2">앱 설정</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">다크 모드</span>
            <input type="checkbox" className="w-5 h-5" disabled />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">이메일 알림 수신</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
          <p className="text-xs text-gray-400 mt-4">* 실제 환경 설정은 백엔드 연동 이후 반영됩니다.</p>
        </div>
      </div>
    </div>
  );
}
