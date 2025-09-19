import { UserRole } from '@prisma/client';
export declare function getAvailableRolesForParent(_parentRole: UserRole): UserRole[];
export declare function validateParentChildRole(_parent: UserRole, _child: UserRole): string | null;
export declare function createUserWithRoleValidation(data: any): Promise<{
    success: boolean;
    user: any;
}>;
export declare function updateUserWithRoleValidation(data: any): Promise<{
    success: boolean;
    user: any;
}>;
//# sourceMappingURL=roleBasedUserService.d.ts.map