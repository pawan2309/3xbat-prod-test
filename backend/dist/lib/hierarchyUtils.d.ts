import { UserRole } from '@prisma/client';
export declare function getAccessibleRoles(role: UserRole): UserRole[];
export declare function getRoleBasedNavigation(_role: UserRole): {
    dashboard: boolean;
    users: boolean;
    reports: boolean;
};
export declare function canAccessFeature(role: UserRole, feature: string): boolean;
export declare function canAccessRole(actorRole: UserRole, targetRole: UserRole): boolean;
//# sourceMappingURL=hierarchyUtils.d.ts.map