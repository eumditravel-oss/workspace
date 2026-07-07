import { create } from 'zustand';
import { QcIssue, ProjectEvaluationContext } from '@/lib/evaluation/types';

interface EvaluationState {
  qcIssues: QcIssue[];
  projectContexts: ProjectEvaluationContext[];
  
  addQcIssue: (issue: Omit<QcIssue, 'id' | 'createdAt' | 'updatedAt' | 'weightedErrorCount' | 'status'>) => void;
  updateQcIssueWeight: (issueId: string, weightPercent: number) => void;
  updateQcIssueStatus: (issueId: string, status: QcIssue['status']) => void;
  
  saveProjectContext: (context: Omit<ProjectEvaluationContext, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const useEvaluationStore = create<EvaluationState>((set) => ({
  qcIssues: [],
  projectContexts: [],
  
  addQcIssue: (issueData) => set((state) => {
    // Validate weight percent
    const weightPercent = Math.max(10, Math.min(100, issueData.weightPercent));
    const weightedErrorCount = weightPercent / 100;
    
    const newIssue: QcIssue = {
      ...issueData,
      id: `qc${Date.now()}`,
      weightPercent,
      weightedErrorCount,
      status: 'REVIEWED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return { qcIssues: [...state.qcIssues, newIssue] };
  }),
  
  updateQcIssueWeight: (issueId, weightPercent) => set((state) => {
    const validWeight = Math.max(10, Math.min(100, weightPercent));
    
    return {
      qcIssues: state.qcIssues.map(issue => 
        issue.id === issueId 
          ? { 
              ...issue, 
              weightPercent: validWeight, 
              weightedErrorCount: validWeight / 100,
              updatedAt: new Date().toISOString() 
            } 
          : issue
      )
    };
  }),

  updateQcIssueStatus: (issueId, status) => set((state) => ({
    qcIssues: state.qcIssues.map(issue => 
      issue.id === issueId 
        ? { ...issue, status, updatedAt: new Date().toISOString() } 
        : issue
    )
  })),
  
  saveProjectContext: (contextData) => set((state) => {
    const existingIndex = state.projectContexts.findIndex(c => c.projectId === contextData.projectId && c.evaluationPeriodId === contextData.evaluationPeriodId);
    
    if (existingIndex >= 0) {
      const updatedContexts = [...state.projectContexts];
      updatedContexts[existingIndex] = {
        ...updatedContexts[existingIndex],
        ...contextData,
        updatedAt: new Date().toISOString()
      };
      return { projectContexts: updatedContexts };
    }
    
    const newContext: ProjectEvaluationContext = {
      ...contextData,
      id: `ctx${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return { projectContexts: [...state.projectContexts, newContext] };
  })
}));
