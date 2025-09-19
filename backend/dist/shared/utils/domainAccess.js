"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAIN_ACCESS_RULES = exports.DOMAIN_CONFIG = void 0;
exports.canAccessDomain = canAccessDomain;
exports.getPrimaryDomain = getPrimaryDomain;
exports.shouldRedirect = shouldRedirect;
exports.validateDomainAccess = validateDomainAccess;
exports.getAccessibleDomains = getAccessibleDomains;
exports.isUserManagementRole = isUserManagementRole;
exports.isOperatingPanelRole = isOperatingPanelRole;
exports.isUserPackageRole = isUserPackageRole;
// Domain configuration
exports.DOMAIN_CONFIG = {
    OPERATING_PANEL: 'operate.3xbat.com',
    OWNER: 'owner.3xbat.com',
    SUB_OWN: 'subowner.3xbat.com',
    SUP_ADM: 'superadmin.3xbat.com',
    ADMIN: 'admin.3xbat.com',
    SUB_ADM: 'sub.3xbat.com',
    MAS_AGENT: 'master.3xbat.com',
    SUP_AGENT: 'superagent.3xbat.com',
    AGENT: 'agent.3xbat.com',
    USER: '3xbat.com' // Separate package
};
// Access control rules - each role has their own domain
exports.DOMAIN_ACCESS_RULES = {
    OWNER: [exports.DOMAIN_CONFIG.OPERATING_PANEL], // OWNER can only access operating panel
    SUB_OWN: [exports.DOMAIN_CONFIG.SUB_OWN],
    SUP_ADM: [exports.DOMAIN_CONFIG.SUP_ADM],
    ADMIN: [exports.DOMAIN_CONFIG.ADMIN],
    SUB_ADM: [exports.DOMAIN_CONFIG.SUB_ADM],
    MAS_AGENT: [exports.DOMAIN_CONFIG.MAS_AGENT],
    SUP_AGENT: [exports.DOMAIN_CONFIG.SUP_AGENT],
    AGENT: [exports.DOMAIN_CONFIG.AGENT],
    USER: [exports.DOMAIN_CONFIG.USER] // Separate package domain
};
/**
 * Check if a user can access a specific domain
 */
function canAccessDomain(userRole, domain) {
    const allowedDomains = exports.DOMAIN_ACCESS_RULES[userRole];
    return allowedDomains.includes(domain);
}
/**
 * Get the primary domain for a user role
 */
function getPrimaryDomain(userRole) {
    return exports.DOMAIN_ACCESS_RULES[userRole][0];
}
/**
 * Check if user should be redirected based on their role and current domain
 */
function shouldRedirect(userRole, currentDomain) {
    const primaryDomain = getPrimaryDomain(userRole);
    if (currentDomain !== primaryDomain) {
        return {
            shouldRedirect: true,
            targetDomain: primaryDomain
        };
    }
    return {
        shouldRedirect: false,
        targetDomain: currentDomain
    };
}
/**
 * Validate domain access for API requests
 */
function validateDomainAccess(userRole, requestDomain) {
    return canAccessDomain(userRole, requestDomain);
}
/**
 * Get all accessible domains for a role
 */
function getAccessibleDomains(userRole) {
    return exports.DOMAIN_ACCESS_RULES[userRole];
}
/**
 * Check if role is for user management (not USER role)
 */
function isUserManagementRole(role) {
    return role !== 'USER' && role !== 'OWNER';
}
/**
 * Check if role is for operating panel only
 */
function isOperatingPanelRole(role) {
    return role === 'OWNER';
}
/**
 * Check if role is for separate user package
 */
function isUserPackageRole(role) {
    return role === 'USER';
}
//# sourceMappingURL=domainAccess.js.map