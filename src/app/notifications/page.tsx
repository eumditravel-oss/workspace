'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const { currentUser } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  if (!currentUser) return <div className="py-10 text-center text-[var(--color-text-sub)]">로그인이 필요합니다.</div>;

  const myNotifications = notifications.filter(n => n.userId === currentUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--color-surface)] p-4 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold text-[var(--color-text-main)] flex items-center">
          <Bell className="w-6 h-6 mr-2 text-indigo-600" />
          알림 센터
        </h1>
        <button 
          onClick={() => markAllAsRead(currentUser.id)}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-[var(--color-text-main)] py-2 px-4 rounded-lg flex items-center"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          모두 읽음 처리
        </button>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border overflow-hidden">
        {myNotifications.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-text-sub)]">
            알림이 없습니다.
          </div>
        ) : (
          <div className="divide-y">
            {myNotifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`p-4 hover:bg-[var(--color-bg)] cursor-pointer transition-colors ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {(n.priority === 'CRITICAL' || n.priority === 'HIGH') && (
                      <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold border border-red-200">
                        긴급
                      </span>
                    )}
                    <h3 className={`font-semibold ${!n.isRead ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-sub)]'}`}>
                      {n.title}
                    </h3>
                    {n.count && n.count > 1 ? (
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-indigo-200">
                        {n.count}개 알림 묶임
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-[var(--color-text-sub)]">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm ${!n.isRead ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-sub)]'}`}>
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
