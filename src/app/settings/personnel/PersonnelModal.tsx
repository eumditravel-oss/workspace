import React, { useState, useEffect } from "react";
import { PersonnelCard } from "@/types/models";
import { X } from "lucide-react";

interface Props {
  user: PersonnelCard | null;
  onClose: () => void;
  onSave: (user: Omit<PersonnelCard, "id"> | PersonnelCard) => void;
}

export const PersonnelModal: React.FC<Props> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<PersonnelCard>>({
    name: "",
    displayName: "",
    employeeNumber: "",
    companyId: "CON_COST",
    departmentId: "DEV",
    role: "WORKER",
    systemRole: "WORKER",
    organizationRank: "STAFF",
    employmentStatus: "ACTIVE",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData as PersonnelCard);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl w-full max-w-[95vw] sm:max-w-xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg)] rounded-t-xl">
          <h2 className="text-lg font-bold text-[var(--color-text-main)]">
            {user ? "인사카드 수정" : "사원 추가"}
          </h2>
          <button onClick={onClose} className="text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">이름 (필수)</label>
              <input required name="name" value={formData.name || ""} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">표시명</label>
              <input name="displayName" value={formData.displayName || ""} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">사번</label>
              <input name="employeeNumber" value={formData.employeeNumber || ""} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">소속 회사</label>
              <select name="companyId" value={formData.companyId || ""} onChange={handleChange} className="w-full p-2 border rounded bg-[var(--color-surface)]">
                <option value="CON_COST">CON-COST</option>
                <option value="Viet_QS">Viet_QS</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">소속 부서</label>
              <input name="departmentId" value={formData.departmentId || ""} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">직급</label>
              <input name="organizationRank" value={formData.organizationRank || ""} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">시스템 권한</label>
              <select name="role" value={formData.role || ""} onChange={handleChange} className="w-full p-2 border rounded bg-[var(--color-surface)]">
                <option value="SUPER_ADMIN">최고 관리자 (SUPER_ADMIN)</option>
                <option value="SYSTEM_ADMIN">시스템 관리자 (SYSTEM_ADMIN)</option>
                <option value="DEPARTMENT_MANAGER">부서장 (DEPARTMENT_MANAGER)</option>
                <option value="PM">PM</option>
                <option value="WORKER">일반 작업자 (WORKER)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">상태</label>
              <select name="employmentStatus" value={formData.employmentStatus || "ACTIVE"} onChange={handleChange} className="w-full p-2 border rounded bg-[var(--color-surface)]">
                <option value="ACTIVE">활성 (ACTIVE)</option>
                <option value="INACTIVE">비활성 (INACTIVE)</option>
                <option value="ON_LEAVE">휴직 (ON_LEAVE)</option>
                <option value="RETIRED">퇴사 (RETIRED)</option>
              </select>
            </div>
          </div>
          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">취소</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

