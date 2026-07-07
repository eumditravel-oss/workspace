'use client';
import { useAuthStore } from '@/store/authStore';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { DepartmentManagerDashboard } from '@/components/dashboard/DepartmentManagerDashboard';
import { PMDashboard } from '@/components/dashboard/PMDashboard';
import { WorkerDashboard } from '@/components/dashboard/WorkerDashboard';

export default function Home() {
  const { currentUser } = useAuthStore();

  if (!currentUser) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {currentUser.role === 'SUPER_ADMIN' && <SuperAdminDashboard />}
      {currentUser.role === 'DEPARTMENT_MANAGER' && <DepartmentManagerDashboard />}
      {currentUser.role === 'PM' && <PMDashboard />}
      {currentUser.role === 'WORKER' && <WorkerDashboard />}
    </div>
  );
}
