// Domain access utilities - moved from frontend to backend for unified access
import { Role } from './roleHierarchy';

// Domain configuration
export const DOMAIN_CONFIG = {
  OWNER: 'operate.3xbat.com', // CONTROL PANEL
  SUB_OWN: 'subown.3xbat.com', // USER PANEL
  SUP_ADM: 'supadm.3xbat.com', // USER PANEL
  ADMIN: 'admin.3xbat.com', // USER PANEL
  SUB_ADM: 'subadm.3xbat.com', // USER PANEL
  MAS_AGENT: 'master.3xbat.com', // USER PANEL
  SUP_AGENT: 'supagent.3xbat.com', // USER PANEL
  AGENT: 'agent.3xbat.com', // USER PANEL
  USER: '3xbat.com' // CLIENT PANEL
} as const;

// Access control rules - each role has their own domain
export const DOMAIN_ACCESS_RULES: Record<Role, readonly string[]> = {
  OWNER: [DOMAIN_CONFIG.OWNER], // OWNER can only access control panel
  SUB_OWN: [DOMAIN_CONFIG.SUB_OWN], // User panel
  SUP_ADM: [DOMAIN_CONFIG.SUP_ADM], // User panel
  ADMIN: [DOMAIN_CONFIG.ADMIN], // User panel
  SUB_ADM: [DOMAIN_CONFIG.SUB_ADM], // User panel
  MAS_AGENT: [DOMAIN_CONFIG.MAS_AGENT], // User panel
  SUP_AGENT: [DOMAIN_CONFIG.SUP_AGENT], // User panel
  AGENT: [DOMAIN_CONFIG.AGENT], // User panel
  USER: [DOMAIN_CONFIG.USER] // Client panel
} as const;

/**
 * Check if a user can access a specific domain
 */
export function canAccessDomain(userRole: Role, domain: string): boolean {
  const allowedDomains = DOMAIN_ACCESS_RULES[userRole];
  return allowedDomains.includes(domain);
}

/**
 * Get the primary domain for a user role
 */
export function getPrimaryDomain(userRole: Role): string {
  return DOMAIN_ACCESS_RULES[userRole][0];
}

/**
 * Check if user should be redirected based on their role and current domain
 */
export function shouldRedirect(userRole: Role, currentDomain: string): { shouldRedirect: boolean; targetDomain: string } {
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
export function validateDomainAccess(userRole: Role, requestDomain: string): boolean {
  return canAccessDomain(userRole, requestDomain);
}

/**
 * Get all accessible domains for a role
 */
export function getAccessibleDomains(userRole: Role): readonly string[] {
  return DOMAIN_ACCESS_RULES[userRole];
}

/**
 * Check if role is for user management (not USER role)
 */
export function isUserManagementRole(role: Role): boolean {
  return role !== 'USER' && role !== 'OWNER';
}

/**
 * Check if role is for operating panel only
 */
export function isOperatingPanelRole(role: Role): boolean {
  return role === 'OWNER';
}

/**
 * Check if role is for separate user package
 */
export function isUserPackageRole(role: Role): boolean {
  return role === 'USER';
}

/**
 * Get the panel type for a role
 */
export function getPanelType(role: Role): 'control-panel' | 'user-panel' | 'client-panel' {
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
export function getRoleConfiguration(role: Role): {
  domain: string;
  panel: 'control-panel' | 'user-panel' | 'client-panel';
} {
  return {
    domain: getPrimaryDomain(role),
    panel: getPanelType(role)
  };
}
