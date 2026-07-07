import { PersonnelCard } from '@/types/models';

/**
 * Returns the preferred display name for a user based on Plan 7 rules.
 * Priority: displayName > koreanAlias > name
 */
export const getUserDisplayName = (user?: PersonnelCard | null): string => {
  if (!user) return '미배정';
  return user.displayName || user.koreanAlias || user.name;
};

/**
 * Robust multilingual search function for users.
 * Checks English name, Korean alias, email, and department context.
 */
export const matchUserSearch = (user: PersonnelCard, query: string): boolean => {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const searchableFields = [
    user.name,
    user.displayName,
    user.koreanAlias,
    user.email,
    user.jobTitle,
    user.departmentName,
    user.teamName,
    user.employeeNumber
  ].map(f => (f || '').toLowerCase());

  return searchableFields.some(field => field.includes(q));
};
