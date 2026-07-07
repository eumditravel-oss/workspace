'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const { currentUser } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;

  const myNotifications = notifications.filter(n => n.userId === currentUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <Bell className="w-6 h-6 mr-2 text-indigo-600" />
          알림 센터
        </h1>
        <button 
          onClick={() => markAllAsRead(currentUser.id)}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          모두 읽음 처리
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {myNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            알림이 없습니다.
          </div>
        ) : (
          <div className="divide-y">
            {myNotifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                    {n.title}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm ${!n.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
