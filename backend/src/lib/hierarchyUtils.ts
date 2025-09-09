import { UserRole } from '@prisma/client';

const roleOrder: UserRole[] = [
  'OWNER',
  'SUB_OWN',
  'SUP_ADM',
  'ADMIN',
  'SUB_ADM',
  'MAS_AGENT',
  'SUP_AGENT',
  'AGENT',
  'USER',
];

export function getAccessibleRoles(role: UserRole): UserRole[] {
  const idx = roleOrder.indexOf(role);
  if (idx === -1) return [];
  return roleOrder.slice(idx); // can access own and below
}

export function getRoleBasedNavigation(_role: UserRole) {
  return {
    dashboard: true,
    users: true,
    reports: true,
  };
}

export function canAccessFeature(role: UserRole, feature: string): boolean {
  if (feature === 'login_reports') return roleOrder.indexOf(role) <= roleOrder.indexOf('SUB_ADM');
  return true;
}

export function canAccessRole(actorRole: UserRole, targetRole: UserRole): boolean {
  return roleOrder.indexOf(actorRole) <= roleOrder.indexOf(targetRole);
}
