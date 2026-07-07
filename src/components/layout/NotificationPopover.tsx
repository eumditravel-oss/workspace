import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Bell, CheckCircle2, AlertCircle, CalendarClock, Briefcase, FileText } from 'lucide-react';
import { Notification } from '@/types/models';

export const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const { currentUser } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const myNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPROVAL_REQUEST': return <CalendarClock className="w-5 h-5 text-blue-500" />;
      case 'CONFLICT_ALERT': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'PROJECT_ASSIGNMENT': return <Briefcase className="w-5 h-5 text-purple-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLink = (n: Notification) => {
    if (n.type === 'APPROVAL_REQUEST') return '/approvals';
    if (n.type === 'CONFLICT_ALERT') return '/conflicts';
    if (n.type === 'PROJECT_ASSIGNMENT') return '/projects/intake';
    return '/notifications';
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">알림</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead(currentUser.id)}
                className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" /> 모두 읽음
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {myNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                새로운 알림이 없습니다.
              </div>
            ) : (
              myNotifications.map(n => (
                <Link 
                  key={n.id} 
                  href={getLink(n)}
                  onClick={() => {
                    markAsRead(n.id);
                    setIsOpen(false);
                  }}
                  className={`block p-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {n.title}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-xs ${!n.isRead ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                        {n.message}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          <div className="p-3 border-t bg-gray-50 text-center">
            <Link 
              href="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              알림 센터 전체보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
