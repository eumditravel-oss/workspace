import { create } from 'zustand';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  addNotification: (userId: string, title: string, message: string) => void;
}

const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'u1', title: '승인 요청', message: '새로운 연장 근무 신청이 접수되었습니다.', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n2', userId: 'u4', title: '업무 할당', message: '새로운 업무 카드가 배정되었습니다.', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'n3', userId: 'u3', title: '프로젝트 배정', message: '새로운 수주 프로젝트의 PM으로 배정되었습니다.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: mockNotifications,
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
  })),
  markAllAsRead: (userId) => set((state) => ({
    notifications: state.notifications.map(n => n.userId === userId ? { ...n, isRead: true } : n)
  })),
  addNotification: (userId, title, message) => set((state) => ({
    notifications: [{
      id: `n${Date.now()}`,
      userId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    }, ...state.notifications]
  }))
}));
