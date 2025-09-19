import { Role } from './roleHierarchy';
export declare const DOMAIN_CONFIG: {
    readonly OPERATING_PANEL: "operate.3xbat.com";
    readonly OWNER: "owner.3xbat.com";
    readonly SUB_OWN: "subowner.3xbat.com";
    readonly SUP_ADM: "superadmin.3xbat.com";
    readonly ADMIN: "admin.3xbat.com";
    readonly SUB_ADM: "sub.3xbat.com";
    readonly MAS_AGENT: "master.3xbat.com";
    readonly SUP_AGENT: "superagent.3xbat.com";
    readonly AGENT: "agent.3xbat.com";
    readonly USER: "3xbat.com";
};
export declare const DOMAIN_ACCESS_RULES: Record<Role, readonly string[]>;
/**
 * Check if a user can access a specific domain
 */
export declare function canAccessDomain(userRole: Role, domain: string): boolean;
/**
 * Get the primary domain for a user role
 */
export declare function getPrimaryDomain(userRole: Role): string;
/**
 * Check if user should be redirected based on their role and current domain
 */
export declare function shouldRedirect(userRole: Role, currentDomain: string): {
    shouldRedirect: boolean;
    targetDomain: string;
};
/**
 * Validate domain access for API requests
 */
export declare function validateDomainAccess(userRole: Role, requestDomain: string): boolean;
/**
 * Get all accessible domains for a role
 */
export declare function getAccessibleDomains(userRole: Role): readonly string[];
/**
 * Check if role is for user management (not USER role)
 */
export declare function isUserManagementRole(role: Role): boolean;
/**
 * Check if role is for operating panel only
 */
export declare function isOperatingPanelRole(role: Role): boolean;
/**
 * Check if role is for separate user package
 */
export declare function isUserPackageRole(role: Role): boolean;
//# sourceMappingURL=domainAccess.d.ts.map