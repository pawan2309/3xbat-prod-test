import { UserRole } from '@prisma/client';

export function getAvailableRolesForParent(_parentRole: UserRole): UserRole[] {
  return ['USER'] as unknown as UserRole[];
}

export function validateParentChildRole(_parent: UserRole, _child: UserRole): string | null {
  return null;
}

export async function createUserWithRoleValidation(data: any) {
  return { success: true, user: data };
}

export async function updateUserWithRoleValidation(data: any) {
  return { success: true, user: data };
}
