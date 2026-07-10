import { useAuthStore } from '../src/store/authStore';
import { useProcessTemplateStore } from '../src/store/processTemplateStore';
import { useApprovalStore } from '../src/store/approvalStore';
import { useTaskStore } from '../src/store/taskStore';
import { useScheduleStore } from '../src/store/scheduleStore';
import { defaultProcessTemplates, defaultProcessStages, defaultProcessTasks } from '../src/data/processTemplateSeed';

async function runTest() {
  console.log('--- Starting Integration Test ---');
  
  // Set IDs based on dummyPersonnel.json
  const adminId = 'u-ceo-hdm';
  const pmId = 'user-1783597561693'; // 유종욱
  const managerId = 'user-1783597410384'; // Thanh Phuong
  const workerId = 'user-1783597439014'; // Manh Cuong
  
  // 1. Set current user to PM
  useAuthStore.getState().loginAs(pmId); 
  const authStore = () => useAuthStore.getState();
  const processStore = () => useProcessTemplateStore.getState();
  const approvalStore = () => useApprovalStore.getState();
  
  // Need to ensure stores are populated
  if (processStore().templates?.length === 0 || !processStore().templates) {
    processStore().loadInitialData(defaultProcessTemplates, defaultProcessStages, defaultProcessTasks);
  }
  
  // Need to ensure task 't1' exists
  useTaskStore.getState().addTask({
    projectId: 'p1',
    title: 'Test Task',
    status: 'TODO',
    priority: 'NORMAL',
    approvalStatus: 'NONE',
    departmentId: 'DEVELOP',
    startDate: '2026-07-20',
    dueDate: '2026-07-25',
    orderIndex: 0,
    assigneeId: pmId
  });
  const tasks = useTaskStore.getState().tasks;
  const taskId = tasks[tasks.length - 1].id;
  
  // 2. PM adds assignment
  const templateId = 'ptmpl_esc_vietnam';
  
  console.log('Test 1: PM creates Draft');
  const assignmentId = processStore().addAssignment({
    taskId,
    templateId,
    status: 'DRAFT',
    pmId: pmId,
    managerId: managerId // Set Manager!
  });
  
  console.log('Assignment created with ID:', assignmentId);
  
  // 3. PM submits assignment to Manager
  console.log('Test 2: PM submits Draft for approval');
  processStore().submitAssignment(assignmentId, managerId);
  let assignment = processStore().assignments.find(a => a.id === assignmentId);
  if (assignment?.status !== 'PENDING_APPROVAL') {
    console.error('Submit Failed! Expected PENDING_APPROVAL, got:', assignment?.status);
    process.exit(1);
  }
  console.log('Submit Success.');

  // 4. Manager Rejects
  console.log('Test 3: Manager Rejects');
  authStore().loginAs(managerId); // Change to Manager
  approvalStore().addRequest({
    type: 'PROCESS_SCHEDULE_APPROVAL',
    taskId,
    projectId: 'p1',
    requestedBy: pmId,
    title: 'test',
    reason: 'test'
  });
  const reqId = approvalStore().requests[approvalStore().requests.length - 1].id;
  
  approvalStore().updateApprovalStatus(reqId, 'REJECTED', managerId, 'Not detailed enough');
  
  assignment = processStore().assignments.find(a => a.id === assignmentId);
  if (assignment?.status !== 'REJECTED') {
    console.error('Reject Failed! Expected REJECTED, got:', assignment?.status);
    process.exit(1);
  }
  console.log('Reject Success.');

  // 5. PM resubmits
  console.log('Test 4: PM Resubmits');
  authStore().loginAs(pmId); // Change to PM
  processStore().resubmitAssignment(assignmentId);
  
  assignment = processStore().assignments.find(a => a.id === assignmentId);
  if (assignment?.status !== 'DRAFT' || assignment?.revisionNo !== 2) {
    console.error('Resubmit Failed! Expected DRAFT and Revision=2, got:', assignment?.status, assignment?.revisionNo);
    process.exit(1);
  }
  if (!assignment.historySnapshot || assignment.historySnapshot.length === 0) {
    console.error('Resubmit Failed! Expected historySnapshot to be created.');
    process.exit(1);
  }
  console.log('Resubmit Success. History Snapshots length:', assignment.historySnapshot.length);
  
  processStore().submitAssignment(assignmentId, managerId);

  // 6. Manager Approves (Officialization)
  console.log('Test 5: Manager Approves and checks Handoff');
  authStore().loginAs(managerId); // Change to Manager
  
  // Mock add a schedule before approve
  processStore().addSchedule({
    assignmentId,
    processStageId: 'pstage_gd0',
    processTaskId: 'ptask_gd0_1',
    startDate: '2026-07-20',
    endDate: '2026-07-25',
    assigneeId: workerId, // Worker
    status: 'NOT_STARTED',
    progress: 0,
    category: '기본',
    isOfficial: false
  });
  
  approvalStore().addRequest({
    type: 'PROCESS_SCHEDULE_APPROVAL',
    taskId,
    projectId: 'p1',
    requestedBy: pmId,
    title: 'test2',
    reason: 'test2'
  });
  const reqId2 = approvalStore().requests[approvalStore().requests.length - 1].id;
  
  approvalStore().updateApprovalStatus(reqId2, 'APPROVED', managerId, 'Looks good');
  
  assignment = processStore().assignments.find(a => a.id === assignmentId);
  if (assignment?.status !== 'APPROVED') {
    console.error('Approve Failed! Expected APPROVED, got:', assignment?.status);
    process.exit(1);
  }
  
  // Check if handoff worked
  const taskWorkSegments = useTaskStore.getState().workSegments.filter(ws => ws.taskId === taskId && ws.workerId === workerId);
  const personalSchedules = useScheduleStore.getState().schedules.filter(s => s.userId === workerId && s.title.includes('공정일정'));
  
  if (taskWorkSegments.length === 0 || personalSchedules.length === 0) {
    console.error('Handoff Failed! WorkSegment or PersonalSchedule was not created.');
    process.exit(1);
  }
  
  console.log('Approve & Handoff Success! Segments created:', taskWorkSegments.length, 'Schedules created:', personalSchedules.length);
  
  console.log('--- All Tests Passed Successfully ---');
}

runTest();
