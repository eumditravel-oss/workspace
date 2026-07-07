import { create } from 'zustand';
import { Project, ProjectStatus } from '@/types/models';
import { mockProjects } from '@/data/mockData';

interface ProjectState {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'progress'>) => void;
  assignPM: (projectId: string, pmId: string) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [...mockProjects],
  
  addProject: (projectData) => set((state) => {
    const newProject: Project = {
      ...projectData,
      id: `p${Date.now()}`,
      status: 'INTAKE_RECEIVED',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { projects: [...state.projects, newProject] };
  }),

  assignPM: (projectId, pmId) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === projectId 
        ? { ...p, pmId, status: 'PM_ASSIGNED', updatedAt: new Date().toISOString() } 
        : p
    )
  })),

  updateProjectStatus: (projectId, status) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === projectId
        ? { ...p, status, updatedAt: new Date().toISOString() }
        : p
    )
  }))
}));
