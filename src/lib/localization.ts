import { WorkspaceLanguage } from '@/types/models';

export const UI_MESSAGES = {
  ko: {
    // Header & Sidebar
    dashboard: '대시보드',
    projectBoard: '통합 프로젝트 보드',
    projectIntake: '수주/개발 관리',
    approvals: '결재/수정 내역',
    conflicts: '일정 충돌 관리',
    schedules: '통합 일정표',
    notifications: '알림 센터',
    settings: '운영 설정',
    myTasks: '내 업무',
    evaluation: '성과 평가',

    // Board Columns
    preWork: '착수 전',
    inProgress: '진행 중',
    completed: '완료',
    revision: '수정',

    // Board Tabs
    devTeamWork: '개발팀 작업',
    externalProject: '외부 수주 프로젝트',

    // Board Time Badges
    goal: '목표',
    delivery: '납품',
    overdue: '🚨 {label}일 경과',
    dueIn: '{time} 전',
    unset: '미정',

    // Intake
    newProjectReg: '신규 프로젝트 등록',
    orderProjectManagement: '수주 프로젝트 관리',
    devTaskListManagement: '개발팀 업무 리스트 관리',

    // Settings
    translationSettings: '번역 설정',
    workspaceSettings: '운영 환경 설정',
    personnelManagement: '사원 관리',
    bulkEdit: '일괄 마감 (Danger)',
    dataQuality: '데이터 품질 검사기',
    importPreview: '가져오기 (JSON)',
    permissions: '권한 정책 설정',

    // Translation UI Warnings
    apiWarning: '주의: 업무상 민감한 내용이 무료 외부 API 서버로 전송될 수 있습니다. 정식 운영 시에는 자체 서버 구축을 권장합니다.',
    fallbackManual: '무료 번역 한도 초과 / 수동 번역 필요',

    // Modal Tabs
    overview: '개요',
  },
  vi: {
    // Header & Sidebar
    dashboard: 'Bảng điều khiển',
    projectBoard: 'Bảng dự án tổng hợp',
    projectIntake: 'Quản lý Đặt hàng/Phát triển',
    approvals: 'Lịch sử Phê duyệt',
    conflicts: 'Quản lý Xung đột Lịch',
    schedules: 'Lịch trình tổng hợp',
    notifications: 'Trung tâm Thông báo',
    settings: 'Cài đặt Vận hành',
    myTasks: 'Công việc của tôi',
    evaluation: 'Đánh giá Hiệu suất',

    // Board Columns
    preWork: 'Chưa bắt đầu',
    inProgress: 'Đang thực hiện',
    completed: 'Hoàn thành',
    revision: 'Chỉnh sửa',

    // Board Tabs
    devTeamWork: 'Công việc đội Phát triển',
    externalProject: 'Dự án Đặt hàng ngoài',

    // Board Time Badges
    goal: 'Mục tiêu',
    delivery: 'Giao hàng',
    overdue: '🚨 Quá hạn {label}',
    dueIn: 'Trước {time}',
    unset: 'Chưa đặt',

    // Intake
    newProjectReg: 'Đăng ký dự án mới',
    orderProjectManagement: 'Quản lý Dự án Đặt hàng',
    devTaskListManagement: 'Quản lý Danh sách Công việc Phát triển',

    // Settings
    translationSettings: 'Cài đặt Dịch thuật',
    workspaceSettings: 'Cài đặt Môi trường Vận hành',
    personnelManagement: 'Quản lý Nhân sự',
    bulkEdit: 'Đóng hàng loạt (Danger)',
    dataQuality: 'Kiểm tra Chất lượng Dữ liệu',
    importPreview: 'Nhập (JSON)',
    permissions: 'Cài đặt Chính sách Quyền',

    // Translation UI Warnings
    apiWarning: 'Lưu ý: Nội dung công việc nhạy cảm có thể được gửi đến máy chủ API miễn phí bên ngoài. Khuyên dùng máy chủ nội bộ khi vận hành chính thức.',
    fallbackManual: 'Vượt quá hạn mức dịch thuật miễn phí / Cần dịch thủ công',

    // Modal Tabs
    overview: 'Tổng quan',
  }
};

export const useTranslation = (lang: WorkspaceLanguage) => {
  return (key: keyof typeof UI_MESSAGES['ko'], params?: Record<string, string>) => {
    let str = UI_MESSAGES[lang]?.[key] || UI_MESSAGES['ko'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  };
};

export const getUserDisplayName = (user: { name?: string; displayName?: string; role?: string; departmentName?: string; isKorean?: boolean } | null | undefined) => {
  if (!user) return 'Unknown';
  return user.displayName || user.name || 'Unknown';
};
