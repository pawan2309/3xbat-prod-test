declare const ROLE_HIERARCHY: {
    OWNER: number;
    SUB_OWN: number;
    SUP_ADM: number;
    ADMIN: number;
    SUB_ADM: number;
    MAS_AGENT: number;
    SUP_AGENT: number;
    AGENT: number;
    USER: number;
};
export type Role = keyof typeof ROLE_HIERARCHY;
export declare function getHierarchyIndex(role: string): number;
export declare function checkHierarchyRelationship(creatorRole: string, newUserRole: string): {
    isDirectSubordinate: boolean;
    upperRole: string | null;
    skipLevel: number;
};
export declare function getRoleDisplayName(role: string): string;
export declare function getHierarchyModalTitle(upperRole: string): string;
export declare function canAccessRole(userRole: string, targetRole: string): boolean;
export declare function getAccessibleRoles(userRole: string): string[];
export declare function canAccessFeature(userRole: string, feature: string): boolean;
export declare function canAccessRestrictedSections(userRole: string): boolean;
export declare function canAccessUserData(requestingUserRole: string, targetUserRole: string): boolean;
export declare function getRoleBasedNavigation(userRole: string): {
    'USER DETAILS': {
        label: string;
        href: string;
        icon: string;
        role: string;
    }[];
    GAMES: {
        label: string;
        href: string;
        icon: string;
        role: string;
    }[];
    Casino: {
        label: string;
        href: string;
        icon: string;
        role: string;
    }[];
    'CASH TRANSACTION': {
        label: string;
        href: string;
        icon: string;
        role: string;
    }[];
    LEDGER: {
        label: string;
        href: string;
        icon: string;
        role: string;
    }[];
    COMMISSIONS: {
        label: string;
        href: string;
        icon: string;
        role: string;
    }[];
    'OLD DATA': {
        label: string;
        href: string;
        icon: string;
        role: string;
    }[];
    'Login Reports': {
        label: string;
        href: string;
        icon: string;
        role: string;
    }[];
} | Record<string, any[]>;
export {};
//# sourceMappingURL=roleHierarchy.d.ts.map