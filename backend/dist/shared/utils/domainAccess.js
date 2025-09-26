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
exports.getPanelType = getPanelType;
exports.getRoleConfiguration = getRoleConfiguration;
// Domain configuration
exports.DOMAIN_CONFIG = {
    OWNER: 'operate.3xbat.com', // CONTROL PANEL
    SUB_OWN: 'subown.3xbat.com', // USER PANEL
    SUP_ADM: 'supadm.3xbat.com', // USER PANEL
    ADMIN: 'admin.3xbat.com', // USER PANEL
    SUB_ADM: 'subadm.3xbat.com', // USER PANEL
    MAS_AGENT: 'master.3xbat.com', // USER PANEL
    SUP_AGENT: 'supagent.3xbat.com', // USER PANEL
    AGENT: 'agent.3xbat.com', // USER PANEL
    USER: '3xbat.com' // CLIENT PANEL
};
// Access control rules - each role has their own domain
exports.DOMAIN_ACCESS_RULES = {
    OWNER: [exports.DOMAIN_CONFIG.OWNER], // OWNER can only access control panel
    SUB_OWN: [exports.DOMAIN_CONFIG.SUB_OWN], // User panel
    SUP_ADM: [exports.DOMAIN_CONFIG.SUP_ADM], // User panel
    ADMIN: [exports.DOMAIN_CONFIG.ADMIN], // User panel
    SUB_ADM: [exports.DOMAIN_CONFIG.SUB_ADM], // User panel
    MAS_AGENT: [exports.DOMAIN_CONFIG.MAS_AGENT], // User panel
    SUP_AGENT: [exports.DOMAIN_CONFIG.SUP_AGENT], // User panel
    AGENT: [exports.DOMAIN_CONFIG.AGENT], // User panel
    USER: [exports.DOMAIN_CONFIG.USER] // Client panel
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
/**
 * Get the panel type for a role
 */
function getPanelType(role) {
    switch (role) {
        case 'OWNER':
            return 'control-panel';
        case 'SUB_OWN':
        case 'SUP_ADM':
        case 'ADMIN':
        case 'SUB_ADM':
        case 'MAS_AGENT':
        case 'SUP_AGENT':
        case 'AGENT':
            return 'user-panel';
        case 'USER':
            return 'client-panel';
        default:
            return 'client-panel';
    }
}
/**
 * Get the correct domain and panel for a role
 */
function getRoleConfiguration(role) {
    return {
        domain: getPrimaryDomain(role),
        panel: getPanelType(role)
    };
}
//# sourceMappingURL=domainAccess.js.map