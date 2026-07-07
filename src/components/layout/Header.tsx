'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { mockUsers } from '@/data/mockData';
import { Bell, User } from 'lucide-react';

export const Header = () => {
  const { currentUser, loginAs } = useAuthStore();

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {currentUser ? `${currentUser.departmentName} - ${currentUser.role}` : '로그인 필요'}
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        {/* Mock Login Switcher */}
        <select
          className="border rounded px-3 py-1 text-sm bg-gray-50"
          value={currentUser?.id || ''}
          onChange={(e) => loginAs(e.target.value)}
        >
          {mockUsers.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.jobTitle})
            </option>
          ))}
        </select>

        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-gray-700">{currentUser?.name}</span>
        </div>
      </div>
    </header>
  );
};
